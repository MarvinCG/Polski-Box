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
    ltCredit: 'Revisión ortográfica y gramatical por', by: 'por {n}',
    tAdd: '➕ Añadir palabras', tVoice: '🎙️ Mi voz', vTitle: 'Graba tu voz', vSub: 'Aaron escuchará tu voz en lugar de la voz generada. Lee cada palabra o frase con naturalidad, a un ritmo un poco más lento de lo normal.',
    kMine: 'Tus palabras', kSit: 'Situaciones', kDlg: 'Diálogos', kCourse: 'Curso', onlyMissing: 'Solo sin grabar', search: 'Buscar…', done: '{n} de {t} grabadas',
    rec: 'Grabar', stop: 'Detener', recording: 'Grabando… toca Detener al terminar', processing: 'Procesando…', genVoice: 'Voz generada', herVoice: 'Tu grabación', saveNext: 'Guardar y siguiente', redo: 'Repetir', skip: 'Saltar ›',
    vSaved: 'Guardada ✓', vDel: 'Borrar grabación', vDelQ: '¿Borrar tu grabación?', vNone: 'No hay nada en esta lista.', noMic: 'Este navegador no puede grabar. Usa Chrome, Edge o Safari actualizados, con permiso de micrófono.', micDenied: 'Sin permiso para el micrófono. Actívalo en el navegador y vuelve a intentarlo.', silence: 'No se oyó nada. Acércate al micrófono y vuelve a grabar.',
    recorded: 'grabada', speaker: '{w}:', kbd: 'Teclado: Espacio grabar/detener · Enter guardar y siguiente · → saltar · P escuchar', recNew: '🎙️ Grabar tu voz para «{p}»', allDone: '¡Todo grabado en esta lista! 🎉'
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
    ltCredit: 'Spelling and grammar check by', by: 'by {n}',
    tAdd: '➕ Add words', tVoice: '🎙️ My voice', vTitle: 'Record your voice', vSub: 'Aaron will hear your voice instead of the generated one. Read each word or phrase naturally, a little slower than usual.',
    kMine: 'Your words', kSit: 'Situations', kDlg: 'Dialogues', kCourse: 'Course', onlyMissing: 'Only not recorded', search: 'Search…', done: '{n} of {t} recorded',
    rec: 'Record', stop: 'Stop', recording: 'Recording… tap Stop when you finish', processing: 'Processing…', genVoice: 'Generated voice', herVoice: 'Your recording', saveNext: 'Save & next', redo: 'Again', skip: 'Skip ›',
    vSaved: 'Saved ✓', vDel: 'Delete recording', vDelQ: 'Delete your recording?', vNone: 'Nothing in this list.', noMic: 'This browser cannot record. Use an up-to-date Chrome, Edge or Safari and allow the microphone.', micDenied: 'No microphone permission. Allow it in the browser and try again.', silence: 'Nothing was heard. Get closer to the microphone and record again.',
    recorded: 'recorded', speaker: '{w}:', kbd: 'Keyboard: Space record/stop · Enter save & next · → skip · P listen', recNew: '🎙️ Record your voice for “{p}”', allDone: 'Everything in this list is recorded! 🎉'
  },
  pl: {
    ttl: 'Nauczycielka', hello: 'Dodaj słówka dla Aarona', helloSub: 'Wpisz polskie słowo lub zwrot. Sprawdzę je, dodam emoji i wymowę, a przy następnej synchronizacji pojawi się w jego aplikacji jako nowe.',
    connect: 'Połącz', connectSub: 'Otwórz link od Aarona albo wklej tu kod zaczynający się od PBX1.', code: 'Kod', connectBtn: 'Połącz', badCode: 'Ten kod jest nieprawidłowy.',
    pl: 'Po polsku', es: 'Po hiszpańsku', en: 'Po angielsku', reg: 'Rejestr', regN: 'Neutralnie', regF: 'Formalnie (Pan/Pani)', regI: 'Nieformalnie (ty)', noteEs: 'Uwaga po hiszpańsku (opcjonalnie)', noteEn: 'Uwaga po angielsku (opcjonalnie)',
    emoji: 'Emoji', emojiSug: 'Propozycje', check: 'Sprawdź', listen: 'Posłuchaj', add: 'Dodaj do aplikacji', adding: 'Zapisuję…', checking: 'Sprawdzam…',
    ltOk: 'Pisownia i gramatyka: bez błędów.', ltIssues: 'Pisownia i gramatyka', apply: 'Zastosuj', dup: 'Już jest w aplikacji:', ipa: 'Wymowa (IPA)',
    ai: 'Sprawdzenie przez AI', aiOk: 'AI nie znalazła problemów.', aiCorr: 'Poprawiona wersja', aiFill: 'Propozycje', aiOff: 'Sprawdzanie przez AI wyłączone (opcjonalne).', aiErr: 'AI nie odpowiedziała: {e}',
    needTr: 'Dodaj tłumaczenie na hiszpański lub angielski.', needPl: 'Najpierw wpisz polskie słowo.', added: 'Dodano! Aaron zobaczy je jako nowe.',
    list: 'Dodane', none: 'Jeszcze nic nie dodano.', stNew: 'Nowe — jeszcze nie zaczęte', stBox: 'Przegródka {n} z 5', stM: 'Opanowane ✓', del: 'Usuń', delQ: 'Usunąć?', removed: 'Usunięto.',
    settings: 'Ustawienia', name: 'Twoje imię', aiKey: 'Klucz Google Gemini (opcjonalnie, za darmo)', aiModel: 'Model', save: 'Zapisz', saved: 'Zapisano.', aiHow: 'Utwórz go na aistudio.google.com/apikey. W darmowym planie Google może wykorzystywać teksty do ulepszania modeli.',
    out: 'Rozłącz', err: 'Błąd: {e}', e_token: 'Token jest nieprawidłowy.', e_forbidden: 'Brak uprawnień do zapisu w repozytorium.', e_repo: 'Nie znaleziono repozytorium.', e_offline: 'Brak połączenia.',
    ltCredit: 'Sprawdzanie pisowni i gramatyki:', by: 'dodała: {n}',
    tAdd: '➕ Dodaj słówka', tVoice: '🎙️ Mój głos', vTitle: 'Nagraj swój głos', vSub: 'Aaron usłyszy twój głos zamiast syntetycznego. Czytaj każde słowo lub zwrot naturalnie, trochę wolniej niż zwykle.',
    kMine: 'Twoje słówka', kSit: 'Sytuacje', kDlg: 'Dialogi', kCourse: 'Kurs', onlyMissing: 'Tylko nienagrane', search: 'Szukaj…', done: 'Nagrane: {n} z {t}',
    rec: 'Nagraj', stop: 'Zatrzymaj', recording: 'Nagrywam… dotknij Zatrzymaj, gdy skończysz', processing: 'Przetwarzam…', genVoice: 'Głos syntetyczny', herVoice: 'Twoje nagranie', saveNext: 'Zapisz i dalej', redo: 'Jeszcze raz', skip: 'Pomiń ›',
    vSaved: 'Zapisano ✓', vDel: 'Usuń nagranie', vDelQ: 'Usunąć nagranie?', vNone: 'Na tej liście nic nie ma.', noMic: 'Ta przeglądarka nie może nagrywać. Użyj aktualnego Chrome, Edge lub Safari i zezwól na mikrofon.', micDenied: 'Brak dostępu do mikrofonu. Zezwól na niego w przeglądarce i spróbuj ponownie.', silence: 'Nic nie było słychać. Podejdź bliżej mikrofonu i nagraj ponownie.',
    recorded: 'nagrane', speaker: '{w}:', kbd: 'Klawiatura: Spacja nagraj/zatrzymaj · Enter zapisz i dalej · → pomiń · P posłuchaj', recNew: '🎙️ Nagraj swój głos dla „{p}”', allDone: 'Wszystko z tej listy nagrane! 🎉'
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
async function getSha(path) {
  const r = await fetch(`${API}/repos/${C.r}/contents/${path}?t=${Date.now()}`, { headers: hdr(), cache: 'no-store' }).catch(() => { throw new Error('offline'); });
  if (r.status === 404) return null; if (!r.ok) throw ghErr(r); return (await r.json()).sha;
}
async function getRaw(path) {   // base64 content of a binary file
  const r = await fetch(`${API}/repos/${C.r}/contents/${path}?t=${Date.now()}`, { headers: hdr(), cache: 'no-store' }).catch(() => { throw new Error('offline'); });
  if (!r.ok) throw ghErr(r); return (await r.json()).content.replace(/\s/g, '');
}
async function putRaw(path, b64, sha, msg) {
  for (let k = 0; k < 2; k++) {
    const body = { message: msg, content: b64 }; if (sha) body.sha = sha;
    const r = await fetch(`${API}/repos/${C.r}/contents/${path}`, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, hdr()), body: JSON.stringify(body) }).catch(() => { throw new Error('offline'); });
    if (r.ok) return (await r.json()).content.sha;
    if ((r.status === 409 || r.status === 422) && k === 0) { sha = await getSha(path); continue; }
    throw ghErr(r);
  }
}
async function delFile(path, sha, msg) {
  sha = sha || await getSha(path); if (!sha) return;
  const r = await fetch(`${API}/repos/${C.r}/contents/${path}`, { method: 'DELETE', headers: Object.assign({ 'Content-Type': 'application/json' }, hdr()), body: JSON.stringify({ message: msg, sha }) }).catch(() => { throw new Error('offline'); });
  if (!r.ok && r.status !== 404) throw ghErr(r);
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
let WL = [], CARDS = {}, CFG = {}, VI = {}, myName = (() => { try { return localStorage.getItem('pbt.name') || ''; } catch (e) { return ''; } })();
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();
async function loadAll() {
  const [w, p, c, v] = await Promise.all([getFile('words.json'), getFile('progress.json').catch(() => ({ data: null })), getFile('config.json').catch(() => ({ data: null })), getFile('voice.json').catch(() => ({ data: null }))]);
  WL = (w.data && w.data.words) || []; CARDS = (p.data && p.data.cards) || {}; CFG = c.data || {}; VI = (v.data && v.data.items) || {};
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
  if (TAB === 'voice') { tw.innerHTML = tabsHTML() + voiceHTML(); return; }
  const regSeg = [['', t('regN')], ['F', t('regF')], ['I', t('regI')]].map(([v, l]) => `<button class="${F.r === v ? 'on' : ''}" data-a="reg" data-v="${v}">${l}</button>`).join('');
  tw.innerHTML = tabsHTML() + (lastAdded != null && WL[lastAdded] && window.PBRec && PBRec.supported() ? `<button class="btn s mt" style="margin-bottom:14px" data-a="recnew">${esc(t('recNew', { p: WL[lastAdded].pl }))}</button>` : '') + `<div class="tgrid"><div>
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
    return `<div class="wrow"><div class="pic sm"><span class="emo">${esc(w.em || '📝')}</span></div><div class="t"><b>${esc(w.pl)}</b><span class="gl">${esc(lang === 'en' ? (w.en || w.es) : (w.es || w.en))}${w.r ? ` <em class="rg ${w.r}">${w.r === 'F' ? t('regF').split(' (')[0] : t('regI').split(' (')[0]}</em>` : ''}</span><small>${st}${w.by ? ' · ' + esc(t('by', { n: w.by })) : ''}</small></div><button class="btn g sm" style="width:auto" data-a="del" data-k="${k}">${pendingDel === k ? t('delQ') : t('del')}</button></div>`;
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

/* ---------------- voice recording tab */
let TAB = 'add', lastAdded = null;
const VF = { kind: 'mine', missing: true, q: '' };
let VCUR = null, PREV = null, VSTATE = 'idle', VMSG = '', vDelQ = false;
const AUD = {};   // key -> object URL of downloaded recordings
const UN = window.UNITS || [];
const glOf = x => lang === 'en' ? (x.en || x.es) : (x.es || x.en);
function vItems(kind) {
  if (kind === 'mine') return WL.map((w, k) => w.del ? null : { key: 't' + k, pl: w.pl, gl: glOf(w), ipa: w.ipa || (window.PolishIPA ? PolishIPA(w.pl) : '') }).filter(Boolean);
  if (kind === 'dlg') { const o = []; UN.forEach(u => (u.ctx || []).forEach(l => o.push({ key: l.a, pl: l.pl, gl: glOf(l), who: lang === 'en' ? l.we : lang === 'pl' ? (SPK_PL[l.w] || l.w) : l.w, unit: lang === 'en' ? u.en : lang === 'pl' ? (u.pl || u.es) : u.es }))); return o; }
  return BUILT.filter(w => !!(UN[w.u] && UN[w.u].sit) === (kind === 'sit')).map(w => ({ key: w.a, pl: w.pl, gl: glOf(w), ipa: w.ipa, unit: UN[w.u] ? (lang === 'en' ? UN[w.u].en : lang === 'pl' ? (UN[w.u].pl || UN[w.u].es) : UN[w.u].es) : '' }));
}
function vList() {
  const q = norm(VF.q);
  return vItems(VF.kind).filter(x => (!VF.missing || !VI[x.key] || (VCUR && x.key === VCUR.key)) && (!q || norm(x.pl + ' ' + x.gl).includes(q)));
}
function tabsHTML() { return `<div class="seg tabs" style="margin-bottom:14px;max-width:420px"><button class="${TAB === 'add' ? 'on' : ''}" data-a="tab" data-v="add">${t('tAdd')}</button><button class="${TAB === 'voice' ? 'on' : ''}" data-a="tab" data-v="voice">${t('tVoice')}</button></div>`; }
function voiceHTML() {
  if (!(window.PBRec && PBRec.supported())) return `<div class="card"><h2>${t('vTitle')}</h2><div class="fb bad">${t('noMic')}</div></div>`;
  const all = vItems(VF.kind), list = vList(), nDone = all.filter(x => VI[x.key]).length;
  if (!VCUR || !all.find(x => x.key === VCUR.key)) VCUR = list[0] || null;
  const segK = [['mine', t('kMine')], ['sit', t('kSit')], ['dlg', t('kDlg')], ['course', t('kCourse')]].map(([v, l]) => `<button class="${VF.kind === v ? 'on' : ''}" data-a="vkind" data-v="${v}">${l}</button>`).join('');
  let rec = '';
  if (!VCUR) rec = `<div class="card"><div class="empty">${all.length ? t('allDone') : t('vNone')}</div></div>`;
  else {
    const c = VCUR, has = !!VI[c.key], rn = VSTATE === 'rec';
    rec = `<div class="card recc"><div class="small">${c.unit ? esc(c.unit) + ' · ' : ''}${t('done', { n: nDone, t: all.length })}</div>
      ${c.who ? `<div class="small" style="font-weight:700;margin-top:8px">${esc(t('speaker', { w: c.who }))}</div>` : ''}
      <div class="pl" style="font-size:clamp(24px,4vw,34px);margin-top:8px">${esc(c.pl)}</div>${c.ipa ? `<div class="ipa">/${esc(c.ipa)}/</div>` : ''}<div class="gl mt">${esc(c.gl)}</div>
      <div class="lvl mt"><i id="lvl"></i></div>
      <div class="rbtns mt">
        <button class="btn ${rn ? 'bad' : ''} recb" data-a="vrec" ${VSTATE === 'proc' ? 'disabled' : ''}>${rn ? '⏹ ' + t('stop') : '🎙️ ' + t('rec')}</button>
        <button class="btn s sm" data-a="vgen" ${rn ? 'disabled' : ''}>🔊 ${t('genVoice')}</button>
        ${PREV || has ? `<button class="btn s sm" data-a="vhers" ${rn ? 'disabled' : ''}>▶ ${t('herVoice')}${has && !PREV ? ' ✓' : ''}</button>` : ''}
      </div>
      ${VMSG ? `<div class="small mt" style="font-weight:700">${esc(VMSG)}</div>` : ''}
      ${PREV ? `<div class="btns two mt"><button class="btn" data-a="vsave" id="vsave">✓ ${t('saveNext')}</button><button class="btn g" data-a="vredo">↻ ${t('redo')}</button></div>` : ''}
      <div class="btns two mt"><button class="btn g sm" data-a="vskip">${t('skip')}</button>${has && !PREV ? `<button class="btn g sm" data-a="vdel">${vDelQ ? t('vDelQ') : '🗑 ' + t('vDel')}</button>` : '<span></span>'}</div>
      <div class="small mt kbh">${t('kbd')}</div></div>`;
  }
  const rows = list.slice(0, 300).map(x => `<button class="wrow ${VCUR && x.key === VCUR.key ? 'sel' : ''}" data-a="vsel" data-k="${esc(x.key)}"><div class="t"><b>${esc(x.pl)}</b><span class="gl">${esc(x.gl)}</span></div>${VI[x.key] ? `<span class="tag m">✓ ${t('recorded')}</span>` : ''}</button>`).join('');
  return `<div class="tgrid"><div><div class="card"><h2>${t('vTitle')}</h2><p class="gl" style="margin:0">${t('vSub')}</p></div>${rec}</div>
    <div><div class="card"><div class="seg" style="flex-wrap:wrap">${segK}</div>
      <div style="display:flex;gap:10px;align-items:center;margin-top:10px"><input class="field" id="vq" placeholder="${esc(t('search'))}" value="${esc(VF.q)}" autocomplete="off" style="flex:1"><label style="margin:0;display:flex;gap:6px;align-items:center;white-space:nowrap"><input type="checkbox" id="vmiss" ${VF.missing ? 'checked' : ''}> ${t('onlyMissing')}</label></div>
      <div class="vlist mt">${rows || `<div class="empty">${t('vNone')}</div>`}</div></div></div></div>`;
}
function vrender() { if (TAB === 'voice') { const y = window.scrollY; render(); window.scrollTo(0, y); } }
function vnext() {
  const list = vList(), i = list.findIndex(x => VCUR && x.key === VCUR.key);
  const nx = list.filter((x, j) => j > i && !VI[x.key])[0] || list.filter(x => !VI[x.key] && (!VCUR || x.key !== VCUR.key))[0] || list[i + 1] || null;
  VCUR = nx; PREV = null; VMSG = ''; vDelQ = false; VSTATE = 'idle';
}
function playUrl(u) { try { const a = new Audio(u); a.play().catch(() => {}); } catch (e) {} }
const VACT = {
  tab(d) { readForm(); TAB = d.v; render(); },
  recnew() { TAB = 'voice'; VF.kind = 'mine'; VCUR = vItems('mine').find(x => x.key === 't' + lastAdded) || null; lastAdded = null; PREV = null; render(); },
  vkind(d) { VF.kind = d.v; VCUR = null; PREV = null; VMSG = ''; render(); },
  vsel(d) { if (VSTATE === 'rec') return; VCUR = vItems(VF.kind).find(x => x.key === d.k) || null; PREV = null; VMSG = ''; vDelQ = false; vrender(); },
  async vrec() {
    if (VSTATE === 'rec') {
      VSTATE = 'proc'; VMSG = t('processing'); vrender();
      try { const blob = await PBRec.stop(); PREV = await PBRec.toMp3(blob); VMSG = ''; VSTATE = 'idle'; vrender(); playUrl(PREV.url); }
      catch (e) { VSTATE = 'idle'; PREV = null; VMSG = e.message === 'silence' ? t('silence') : String(e.message || e); vrender(); }
      return;
    }
    if (VSTATE !== 'idle') return;
    try {
      PREV = null; VMSG = t('recording'); VSTATE = 'rec'; vrender();
      await PBRec.start(lv => { const e = document.getElementById('lvl'); if (e) e.style.width = Math.min(100, Math.round(lv * 140)) + '%'; }, () => { if (VSTATE === 'rec') VACT.vrec(); });
    } catch (e) { VSTATE = 'idle'; VMSG = /denied|allowed|permission/i.test(e.name + e.message) ? t('micDenied') : t('noMic'); vrender(); }
  },
  vredo() { PREV = null; VMSG = ''; VACT.vrec(); },
  vgen() { if (!VCUR || !window.speechSynthesis) return; const vs = speechSynthesis.getVoices().filter(v => /^pl/i.test(v.lang)).sort((a, b) => (/natural|neural|online|enhanced|premium|google/i.test(b.name) ? 1 : 0) - (/natural|neural|online|enhanced|premium|google/i.test(a.name) ? 1 : 0)); const u = new SpeechSynthesisUtterance(VCUR.pl.replace(/\([^)]*\)/g, ' ')); u.lang = 'pl-PL'; if (vs[0]) u.voice = vs[0]; u.rate = 0.92; speechSynthesis.cancel(); speechSynthesis.speak(u); },
  async vhers() {
    if (!VCUR) return; if (PREV) return playUrl(PREV.url);
    const k = VCUR.key; if (AUD[k]) return playUrl(AUD[k]);
    try { const b64 = await getRaw('voice/' + k + '.mp3'); AUD[k] = 'data:audio/mpeg;base64,' + b64; playUrl(AUD[k]); } catch (e) { toast(errT(e)); }
  },
  async vsave() {
    if (!PREV || !VCUR) return; const k = VCUR.key, P0 = PREV; const b = document.getElementById('vsave'); if (b) { b.disabled = true; b.textContent = t('adding'); }
    try {
      const sha = await putRaw('voice/' + k + '.mp3', P0.b64, VI[k] && VI[k].sha, `voice: ${VCUR.pl}`);
      const d = await update('voice.json', x => { x.items = x.items || {}; x.items[k] = { at: Date.now(), sha, s: P0.secs, by: myName || undefined }; }, `voice index: ${k}`, { v: 1, items: {} });
      VI = d.items; AUD[k] = 'data:audio/mpeg;base64,' + P0.b64; toast(t('vSaved')); vnext(); vrender();
    } catch (e) { toast(errT(e)); if (b) { b.disabled = false; b.textContent = '✓ ' + t('saveNext'); } }
  },
  vskip() { if (VSTATE === 'rec') return; vnext(); vrender(); },
  async vdel() {
    if (!VCUR) return; if (!vDelQ) { vDelQ = true; return vrender(); }
    const k = VCUR.key; vDelQ = false;
    try { await delFile('voice/' + k + '.mp3', VI[k] && VI[k].sha, `voice: remove ${k}`); const d = await update('voice.json', x => { x.items = x.items || {}; delete x.items[k]; }, `voice index: remove ${k}`, { v: 1, items: {} }); VI = d.items; delete AUD[k]; toast(t('removed')); vrender(); }
    catch (e) { toast(errT(e)); }
  }
};
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
      WL = d.words; lastAdded = WL.length - 1; Object.assign(F, { pl: '', es: '', en: '', r: '', ne: '', nn: '', em: '' }); lastLT = []; lastAI = null;
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
document.addEventListener('click', e => { const a = e.target.closest('[data-a]'); const f = a && (VACT[a.dataset.a] || ACT[a.dataset.a]); if (f) { e.preventDefault(); f(a.dataset, a); } const l = e.target.closest('#lang button'); if (l) { readForm(); lang = l.dataset.l; try { localStorage.setItem('pbt.lang', lang); } catch (x) {} render(); } });
document.addEventListener('change', e => { if (e.target.id === 'vmiss') { VF.missing = e.target.checked; render(); } });
document.addEventListener('input', e => { if (e.target.id === 'vq') { VF.q = e.target.value; clearTimeout(window.__vq); window.__vq = setTimeout(() => { const pos = e.target.selectionStart; render(); const n = document.getElementById('vq'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} } }, 250); return; }
  if (e.target.id === 'f_es' || e.target.id === 'f_en') { clearTimeout(window.__ed); window.__ed = setTimeout(drawEmojis, 300); } });
document.addEventListener('keydown', e => {
  if (TAB === 'voice' && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) {
    if (e.key === ' ') { e.preventDefault(); VACT.vrec(); return; }
    if (e.key === 'Enter' && PREV) { e.preventDefault(); VACT.vsave(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); VACT.vskip(); return; }
    if (e.key === 'p' || e.key === 'P') { VACT.vhers(); return; }
    if (e.key === 'g' || e.key === 'G') { VACT.vgen(); return; }
  }
  if (e.key === 'Enter' && e.target.id === 'f_pl') { e.preventDefault(); ACT.check(); } if (e.key === 'Enter' && e.target.id === 'code') ACT.connect(); });
async function boot() {
  render(); if (!C) return;
  try { await loadAll(); } catch (e) { toast(errT(e)); if (e.message === 'token' || e.message === 'repo') { /* keep the form; let them reconnect */ } }
  readForm(); render();
}
if (window.speechSynthesis) speechSynthesis.getVoices();
boot();
})();
