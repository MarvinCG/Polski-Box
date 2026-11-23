/* Polski Box · teacher page.
   Tab 1 (Add): type a Polish word or phrase; it is checked (LanguageTool spelling/grammar, duplicates, IPA),
   gets an emoji or a photo from her gallery, and is saved to words.json in the private data repository.
   Tab 2 (Words): any word, phrase or dialogue line — record her voice, add a photo, or remove it from the app.
   The student's apps pick everything up on their next sync. */
(function () {
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KEY = 'polskibox.teacher', API = 'https://api.github.com', CB = 5000;
const L = {
  es: {
    ttl: 'Profesora', hello: 'Añadir palabras para Aaron', helloSub: 'Escribe una palabra o una frase en polaco. La reviso, le pongo emoji y pronunciación, y aparece en su app como nueva en la próxima sincronización.',
    connect: 'Conectar', connectSub: 'Abre el enlace que te mandó Aaron, o pega aquí el código que empieza con PBX1.', code: 'Código', connectBtn: 'Conectar', badCode: 'Ese código no es válido.',
    pl: 'Polaco', es: 'Traducción al español', reg: 'Registro', regN: 'Neutral', regF: 'Formal (Pan/Pani)', regI: 'Informal (ty)', noteEs: 'Nota para Aaron (opcional, en español)',
    emoji: 'Emoji', emojiSug: 'o elige uno', check: 'Revisar', listen: 'Escuchar', add: 'Añadir a la app', adding: 'Guardando…', checking: 'Revisando…',
    ltOk: 'Ortografía y gramática: sin errores.', ltIssues: 'Ortografía y gramática', dup: 'Ya existe en la app:', ipa: 'Pronunciación (IPA)', ltDown: 'No se pudo revisar la ortografía ahora. Puedes añadirla igual.',
    needTr: 'Falta la traducción al español.', needPl: 'Escribe primero la palabra en polaco.', added: '¡Añadida! Aaron la verá como nueva.',
    list: 'Añadidas', none: 'Aún no has añadido nada.', stNew: 'Nueva — todavía no la empezó', stBox: 'Caja {n} de 5', stM: 'Dominada ✓', del: 'Borrar', delQ: '¿Borrar?', removed: 'Borrada.',
    out: 'Desconectar', err: 'Error: {e}', e_token: 'El token no es válido.', e_forbidden: 'Sin permiso para escribir en el repositorio.', e_repo: 'No se encontró el repositorio.', e_offline: 'Sin conexión.',
    ltCredit: 'Revisión ortográfica y gramatical por',
    tAdd: '➕ Añadir palabra', tWords: '📚 Palabras', wTitle: 'Voz, foto y quitar', wSub: 'Elige una palabra o frase de la lista. Puedes grabar tu voz, ponerle una foto de tu galería, o quitarla si Aaron no la necesita.',
    kMine: 'Tus palabras', kSit: 'Situaciones', kDlg: 'Diálogos', kCourse: 'Curso', search: 'Buscar…', fAll: 'Todas', fNoVoice: 'Sin tu voz', fNoPhoto: 'Sin foto', fHidden: 'Quitadas',
    nVoice: '{n} de {t} con tu voz', voiceT: '🎙️ Tu voz', photoT: '🖼️ Foto', hideT: '🚫 Quitar de la app',
    rec: 'Grabar', stop: 'Detener', recording: 'Grabando… toca Detener al terminar', processing: 'Procesando…', genVoice: 'Voz generada', herVoice: 'Tu grabación', saveNext: 'Guardar y siguiente', redo: 'Repetir', skip: 'Siguiente ›',
    vSaved: 'Guardada ✓', vDel: 'Borrar grabación', vDelQ: '¿Borrar tu grabación?', vNone: 'No hay nada en esta lista.', noMic: 'Este navegador no puede grabar. Usa Chrome, Edge o Safari actualizados, con permiso de micrófono.', micDenied: 'Sin permiso para el micrófono. Actívalo en el navegador y vuelve a intentarlo.', silence: 'No se oyó nada. Acércate al micrófono y vuelve a grabar.',
    pick: '📷 Elegir foto', change: '📷 Cambiar foto', savePhoto: 'Guardar foto', cancel: 'Cancelar', delPhoto: 'Quitar foto', delPhotoQ: '¿Quitar la foto?', photoSaved: 'Foto guardada ✓', photoDel: 'Foto quitada.', photoErr: 'No se pudo leer esa imagen.', photoOpt: '🖼️ Foto (opcional, en lugar del emoji)', photoSub: 'Se muestra en lugar del dibujo. Mejor una foto clara, con el objeto en el centro.',
    hideSub: 'Aaron ya no la verá en sus sesiones ni en los juegos. Se puede volver a mostrar.', hideBtn: 'Quitar de la app', unhide: 'Volver a mostrar', hidOk: 'Quitada de la app.', unhidOk: 'Visible otra vez.', hidByS: 'Aaron la quitó de su estudio.', hidByT: 'La quitaste de la app.',
    speaker: '{w}:', kbd: 'Teclado: Espacio grabar/detener · Enter guardar y siguiente · → siguiente · P escuchar', recNew: '🎙️ Grabar tu voz para «{p}»', allDone: '¡Todo listo en esta lista! 🎉', hasVoice: 'con tu voz', hasPhoto: 'con foto', hidden: 'quitada', editT: "✏️ Modificar", editSub: "Cambia el polaco, la traducción o la nota (por ejemplo, agua en lugar de cerveza). Aaron lo ve en su próxima sincronización.", editBtn: "Modificar texto", eSave: "Guardar", eSaved: "Cambios guardados.", eRestore: "Volver al original", eRestored: "Se restauró el original.", edited: "modificada", orig: "original", stale: "⚠️ La frase cambió después de tu grabación. Grábala de nuevo; mientras tanto Aaron escucha la voz generada.", delT: "🗑 Eliminar definitivamente", delSub: "Desaparece por completo, también para Aaron, junto con tu voz y tu foto. No se puede recuperar.", delBtn: "Eliminar definitivamente", delQx: "¿Seguro? Toca otra vez para eliminar"
  },
  pl: {
    ttl: 'Nauczycielka', hello: 'Dodaj słówka dla Aarona', helloSub: 'Wpisz polskie słowo lub zwrot. Sprawdzę je, dodam emoji i wymowę, a przy następnej synchronizacji pojawi się w jego aplikacji jako nowe.',
    connect: 'Połącz', connectSub: 'Otwórz link od Aarona albo wklej tu kod zaczynający się od PBX1.', code: 'Kod', connectBtn: 'Połącz', badCode: 'Ten kod jest nieprawidłowy.',
    pl: 'Po polsku', es: 'Tłumaczenie na hiszpański', reg: 'Rejestr', regN: 'Neutralnie', regF: 'Formalnie (Pan/Pani)', regI: 'Nieformalnie (ty)', noteEs: 'Uwaga dla Aarona (opcjonalnie, po hiszpańsku)',
    emoji: 'Emoji', emojiSug: 'albo wybierz', check: 'Sprawdź', listen: 'Posłuchaj', add: 'Dodaj do aplikacji', adding: 'Zapisuję…', checking: 'Sprawdzam…',
    ltOk: 'Pisownia i gramatyka: bez błędów.', ltIssues: 'Pisownia i gramatyka', dup: 'Już jest w aplikacji:', ipa: 'Wymowa (IPA)', ltDown: 'Sprawdzanie pisowni jest teraz niedostępne. Możesz dodać słowo mimo to.',
    needTr: 'Dodaj tłumaczenie na hiszpański.', needPl: 'Najpierw wpisz polskie słowo.', added: 'Dodano! Aaron zobaczy je jako nowe.',
    list: 'Dodane', none: 'Jeszcze nic nie dodano.', stNew: 'Nowe — jeszcze nie zaczęte', stBox: 'Przegródka {n} z 5', stM: 'Opanowane ✓', del: 'Usuń', delQ: 'Usunąć?', removed: 'Usunięto.',
    out: 'Rozłącz', err: 'Błąd: {e}', e_token: 'Token jest nieprawidłowy.', e_forbidden: 'Brak uprawnień do zapisu w repozytorium.', e_repo: 'Nie znaleziono repozytorium.', e_offline: 'Brak połączenia.',
    ltCredit: 'Sprawdzanie pisowni i gramatyki:',
    tAdd: '➕ Dodaj słówko', tWords: '📚 Słówka', wTitle: 'Głos, zdjęcie i usuwanie', wSub: 'Wybierz słowo lub zwrot z listy. Możesz nagrać swój głos, dodać zdjęcie z galerii albo usunąć je, jeśli Aaron go nie potrzebuje.',
    kMine: 'Twoje słówka', kSit: 'Sytuacje', kDlg: 'Dialogi', kCourse: 'Kurs', search: 'Szukaj…', fAll: 'Wszystkie', fNoVoice: 'Bez twojego głosu', fNoPhoto: 'Bez zdjęcia', fHidden: 'Usunięte',
    nVoice: 'Z twoim głosem: {n} z {t}', voiceT: '🎙️ Twój głos', photoT: '🖼️ Zdjęcie', hideT: '🚫 Usuń z aplikacji',
    rec: 'Nagraj', stop: 'Zatrzymaj', recording: 'Nagrywam… dotknij Zatrzymaj, gdy skończysz', processing: 'Przetwarzam…', genVoice: 'Głos syntetyczny', herVoice: 'Twoje nagranie', saveNext: 'Zapisz i dalej', redo: 'Jeszcze raz', skip: 'Dalej ›',
    vSaved: 'Zapisano ✓', vDel: 'Usuń nagranie', vDelQ: 'Usunąć nagranie?', vNone: 'Na tej liście nic nie ma.', noMic: 'Ta przeglądarka nie może nagrywać. Użyj aktualnego Chrome, Edge lub Safari i zezwól na mikrofon.', micDenied: 'Brak dostępu do mikrofonu. Zezwól na niego w przeglądarce i spróbuj ponownie.', silence: 'Nic nie było słychać. Podejdź bliżej mikrofonu i nagraj ponownie.',
    pick: '📷 Wybierz zdjęcie', change: '📷 Zmień zdjęcie', savePhoto: 'Zapisz zdjęcie', cancel: 'Anuluj', delPhoto: 'Usuń zdjęcie', delPhotoQ: 'Usunąć zdjęcie?', photoSaved: 'Zdjęcie zapisane ✓', photoDel: 'Zdjęcie usunięte.', photoErr: 'Nie udało się odczytać tego obrazu.', photoOpt: '🖼️ Zdjęcie (opcjonalnie, zamiast emoji)', photoSub: 'Pojawia się zamiast rysunku. Najlepiej wyraźne zdjęcie z przedmiotem na środku.',
    hideSub: 'Aaron nie zobaczy go już w sesjach ani w grach. Można je przywrócić.', hideBtn: 'Usuń z aplikacji', unhide: 'Pokaż znowu', hidOk: 'Usunięto z aplikacji.', unhidOk: 'Znowu widoczne.', hidByS: 'Aaron usunął je ze swojej nauki.', hidByT: 'Usunęłaś je z aplikacji.',
    speaker: '{w}:', kbd: 'Klawiatura: Spacja nagraj/zatrzymaj · Enter zapisz i dalej · → dalej · P posłuchaj', recNew: '🎙️ Nagraj swój głos dla „{p}”', allDone: 'Na tej liście wszystko gotowe! 🎉', hasVoice: 'twój głos', hasPhoto: 'zdjęcie', hidden: 'usunięte', editT: "✏️ Zmień", editSub: "Zmień polski tekst, tłumaczenie lub uwagę (np. woda zamiast piwa). Aaron zobaczy to przy następnej synchronizacji.", editBtn: "Zmień tekst", eSave: "Zapisz", eSaved: "Zmiany zapisane.", eRestore: "Przywróć oryginał", eRestored: "Przywrócono oryginał.", edited: "zmienione", orig: "oryginał", stale: "⚠️ Zwrot zmienił się po twoim nagraniu. Nagraj go ponownie; do tego czasu Aaron słyszy głos syntetyczny.", delT: "🗑 Usuń na zawsze", delSub: "Zniknie całkowicie, także u Aarona, razem z twoim nagraniem i zdjęciem. Nie da się go odzyskać.", delBtn: "Usuń na zawsze", delQx: "Na pewno? Dotknij jeszcze raz, aby usunąć"
  }
};
let lang = (() => { try { return localStorage.getItem('pbt.lang') === 'es' ? 'es' : 'pl'; } catch (e) { return 'pl'; } })();
const t = (k, v) => { let s = (L[lang] || L.pl)[k] || L.pl[k] || k; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s; };
const errT = e => L.pl['e_' + e.message] ? t('e_' + e.message) : t('err', { e: e.message });

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
const gget = path => fetch(`${API}/repos/${C.r}/contents/${path}?t=${Date.now()}`, { headers: hdr(), cache: 'no-store' }).catch(() => { throw new Error('offline'); });
async function getFile(path) {
  const r = await gget(path);
  if (r.status === 404) return { sha: null, data: null };
  if (!r.ok) throw ghErr(r);
  const j = await r.json(); return { sha: j.sha, data: JSON.parse(b64d(j.content)) };
}
async function putFile(path, data, sha, msg) {
  const body = { message: msg, content: b64e(JSON.stringify(data, null, 1)) }; if (sha) body.sha = sha;
  let r; try { r = await fetch(`${API}/repos/${C.r}/contents/${path}`, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, hdr()), body: JSON.stringify(body) }); } catch (e) { throw new Error('offline'); }
  if (!r.ok) throw ghErr(r);
}
async function getSha(path) { const r = await gget(path); if (r.status === 404) return null; if (!r.ok) throw ghErr(r); return (await r.json()).sha; }
async function getRaw(path) { const r = await gget(path); if (!r.ok) throw ghErr(r); return (await r.json()).content.replace(/\s/g, ''); }
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
  if (!r.ok && r.status !== 404 && r.status !== 409) throw ghErr(r);
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
const BUILT = (window.WORDS || []), UN = window.UNITS || [];
let WL = [], CARDS = {}, HID = {}, ED = {}, VI = {}, II = {};
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();
async function loadAll() {
  const opt = p => getFile(p).catch(() => ({ data: null }));
  const [w, p, v, i] = await Promise.all([getFile('words.json'), opt('progress.json'), opt('voice.json'), opt('img.json')]);
  WL = (w.data && w.data.words) || []; CARDS = (p.data && p.data.cards) || {}; HID = (p.data && p.data.hid) || {}; ED = (p.data && p.data.ed) || {};
  VI = (v.data && v.data.items) || {}; II = (i.data && i.data.items) || {};
}
const toEmoji = p => { try { return String.fromCodePoint(...p.split('-').map(h => parseInt(h, 16))); } catch (e) { return ''; } };
const EMAP = (() => {   // gloss words of the built-in vocabulary -> emoji, to suggest a picture
  const m = {};
  BUILT.forEach(w => { if (!w.p || /^[#dm]/.test(w.p)) return; const em = toEmoji(w.p); norm(w.es).split(' ').forEach(k => { if (k.length > 2 && !/^(the|and|for|with|una|uno|los|las|del|que|por|con|para|you|your|her|his|this|that|esta|este|muy)$/.test(k)) (m[k] = m[k] || []).push(em); }); });
  return m;
})();
const PALETTE = '🙂 😊 😄 🤗 🙏 👋 🤝 💬 ❓ ❤️ 👍 👎 🏠 🍽️ ☕ 🍺 🧃 🍞 🧀 🥚 🍎 🥗 🍲 🍰 🛒 💳 🚗 🚌 ✈️ 🗺️ ⛪ 🎄 🎂 🎁 💐 📱 💻 🎮 ⚽ 🎵 📚 🐶 🐱 ☀️ 🌧️ ❄️ 🌳 ⏰ 📅 👨‍👩‍👧 👩 👨 👴 👵 👦 💤 🚿 🛏️'.split(' ');
function suggestEmoji(es) {
  const score = {}; norm(es).split(' ').forEach(k => (EMAP[k] || []).forEach((e, j) => { score[e] = (score[e] || 0) + 1 / (1 + j * 0.2); }));
  return Object.keys(score).sort((a, b) => score[b] - score[a]).slice(0, 8);
}
function findDup(pl) {
  const n = norm(pl); if (!n) return null;
  const b = BUILT.find(w => w.pl.split(' / ').some(x => norm(x) === n)); if (b) return b;
  return WL.find(w => !w.del && norm(w.pl) === n) || null;
}
async function languageTool(text) {
  const body = new URLSearchParams({ text, language: 'pl-PL', motherTongue: 'es' });
  const r = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', body, headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('LanguageTool ' + r.status);
  return (await r.json()).matches || [];
}

/* ---------------- photos: gallery image -> JPEG, longest side 720 px (about 40–90 KB) */
async function photoFromFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => bad(new Error('img')); i.src = url; });
    const M = 720, sc = Math.min(1, M / Math.max(img.naturalWidth, img.naturalHeight));
    const cv = document.createElement('canvas'); cv.width = Math.round(img.naturalWidth * sc); cv.height = Math.round(img.naturalHeight * sc);
    const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
    const data = cv.toDataURL('image/jpeg', 0.82);
    return { b64: data.split(',')[1], url: data };
  } finally { URL.revokeObjectURL(url); }
}
/* save / delete a media file and its index entry (voice.json or img.json) */
async function saveMedia(kind, k, b64, label, text) {
  const idx = kind === 'voice' ? VI : II, ext = kind === 'voice' ? 'mp3' : 'jpg';
  const sha = await putRaw(`${kind}/${k}.${ext}`, b64, idx[k] && idx[k].sha, `${kind}: ${label}`);
  const d = await update(kind + '.json', x => { x.items = x.items || {}; x.items[k] = text ? { at: Date.now(), sha, pl: text } : { at: Date.now(), sha }; }, `${kind} index: ${k}`, { v: 1, items: {} });
  if (kind === 'voice') VI = d.items; else II = d.items;
}
async function delMedia(kind, k) {
  const idx = kind === 'voice' ? VI : II, ext = kind === 'voice' ? 'mp3' : 'jpg';
  await delFile(`${kind}/${k}.${ext}`, idx[k] && idx[k].sha, `${kind}: remove ${k}`);
  const d = await update(kind + '.json', x => { x.items = x.items || {}; delete x.items[k]; }, `${kind} index: remove ${k}`, { v: 1, items: {} });
  if (kind === 'voice') VI = d.items; else II = d.items;
}
/* removed words live in progress.json → hid, shared with the student's app (latest change wins) */
async function setHidden(k, h, x) {
  const v = { h, t: Date.now(), by: 't' }; if (x) v.x = true;
  const d = await update('progress.json', p => { p.hid = p.hid || {}; p.hid[k] = v; }, `teacher: ${x ? 'delete' : h ? 'remove' : 'restore'} ${k}`, {});
  HID = d.hid || {}; ED = d.ed || ED; CARDS = d.cards || CARDS;
}
const isHid = k => !!(HID[k] && HID[k].h);
const isDelK = k => !!(HID[k] && HID[k].h && HID[k].x);
/* edits (progress.json → ed), shared with the student's app: latest change wins */
async function setEdit(k, v) {
  v.t = Date.now(); v.by = 't';
  const d = await update('progress.json', p => { p.ed = p.ed || {}; p.ed[k] = v; }, `teacher: edit ${k}`, {});
  ED = d.ed || {}; HID = d.hid || HID; CARDS = d.cards || CARDS;
}
const edOf = k => { const e = ED[k]; return e && !e.reset ? e : null; };
const voiceStale = (k, pl) => { const v = VI[k]; if (!v) return false; if (v.pl) return v.pl !== pl; const e = edOf(k); return !!(e && e.pc && (v.at || 0) < e.t); };

