"""Rule-based Polish G2P used only to cross-check the hand-written IPA."""
import json, re, sys

VOW = {'a':'a','e':'ɛ','i':'i','o':'ɔ','u':'u','ó':'u','y':'ɨ','ą':'Ą','ę':'Ę'}
PAIRS = {'b':'p','d':'t','ɡ':'k','v':'f','z':'s','ʐ':'ʂ','ʑ':'ɕ','dz':'ts','dʐ':'tʂ','dʑ':'tɕ'}
DEVOICE = PAIRS
VOICE = {v:k for k,v in PAIRS.items()}
OBS = set(PAIRS) | set(VOICE) | {'x'}
VOWELS = {'a','ɛ','i','ɔ','u','ɨ','ɔ̃','ɛ̃'}
SINGLE = {'b':'b','c':'ts','ć':'tɕ','d':'d','f':'f','g':'ɡ','h':'x','j':'j','k':'k','l':'l',
          'ł':'w','m':'m','n':'n','ń':'ɲ','p':'p','r':'r','s':'s','ś':'ɕ','t':'t','w':'v',
          'z':'z','ź':'ʑ','ż':'ʐ'}

def isv(ch): return ch in VOW

def parse(word):
    w = word.lower(); n = len(w); i = 0; ph = []
    def add(s, tr=False, pal=False): ph.append({'s':s,'tr':tr,'pal':pal})
    while i < n:
        c = w[i]; a = w[i+1] if i+1<n else ''; b = w[i+2] if i+2<n else ''
        if c=='d' and a=='z':
            if b=='i':
                add('dʑ'); i += 3 if (i+3<n and isv(w[i+3])) else 2; continue
            add('dz'); i+=2; continue
        if c=='d' and a=='ż': add('dʐ'); i+=2; continue
        if c=='d' and a=='ź': add('dʑ'); i+=2; continue
        if c=='c' and a=='h':
            if b=='i' and i+3<n and isv(w[i+3]): add('x',pal=True); i+=3; continue
            add('x'); i+=2; continue
        if c=='c' and a=='z': add('tʂ'); i+=2; continue
        if c=='s' and a=='z': add('ʂ'); i+=2; continue
        if c=='r' and a=='z': add('ʐ',tr=True); i+=2; continue
        if c in 'cszn' and a=='i':
            add({'c':'tɕ','s':'ɕ','z':'ʑ','n':'ɲ'}[c])
            i += 2 if (i+2<n and isv(w[i+2])) else 1; continue
        if c in 'pbmfwkgh' and a=='i' and i+2<n and isv(w[i+2]):
            add({'p':'p','b':'b','m':'m','f':'f','w':'v','k':'k','g':'ɡ','h':'x'}[c], tr=(c=='w'), pal=True)
            i+=2; continue
        if c in 'lrtd' and a=='i' and i+2<n and isv(w[i+2]):
            add(SINGLE[c]); add('j'); i+=2; continue
        if c in 'ae' and a=='u': add(VOW[c]); add('w'); i+=2; continue
        if c in VOW: add(VOW[c]); i+=1; continue
        if c in SINGLE: add(SINGLE[c], tr=(c=='w')); i+=1; continue
        i+=1
    return ph

def nasal(ph):
    out = []
    for k,p in enumerate(ph):
        if p['s'] in ('Ą','Ę'):
            v = 'ɔ' if p['s']=='Ą' else 'ɛ'
            nx = ph[k+1]['s'] if k+1 < len(ph) else None
            if nx is None: out.append({'s': 'ɔ̃' if v=='ɔ' else 'ɛ','tr':False,'pal':False}); continue
            if nx in ('p','b'): cons='m'
            elif nx in ('t','d','ts','dz','tʂ','dʐ'): cons='n'
            elif nx in ('k','ɡ'): cons='ŋ'
            elif nx in ('tɕ','dʑ'): cons='ɲ'
            elif nx in ('l','w'): cons=''
            else: cons=None
            if cons is None: out.append({'s':v+'\u0303','tr':False,'pal':False})
            else:
                out.append({'s':v,'tr':False,'pal':False})
                if cons: out.append({'s':cons,'tr':False,'pal':False})
        else: out.append(p)
    for k,p in enumerate(out):
        if p['s']=='n' and k+1<len(out) and out[k+1]['s'] in ('k','ɡ'): p['s']='ŋ'
    return out

