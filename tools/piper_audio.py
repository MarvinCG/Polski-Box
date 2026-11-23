"""Render every word and dialogue line with a Piper neural voice (much more natural than eSpeak).
Runs in GitHub Actions (see .github/workflows/pages.yml); can also run on any PC with internet:
    pip install piper-tts && python3 -m piper.download_voices pl_PL-gosia-medium --data-dir .voices
    python3 tools/piper_audio.py
Output: web/a/*.mp3 (overwrites the eSpeak files) and web/audio-hd.js = true."""
import json, os, subprocess, sys, wave
from concurrent.futures import ThreadPoolExecutor
from piper import PiperVoice
from piper.config import SynthesisConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.environ.get('PIPER_VOICE', 'pl_PL-gosia-medium')
VDIR = os.environ.get('PIPER_DIR', os.path.join(ROOT, '.voices'))
CACHE = os.environ.get('HD_CACHE', os.path.join(ROOT, '.hd'))   # rendered mp3s kept between builds
OUT = os.path.join(ROOT, 'web', 'a')
os.makedirs(CACHE, exist_ok=True); os.makedirs(OUT, exist_ok=True)

jobs = json.load(open(os.path.join(ROOT, 'web', 'audio.json'), encoding='utf-8'))
voice = PiperVoice.load(os.path.join(VDIR, VOICE + '.onnx'))
cfg = SynthesisConfig(length_scale=1.1)   # a little slower than normal speech, for learners
FILTER = ('silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,'
          'areverse,loudnorm=I=-18:TP=-2,adelay=60')

def key(name, text):  # re-render only when the text or the voice changes
    import hashlib
    return os.path.join(CACHE, name + '-' + hashlib.sha1((VOICE + '|' + text).encode()).hexdigest()[:10] + '.mp3')

todo = []
for name, text in jobs.items():
    c = key(name, text)
    if not os.path.exists(c):
        wav = os.path.join(CACHE, name + '.wav')
        with wave.open(wav, 'wb') as wf:
            voice.synthesize_wav(text, wf, syn_config=cfg)
        todo.append((wav, c))

def enc(j):
    wav, mp3 = j
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '22050', '-af', FILTER, '-c:a', 'libmp3lame', '-b:a', '40k', mp3], check=True)
    os.remove(wav)

with ThreadPoolExecutor(4) as ex: list(ex.map(enc, todo))
for name, text in jobs.items():
    subprocess.run(['cp', key(name, text), os.path.join(OUT, name + '.mp3')], check=True)
open(os.path.join(ROOT, 'web', 'audio-hd.js'), 'w').write('window.AUDIO_HD = true; /* Piper ' + VOICE + ' */\n')
print('rendered', len(todo), 'new,', len(jobs), 'total, voice', VOICE)