/* ---------------- shared bits */
function toast(msg) { const e = document.createElement('div'); e.textContent = msg; e.style.cssText = 'position:fixed;left:50%;bottom:30px;transform:translateX(-50%);background:#14244a;color:#fff;padding:10px 18px;border-radius:99px;z-index:99;font-weight:600;max-width:90vw;text-align:center'; document.body.appendChild(e); setTimeout(() => e.remove(), 2600); }
function speak(text) {
  if (!text || !window.speechSynthesis) return;
  const good = v => /natural|neural|online|enhanced|premium|google/i.test(v.name) ? 1 : 0;
  const vs = speechSynthesis.getVoices().filter(v => /^pl/i.test(v.lang)).sort((a, b) => good(b) - good(a));
  const u = new SpeechSynthesisUtterance(text.replace(/\([^)]*\)/g, ' ')); u.lang = 'pl-PL'; if (vs[0]) u.voice = vs[0]; u.rate = 0.92; speechSynthesis.cancel(); speechSynthesis.speak(u);
}
function playUrl(u) { try { const a = new Audio(u); a.play().catch(() => {}); } catch (e) {} }
const glOf = x => x.es || x.en || '';
const SPK_PL = { 'Tú': 'Ty (Aaron)', 'Mamá': 'Mama', 'Papá': 'Tata', 'Abuela': 'Babcia', 'Hermano': 'Brat', 'Kasjer': 'Kasjer' };
const uName = u => !u ? '' : lang === 'pl' ? (u.pl || u.es) : u.es;
let TAB = 'add';

