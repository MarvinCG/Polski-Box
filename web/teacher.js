/* Polski Box · teacher page.
   The teacher types a word or phrase; it is checked (LanguageTool spelling/grammar, optional Google Gemini review,
   duplicates, IPA) and saved to words.json in the private data repository. The student's apps pick it up on their next sync. */
(function () {
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KEY = 'polskibox.teacher', API = 'https://api.github.com', CB = 5000;
const L = {
  es: {
    ttl: 'Profesora', hello: 'Añadir palabras para Aaron', helloSub: 'Escribe una palabra o una frase en polaco. La reviso, le pongo emoji y pronunciación, y aparece en su app como nueva en la próxima sincronización.',
    connect: 'Conectar', connectSub: 'Abre el enlace que te mandó Aaron, o pega aquí el código que empieza con PBX1.', code: 'Código', connectBtn: 'Conectar', badCode: 'Ese código no es válido.',
    pl: 'Polaco', es: 'Español', en: 'Inglés', reg: 'Registro', regN: 'Neutral', regF: 'Formal (Pan/Pani)', regI: 'Informal (ty)', noteEs: 'Nota en español (opcional)', noteEn: 'Nota en inglés (opcional)',
    emoji: 'Emoji', emojiSug: 'Sugeridos', check: 'Revisar', listen: 'Escuchar', add: 'Añadir a la app', adding: 'Guardando…', checking: 'Revisando…',
    ltOk: 'Ortografía y gramática: sin errores.', ltIssues: 'Ortografía y gramática', apply: 'Aplicar', dup: 'Ya existe en la app:', ipa: 'Pronunciación (IPA)',
    ai: 'Revisión con IA', aiOk: 'La IA no encontró problemas.', aiCorr: 'Propuesta corregida', aiFill: 'Sugerencias', aiOff: 'Revisión con IA desactivada (opcional).', aiErr: 'La IA no respondió: {e}',
    needTr: 'Falta la traducción al español o al inglés.', needPl: 'Escribe primero la palabra en polaco.', added: '¡Añadida! Aaron la verá como nueva.',
    list: 'Añadidas', none: 'Aún no has añadido nada.', stNew: 'Nueva — todavía no la empezó', stBox: 'Caja {n} de 5', stM: 'Dominada ✓', del: 'Quitar', delQ: '¿Quitar?', removed: 'Quitada.',
    settings: 'Ajustes', name: 'Tu nombre', aiKey: 'Clave de Google Gemini (opcional, gratis)', aiModel: 'Modelo', save: 'Guardar', saved: 'Guardado.', aiHow: 'Créala en aistudio.google.com/apikey. En el nivel gratuito Google puede usar los textos para mejorar sus modelos.',
    out: 'Desconectar', err: 'Error: {e}', e_token: 'El token no es válido.', e_forbidden: 'Sin permiso para escribir en el repositorio.', e_repo: 'No se encontró el repositorio.', e_offline: 'Sin conexión.',
    ltCredit: 'Revisión ortográfica y gramatical por', by: 'por {n}'
  },
  en: {
    ttl: 'Teacher', hello: 'Add words for Aaron', helloSub: 'Type a Polish word or phrase. I check it, add an emoji and the pronunciation, and it shows up in his app as new on the next sync.',
    connect: 'Connect', connectSub: 'Open the link Aaron sent you, or paste the code that starts with PBX1.', code: 'Code', connectBtn: 'Connect', badCode: 'That code is not valid.',
    pl: 'Polish', es: 'Spanish', en: 'English', reg: 'Register', regN: 'Neutral', regF: 'Formal (Pan/Pani)', regI: 'Informal (ty)', noteEs: 'Note in Spanish (optional)', noteEn: 'Note in English (optional)',
    emoji: 'Emoji', emojiSug: 'Suggested', check: 'Check', listen: 'Listen', add: 'Add to the app', adding: 'Saving…', checking: 'Checking…',
    ltOk: 'Spelling and grammar: no issues.', ltIssues: 'Spelling and grammar', apply: 'Apply', dup: 'Already in the app:', ipa: 'Pronunciation (IPA)',
    ai: 'AI review', aiOk: 'The AI found no problems.', aiCorr: 'Corrected proposal', aiFill: 'Suggestions', aiOff: 'AI review is off (optional).', aiErr: 'The AI did not answer: {e}',
    needTr: 'Add the Spanish or English translation.', needPl: 'Type the Polish word first.', added: 'Added! Aaron will see it as new.',
    list: 'Added', none: 'Nothing added yet.', stNew: 'New — not started yet', stBox: 'Box {n} of 5', stM: 'Mastered ✓', del: 'Remove', delQ: 'Remove?', removed: 'Removed.',
    settings: 'Settings', name: 'Your name', aiKey: 'Google Gemini key (optional, free)', aiModel: 'Model', save: 'Save', saved: 'Saved.', aiHow: 'Create it at aistudio.google.com/apikey. On the free tier Google may use the texts to improve its models.',
    out: 'Disconnect', err: 'Error: {e}', e_token: 'The token is not valid.', e_forbidden: 'No permission to write to the repository.', e_repo: 'Repository not found.', e_offline: 'No connection.',
    ltCredit: 'Spelling and grammar check by', by: 'by {n}'
  }
};
let lang = (() => { try { return localStorage.getItem('pbt.lang') || 'es'; } catch (e) { return 'es'; } })();
const t = (k, v) => { let s = (L[lang] || L.es)[k] || L.es[k] || k; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s; };
const errT = e => L.es['e_' + e.message] ? t('e_' + e.message) : t('err', { e: e.message });

/* ---------------- connection */
const b64e = s => btoa(unescape(encodeURIComponent(s)));
const b64d = s => decodeURIComponent(escape(atob(String(s).replace(/\s/g, ''))));
function readCode(s) {
  const m = String(s || '').match(/PBX1\.([A-Za-z0-9+/_-]+)/); if (!m) return null;
  try { let b = m[1].replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '='; const o = JSON.parse(b64d(b)); return o.r && o.t ? o : null; } catch (e) { return null; }
}
let C = (() => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } })();
const fromHash = readCode(location.hash);
if (fromHash) { C = { r: fromHash.r, t: fromHash.t }; try { localStorage.setItem(KEY, JSON.stringify(C)); } catch (e) {} history.replaceState(null, '', location.pathname); }
function hdr() { return { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + C.t, 'X-GitHub-Api-Version': '2022-11-28' }; }
function ghErr(r) { return new Error(r.status === 401 ? 'token' : r.status === 403 ? 'forbidden' : r.status === 404 ? 'repo' : r.status === 409 || r.status === 422 ? 'conflict' : 'http' + r.status); }
async function getFile(path) {
  let r; try { r = await fetch(`${API}/repos/${C.r}/contents/${path}?t=${Date.now()}`, { headers: hdr(), cache: 'no-store' }); } catch (e) { throw new Error('offline'); }
  if (r.status === 404) return { sha: null, data: null };
  if (!r.ok) throw ghErr(r);
  const j = await r.json(); return { sha: j.sha, data: JSON.parse(b64d(j.content)) };
}
async function putFile(path, data, sha, msg) {
  const body = { message: msg, content: b64e(JSON.stringify(data, null, 1)) }; if (sha) body.sha = sha;
  let r; try { r = await fetch(`${API}/repos/${C.r}/contents/${path}`, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, hdr()), body: JSON.stringify(body) }); } catch (e) { throw new Error('offline'); }
  if (!r.ok) throw ghErr(r);
}
/** read-modify-write with retries, so the student's sync and the teacher never overwrite each other */
async function update(path, fn, msg, empty) {
  for (let k = 0; k < 4; k++) {
    const f = await getFile(path); const d = f.data || JSON.parse(JSON.stringify(empty));
    fn(d);
    try { await putFile(path, d, f.sha, msg); return d; } catch (e) { if (e.message !== 'conflict' || k === 3) throw e; }
  }
}

