/* Polish IPA, rule-based: a JavaScript port of tools/src/g2p_check.py + ipa_word from tools/prep.py.
   Used for words the teacher adds, so they get a transcription with stress like the built-in ones. */
(function (root) {
'use strict';
const VOW = { a: 'a', e: 'ɛ', i: 'i', o: 'ɔ', u: 'u', ó: 'u', y: 'ɨ', ą: 'Ą', ę: 'Ę' };
const PAIRS = { b: 'p', d: 't', 'ɡ': 'k', v: 'f', z: 's', 'ʐ': 'ʂ', 'ʑ': 'ɕ', dz: 'ts', 'dʐ': 'tʂ', 'dʑ': 'tɕ' };
const VOICE = {}; for (const k in PAIRS) VOICE[PAIRS[k]] = k;
const OBS = new Set(Object.keys(PAIRS).concat(Object.keys(VOICE), ['x']));
const VOWELS = new Set(['a', 'ɛ', 'i', 'ɔ', 'u', 'ɨ', 'ɔ̃', 'ɛ̃']);
const SINGLE = { b: 'b', c: 'ts', ć: 'tɕ', d: 'd', f: 'f', g: 'ɡ', h: 'x', j: 'j', k: 'k', l: 'l', ł: 'w', m: 'm', n: 'n', ń: 'ɲ', p: 'p', r: 'r', s: 's', ś: 'ɕ', t: 't', w: 'v', z: 'z', ź: 'ʑ', ż: 'ʐ' };
const isv = c => c in VOW;
const LIQ = ['r', 'l', 'j', 'w'], FR = ['s', 'z', 'ʂ', 'ʐ', 'ɕ', 'ʑ', 'f', 'v', 'x'];
const OVR = { aaron: 'ˈaarɔn' };

function parse(word) {
  const w = Array.from(word.toLowerCase()), n = w.length, ph = []; let i = 0;
  const add = (s, tr, pal) => ph.push({ s, tr: !!tr, pal: !!pal });
  while (i < n) {
    const c = w[i], a = w[i + 1] || '', b = w[i + 2] || '';
    if (c === 'd' && a === 'z') { if (b === 'i') { add('dʑ'); i += (i + 3 < n && isv(w[i + 3])) ? 3 : 2; continue; } add('dz'); i += 2; continue; }
    if (c === 'd' && a === 'ż') { add('dʐ'); i += 2; continue; }
    if (c === 'd' && a === 'ź') { add('dʑ'); i += 2; continue; }
    if (c === 'c' && a === 'h') { if (b === 'i' && i + 3 < n && isv(w[i + 3])) { add('x', 0, 1); i += 3; continue; } add('x'); i += 2; continue; }
    if (c === 'c' && a === 'z') { add('tʂ'); i += 2; continue; }
    if (c === 's' && a === 'z') { add('ʂ'); i += 2; continue; }
    if (c === 'r' && a === 'z') { add('ʐ', 1); i += 2; continue; }
    if ('cszn'.includes(c) && a === 'i') { add({ c: 'tɕ', s: 'ɕ', z: 'ʑ', n: 'ɲ' }[c]); i += (i + 2 < n && isv(w[i + 2])) ? 2 : 1; continue; }
    if ('pbmfwkgh'.includes(c) && a === 'i' && i + 2 < n && isv(w[i + 2])) { add({ p: 'p', b: 'b', m: 'm', f: 'f', w: 'v', k: 'k', g: 'ɡ', h: 'x' }[c], c === 'w', 1); i += 2; continue; }
    if ('lrtd'.includes(c) && a === 'i' && i + 2 < n && isv(w[i + 2])) { add(SINGLE[c]); add('j'); i += 2; continue; }
    if ('ae'.includes(c) && a === 'u') { add(VOW[c]); add('w'); i += 2; continue; }
    if (c in VOW) { add(VOW[c]); i++; continue; }
    if (c in SINGLE) { add(SINGLE[c], c === 'w'); i++; continue; }
    i++;
  }
  return ph;
}
function nasal(ph) {
  const out = [];
  ph.forEach((p, k) => {
    if (p.s === 'Ą' || p.s === 'Ę') {
      const v = p.s === 'Ą' ? 'ɔ' : 'ɛ', nx = k + 1 < ph.length ? ph[k + 1].s : null;
      if (nx === null) { out.push({ s: v === 'ɔ' ? 'ɔ̃' : 'ɛ', tr: false, pal: false }); return; }
      let cons;
      if (nx === 'p' || nx === 'b') cons = 'm';
      else if (['t', 'd', 'ts', 'dz', 'tʂ', 'dʐ'].includes(nx)) cons = 'n';
      else if (nx === 'k' || nx === 'ɡ') cons = 'ŋ';
      else if (nx === 'tɕ' || nx === 'dʑ') cons = 'ɲ';
      else if (nx === 'l' || nx === 'w') cons = '';
      else cons = null;
      if (cons === null) out.push({ s: v + '̃', tr: false, pal: false });
      else { out.push({ s: v, tr: false, pal: false }); if (cons) out.push({ s: cons, tr: false, pal: false }); }
    } else out.push(p);
  });
  out.forEach((p, k) => { if (p.s === 'n' && k + 1 < out.length && (out[k + 1].s === 'k' || out[k + 1].s === 'ɡ')) p.s = 'ŋ'; });
  return out;
}
function voicing(ph, nextVoice) {
  let nv = nextVoice === undefined ? false : nextVoice;
  for (let k = ph.length - 1; k >= 0; k--) {
    const p = ph[k]; let s = p.s;
    if (!OBS.has(s)) { nv = null; continue; }
    if (nv === true && s in VOICE) p.s = VOICE[s];
    else if (nv === false && s in PAIRS) p.s = PAIRS[s];
    s = p.s;
    if (p.tr) nv = (s in VOICE) ? false : null;
    else nv = s !== 'x' ? (s in PAIRS) : false;
  }
  for (let k = 1; k < ph.length; k++) if (ph[k].tr && ph[k].s in PAIRS && ph[k - 1].s in VOICE) ph[k].s = PAIRS[ph[k].s];
  const out = [];
  ph.forEach(p => { const l = out[out.length - 1]; if (l && l.s === p.s && p.s.length === 2 && OBS.has(p.s)) return; out.push(p); });
  return out;
}
const nuclei = ph => ph.map((p, k) => VOWELS.has(p.s) ? k : -1).filter(k => k >= 0);

function ipaWord(wd, idx, ws) {
  const lw = wd.toLowerCase(); if (OVR[lw]) return OVR[lw];
  let ph = nasal(parse(wd));
  if ((lw === 'w' || lw === 'z') && idx + 1 < ws.length) {
    const nxt = nasal(parse(ws[idx + 1])), first = nxt.length ? nxt[0].s : null;
    ph = voicing(ph, (first in VOICE) ? false : true);
  } else ph = voicing(ph);
  const nu = nuclei(ph); let mark = null;
  if (nu.length >= 2) {
    let st = nu.length - 2;
    if (/(liśmy|łyśmy|liście|łyście)$/.test(lw) && nu.length >= 3) st = nu.length - 3;
    let j = nu[st];
    const V = q => VOWELS.has(ph[q].s);
    if (j - 1 >= 0 && !V(j - 1)) {
      j--;
      if (j - 1 >= 0 && !V(j - 1) && LIQ.includes(ph[j].s) && OBS.has(ph[j - 1].s)) j--;
      else if (j - 1 >= 0 && FR.includes(ph[j - 1].s) && !FR.includes(ph[j].s)) j--;
    }
    let allCons = true; for (let q = 0; q < j; q++) if (V(q)) { allCons = false; break; }
    if (allCons) j = 0;
    mark = j;
  }
  return ph.map((p, q) => (q === mark ? 'ˈ' : '') + p.s + (p.pal ? 'ʲ' : '')).join('');
}
function ipa(pl) {
  const text = pl.replace(/\([^)]*\)/g, ' ').replace(/[?!.,…„”"«»:;]/g, ' ');
  const ws = text.split(/\s+|\//).filter(x => x.trim());
  return ws.map((w, i) => ipaWord(w, i, ws)).join(' ');
}
root.PolishIPA = ipa;
if (typeof module !== 'undefined') module.exports = ipa;
})(typeof window !== 'undefined' ? window : globalThis);