def voicing(ph, final_devoice=True, next_voice=None):
    nv = (False if final_devoice else None) if next_voice is None else next_voice
    for k in range(len(ph)-1, -1, -1):
        p = ph[k]; s = p['s']
        if s not in OBS: nv = None; continue
        if nv is True and s in VOICE: p['s'] = VOICE[s]
        elif nv is False and s in DEVOICE: p['s'] = DEVOICE[s]
        s = p['s']
        if p['tr']: nv = False if s in VOICE else None   # w/rz never voice what precedes
        else: nv = (s in DEVOICE) if s != 'x' else False
    for k in range(1, len(ph)):   # w, rz devoice after voiceless obstruents
        if ph[k]['tr'] and ph[k]['s'] in DEVOICE and ph[k-1]['s'] in VOICE: ph[k]['s'] = DEVOICE[ph[k]['s']]
    out = []
    for p in ph:   # ćdź -> dź etc.
        if out and out[-1]['s']==p['s'] and len(p['s'])==2 and p['s'] in OBS: continue
        out.append(p)
    return out

def render(ph):
    return ''.join(p['s'] + ('ʲ' if p['pal'] else '') for p in ph)

def nuclei(ph): return [k for k,p in enumerate(ph) if p['s'] in VOWELS]

def words(text):
    text = re.sub(r'\([^)]*\)', ' ', text)
    text = re.sub(r'[?!.,…„”"«»:;]', ' ', text)
    return [t for t in re.split(r'\s+|/', text) if t.strip()]

def g2p_phrase(text):
    ws = words(text); res = []
    for idx, wd in enumerate(ws):
        ph = nasal(parse(wd))
        if wd.lower() in ('w','z') and idx+1 < len(ws):
            nxt = nasal(parse(ws[idx+1]))
            first = nxt[0]['s'] if nxt else None
            nvoice = False if (first in VOICE) else True
            ph = voicing(ph, next_voice=nvoice)
        else:
            ph = voicing(ph)
        nu = nuclei(ph)
        stress = len(nu)-2 if len(nu) >= 2 else None
        res.append((render(ph), stress, len(nu)))
    return res

def manual_words(ipa):
    ipa = ipa.replace('/', ' ')
    out = []
    for t in ipa.split():
        segs = t.replace('ˈ','')
        # stressed nucleus index = number of vowels before the ˈ mark position
        if 'ˈ' in t:
            before = t.split('ˈ')[0]
            stressed = sum(1 for ch in before if ch in 'aɛiɔuɨ')
        else:
            stressed = None
        out.append((segs, stressed))
    return out

def main():
    units = []
    for f in ('data1.json','data2.json','data3.json','data4.json'):
        units += json.load(open(f, encoding='utf-8'))
    total = 0; issues = 0; seen = {}
    for u in units:
        for it in u['items']:
            total += 1
            key = it['pl'].lower()
            if key in seen: print(f"DUP  {it['pl']}  ({seen[key]} & {u['id']})")
            seen[key] = u['id']
            auto = g2p_phrase(it['pl']); man = manual_words(it['ipa'])
            if len(auto) != len(man):
                issues += 1
                print(f"LEN  {u['id']} {it['pl']!r}: manual={it['ipa']!r} auto={' '.join(a[0] for a in auto)!r}")
                continue
            for (aseg, ast, anu), (mseg, mst) in zip(auto, man):
                problems = []
                if aseg != mseg: problems.append('seg')
                if anu >= 2 and ast != mst: problems.append('stress')
                if anu < 2 and mst is not None: problems.append('mono-stress')
                if problems:
                    issues += 1
                    print(f"{'/'.join(problems):12s} {u['id']} {it['pl']!r}: manual={mseg!r}(s{mst}) auto={aseg!r}(s{ast})")
    print(f"\n{total} entries, {issues} flagged")

if __name__ == '__main__':
    main()