/* ---------------- data */
const BUILT = (window.WORDS || []);
let WL = [], CARDS = {}, CFG = {}, myName = (() => { try { return localStorage.getItem('pbt.name') || ''; } catch (e) { return ''; } })();
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();
async function loadAll() {
  const [w, p, c] = await Promise.all([getFile('words.json'), getFile('progress.json').catch(() => ({ data: null })), getFile('config.json').catch(() => ({ data: null }))]);
  WL = (w.data && w.data.words) || []; CARDS = (p.data && p.data.cards) || {}; CFG = c.data || {};
}
const toEmoji = p => { try { return String.fromCodePoint(...p.split('-').map(h => parseInt(h, 16))); } catch (e) { return ''; } };
const EMAP = (() => {   // gloss words of the built-in vocabulary -> emoji, to suggest pictures without AI
  const m = {};
  BUILT.forEach(w => { if (!w.p || /^[#dm]/.test(w.p)) return; const em = toEmoji(w.p); (norm(w.en) + ' ' + norm(w.es)).split(' ').forEach(k => { if (k.length > 2 && !/^(the|and|for|with|una|uno|los|las|del|que|por|con|para|you|your|her|his|this|that|esta|este|muy)$/.test(k)) (m[k] = m[k] || []).push(em); }); });
  return m;
})();
const PALETTE = '🙂 😊 😄 🤗 🙏 👋 🤝 💬 ❓ ❤️ 👍 👎 🏠 🍽️ ☕ 🍺 🧃 🍞 🧀 🥚 🍎 🥗 🍲 🍰 🛒 💳 🚗 🚌 ✈️ 🗺️ ⛪ 🎄 🎂 🎁 💐 📱 💻 🎮 ⚽ 🎵 📚 🐶 🐱 ☀️ 🌧️ ❄️ 🌳 ⏰ 📅 👨‍👩‍👧 👩 👨 👴 👵 👦 💤 🚿 🛏️'.split(' ');
function suggestEmoji(es, en) {
  const score = {}; (norm(en) + ' ' + norm(es)).split(' ').forEach(k => (EMAP[k] || []).forEach((e, j) => { score[e] = (score[e] || 0) + 1 / (1 + j * 0.2); }));
  return Object.keys(score).sort((a, b) => score[b] - score[a]).slice(0, 8);
}
function findDup(pl) {
  const n = norm(pl); if (!n) return null;
  const b = BUILT.find(w => w.pl.split(' / ').some(x => norm(x) === n)); if (b) return b;
  const c = WL.find(w => !w.del && norm(w.pl) === n); return c || null;
}

/* ---------------- checks */
async function languageTool(text) {
  const body = new URLSearchParams({ text, language: 'pl-PL', motherTongue: 'es' });
  const r = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', body, headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('LanguageTool ' + r.status);
  return (await r.json()).matches || [];
}
async function gemini(pl, es, en) {
  const key = CFG.gemini_key; if (!key) return null;
  const model = CFG.gemini_model || 'gemini-flash-latest';
  const prompt = `You assist a native Polish teacher who adds vocabulary to a learning app. The learner is an adult man from Costa Rica (Spanish speaker) learning Polish to talk with his girlfriend's family.
Check the Polish text for spelling, Polish diacritics, grammar and naturalness (is it what a native would really say?). Do not change correct text.
Return only JSON with these keys:
"corrected": the corrected Polish (identical to the input if it is already correct),
"ok": true if no change is needed,
"problems": array of {"es": short explanation in Spanish, "en": the same in English}, empty if none,
"es": natural Spanish translation, "en": natural English translation,
"register": "F" if it uses formal address (Pan, Pani, Państwo) or is clearly formal, "I" if it uses informal "ty" or is colloquial, "" if neutral,
"emoji": the single emoji that best illustrates it,
"note_es", "note_en": a short usage note only if really useful (else "").
Polish text: """${pl}"""
Teacher's Spanish (may be empty): """${es}"""
Teacher's English (may be empty): """${en}"""`;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status));
  const txt = (((j.candidates || [])[0] || {}).content || { parts: [{}] }).parts.map(p => p.text || '').join('');
  return JSON.parse(txt.replace(/^```json|```$/g, '').trim());
}

/* ---------------- UI */
const F = { pl: '', es: '', en: '', r: '', ne: '', nn: '', em: '' };
let lastLT = [], lastAI = null, pendingDel = null;
function readForm() { ['pl', 'es', 'en', 'ne', 'nn', 'em'].forEach(k => { const e = $('#f_' + k); if (e) F[k] = e.value; }); }
function toast(msg) { const e = document.createElement('div'); e.textContent = msg; e.style.cssText = 'position:fixed;left:50%;bottom:30px;transform:translateX(-50%);background:#14244a;color:#fff;padding:10px 18px;border-radius:99px;z-index:99;font-weight:600;max-width:90vw;text-align:center'; document.body.appendChild(e); setTimeout(() => e.remove(), 2600); }

function render() {
  document.documentElement.lang = lang; $('#ttl').textContent = t('ttl');
  document.querySelectorAll('#lang button').forEach(b => b.classList.toggle('on', b.dataset.l === lang));
  const tw = $('#tw');
  if (!C) {
    tw.innerHTML = `<div class="card" style="max-width:560px;margin:20px auto"><h2>${t('connect')}</h2><p class="gl" style="margin:0 0 10px">${t('connectSub')}</p>
      <label for="code">${t('code')}</label><input class="field" id="code" placeholder="PBX1.…" autocomplete="off"><button class="btn mt" data-a="connect">${t('connectBtn')}</button><div id="cerr"></div></div>`;
    return;
  }
  const regSeg = [['', t('regN')], ['F', t('regF')], ['I', t('regI')]].map(([v, l]) => `<button class="${F.r === v ? 'on' : ''}" data-a="reg" data-v="${v}">${l}</button>`).join('');
  tw.innerHTML = `<div class="tgrid"><div>
    <div class="card"><h2>${t('hello')}</h2><p class="gl" style="margin:0">${t('helloSub')}</p>
      <label for="f_pl">${t('pl')}</label><input class="field pl-in" id="f_pl" lang="pl" value="${esc(F.pl)}" autocomplete="off" spellcheck="true" placeholder="np. Świetnie Pani gotuje.">
      <div class="keys mt">${'ą ć ę ł ń ó ś ź ż'.split(' ').map(c => `<button data-a="key" data-c="${c}">${c}</button>`).join('')}</div>
      <div class="row2"><div><label for="f_es">${t('es')}</label><input class="field" id="f_es" value="${esc(F.es)}" autocomplete="off"></div><div><label for="f_en">${t('en')}</label><input class="field" id="f_en" value="${esc(F.en)}" autocomplete="off"></div></div>
      <label>${t('reg')}</label><div class="seg r">${regSeg}</div>
      <label for="f_em">${t('emoji')}</label><div style="display:flex;gap:10px;align-items:center"><input class="field emoin" id="f_em" value="${esc(F.em)}" maxlength="16" autocomplete="off"><span class="small">${t('emojiSug')}</span></div>
      <div class="emopick" id="emos"></div>
      <div class="row2"><div><label for="f_ne">${t('noteEs')}</label><textarea class="field" id="f_ne">${esc(F.ne)}</textarea></div><div><label for="f_nn">${t('noteEn')}</label><textarea class="field" id="f_nn">${esc(F.nn)}</textarea></div></div>
      <div class="btns two mt"><button class="btn s" data-a="check" id="bcheck">🔎 ${t('check')}</button><button class="btn s" data-a="listen">🔊 ${t('listen')}</button></div>
      <button class="btn mt" data-a="add" id="badd">➕ ${t('add')}</button>
      <div class="lt">${t('ltCredit')} <a href="https://languagetool.org" target="_blank" rel="noopener">LanguageTool</a>.</div>
    </div></div>
    <div><div id="res"></div>
    <div class="card lst"><h2>${t('list')} (${WL.filter(w => !w.del).length})</h2><div id="list">${listHTML()}</div></div>
    <div class="card"><h2>${t('settings')}</h2>
      <label for="s_name">${t('name')}</label><input class="field" id="s_name" value="${esc(myName)}" autocomplete="off">
      <label for="s_key">${t('aiKey')}</label><input class="field" id="s_key" type="password" value="${esc(CFG.gemini_key || '')}" autocomplete="off" placeholder="AIza…">
      <label for="s_model">${t('aiModel')}</label><input class="field" id="s_model" value="${esc(CFG.gemini_model || 'gemini-flash-latest')}" autocomplete="off">
      <p class="small">${t('aiHow')}</p>
      <div class="btns two"><button class="btn sm" data-a="savecfg">${t('save')}</button><button class="btn g sm" data-a="out">${t('out')}</button></div>
    </div></div></div>`;
  drawEmojis();
}
function drawEmojis() {
  readForm(); const sug = suggestEmoji(F.es, F.en); const list = Array.from(new Set(sug.concat(PALETTE))).slice(0, 40);
  if (lastAI && lastAI.emoji && list.indexOf(lastAI.emoji) < 0) list.unshift(lastAI.emoji);
  const e = $('#emos'); if (e) e.innerHTML = list.map(x => `<button class="${F.em === x ? 'on' : ''}" data-a="emo" data-v="${esc(x)}">${x}</button>`).join('');
}
function listHTML() {
  const live = WL.map((w, k) => ({ w, k })).filter(o => !o.w.del).reverse();
  if (!live.length) return `<div class="empty">${t('none')}</div>`;
  return live.map(({ w, k }) => {
    const c = CARDS[CB + k], st = !c ? `<span class="tag d">✨ ${t('stNew')}</span>` : c.b >= 6 ? `<span class="tag m">${t('stM')}</span>` : `<span class="tag">${t('stBox', { n: c.b })}</span>`;
    return `<div class="wrow"><div class="pic sm"><span class="emo">${esc(w.em || '📝')}</span></div><div class="t"><b>${esc(w.pl)}</b><span class="gl">${esc(lang === 'en' ? (w.en || w.es) : (w.es || w.en))}${w.r ? ` <em class="rg ${w.r}">${w.r === 'F' ? 'Formal' : 'Informal'}</em>` : ''}</span><small>${st}${w.by ? ' · ' + esc(t('by', { n: w.by })) : ''}</small></div><button class="btn g sm" style="width:auto" data-a="del" data-k="${k}">${pendingDel === k ? t('delQ') : t('del')}</button></div>`;
  }).join('');
}
function resHTML(dup) {
  let h = '';
  if (dup) h += `<div class="issue bad"><b>⚠️ ${t('dup')}</b>${esc(dup.pl)} — ${esc(dup.es || dup.en || '')}</div>`;
  if (lastLT === null) h += `<div class="issue">LanguageTool —</div>`;
  else if (!lastLT.length) h += `<div class="issue ok"><b>✓ ${t('ltOk')}</b></div>`;
  else h += `<div class="small" style="font-weight:700;margin-top:10px">${t('ltIssues')}</div>` + lastLT.map((m, j) => {
    const c = m.context || {}, txt = c.text || '', o = c.offset || 0, n = c.length || 0;
    return `<div class="issue"><b>${esc(m.message)}</b><div class="ctx">${esc(txt.slice(0, o))}<mark>${esc(txt.slice(o, o + n))}</mark>${esc(txt.slice(o + n))}</div>${(m.replacements || []).slice(0, 5).map((r, q) => `<button class="sug" data-a="ltfix" data-j="${j}" data-q="${q}">${esc(r.value)}</button>`).join('')}</div>`;
  }).join('');
  const a = lastAI;
  if (a && a.error) h += `<div class="issue bad">${esc(t('aiErr', { e: a.error }))}</div>`;
  else if (a) {
    const corr = a.corrected && a.corrected.trim() !== F.pl.trim();
    h += `<div class="issue ai ${a.ok && !corr ? 'ok' : ''}"><b>🤖 ${t('ai')}</b>${a.ok && !corr ? t('aiOk') : ''}
      ${(a.problems || []).map(p => `<div class="ctx">• ${esc(lang === 'en' ? p.en : p.es)}</div>`).join('')}
      ${corr ? `<div class="mt"><span class="small">${t('aiCorr')}:</span> <b class="pl" style="font-size:19px">${esc(a.corrected)}</b> <button class="sug" data-a="aifix" data-k="pl">${t('apply')}</button></div>` : ''}
      ${[['es', a.es], ['en', a.en], ['ne', a.note_es], ['nn', a.note_en]].some(x => x[1] && x[1] !== F[x[0]]) || (a.register && a.register !== F.r) || (a.emoji && a.emoji !== F.em) ? `<div class="small mt" style="font-weight:700">${t('aiFill')}</div>` : ''}
      ${[['es', a.es], ['en', a.en], ['ne', a.note_es], ['nn', a.note_en]].filter(x => x[1] && x[1] !== F[x[0]]).map(([k, v]) => `<div class="ctx">${t({ es: 'es', en: 'en', ne: 'noteEs', nn: 'noteEn' }[k])}: <b>${esc(v)}</b> <button class="sug" data-a="aifix" data-k="${k}">${t('apply')}</button></div>`).join('')}
      ${a.register && a.register !== F.r ? `<div class="ctx">${t('reg')}: <b>${a.register === 'F' ? 'Formal' : 'Informal'}</b> <button class="sug" data-a="aifix" data-k="r">${t('apply')}</button></div>` : ''}
      ${a.emoji && a.emoji !== F.em ? `<div class="ctx">${t('emoji')}: <span style="font-size:24px">${esc(a.emoji)}</span> <button class="sug" data-a="aifix" data-k="em">${t('apply')}</button></div>` : ''}</div>`;
  } else if (!CFG.gemini_key) h += `<div class="small mt">${t('aiOff')}</div>`;
  if (F.pl.trim()) h += `<div class="issue ok"><b>${t('ipa')}</b><span class="ipa" style="font-size:18px">/${esc(window.PolishIPA ? PolishIPA(F.pl) : '')}/</span></div>`;
  return `<div class="card">${h}</div>`;
}

const ACT = {
  connect() { const c = readCode($('#code').value); if (!c) { $('#cerr').innerHTML = `<div class="fb bad mt small">${t('badCode')}</div>`; return; } C = { r: c.r, t: c.t }; try { localStorage.setItem(KEY, JSON.stringify(C)); } catch (e) {} boot(); },
  out() { C = null; try { localStorage.removeItem(KEY); } catch (e) {} render(); },
  key(d) { const e = $('#f_pl'); const p = e.selectionStart == null ? e.value.length : e.selectionStart; e.value = e.value.slice(0, p) + d.c + e.value.slice(e.selectionEnd == null ? p : e.selectionEnd); e.focus(); try { e.setSelectionRange(p + 1, p + 1); } catch (x) {} },
  reg(d) { readForm(); F.r = d.v; document.querySelectorAll('.seg.r button').forEach(b => b.classList.toggle('on', b.dataset.v === d.v)); },
  emo(d) { $('#f_em').value = d.v; readForm(); drawEmojis(); },
  listen() {
    readForm(); if (!F.pl.trim() || !window.speechSynthesis) return;
    const vs = speechSynthesis.getVoices().filter(v => /^pl/i.test(v.lang)).sort((a, b) => (/natural|neural|online|enhanced|premium|google/i.test(b.name) ? 1 : 0) - (/natural|neural|online|enhanced|premium|google/i.test(a.name) ? 1 : 0));
    const u = new SpeechSynthesisUtterance(F.pl); u.lang = 'pl-PL'; if (vs[0]) u.voice = vs[0]; u.rate = 0.92; speechSynthesis.cancel(); speechSynthesis.speak(u);
  },
  async check() {
    readForm(); if (!F.pl.trim()) { toast(t('needPl')); return; }
    const b = $('#bcheck'); b.disabled = true; b.textContent = t('checking');
    const dup = findDup(F.pl);
    const [lt, ai] = await Promise.all([languageTool(F.pl).catch(() => null), gemini(F.pl, F.es, F.en).catch(e => ({ error: e.message }))]);
    lastLT = lt; lastAI = ai;
    if (ai && !ai.error) {   // fill empty fields with the AI suggestions; filled ones stay as the teacher wrote them
      if (!F.es && ai.es) $('#f_es').value = ai.es; if (!F.en && ai.en) $('#f_en').value = ai.en;
      if (!F.em && ai.emoji) $('#f_em').value = ai.emoji; if (!F.ne && ai.note_es) $('#f_ne').value = ai.note_es; if (!F.nn && ai.note_en) $('#f_nn').value = ai.note_en;
      if (!F.r && ai.register) ACT.reg({ v: ai.register });
    } else if (!F.em) { const s = suggestEmoji(F.es, F.en); if (s[0]) $('#f_em').value = s[0]; }
    readForm(); $('#res').innerHTML = resHTML(dup); drawEmojis();
    b.disabled = false; b.textContent = '🔎 ' + t('check');
  },
  ltfix(d) {
    readForm(); const m = lastLT[Number(d.j)], r = m.replacements[Number(d.q)].value;
    $('#f_pl').value = F.pl.slice(0, m.offset) + r + F.pl.slice(m.offset + m.length); ACT.check();
  },
  aifix(d) {
    readForm(); const a = lastAI, k = d.k;
    if (k === 'pl') { $('#f_pl').value = a.corrected; return ACT.check(); }
    if (k === 'r') ACT.reg({ v: a.register });
    else $('#f_' + k).value = { es: a.es, en: a.en, ne: a.note_es, nn: a.note_en, em: a.emoji }[k];
    readForm(); $('#res').innerHTML = resHTML(findDup(F.pl)); drawEmojis();
  },
  async add() {
    readForm(); const pl = F.pl.trim().replace(/\s+/g, ' ');
    if (!pl) return toast(t('needPl')); if (!F.es.trim() && !F.en.trim()) return toast(t('needTr'));
    const b = $('#badd'); b.disabled = true; b.textContent = t('adding');
    const e = { pl, es: F.es.trim(), en: F.en.trim(), ipa: window.PolishIPA ? PolishIPA(pl) : '', em: F.em.trim() || suggestEmoji(F.es, F.en)[0] || '📝', at: Date.now() };
    if (F.r) e.r = F.r; if (F.ne.trim()) e.ne = F.ne.trim(); if (F.nn.trim()) e.nn = F.nn.trim(); if (myName) e.by = myName;
    try {
      const d = await update('words.json', d => { d.words = d.words || []; d.words.push(e); }, `teacher: ${pl}`, { v: 1, words: [] });
      WL = d.words; Object.assign(F, { pl: '', es: '', en: '', r: '', ne: '', nn: '', em: '' }); lastLT = []; lastAI = null;
      render(); toast(t('added'));
    } catch (er) { toast(errT(er)); b.disabled = false; b.textContent = '➕ ' + t('add'); }
  },
  async del(d) {
    const k = Number(d.k); if (pendingDel !== k) { pendingDel = k; $('#list').innerHTML = listHTML(); return; }
    pendingDel = null;
    try { const r = await update('words.json', x => { if (x.words[k]) x.words[k].del = true; }, `teacher: remove ${WL[k] && WL[k].pl}`, { v: 1, words: [] }); WL = r.words; readForm(); render(); toast(t('removed')); } catch (er) { toast(errT(er)); }
  },
  async savecfg() {
    myName = $('#s_name').value.trim(); try { localStorage.setItem('pbt.name', myName); } catch (e) {}
    const key = $('#s_key').value.trim(), model = $('#s_model').value.trim() || 'gemini-flash-latest';
    try {
      if (key !== (CFG.gemini_key || '') || model !== (CFG.gemini_model || 'gemini-flash-latest')) CFG = await update('config.json', c => { c.gemini_key = key; c.gemini_model = model; }, 'teacher settings', {});
      toast(t('saved'));
    } catch (er) { toast(errT(er)); }
  }
};
document.addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (a && ACT[a.dataset.a]) { e.preventDefault(); ACT[a.dataset.a](a.dataset, a); } const l = e.target.closest('#lang button'); if (l) { readForm(); lang = l.dataset.l; try { localStorage.setItem('pbt.lang', lang); } catch (x) {} render(); } });
document.addEventListener('input', e => { if (e.target.id === 'f_es' || e.target.id === 'f_en') { clearTimeout(window.__ed); window.__ed = setTimeout(drawEmojis, 300); } });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'f_pl') { e.preventDefault(); ACT.check(); } if (e.key === 'Enter' && e.target.id === 'code') ACT.connect(); });
async function boot() {
  render(); if (!C) return;
  try { await loadAll(); } catch (e) { toast(errT(e)); if (e.message === 'token' || e.message === 'repo') { /* keep the form; let them reconnect */ } }
  readForm(); render();
}
if (window.speechSynthesis) speechSynthesis.getVoices();
boot();
})();