/* ================================================================ tab 1: add a word */
const F = { pl: '', es: '', r: '', ne: '', em: '' };
let lastLT = [], pendingDel = null, lastAdded = null, FPHOTO = null;
function readForm() { ['pl', 'es', 'ne', 'em'].forEach(k => { const e = $('#f_' + k); if (e) F[k] = e.value; }); }
function addHTML() {
  const regSeg = [['', t('regN')], ['F', t('regF')], ['I', t('regI')]].map(([v, l]) => `<button class="${F.r === v ? 'on' : ''}" data-a="reg" data-v="${v}">${l}</button>`).join('');
  return (lastAdded != null && WL[lastAdded] && window.PBRec && PBRec.supported() ? `<button class="btn s" style="margin-bottom:14px" data-a="recnew">${esc(t('recNew', { p: WL[lastAdded].pl }))}</button>` : '') + `<div class="tgrid"><div>
    <div class="card"><h2>${t('hello')}</h2><p class="gl" style="margin:0">${t('helloSub')}</p>
      <label for="f_pl">${t('pl')}</label><input class="field pl-in" id="f_pl" lang="pl" value="${esc(F.pl)}" autocomplete="off" spellcheck="true" placeholder="np. Świetnie Pani gotuje.">
      <div class="keys mt">${'ą ć ę ł ń ó ś ź ż'.split(' ').map(c => `<button data-a="key" data-c="${c}">${c}</button>`).join('')}</div>
      <label for="f_es">${t('es')}</label><input class="field" id="f_es" value="${esc(F.es)}" autocomplete="off">
      <label>${t('reg')}</label><div class="seg r">${regSeg}</div>
      <label for="f_em">${t('emoji')}</label><div style="display:flex;gap:10px;align-items:center"><input class="field emoin" id="f_em" value="${esc(F.em)}" maxlength="16" autocomplete="off"><span class="small">${t('emojiSug')}</span></div>
      <div class="emopick" id="emos"></div>
      <label>${t('photoOpt')}</label>
      <div class="phrow">${FPHOTO ? `<img class="thumb" src="${FPHOTO.url}" alt=""><button class="btn g sm" data-a="fphotodel">✕ ${t('cancel')}</button>` : `<label class="btn s sm filebtn">${t('pick')}<input type="file" accept="image/*" id="fphoto" hidden></label>`}</div>
      <label for="f_ne">${t('noteEs')}</label><textarea class="field" id="f_ne">${esc(F.ne)}</textarea>
      <div class="btns two mt"><button class="btn s" data-a="check" id="bcheck">🔎 ${t('check')}</button><button class="btn s" data-a="listen">🔊 ${t('listen')}</button></div>
      <button class="btn mt" data-a="add" id="badd">➕ ${t('add')}</button>
    </div></div>
    <div><div id="res"></div>
    <div class="card lst"><h2>${t('list')} (${WL.filter(w => !w.del).length})</h2><div id="list">${listHTML()}</div></div></div></div>`;
}
function drawEmojis() {
  readForm(); const list = Array.from(new Set(suggestEmoji(F.es).concat(PALETTE))).slice(0, 40);
  const e = $('#emos'); if (e) e.innerHTML = list.map(x => `<button class="${F.em === x ? 'on' : ''}" data-a="emo" data-v="${esc(x)}">${x}</button>`).join('');
}
function listHTML() {
  const live = WL.map((w, k) => ({ w: Object.assign({}, w, edOf('t' + k) ? { pl: edOf('t' + k).pl || w.pl, es: edOf('t' + k).es != null ? edOf('t' + k).es : w.es } : {}), k })).filter(o => !o.w.del && !isDelK('t' + o.k)).reverse();
  if (!live.length) return `<div class="empty">${t('none')}</div>`;
  return live.map(({ w, k }) => {
    const c = CARDS[CB + k], st = !c ? `<span class="tag d">✨ ${t('stNew')}</span>` : c.b >= 6 ? `<span class="tag m">${t('stM')}</span>` : `<span class="tag">${t('stBox', { n: c.b })}</span>`;
    const key = 't' + k, extra = (VI[key] ? ' 🎙️' : '') + (II[key] ? ' 🖼️' : '') + (isHid(key) ? ' 🚫' : '');
    return `<div class="wrow"><div class="pic sm"><span class="emo">${esc(w.em || '📝')}</span></div><div class="t"><b>${esc(w.pl)}</b><span class="gl">${esc(glOf(w))}${w.r ? ` <em class="rg ${w.r}">${w.r === 'F' ? t('regF').split(' (')[0] : t('regI').split(' (')[0]}</em>` : ''}${extra}</span><small>${st}</small></div><button class="btn g sm" style="width:auto" data-a="del" data-k="${k}">${pendingDel === k ? t('delQ') : t('del')}</button></div>`;
  }).join('');
}
function resHTML(dup) {
  let h = '';
  if (dup) h += `<div class="issue bad"><b>⚠️ ${t('dup')}</b>${esc(dup.pl)} — ${esc(dup.es || '')}</div>`;
  if (lastLT === null) h += `<div class="issue">${t('ltDown')}</div>`;
  else if (!lastLT.length) h += `<div class="issue ok"><b>✓ ${t('ltOk')}</b></div>`;
  else h += `<div class="small" style="font-weight:700;margin-top:10px">${t('ltIssues')}</div>` + lastLT.map((m, j) => {
    const c = m.context || {}, txt = c.text || '', o = c.offset || 0, n = c.length || 0;
    return `<div class="issue"><b>${esc(m.message)}</b><div class="ctx">${esc(txt.slice(0, o))}<mark>${esc(txt.slice(o, o + n))}</mark>${esc(txt.slice(o + n))}</div>${(m.replacements || []).slice(0, 5).map((r, q) => `<button class="sug" data-a="ltfix" data-j="${j}" data-q="${q}">${esc(r.value)}</button>`).join('')}</div>`;
  }).join('');
  if (F.pl.trim()) h += `<div class="issue ok"><b>${t('ipa')}</b><span class="ipa" style="font-size:18px">/${esc(window.PolishIPA ? PolishIPA(F.pl) : '')}/</span></div>`;
  return `<div class="card">${h}</div>`;
}

/* ================================================================ tab 2: words — voice, photo, remove */
const WF = { kind: 'mine', filter: 'all', q: '' };
let CUR = null, PREV = null, VSTATE = 'idle', VMSG = '', delQ = null, PPREV = null, EDT = null;
const AUD = {}, PHO = {};   // key -> data URL of downloaded recordings / photos
function overlay(x) {   // apply an edit on top of the original text
  x.opl = x.pl; x.oes = x.gl;
  const e = edOf(x.key); if (!e) return x;
  x.ed = 1;
  if (e.pl && e.pl !== x.pl) { x.pl = e.pl; x.ipa = window.PolishIPA ? PolishIPA(e.pl) : x.ipa; }
  if (e.es != null) x.gl = e.es;
  if ('ne' in e) x.ne = e.ne; if ('r' in e) x.r = e.r; if (e.em) x.em = e.em;
  return x;
}
function items(kind) {
  let o;
  if (kind === 'mine') o = WL.map((w, k) => w.del ? null : { key: 't' + k, pl: w.pl, gl: glOf(w), ne: w.ne || '', r: w.r || '', ipa: w.ipa || (window.PolishIPA ? PolishIPA(w.pl) : ''), em: w.em || '📝', word: 1 }).filter(Boolean);
  else if (kind === 'dlg') { o = []; UN.forEach(u => (u.ctx || []).forEach(l => o.push({ key: l.a, pl: l.pl, gl: glOf(l), who: lang === 'pl' ? (SPK_PL[l.w] || l.w) : l.w, unit: uName(u) }))); }
  else o = BUILT.filter(w => !!(UN[w.u] && UN[w.u].sit) === (kind === 'sit')).map(w => ({ key: w.a, pl: w.pl, gl: glOf(w), ne: w.ne || '', r: w.r || '', ipa: w.ipa, p: w.p, ic: UN[w.u] && UN[w.u].ic, unit: uName(UN[w.u]), word: 1 }));
  return o.filter(x => !isDelK(x.key)).map(overlay);
}
function wList() {
  const q = norm(WF.q), f = WF.filter, keep = x => CUR && x.key === CUR.key;
  return items(WF.kind).filter(x => (!q || norm(x.pl + ' ' + x.gl).includes(q)) && (keep(x) ||
    (f === 'all' ? true : f === 'novoice' ? !VI[x.key] : f === 'nophoto' ? (x.word && !II[x.key]) : f === 'hidden' ? isHid(x.key) : true)));
}
function picOf(x, cls) {
  cls = cls || '';
  if (PPREV && CUR && x.key === CUR.key) return `<div class="pic photo ${cls}"><img src="${PPREV.url}" alt=""></div>`;
  if (II[x.key] && PHO[x.key]) return `<div class="pic photo ${cls}"><img src="${PHO[x.key]}" alt=""></div>`;
  if (x.em) return `<div class="pic ${cls}"><span class="emo">${esc(x.em)}</span></div>`;
  const p = x.p;
  if (!p) return x.ic ? `<div class="pic ph ${cls}"><img src="e/${x.ic}.svg" alt=""></div>` : '';
  if (p[0] === '#') return `<div class="pic ${cls}"><span class="num">${esc(p.slice(1))}</span></div>`;
  if (p[0] === 'd' || p[0] === 'm') return `<div class="pic ${cls}"><span class="num">📅</span></div>`;
  return `<div class="pic ${cls}"><img src="e/${p}.svg" alt=""></div>`;
}
function wordsHTML() {
  const all = items(WF.kind), list = wList(), nV = all.filter(x => VI[x.key]).length;
  if (!CUR || !all.find(x => x.key === CUR.key)) { CUR = list[0] || null; PREV = null; PPREV = null; }
  if (CUR && II[CUR.key] && !PHO[CUR.key]) loadPhoto(CUR.key);
  const segK = [['mine', t('kMine')], ['sit', t('kSit')], ['dlg', t('kDlg')], ['course', t('kCourse')]].map(([v, l]) => `<button class="${WF.kind === v ? 'on' : ''}" data-a="wkind" data-v="${v}">${l}</button>`).join('');
  const fl = [['all', t('fAll')], ['novoice', t('fNoVoice')]].concat(WF.kind === 'dlg' ? [] : [['nophoto', t('fNoPhoto')], ['hidden', t('fHidden')]]);
  let card = '';
  if (!CUR) card = `<div class="card"><div class="empty">${all.length ? t('allDone') : t('vNone')}</div></div>`;
  else {
    const c = CUR, hasV = !!VI[c.key], hasP = !!II[c.key], rn = VSTATE === 'rec', hid = isHid(c.key), mic = !!(window.PBRec && PBRec.supported());
    card = `<div class="card recc ${hid ? 'hidc' : ''}">
      <div class="small">${c.unit ? esc(c.unit) + ' · ' : ''}${t('nVoice', { n: nV, t: all.length })}</div>
      <div class="whead">${c.word ? picOf(c, 'md') : ''}<div style="min-width:0">${c.who ? `<div class="small" style="font-weight:700">${esc(t('speaker', { w: c.who }))}</div>` : ''}
        <div class="pl" style="font-size:clamp(22px,4vw,32px)">${esc(c.pl)}</div>${c.ipa ? `<div class="ipa">/${esc(c.ipa)}/</div>` : ''}<div class="gl">${esc(c.gl)}</div></div></div>
      ${c.ed ? `<div class="small mt">✏️ ${t('edited')} · ${esc(t('orig'))}: <i>${esc(c.opl)}</i></div>` : ''}
      <h3 class="sec">${t('editT')}</h3>
      ${EDT ? `<label for="t_pl">${t('pl')}</label><input class="field" id="t_pl" lang="pl" value="${esc(EDT.pl)}" autocomplete="off" spellcheck="true">
        <div class="keys mt">${'ą ć ę ł ń ó ś ź ż'.split(' ').map(ch => `<button data-a="key" data-f="t_pl" data-c="${ch}">${ch}</button>`).join('')}</div>
        <label for="t_es">${t('es')}</label><input class="field" id="t_es" value="${esc(EDT.es)}" autocomplete="off">
        ${c.word ? `<label for="t_ne">${t('noteEs')}</label><textarea class="field" id="t_ne">${esc(EDT.ne)}</textarea>
        <label>${t('reg')}</label><div class="seg">${[['', t('regN')], ['F', t('regF')], ['I', t('regI')]].map(([v, l]) => `<button class="${EDT.r === v ? 'on' : ''}" data-a="edreg" data-v="${v}">${l}</button>`).join('')}</div>` : ''}
        <div id="t_res">${EDT.res || ''}</div>
        <div class="btns two mt"><button class="btn s sm" data-a="edcheck" id="edcheck">🔎 ${t('check')}</button><button class="btn sm" data-a="edsave" id="edsave">✓ ${t('eSave')}</button></div>
        <div class="btns two mt">${c.ed ? `<button class="btn g sm" data-a="edreset">↩️ ${t('eRestore')}</button>` : '<span></span>'}<button class="btn g sm" data-a="edcancel">${t('cancel')}</button></div>`
      : `<p class="small" style="margin:0 0 8px">${t('editSub')}</p><button class="btn s sm" data-a="edopen">✏️ ${t('editBtn')}</button>`}
      <h3 class="sec">${t('voiceT')}${hasV ? ' ✓' : ''}</h3>
      ${voiceStale(c.key, c.pl) ? `<div class="fb warn small">${t('stale')}</div>` : ''}
      ${mic ? `<div class="lvl"><i id="lvl"></i></div>
      <div class="rbtns mt">
        <button class="btn ${rn ? 'bad' : ''} recb" data-a="vrec" ${VSTATE === 'proc' ? 'disabled' : ''}>${rn ? '⏹ ' + t('stop') : '🎙️ ' + t('rec')}</button>
        <button class="btn s sm" data-a="vgen" ${rn ? 'disabled' : ''}>🔊 ${t('genVoice')}</button>
        ${PREV || hasV ? `<button class="btn s sm" data-a="vhers" ${rn ? 'disabled' : ''}>▶ ${t('herVoice')}</button>` : '<span></span>'}
      </div>
      ${VMSG ? `<div class="small mt" style="font-weight:700">${esc(VMSG)}</div>` : ''}
      ${PREV ? `<div class="btns two mt"><button class="btn" data-a="vsave" id="vsave">✓ ${t('saveNext')}</button><button class="btn g" data-a="vredo">↻ ${t('redo')}</button></div>` : ''}
      ${hasV && !PREV ? `<button class="btn g sm mt" data-a="vdel">${delQ === 'v' ? t('vDelQ') : '🗑 ' + t('vDel')}</button>` : ''}` : `<div class="fb bad small">${t('noMic')}</div>`}
      ${c.word ? `<h3 class="sec">${t('photoT')}${hasP ? ' ✓' : ''}</h3><p class="small" style="margin:0 0 8px">${t('photoSub')}</p>
      ${PPREV ? `<div class="btns two"><button class="btn" data-a="psave" id="psave">✓ ${t('savePhoto')}</button><button class="btn g" data-a="pcancel">${t('cancel')}</button></div>`
        : `<div class="btns two"><label class="btn s sm filebtn">${hasP ? t('change') : t('pick')}<input type="file" accept="image/*" id="wphoto" hidden></label>${hasP ? `<button class="btn g sm" data-a="pdel">${delQ === 'p' ? t('delPhotoQ') : '🗑 ' + t('delPhoto')}</button>` : '<span></span>'}</div>`}
      <h3 class="sec">${t('hideT')}</h3>
      ${hid ? `<div class="fb warn small">${HID[c.key].by === 's' ? t('hidByS') : t('hidByT')}</div><button class="btn s sm mt" data-a="unhide">↩️ ${t('unhide')}</button>`
        : `<p class="small" style="margin:0 0 8px">${t('hideSub')}</p><button class="btn g sm" data-a="hide">🚫 ${t('hideBtn')}</button>`}
      <h3 class="sec">${t('delT')}</h3><p class="small" style="margin:0 0 8px">${t('delSub')}</p>
      <button class="btn g sm" data-a="delx">${delQ === 'x' ? '⚠️ ' + t('delQx') : '🗑 ' + t('delBtn')}</button>` : ''}
      <button class="btn s mt2" data-a="wnext">${t('skip')}</button>
      ${mic ? `<div class="small mt kbh">${t('kbd')}</div>` : ''}</div>`;
  }
  const rows = list.slice(0, 400).map(x => `<button class="wrow ${CUR && x.key === CUR.key ? 'sel' : ''} ${isHid(x.key) ? 'dim' : ''}" data-a="wsel" data-k="${esc(x.key)}"><div class="t"><b>${esc(x.pl)}</b><span class="gl">${esc(x.gl)}</span></div><span class="bdg">${VI[x.key] ? '🎙️' : ''}${II[x.key] ? '🖼️' : ''}${isHid(x.key) ? '🚫' : ''}</span></button>`).join('');
  return `<div class="tgrid"><div><div class="card"><h2>${t('wTitle')}</h2><p class="gl" style="margin:0">${t('wSub')}</p></div>${card}</div>
    <div><div class="card"><div class="seg" style="flex-wrap:wrap">${segK}</div>
      <div style="display:flex;gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap"><input class="field" id="wq" placeholder="${esc(t('search'))}" value="${esc(WF.q)}" autocomplete="off" style="flex:1;min-width:160px">
      <select class="field" id="wfilter" style="width:auto">${fl.map(([v, l]) => `<option value="${v}" ${WF.filter === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="vlist mt">${rows || `<div class="empty">${t('vNone')}</div>`}</div></div></div></div>`;
}
async function loadPhoto(k) { try { const b = await getRaw('img/' + k + '.jpg'); PHO[k] = 'data:image/jpeg;base64,' + b; wrender(); } catch (e) {} }
function wrender() { if (TAB === 'words') { const y = window.scrollY, l = $('.vlist'), ly = l ? l.scrollTop : 0; render(); window.scrollTo(0, y); const l2 = $('.vlist'); if (l2 && ly) l2.scrollTop = ly; } }
function wnext() {
  const before = items(WF.kind).filter(x => true), i = before.findIndex(x => CUR && x.key === CUR.key);
  const old = CUR; CUR = null; const list = wList();
  CUR = list.find(x => before.findIndex(y => y.key === x.key) > i && (!old || x.key !== old.key)) || list.find(x => !old || x.key !== old.key) || null;
  PREV = null; PPREV = null; VMSG = ''; delQ = null; VSTATE = 'idle'; EDT = null;
}

const ACT = {
  /* connection & tabs */
  connect() { const c = readCode($('#code').value); if (!c) { $('#cerr').innerHTML = `<div class="fb bad mt small">${t('badCode')}</div>`; return; } C = { r: c.r, t: c.t }; try { localStorage.setItem(KEY, JSON.stringify(C)); } catch (e) {} boot(); },
  out() { C = null; try { localStorage.removeItem(KEY); } catch (e) {} render(); },
  tab(d) { readForm(); TAB = d.v; render(); window.scrollTo(0, 0); },
  /* add tab */
  key(d) { const e = $('#' + (d.f || 'f_pl')); const p = e.selectionStart == null ? e.value.length : e.selectionStart; e.value = e.value.slice(0, p) + d.c + e.value.slice(e.selectionEnd == null ? p : e.selectionEnd); e.focus(); try { e.setSelectionRange(p + 1, p + 1); } catch (x) {} },
  reg(d) { readForm(); F.r = d.v; document.querySelectorAll('.seg.r button').forEach(b => b.classList.toggle('on', b.dataset.v === d.v)); },
  emo(d) { $('#f_em').value = d.v; readForm(); drawEmojis(); },
  fphotodel() { readForm(); FPHOTO = null; render(); },
  listen() { readForm(); speak(F.pl); },
  async check() {
    readForm(); if (!F.pl.trim()) { toast(t('needPl')); return; }
    const b = $('#bcheck'); b.disabled = true; b.textContent = t('checking');
    lastLT = await languageTool(F.pl).catch(() => null);
    if (!F.em) { const s = suggestEmoji(F.es); if (s[0]) $('#f_em').value = s[0]; }
    readForm(); $('#res').innerHTML = resHTML(findDup(F.pl)); drawEmojis();
    b.disabled = false; b.textContent = '🔎 ' + t('check');
  },
  ltfix(d) {
    readForm(); const m = lastLT[Number(d.j)], r = m.replacements[Number(d.q)].value;
    $('#f_pl').value = F.pl.slice(0, m.offset) + r + F.pl.slice(m.offset + m.length); ACT.check();
  },
  async add() {
    readForm(); const pl = F.pl.trim().replace(/\s+/g, ' ');
    if (!pl) return toast(t('needPl')); if (!F.es.trim()) return toast(t('needTr'));
    const b = $('#badd'); b.disabled = true; b.textContent = t('adding');
    const e = { pl, es: F.es.trim(), ipa: window.PolishIPA ? PolishIPA(pl) : '', em: F.em.trim() || suggestEmoji(F.es)[0] || '📝', at: Date.now() };
    if (F.r) e.r = F.r; if (F.ne.trim()) e.ne = F.ne.trim();
    try {
      let k = -1;
      const d = await update('words.json', d => { d.words = d.words || []; d.words.push(e); k = d.words.length - 1; }, `teacher: ${pl}`, { v: 1, words: [] });
      WL = d.words; lastAdded = k;
      if (FPHOTO) { try { await saveMedia('img', 't' + k, FPHOTO.b64, pl); PHO['t' + k] = FPHOTO.url; } catch (er) { toast(errT(er)); } }
      Object.assign(F, { pl: '', es: '', r: '', ne: '', em: '' }); lastLT = []; FPHOTO = null;
      render(); toast(t('added'));
    } catch (er) { toast(errT(er)); b.disabled = false; b.textContent = '➕ ' + t('add'); }
  },
  async del(d) {
    const k = Number(d.k); if (pendingDel !== k) { pendingDel = k; $('#list').innerHTML = listHTML(); return; }
    pendingDel = null;
    try { const r = await update('words.json', x => { if (x.words[k]) x.words[k].del = true; }, `teacher: delete ${WL[k] && WL[k].pl}`, { v: 1, words: [] }); WL = r.words; readForm(); render(); toast(t('removed')); } catch (er) { toast(errT(er)); }
  },
  recnew() { TAB = 'words'; WF.kind = 'mine'; WF.filter = 'all'; CUR = items('mine').find(x => x.key === 't' + lastAdded) || null; lastAdded = null; PREV = null; render(); window.scrollTo(0, 0); },
  /* words tab */
  wkind(d) { WF.kind = d.v; if (d.v === 'dlg' && (WF.filter === 'nophoto' || WF.filter === 'hidden')) WF.filter = 'all'; CUR = null; PREV = null; PPREV = null; VMSG = ''; render(); },
  wsel(d) { if (VSTATE === 'rec') return; CUR = items(WF.kind).find(x => x.key === d.k) || null; PREV = null; PPREV = null; VMSG = ''; delQ = null; EDT = null; wrender(); if (window.innerWidth < 900) window.scrollTo({ top: 0, behavior: 'smooth' }); },
  wnext() { if (VSTATE === 'rec') return; wnext(); wrender(); },
  async vrec() {
    if (!CUR) return;
    if (VSTATE === 'rec') {
      VSTATE = 'proc'; VMSG = t('processing'); wrender();
      try { const blob = await PBRec.stop(); PREV = await PBRec.toMp3(blob); VMSG = ''; VSTATE = 'idle'; wrender(); playUrl(PREV.url); }
      catch (e) { VSTATE = 'idle'; PREV = null; VMSG = e.message === 'silence' ? t('silence') : String(e.message || e); wrender(); }
      return;
    }
    if (VSTATE !== 'idle') return;
    try {
      PREV = null; VMSG = t('recording'); VSTATE = 'rec'; wrender();
      await PBRec.start(lv => { const e = document.getElementById('lvl'); if (e) e.style.width = Math.min(100, Math.round(lv * 140)) + '%'; }, () => { if (VSTATE === 'rec') ACT.vrec(); });
    } catch (e) { VSTATE = 'idle'; VMSG = /denied|allowed|permission/i.test(e.name + e.message) ? t('micDenied') : t('noMic'); wrender(); }
  },
  vredo() { PREV = null; VMSG = ''; ACT.vrec(); },
  vgen() { if (CUR) speak(CUR.pl); },
  async vhers() {
    if (!CUR) return; if (PREV) return playUrl(PREV.url);
    const k = CUR.key; if (AUD[k]) return playUrl(AUD[k]);
    try { AUD[k] = 'data:audio/mpeg;base64,' + await getRaw('voice/' + k + '.mp3'); playUrl(AUD[k]); } catch (e) { toast(errT(e)); }
  },
  async vsave() {
    if (!PREV || !CUR) return; const k = CUR.key, P0 = PREV, b = $('#vsave'); if (b) { b.disabled = true; b.textContent = t('adding'); }
    try { await saveMedia('voice', k, P0.b64, CUR.pl, CUR.pl); AUD[k] = 'data:audio/mpeg;base64,' + P0.b64; toast(t('vSaved')); wnext(); wrender(); }
    catch (e) { toast(errT(e)); if (b) { b.disabled = false; b.textContent = '✓ ' + t('saveNext'); } }
  },
  async vdel() {
    if (!CUR) return; if (delQ !== 'v') { delQ = 'v'; return wrender(); }
    const k = CUR.key; delQ = null;
    try { await delMedia('voice', k); delete AUD[k]; toast(t('removed')); wrender(); } catch (e) { toast(errT(e)); }
  },
  pcancel() { PPREV = null; wrender(); },
  async psave() {
    if (!PPREV || !CUR) return; const k = CUR.key, P0 = PPREV, b = $('#psave'); if (b) { b.disabled = true; b.textContent = t('adding'); }
    try { await saveMedia('img', k, P0.b64, CUR.pl); PHO[k] = P0.url; PPREV = null; toast(t('photoSaved')); wrender(); }
    catch (e) { toast(errT(e)); if (b) { b.disabled = false; b.textContent = '✓ ' + t('savePhoto'); } }
  },
  async pdel() {
    if (!CUR) return; if (delQ !== 'p') { delQ = 'p'; return wrender(); }
    const k = CUR.key; delQ = null;
    try { await delMedia('img', k); delete PHO[k]; toast(t('photoDel')); wrender(); } catch (e) { toast(errT(e)); }
  },
  edopen() { if (!CUR) return; EDT = { pl: CUR.pl, es: CUR.gl, ne: CUR.ne || '', r: CUR.r || '' }; wrender(); const e = $('#t_pl'); if (e) e.focus(); },
  edcancel() { EDT = null; wrender(); },
  edreg(d) { edRead(); EDT.r = d.v; wrender(); },
  async edcheck() {
    edRead(); const b = $('#edcheck'); if (b) { b.disabled = true; b.textContent = t('checking'); }
    const m = await languageTool(EDT.pl).catch(() => null); EDT.lt = m;
    EDT.res = m === null ? `<div class="issue">${t('ltDown')}</div>` : !m.length ? `<div class="issue ok"><b>✓ ${t('ltOk')}</b></div>` :
      m.map((x, j) => `<div class="issue"><b>${esc(x.message)}</b>${(x.replacements || []).slice(0, 5).map((r, q) => `<button class="sug" data-a="edfix" data-j="${j}" data-q="${q}">${esc(r.value)}</button>`).join('')}</div>`).join('');
    wrender();
  },
  edfix(d) { edRead(); const m = EDT.lt && EDT.lt[Number(d.j)]; if (!m) return; EDT.pl = EDT.pl.slice(0, m.offset) + m.replacements[Number(d.q)].value + EDT.pl.slice(m.offset + m.length); ACT.edcheck(); },
  async edsave() {
    if (!CUR || !EDT) return; edRead(); const pl = EDT.pl.trim().replace(/\s+/g, ' '); if (!pl) return toast(t('needPl'));
    const b = $('#edsave'); if (b) { b.disabled = true; b.textContent = t('adding'); }
    const v = { pl, es: EDT.es.trim(), pc: pl !== CUR.opl }; if (CUR.word) { v.ne = EDT.ne.trim(); v.r = EDT.r; }
    const old = edOf(CUR.key); if (old && old.em) v.em = old.em;
    try { await setEdit(CUR.key, v); const k = CUR.key; EDT = null; CUR = items(WF.kind).find(x => x.key === k) || null; toast(t('eSaved')); wrender(); }
    catch (e) { toast(errT(e)); if (b) { b.disabled = false; b.textContent = '✓ ' + t('eSave'); } }
  },
  async edreset() {
    if (!CUR) return;
    try { await setEdit(CUR.key, { reset: true }); const k = CUR.key; EDT = null; CUR = items(WF.kind).find(x => x.key === k) || null; toast(t('eRestored')); wrender(); } catch (e) { toast(errT(e)); }
  },
  async delx() {
    if (!CUR) return; if (delQ !== 'x') { delQ = 'x'; return wrender(); }
    const k = CUR.key; delQ = null;
    try {
      await setHidden(k, true, true);
      if (/^t\d+$/.test(k)) { const n = Number(k.slice(1)); const r = await update('words.json', x => { if (x.words[n]) x.words[n].del = true; }, `teacher: delete ${k}`, { v: 1, words: [] }); WL = r.words; }
      if (VI[k]) await delMedia('voice', k).catch(() => {});
      if (II[k]) await delMedia('img', k).catch(() => {});
      toast(t('removed')); wnext(); wrender();
    } catch (e) { toast(errT(e)); }
  },
  async hide() { if (!CUR) return; try { await setHidden(CUR.key, true); toast(t('hidOk')); wrender(); } catch (e) { toast(errT(e)); } },
  async unhide() { if (!CUR) return; try { await setHidden(CUR.key, false); toast(t('unhidOk')); wrender(); } catch (e) { toast(errT(e)); } }
};

/* ---------------- page */
function edRead() { if (!EDT) return; [['pl', 't_pl'], ['es', 't_es'], ['ne', 't_ne']].forEach(([k, id]) => { const e = $('#' + id); if (e) EDT[k] = e.value; }); }
function tabsHTML() { return `<div class="seg tabs" style="margin-bottom:14px;max-width:460px"><button class="${TAB === 'add' ? 'on' : ''}" data-a="tab" data-v="add">${t('tAdd')}</button><button class="${TAB === 'words' ? 'on' : ''}" data-a="tab" data-v="words">${t('tWords')}</button></div>`; }
function render() {
  document.documentElement.lang = lang; $('#ttl').textContent = t('ttl');
  document.querySelectorAll('#lang button').forEach(b => b.classList.toggle('on', b.dataset.l === lang));
  const tw = $('#tw');
  if (!C) {
    tw.innerHTML = `<div class="card" style="max-width:560px;margin:20px auto"><h2>${t('connect')}</h2><p class="gl" style="margin:0 0 10px">${t('connectSub')}</p>
      <label for="code">${t('code')}</label><input class="field" id="code" placeholder="PBX1.…" autocomplete="off"><button class="btn mt" data-a="connect">${t('connectBtn')}</button><div id="cerr"></div></div>`;
    return;
  }
  const foot = `<div class="lt">${t('ltCredit')} <a href="https://languagetool.org" target="_blank" rel="noopener">LanguageTool</a>. · <button class="linkbtn" data-a="out">${t('out')}</button></div>`;
  tw.innerHTML = tabsHTML() + (TAB === 'words' ? wordsHTML() : addHTML()) + foot;
  if (TAB === 'add') drawEmojis();
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-a]'); const f = a && ACT[a.dataset.a]; if (f) { e.preventDefault(); f(a.dataset, a); }
  const l = e.target.closest('#lang button'); if (l) { readForm(); lang = l.dataset.l; try { localStorage.setItem('pbt.lang', lang); } catch (x) {} render(); }
});
document.addEventListener('change', async e => {
  const id = e.target.id;
  if (id === 'wfilter') { WF.filter = e.target.value; CUR = null; render(); return; }
  if ((id === 'fphoto' || id === 'wphoto') && e.target.files && e.target.files[0]) {
    try { const p = await photoFromFile(e.target.files[0]); if (id === 'fphoto') { readForm(); FPHOTO = p; render(); } else { PPREV = p; wrender(); } }
    catch (x) { toast(t('photoErr')); }
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'wq') { WF.q = e.target.value; clearTimeout(window.__wq); window.__wq = setTimeout(() => { const pos = e.target.selectionStart; render(); const n = $('#wq'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} } }, 250); return; }
  if (e.target.id === 'f_es') { clearTimeout(window.__ed); window.__ed = setTimeout(drawEmojis, 300); }
});
document.addEventListener('keydown', e => {
  if (TAB === 'words' && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) {
    if (e.key === ' ') { e.preventDefault(); ACT.vrec(); return; }
    if (e.key === 'Enter' && PREV) { e.preventDefault(); ACT.vsave(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); ACT.wnext(); return; }
    if (e.key === 'p' || e.key === 'P') { ACT.vhers(); return; }
  }
  if (e.key === 'Enter' && e.target.id === 'f_pl') { e.preventDefault(); ACT.check(); }
  if (e.key === 'Enter' && e.target.id === 'code') ACT.connect();
});
async function boot() {
  render(); if (!C) return;
  try { await loadAll(); } catch (e) { toast(errT(e)); }
  readForm(); render();
}
/* keep her view fresh (Aaron may edit or remove words meanwhile), without disturbing a recording or a form */
async function refresh() {
  if (!C || VSTATE !== 'idle' || PREV || PPREV || EDT || document.visibilityState === 'hidden') return;
  const a = document.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
  try { await loadAll(); if (TAB === 'words') wrender(); else { const l = $('#list'); if (l) l.innerHTML = listHTML(); } } catch (e) {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
setInterval(refresh, 90000);
window.__refresh = refresh;
if (window.speechSynthesis) speechSynthesis.getVoices();
boot();
})();
