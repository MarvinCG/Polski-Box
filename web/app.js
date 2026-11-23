(function () {
'use strict';
const U = window.UNITS, W = window.WORDS.slice();   // W[id] -> word (ids of teacher words start at CB)
let WA = W.slice();                                 // live list of all words
const CB = 5000, SITE = 'https://marvincg.github.io/Polski-Box/';
const TU = U.push({ id: 'tch', es: 'De tu profesora', en: 'From your teacher', pl: 'Od nauczycielki', ic: '1f469-200d-1f3eb', wk: 0, tch: 1, ds: '', dn: '', ctx: [] }) - 1;
const INT = [0, 1, 2, 4, 8, 16], MAST = 60;
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 6e4) / 864e5) + (window.__shift || 0); };
const dayStr = n => new Date(n * 864e5).toISOString().slice(0, 10);
const NA = () => window.Native || null;

/* ------------------------------------------------------------ texts */
const T = {
en: {
 today: 'Today', box: 'My box', words: 'Words', me: 'Progress', streak: 'day streak',
 hello: 'Dzień dobry!', start: "Start today's session", rev: '{n} to review', nw: '{n} new words', both: '{a} · {b}',
 done: 'All done for today!', doneSub: 'Your boxes are up to date. Come back tomorrow for the next words.',
 more: 'Learn 5 more new words', free: 'Free practice', todayGoal: 'Today',
 wotd: 'Word of the day', dotd: 'Mini dialogue', playAll: 'Play dialogue', boxes: 'Your learning box', boxesSub: 'Every word travels from box 1 to box 5. A correct answer moves it up; a mistake sends it back to box 1.',
 every1: 'daily', everyN: 'every {n} d', mastered: 'Mastered', newLeft: 'new words waiting', due: 'due',
 box1: 'Box {n}', practiceBox: 'Practise this box', practiceNote: 'Free practice does not change your boxes.', emptyBox: 'No words here yet.',
 search: 'Search a word or meaning…', units: 'Units', prio: 'Learn this unit first', prioOn: 'This unit comes first in your daily new words', prioOff: 'Daily new words follow the course order',
 dialogues: 'Dialogues', back: '‹ Back', st_new: 'new', st_box: 'box {n}', st_m: 'mastered',
 slow: 'Slow', say: 'Listen', close: 'Close', note: 'Note', noResults: 'Nothing found.', unitWords: 'Words',
 qMean: 'What does it mean?', qListen: 'Listen. What does it mean?', qSay: 'How do you say…?', qWrite: 'Write it in Polish', qDict: 'Listen and write what you hear', qBuild: 'Build the sentence', qBuildL: 'Listen and build the sentence',
 check: 'Check', dk: "I don't know", next: 'Next', cont: 'Continue', hint: 'Hint', typeHere: 'Type in Polish…',
 right: 'Correct!', wrong: 'Not quite', accent: 'Right — mind the accents:', answer: 'Answer', tryAgain: 'You will see it again in a moment.',
 newWord: 'New word', gotIt: 'Got it', intro: 'Listen, look, repeat out loud. Then you will be tested on it.',
 sumTitle: 'Session complete!', sumA: 'answers', sumOk: 'correct', sumNew: 'new words', sumUp: 'moved up', sumDown: 'back to box 1', sumNext: 'Next reviews: tomorrow',
 quit: 'Quit this session?', quitSub: 'Your answers so far are saved.', quitYes: 'Quit', keep: 'Keep going',
 stats: 'Overview', started: 'Started', mastered2: 'Mastered', acc: 'Accuracy (7 d)', last14: 'Last 14 days', byUnit: 'By unit', report: 'Report for your teacher', reportSub: 'A short summary of your progress, with the words that still need work.',
 share: 'Share report', copy: 'Copy report', copied: 'Copied', weak: 'Words to practise', noWeak: 'No difficult words yet — keep going!',
 settings: 'Settings', npd: 'New words per day', ui: 'App language', gl: 'Translations', voice: 'Voice', vAuto: 'Auto', vDev: 'Device', vBun: 'Recordings', vNote: 'Auto picks the most natural Polish voice it can find on this device.',
 vReady: 'Phone voice: Polish ready.', vNopl: 'Phone has no Polish voice installed (Settings › Language › Text-to-speech). Using built-in recordings.', vNone: 'Using built-in recordings.',
 auto: 'Play audio automatically', slowDef: 'Always play slowly', strict: 'Require Polish accents when typing', strictSub: 'Off: ą/ę/ł… may be typed as a/e/l…',
 backup: 'Backup', export: 'Export progress', import: 'Import progress', importPh: 'Paste your backup here', importGo: 'Import', importBad: 'That backup could not be read.', importOk: 'Progress restored.',
 reset: 'Reset all progress', resetQ: 'Erase all your progress?', resetSub: 'Your boxes, streak and statistics will be deleted. This cannot be undone.', resetYes: 'Erase',
 about: 'About', aboutTxt: 'Audio: built-in recordings (HD neural voice when available) or your device’s Polish voice. Pictures: Twemoji, © Twitter, Inc. and contributors, CC-BY 4.0. Content: “Polaco desde cero” ({u} course units) plus {s} real-life situations, {n} entries in total. Works offline; sync is optional. Grammar checks for your teacher: LanguageTool (languagetool.org).',
 welcome: 'Welcome to Polski Box', wTxt: 'Choose your language. You can change it later.', w1: 'Every day: a few new words, with picture and sound.', w2: 'Your learning box brings each word back right when you are about to forget it.', w3: 'A word is mastered only after you can write it from sound alone.',
 pick: 'English',
 reportHead: 'Polski Box — progress report', rDate: 'Date', rStreak: 'Streak', rStarted: 'Words started', rMast: 'Mastered', rBoxes: 'In boxes 1–5', rAcc: 'Accuracy (last 7 days)', rUnits: 'By unit', rWeak: 'Words to practise with you',
 day: 'day', month: 'month',
 sit: 'Situations', sitIntro: 'Real-life moments with your girlfriend’s family. Use the formal Pan / Pani / Państwa with her parents and relatives, and the informal ty with her brother and friends.',
 learnSit: 'Learn new phrases ({n})', allStarted: 'All phrases started ✓', practiseSit: 'Practise', roleplay: 'Role-play', rpYour: 'Your turn', rpSay: 'Say this in Polish', rpShow: 'Show & listen', rpHint: 'Hint',
 rpAgain: 'Again', rpDone: 'Role-play finished!', rpDoneSub: 'Say the whole conversation out loud once more, then try it with your teacher.', rpTip: 'Say your line out loud first, then tap “Show & listen”.',
 formal: 'Formal', informal: 'Informal', mode: 'Daily new words', mCourse: 'Course', mMix: 'Mix', mSit: 'Situations', sitToday: 'Situation of the day', open: 'Open', phrases: 'Phrases', nSit: '{n} situations', started2: 'started',
 games: 'Games', vHD: 'Using the HD recordings (neural voice).', vWeb: 'Using the voice “{v}”.', vPick: 'Voice on this device', vBest: 'Best available',
 vTip: 'Tip — iPad: Settings › Accessibility › Spoken Content › Voices › Polish › Zosia (Enhanced). Windows: use Edge for the natural voices Zofia and Marek.',
 sync: 'Sync between devices', syncSub: 'Keeps your boxes, streak and your teacher’s words the same on your phone, tablet and PC. Uses a private GitHub repository.',
 syncOff: 'Not connected', syncOn: 'Connected to {r}', syncLast: 'Last sync: {t}', syncNever: 'never', syncNow: 'Sync now', syncing: 'Syncing…',
 syncSetup: 'Connect', syncRepo: 'Data repository (owner/name)', syncToken: 'GitHub token (fine-grained, Contents read & write)', syncCode: '…or paste a code from another device',
 syncGo: 'Connect', syncCopy: 'Copy code for another device', syncTeacher: 'Copy link for your teacher', syncOut: 'Disconnect', syncDone: 'Connected and synced',
 syncWarn: 'The code and the link contain your access token. Share them only with your own devices and your teacher.',
 e_token: 'The token was rejected. Check it or create a new one.', e_forbidden: 'The token has no access to this repository (Contents: read & write).', e_repo: 'Repository not found. Check owner/name and the token’s repository access.', e_offline: 'No connection. It will sync later.', e_conflict: 'Another device synced at the same time. Try again.',
 ago_now: 'just now', ago_m: '{n} min ago', ago_h: '{n} h ago', ago_d: '{n} d ago',
 tchTitle: 'New from your teacher', tchSub: '{n} new words or phrases waiting for you', tchGo: 'Learn them now', tchBadge: 'NEW', tchUnit: 'From your teacher',
 keys: 'Keyboard: 1–4 answer · Enter next · Space listen · Esc back',
 inst: 'Install the app', instSub: 'Polski Box is a web app: install it once and it updates by itself. Works offline.', instBtn: 'Install Polski Box', instIOS: 'On iPad / iPhone: tap Share ⬆️ in Safari, then “Add to Home Screen”.', instOther: 'In Chrome or Edge: open the menu ⋮ and choose “Install app” (or “Add to Home screen”).',
 tvOn: 'Use my teacher’s voice', tvSub: '{n} recordings by your teacher. Where she recorded a word you hear her; 🤖 plays the generated voice.', tvGen: 'Generated voice'
},
es: {
 today: 'Hoy', box: 'Mi caja', words: 'Palabras', me: 'Progreso', streak: 'días seguidos',
 hello: 'Dzień dobry!', start: 'Empezar la sesión de hoy', rev: '{n} por repasar', nw: '{n} palabras nuevas', both: '{a} · {b}',
 done: '¡Listo por hoy!', doneSub: 'Tus cajas están al día. Vuelve mañana por las siguientes palabras.',
 more: 'Aprender 5 palabras nuevas más', free: 'Práctica libre', todayGoal: 'Hoy',
 wotd: 'Palabra del día', dotd: 'Mini diálogo', playAll: 'Escuchar el diálogo', boxes: 'Tu caja de aprendizaje', boxesSub: 'Cada palabra viaja de la caja 1 a la caja 5. Si aciertas, sube; si fallas, vuelve a la caja 1.',
 every1: 'a diario', everyN: 'cada {n} d', mastered: 'Dominadas', newLeft: 'palabras nuevas esperando', due: 'pendientes',
 box1: 'Caja {n}', practiceBox: 'Practicar esta caja', practiceNote: 'La práctica libre no cambia tus cajas.', emptyBox: 'Aún no hay palabras aquí.',
 search: 'Busca una palabra o significado…', units: 'Unidades', prio: 'Aprender esta unidad primero', prioOn: 'Esta unidad va primero en tus palabras nuevas diarias', prioOff: 'Las palabras nuevas siguen el orden del curso',
 dialogues: 'Diálogos', back: '‹ Volver', st_new: 'nueva', st_box: 'caja {n}', st_m: 'dominada',
 slow: 'Lento', say: 'Escuchar', close: 'Cerrar', note: 'Nota', noResults: 'No se encontró nada.', unitWords: 'Palabras',
 qMean: '¿Qué significa?', qListen: 'Escucha. ¿Qué significa?', qSay: '¿Cómo se dice…?', qWrite: 'Escríbelo en polaco', qDict: 'Escucha y escribe lo que oyes', qBuild: 'Arma la frase', qBuildL: 'Escucha y arma la frase',
 check: 'Comprobar', dk: 'No sé', next: 'Siguiente', cont: 'Continuar', hint: 'Pista', typeHere: 'Escribe en polaco…',
 right: '¡Correcto!', wrong: 'No del todo', accent: 'Bien — ojo con los acentos:', answer: 'Respuesta', tryAgain: 'La volverás a ver en un momento.',
 newWord: 'Palabra nueva', gotIt: 'Entendido', intro: 'Escucha, mira y repite en voz alta. Después te preguntaremos.',
 sumTitle: '¡Sesión completada!', sumA: 'respuestas', sumOk: 'correctas', sumNew: 'palabras nuevas', sumUp: 'subieron de caja', sumDown: 'volvieron a la caja 1', sumNext: 'Próximo repaso: mañana',
 quit: '¿Salir de la sesión?', quitSub: 'Tus respuestas hasta ahora quedan guardadas.', quitYes: 'Salir', keep: 'Seguir',
 stats: 'Resumen', started: 'Iniciadas', mastered2: 'Dominadas', acc: 'Aciertos (7 d)', last14: 'Últimos 14 días', byUnit: 'Por unidad', report: 'Informe para tu profesora', reportSub: 'Un resumen corto de tu avance, con las palabras que aún cuestan.',
 share: 'Compartir informe', copy: 'Copiar informe', copied: 'Copiado', weak: 'Palabras por practicar', noWeak: 'Aún no hay palabras difíciles. ¡Sigue así!',
 settings: 'Ajustes', npd: 'Palabras nuevas por día', ui: 'Idioma de la app', gl: 'Traducciones', voice: 'Voz', vAuto: 'Auto', vDev: 'Dispositivo', vBun: 'Grabaciones', vNote: 'Auto elige la voz polaca más natural que encuentre en este dispositivo.',
 vReady: 'Voz del teléfono: polaco listo.', vNopl: 'El teléfono no tiene voz en polaco (Ajustes › Idioma › Texto a voz). Se usan las grabaciones incluidas.', vNone: 'Se usan las grabaciones incluidas.',
 auto: 'Reproducir audio automáticamente', slowDef: 'Reproducir siempre lento', strict: 'Exigir tildes polacas al escribir', strictSub: 'Apagado: ą/ę/ł… se pueden escribir como a/e/l…',
 backup: 'Copia de seguridad', export: 'Exportar progreso', import: 'Importar progreso', importPh: 'Pega aquí tu copia de seguridad', importGo: 'Importar', importBad: 'No se pudo leer esa copia.', importOk: 'Progreso restaurado.',
 reset: 'Borrar todo el progreso', resetQ: '¿Borrar todo tu progreso?', resetSub: 'Se eliminarán tus cajas, tu racha y tus estadísticas. No se puede deshacer.', resetYes: 'Borrar',
 about: 'Acerca de', aboutTxt: 'Audio: grabaciones incluidas (voz neuronal HD cuando está disponible) o la voz polaca de tu dispositivo. Imágenes: Twemoji, © Twitter, Inc. y colaboradores, CC-BY 4.0. Contenido: «Polaco desde cero» ({u} unidades) más {s} situaciones de la vida real, {n} entradas en total. Funciona sin internet; la sincronización es opcional. Revisión gramatical para tu profesora: LanguageTool (languagetool.org).',
 welcome: 'Bienvenido a Polski Box', wTxt: 'Elige tu idioma. Puedes cambiarlo después.', w1: 'Cada día: unas pocas palabras nuevas, con imagen y sonido.', w2: 'Tu caja de aprendizaje devuelve cada palabra justo cuando estás por olvidarla.', w3: 'Una palabra está dominada solo cuando puedes escribirla oyéndola.',
 pick: 'Español',
 reportHead: 'Polski Box — informe de progreso', rDate: 'Fecha', rStreak: 'Racha', rStarted: 'Palabras iniciadas', rMast: 'Dominadas', rBoxes: 'En cajas 1–5', rAcc: 'Aciertos (últimos 7 días)', rUnits: 'Por unidad', rWeak: 'Palabras para practicar contigo',
 day: 'día', month: 'mes',
 sit: 'Situaciones', sitIntro: 'Momentos reales con la familia de tu novia. Usa el trato formal Pan / Pani / Państwa con sus papás y familiares, y el informal ty con su hermano y amigos.',
 learnSit: 'Aprender frases nuevas ({n})', allStarted: 'Todas las frases iniciadas ✓', practiseSit: 'Practicar', roleplay: 'Juego de roles', rpYour: 'Tu turno', rpSay: 'Dilo en polaco', rpShow: 'Mostrar y escuchar', rpHint: 'Pista',
 rpAgain: 'Otra vez', rpDone: '¡Juego de roles terminado!', rpDoneSub: 'Di toda la conversación en voz alta una vez más y luego pruébala con tu profesora.', rpTip: 'Di tu frase en voz alta primero y luego toca «Mostrar y escuchar».',
 formal: 'Formal', informal: 'Informal', mode: 'Palabras nuevas diarias', mCourse: 'Curso', mMix: 'Mixto', mSit: 'Situaciones', sitToday: 'Situación del día', open: 'Abrir', phrases: 'Frases', nSit: '{n} situaciones', started2: 'iniciadas',
 games: 'Juegos', vHD: 'Se usan las grabaciones HD (voz neuronal).', vWeb: 'Se usa la voz «{v}».', vPick: 'Voz en este dispositivo', vBest: 'La mejor disponible',
 vTip: 'Consejo — iPad: Ajustes › Accesibilidad › Contenido leído › Voces › Polaco › Zosia (mejorada). Windows: usa Edge para las voces naturales Zofia y Marek.',
 sync: 'Sincronizar dispositivos', syncSub: 'Mantiene iguales tus cajas, tu racha y las palabras de tu profesora en el teléfono, la tablet y la PC. Usa un repositorio privado de GitHub.',
 syncOff: 'Sin conectar', syncOn: 'Conectado a {r}', syncLast: 'Última sincronización: {t}', syncNever: 'nunca', syncNow: 'Sincronizar ahora', syncing: 'Sincronizando…',
 syncSetup: 'Conectar', syncRepo: 'Repositorio de datos (dueño/nombre)', syncToken: 'Token de GitHub (fine-grained, Contents lectura y escritura)', syncCode: '…o pega un código de otro dispositivo',
 syncGo: 'Conectar', syncCopy: 'Copiar código para otro dispositivo', syncTeacher: 'Copiar enlace para tu profesora', syncOut: 'Desconectar', syncDone: 'Conectado y sincronizado',
 syncWarn: 'El código y el enlace contienen tu token de acceso. Compártelos solo con tus dispositivos y con tu profesora.',
 e_token: 'GitHub rechazó el token. Revísalo o crea uno nuevo.', e_forbidden: 'El token no tiene acceso a este repositorio (Contents: lectura y escritura).', e_repo: 'No se encontró el repositorio. Revisa dueño/nombre y el acceso del token.', e_offline: 'Sin conexión. Se sincronizará después.', e_conflict: 'Otro dispositivo sincronizó al mismo tiempo. Inténtalo de nuevo.',
 ago_now: 'ahora mismo', ago_m: 'hace {n} min', ago_h: 'hace {n} h', ago_d: 'hace {n} d',
 tchTitle: 'Nuevo de tu profesora', tchSub: '{n} palabras o frases nuevas te esperan', tchGo: 'Aprenderlas ahora', tchBadge: 'NUEVA', tchUnit: 'De tu profesora',
 keys: 'Teclado: 1–4 responder · Enter siguiente · Espacio escuchar · Esc volver',
 inst: 'Instalar la app', instSub: 'Polski Box es una web app: la instalas una vez y se actualiza sola. Funciona sin internet.', instBtn: 'Instalar Polski Box', instIOS: 'En iPad / iPhone: en Safari toca Compartir ⬆️ y luego «Añadir a pantalla de inicio».', instOther: 'En Chrome o Edge: abre el menú ⋮ y elige «Instalar app» (o «Agregar a la pantalla principal»).',
 tvOn: 'Usar la voz de mi profesora', tvSub: '{n} grabaciones de tu profesora. Donde ella grabó una palabra, la escuchas a ella; 🤖 reproduce la voz generada.', tvGen: 'Voz generada'
}};
const t = (k, v) => { let s = (T[S.cfg.ui] || T.en)[k]; if (s == null) s = T.en[k] || k; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s; };

/* ------------------------------------------------------------ state */
const KEY = 'polskibox.v1';
const newDev = () => 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const blank = () => ({ v: 2, dev: newDev(), cards: {}, intro: { d: -1, n: 0 }, log: {}, ol: {}, q: [], qt: 0, cfgT: 0, gb: {}, seenT: 0, devs: {}, resetAt: 0, cfg: { npd: 8, mode: 'mix', ui: 'en', gl: 'en', voice: 'auto', vname: '', tv: true, slow: false, strict: false, auto: true, ok: false } });
const store = {
  get() {
    try { const n = NA(); if (n && n.load) { const s = n.load('state'); if (s) return JSON.parse(s); } } catch (e) {}
    try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {}
    return null;
  },
  set(o) {
    const s = JSON.stringify(o);
    try { const n = NA(); if (n && n.save) n.save('state', s); } catch (e) {}
    try { localStorage.setItem(KEY, s); } catch (e) {}
  }
};
function norm(o) {
  const b = blank(); if (!o || typeof o !== 'object') return b;
  const r = Object.assign(b, o); r.cfg = Object.assign(blank().cfg, o.cfg || {});
  r.cards = (o.cards && typeof o.cards === 'object') ? o.cards : {}; r.log = o.log || {}; r.q = Array.isArray(o.q) ? o.q : []; r.intro = o.intro || { d: -1, n: 0 };
  r.ol = o.ol || {}; r.gb = o.gb || {}; r.devs = o.devs || {}; if (!r.dev) r.dev = newDev();
  return r;
}
let S = norm(store.get());
const save = () => { store.set(S); if (window.PBSync) PBSync.soon(4000); };
const V = { tab: 'today', unit: null, sheet: null, q: '' };
let M = null;

/* ------------------------------------------------------------ helpers */
const gloss = w => S.cfg.gl === 'es' ? w.es : w.en;
const regChip = w => w.r ? `<em class="rg ${w.r}">${t(w.r === 'F' ? 'formal' : 'informal')}</em>` : '';
const note = w => S.cfg.gl === 'es' ? w.ne : w.nn;
const utitle = u => S.cfg.ui === 'es' ? u.es : u.en;
const ago = ms => { const m = Math.round((Date.now() - ms) / 6e4); return m < 1 ? t('ago_now') : m < 60 ? t('ago_m', { n: m }) : m < 1440 ? t('ago_h', { n: Math.round(m / 60) }) : t('ago_d', { n: Math.round(m / 1440) }); };
const uother = u => S.cfg.ui === 'es' ? u.en : u.es;
const speakerSvg = '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
const ICO = {
  today: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  box: '<svg viewBox="0 0 24 24"><path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/></svg>',
  sit: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4zM8 9h8M8 12h5"/></svg>',
  words: '<svg viewBox="0 0 24 24"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6M20 4v14h-6"/></svg>',
  me: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  games: '<svg viewBox="0 0 24 24"><path d="M6 8h12a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.6L14 14h-4l-1 1.6A4 4 0 0 1 2 13v-1a4 4 0 0 1 4-4zM7 10.5v3M5.5 12h3M16 11h.01M18 13h.01"/></svg>'
};
function picHTML(w, cls) {
  cls = cls || ''; const p = w.p;
  if (w.em) return `<div class="pic ${cls}"><span class="emo">${esc(w.em)}</span></div>`;
  if (!p) return `<div class="pic ph ${cls}"><img src="e/${U[w.u].ic}.svg" alt=""></div>`;
  if (p[0] === '#') return `<div class="pic ${cls}"><span class="num">${esc(p.slice(1))}</span></div>`;
  if (p[0] === 'd' || p[0] === 'm') return `<div class="pic ${cls}"><div class="cal">${p.slice(1)}<i>${t(p[0] === 'm' ? 'month' : 'day')}</i></div></div>`;
  return `<div class="pic ${cls}"><img src="e/${p}.svg" alt=""></div>`;
}
const status = i => { const c = S.cards[i]; return c ? c.b : 0; };
/* answers of a day on every synced device */
function LG(d) { const o = { a: 0, ok: 0, x: 0 }; const add = l => { if (l) { o.a += l.a || 0; o.ok += l.ok || 0; o.x += l.x || 0; } }; add(S.log[d]); for (const k in (S.ol || {})) add(S.ol[k][d]); return o; }
const tchNew = () => WA.filter(w => w.tch && !S.cards[w.i]);
function stTag(i) { const b = status(i); return b === 0 ? `<span class="tag n">${t('st_new')}</span>` : b === 6 ? `<span class="tag m">${t('st_m')}</span>` : `<span class="tag">${t('st_box', { n: b })}</span>`; }
function dueIds() { const d = today(); return Object.keys(S.cards).map(Number).filter(i => S.cards[i].d <= d).sort((a, b) => S.cards[a].b - S.cards[b].b || S.cards[a].d - S.cards[b].d); }
function newPool() {
  const un = i => !S.cards[i];
  const order = isSit => {
    const out = [], used = new Set(), ok = w => !w.tch && (!!U[w.u].sit) === isSit;
    S.q.forEach(u => { if (U[u] && !U[u].tch && !!U[u].sit === isSit) WA.forEach(w => { if (w.u === u && un(w.i)) { out.push(w.i); used.add(w.i); } }); });
    WA.forEach(w => { if (ok(w) && un(w.i) && !used.has(w.i)) out.push(w.i); });
    return out;
  };
  const c = order(false), a = order(true), m = S.cfg.mode, tch = tchNew().map(w => w.i);
  if (m === 'course') return tch.concat(c, a);
  if (m === 'sit') return tch.concat(a, c);
  const out = tch.slice(); for (let k = 0; k < Math.max(c.length, a.length); k++) { if (a[k] !== undefined) out.push(a[k]); if (c[k] !== undefined) out.push(c[k]); }
  return out;
}
function counts() {
  const b = [0, 0, 0, 0, 0, 0, 0], due = [0, 0, 0, 0, 0, 0, 0], d = today();
  for (const k in S.cards) { const c = S.cards[k]; b[c.b]++; if (c.d <= d) due[c.b]++; }
  b[0] = WA.length - Object.keys(S.cards).length; return { b, due };
}
function streak() {
  let d = today(), n = 0; if (!LG(d).a) d--;
  while (LG(d).a) { n++; d--; } return n;
}
function acc7() { let a = 0, o = 0; const d = today(); for (let k = 0; k < 7; k++) { const l = LG(d - k); a += l.a; o += l.ok; } return a ? Math.round(100 * o / a) : null; }
function toast(msg) { const e = document.createElement('div'); e.textContent = msg; e.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#14244a;color:#fff;padding:10px 18px;border-radius:99px;z-index:99;font-weight:600'; document.body.appendChild(e); setTimeout(() => e.remove(), 1700); }

/* ------------------------------------------------------------ voice */
const ttsText = pl => pl.replace(/\([^)]*\)/g, ' ').replace(/…/g, '...').replace(/\s*\/\s*/g, ', ').replace(/Wi-Fi/g, 'wifi').replace(/\s+/g, ' ').trim();
const Voice = (() => {
  let au = null, res = null, seq = 0, wv = [];
  const WS = window.speechSynthesis || null;
  const devReady = () => { try { const n = NA(); return !!(n && n.ttsReady && n.ttsReady()); } catch (e) { return false; } };
  /* Polish web voices, best first: neural / natural / enhanced voices sound far better than the basic ones */
  const score = v => (/natural|neural|online/i.test(v.name) ? 6 : 0) + (/premium|enhanced|wavenet|studio|siri/i.test(v.name) ? 5 : 0) + (/google/i.test(v.name) ? 3 : 0) + (v.localService === false ? 1 : 0);
  function load() { try { wv = WS ? WS.getVoices().filter(v => /^pl([-_]|$)/i.test(v.lang)).sort((a, b) => score(b) - score(a)) : []; } catch (e) { wv = []; } }
  if (WS) { load(); try { WS.addEventListener('voiceschanged', () => { load(); if (V && V.tab === 'me' && !M) render(); }); } catch (e) { WS.onvoiceschanged = load; } }
  const webVoice = () => { if (!wv.length) return null; const n = S.cfg.vname; return (n && wv.find(v => v.name === n)) || wv[0]; };
  const webGood = () => { const v = webVoice(); return !!v && (score(v) >= 3 || !!S.cfg.vname); };
  function engine(it) {
    const rec = !!(it && it.a), mode = S.cfg.voice, nat = devReady(), web = !!webVoice();
    if (mode === 'bundled') return rec ? 'rec' : nat ? 'nat' : web ? 'web' : 'none';
    if (mode === 'device') return nat ? 'nat' : web ? 'web' : rec ? 'rec' : 'none';
    if (rec && window.AUDIO_HD) return 'rec';           // neural recordings built by GitHub Actions
    if (nat) return 'nat';
    if (webGood()) return 'web';
    return rec ? 'rec' : web ? 'web' : 'none';
  }
  const fin = () => { if (res) { const r = res; res = null; r(); } };
  function stop() {
    try { if (au) { au.onended = au.onerror = null; au.pause(); } } catch (e) {}
    try { const n = NA(); if (n && n.stop) n.stop(); } catch (e) {}
    try { if (WS && (WS.speaking || WS.pending)) WS.cancel(); } catch (e) {}
    fin();
  }
  const tvKey = it => it && (it.vk || it.a);
  const tvHas = it => S.cfg.tv !== false && !!window.PBSync && PBSync.voice.has(tvKey(it));
  function say(it, slow, gen) {
    stop();
    if (!gen && tvHas(it)) {   // the teacher's own recording
      const my = ++seq;
      return new Promise(done => {
        res = done; const sl = slow || S.cfg.slow;
        PBSync.voice.get(tvKey(it)).then(b64 => {
          if (my !== seq || res !== done) return;
          if (!b64) { res = null; say(it, slow, true).then(done); return; }
          try { au = new Audio('data:audio/mpeg;base64,' + b64); au.playbackRate = sl ? 0.75 : 1; au.onended = au.onerror = fin; const p = au.play(); if (p && p.catch) p.catch(fin); } catch (e) { fin(); }
        });
      });
    }
    return new Promise(done => {
      res = done; const sl = slow || S.cfg.slow, en = engine(it);
      if (en === 'nat') {
        const id = ++seq; window.__ttsDone = i => { if (Number(i) === id) fin(); };
        try { NA().speak(ttsText(it.pl), sl ? 0.55 : 0.85, id); } catch (e) { fin(); }
      } else if (en === 'web') {
        try {
          const u = new SpeechSynthesisUtterance(ttsText(it.pl)), v = webVoice();
          u.lang = (v && v.lang) || 'pl-PL'; if (v) u.voice = v; u.rate = sl ? 0.6 : 0.92;
          const guard = setTimeout(fin, 4000 + it.pl.length * 160);
          u.onend = u.onerror = () => { clearTimeout(guard); fin(); };
          WS.speak(u);
        } catch (e) { fin(); }
      } else if (en === 'rec') {
        try {
          au = new Audio('a/' + it.a + '.mp3'); au.playbackRate = sl ? 0.7 : 1; au.onended = au.onerror = fin;
          const p = au.play(); if (p && p.catch) p.catch(fin);
        } catch (e) { fin(); }
      } else fin();
    });
  }
  function info() {
    const en = engine({ a: 'x', pl: '' });
    if (en === 'rec') return window.AUDIO_HD ? t('vHD') : t('vNone');
    if (en === 'nat') return t('vReady');
    if (en === 'web') return t('vWeb', { v: webVoice().name });
    try { const n = NA(); if (n && n.ttsInfo && n.ttsInfo() === 'nopl') return t('vNopl'); } catch (e) {}
    return t('vNone');
  }
  return { say, stop, info, voices: () => wv, engine, tvHas };
})();
const play = (w, slow, gen) => Voice.say(w, slow, gen);
/* extra button to hear the generated voice when the teacher recorded this word */
const genBtn = w => Voice.tvHas(w) ? `<button class="say slow" data-a="play" data-i="${w.i}" data-g="1" title="${esc(t('tvGen'))}" aria-label="${esc(t('tvGen'))}">🤖</button>` : '';
const tvCls = w => Voice.tvHas(w) ? ' tv' : '';

/* ------------------------------------------------------------ base render */
function render() {
  const a = $('#base'); if (!a) return;
  const sk = streak();
  let view = '';
  if (V.tab === 'today') view = vToday(); else if (V.tab === 'games') view = window.PBGames ? PBGames.menu() : ''; else if (V.tab === 'box') view = vBox(); else if (V.tab === 'sit') view = V.unit != null ? vUnit(V.unit) : vSit(); else if (V.tab === 'words') view = V.unit != null ? vUnit(V.unit) : vWords(); else view = vMe();
  const nav = ['today', 'sit', 'games', 'box', 'words', 'me'].map(k => `<button class="${V.tab === k ? 'on' : ''}" data-a="tab" data-k="${k}">${ICO[k]}<span>${t(k)}</span></button>`).join('');
  const sc = window.PBSync && PBSync.conf(), ss = window.PBSync ? PBSync.state : {};
  const syncChip = sc ? `<button class="chip sy ${ss.running ? 'spin' : ss.err && ss.err !== 'offline' ? 'err' : ''}" data-a="syncnow" title="${esc(t('syncNow'))}" aria-label="${esc(t('syncNow'))}"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3M18 3v4h-4M6 21v-4h4"/></svg></button>` : '';
  a.innerHTML = `<div class="top"><h1>Polski Box<small>🇵🇱</small></h1>${syncChip}<span class="chip"><img src="e/1f525.svg" alt="">${sk} <span style="font-weight:500">${t('streak')}</span></span></div>
  <nav>${nav}</nav><main id="main" class="v-${V.tab}"><div class="mw">${view}</div></main>${sheetHTML()}`;
}
function vToday() {
  const d = today(), due = dueIds(), left = Math.max(0, S.cfg.npd - (S.intro.d === d ? S.intro.n : 0)), nNew = Math.min(left, newPool().length);
  const a = LG(d).a, tot = a + due.length + nNew, pct = tot ? Math.min(1, a / tot) : 1, C = 2 * Math.PI * 30;
  const ring = `<svg class="ring" viewBox="0 0 74 74"><circle cx="37" cy="37" r="30" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="8"/><circle cx="37" cy="37" r="30" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 37 37)"/><text x="37" y="43" text-anchor="middle" fill="#fff" font-size="18" font-weight="700">${Math.round(pct * 100)}%</text></svg>`;
  const finished = !due.length && !nNew;
  const parts = []; if (due.length) parts.push(t('rev', { n: due.length })); if (nNew) parts.push(t('nw', { n: nNew }));
  let hero = `<div class="card hero"><h2>${t('todayGoal')}</h2><div class="row">${ring}<div style="flex:1"><div class="big">${finished ? t('done') : t('hello')}</div><p style="margin:0">${finished ? t('doneSub') : parts.join(' · ')}</p></div></div><div class="mt btns">`;
  if (!finished) hero += `<button class="btn w" data-a="start">${t('start')}</button>`;
  else { if (newPool().length) hero += `<button class="btn w" data-a="more">${t('more')}</button>`; }
  hero += '</div></div>';
  const c = counts();
  const strip = `<div class="card"><h2>${t('boxes')}</h2><div class="boxes">${[1, 2, 3, 4, 5].map(b => `<button class="bx" data-a="tab" data-k="box">${c.due[b] ? `<em>${c.due[b]}</em>` : ''}<b>${c.b[b]}</b><span>${t('box1', { n: b })}</span></button>`).join('')}</div>
    <div class="small">${c.b[6]} ${t('mastered').toLowerCase()} · ${c.b[0]} ${t('newLeft')}</div></div>`;
  const w = WA[(d * 37) % WA.length];
  const wotd = `<div class="card"><h2>${t('wotd')}</h2><div class="wrow" style="border:0;padding:0">${picHTML(w, 'md')}<div class="t"><b class="pl" style="font-size:22px">${esc(w.pl)}</b><span class="ipa">/${esc(w.ipa)}/</span><span class="gl">${esc(gloss(w))}</span></div><button class="say" data-a="play" data-i="${w.i}">${speakerSvg}</button></div></div>`;
  const sl = sitIdx(), sk2 = sl[d % sl.length], su = U[sk2], sws = WA.filter(w => w.u === sk2), sst = sws.filter(w => status(w.i) > 0).length;
  const sitCard = `<div class="card"><h2>${t('sitToday')}</h2><button class="wrow" style="border:0;padding:0" data-a="sitopen" data-u="${sk2}"><img src="e/${su.ic}.svg" width="44" height="44" alt=""><div class="t"><b style="font-size:18px">${esc(utitle(su))}</b><span class="gl">${sst}/${sws.length} ${t('started2')}</span></div><span class="tag">${t('open')}</span></button></div>`;
  const ui = d % U.length, u = U[ui];
  const dial = u.ctx.length ? `<div class="card"><h2>${t('dotd')} · ${esc(utitle(u))}</h2>${dialHTML(ui)}<button class="btn s sm mt" data-a="dial" data-u="${ui}">${t('playAll')}</button></div>` : '';
  const tn = tchNew();
  const tchCard = tn.length ? `<div class="card tchc"><h2>👩‍🏫 ${t('tchTitle')}</h2><div class="wrow" style="border:0;padding:0">${picHTML(tn[tn.length - 1], 'md')}<div class="t"><b style="font-size:19px">${esc(tn[tn.length - 1].pl)}</b><span class="gl">${t('tchSub', { n: tn.length })}</span></div></div><button class="btn mt" data-a="sitlearn" data-u="${TU}">${t('tchGo')}</button></div>` : '';
  const gm = window.PBGames ? PBGames.todayCard() : '';
  return hero + tchCard + sitCard + gm + strip + wotd + dial;
}
function dialHTML(ui) {
  const u = U[ui];
  return u.ctx.map((l, j) => `<button class="dl ${l.w === 'Tú' ? 'you' : ''}" id="dl${ui}_${j}" data-a="line" data-u="${ui}" data-j="${j}">${l.w ? `<small>${esc(S.cfg.ui === 'es' ? l.w : l.we)}</small>` : ''}<b>${esc(l.pl)}</b><span>${esc(S.cfg.gl === 'es' ? l.es : l.en)}</span></button>`).join('');
}
function vBox() {
  const c = counts(), mx = Math.max(1, ...c.b.slice(1, 6));
  const bars = [1, 2, 3, 4, 5].map(b => `<button data-a="boxsheet" data-b="${b}"><div class="fill" style="height:${Math.max(24, Math.round(100 * c.b[b] / mx))}%">${c.due[b] ? `<em>${c.due[b]}</em>` : ''}${c.b[b]}</div><div class="lbl">${t('box1', { n: b })}<small>${b === 1 ? t('every1') : t('everyN', { n: INT[b] })}</small></div></button>`).join('');
  return `<div class="card"><h2>${t('boxes')}</h2><p class="small" style="margin:0 0 10px">${t('boxesSub')}</p><div class="bigbox">${bars}</div>
  <button class="btn s" data-a="boxsheet" data-b="6" style="justify-content:space-between"><span>🏆 ${t('mastered')}</span><b>${c.b[6]}</b></button>
  <div class="small mt center">${c.b[0]} ${t('newLeft')} · ${c.due.slice(1, 6).reduce((a, b) => a + b, 0)} ${t('due')}</div></div>`;
}
function vWords() {
  return `<input class="field" id="q" placeholder="${esc(t('search'))}" value="${esc(V.q)}" autocomplete="off" autocapitalize="off" spellcheck="false"><div id="wres">${wresHTML()}</div>`;
}
function wresHTML() {
  const q = V.q.trim().toLowerCase(); let h = '';
  if (q) {
    const f = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').toLowerCase();
    const r = WA.filter(w => f(w.pl).includes(f(q)) || f(w.es).includes(f(q)) || f(w.en).includes(f(q))).slice(0, 60);
    h += `<div class="card mt">${r.length ? r.map(wrow).join('') : `<div class="empty">${t('noResults')}</div>`}</div>`;
  } else {
    h += `<h2 class="small mt2" style="text-transform:uppercase;letter-spacing:.6px;font-weight:700">${t('units')}</h2>` + U.map((u, k) => {
      if (u.sit) return '';
      const ws = WA.filter(w => w.u === k); if (!ws.length) return ''; const m = ws.reduce((a, w) => a + status(w.i), 0) / (6 * ws.length), st = ws.filter(w => status(w.i) > 0).length;
      return `<button class="ucard" data-a="unit" data-u="${k}"><img src="e/${u.ic}.svg" alt=""><div class="t"><b>${esc(utitle(u))}</b><small>${esc(uother(u))} · ${st}/${ws.length}</small><div class="bar"><i style="width:${Math.round(m * 100)}%"></i></div></div></button>`;
    }).join('');
  }
  return h;
}
const wrow = w => `<button class="wrow" data-a="word" data-i="${w.i}">${picHTML(w, 'sm')}<div class="t"><b>${esc(w.pl)}</b><span class="gl">${esc(gloss(w))}${regChip(w)}</span></div>${w.tch && !S.cards[w.i] ? `<span class="tag d">✨ ${t('tchBadge')}</span>` : stTag(w.i)}</button>`;
const sitIdx = () => U.map((u, k) => k).filter(k => U[k].sit);
function vSit() {
  const list = sitIdx().map(k => {
    const u = U[k], ws = WA.filter(w => w.u === k), st = ws.filter(w => status(w.i) > 0).length, ms = ws.filter(w => status(w.i) === 6).length;
    return `<button class="ucard" data-a="unit" data-u="${k}"><img src="e/${u.ic}.svg" alt=""><div class="t"><b>${esc(utitle(u))}</b><small>${esc(uother(u))} · ${st}/${ws.length} ${t('started2')}${ms ? ' · 🏆 ' + ms : ''}</small><div class="bar"><i style="width:${Math.round(100 * ws.reduce((a, w) => a + status(w.i), 0) / (6 * ws.length))}%"></i></div></div></button>`;
  }).join('');
  return `<div class="card"><h2>${t('sit')}</h2><p style="margin:0">${t('sitIntro')}</p></div>${list}`;
}
function vUnit(k) {
  const u = U[k], ws = WA.filter(w => w.u === k), on = S.q.indexOf(k) >= 0, hasYou = u.ctx.some(l => l.w === 'Tú');
  const unseen = ws.filter(w => !S.cards[w.i]).length, seen = ws.length - unseen;
  let acts = '';
  if (u.sit) {
    acts = `<div class="btns mt">${unseen ? `<button class="btn" data-a="sitlearn" data-u="${k}">${t('learnSit', { n: Math.min(8, unseen) })}</button>` : `<div class="small center">${t('allStarted')}</div>`}
      <div class="btns two">${seen ? `<button class="btn s sm" data-a="sitpractice" data-u="${k}">${t('practiseSit')}</button>` : `<button class="btn s sm" disabled>${t('practiseSit')}</button>`}${hasYou ? `<button class="btn s sm" data-a="rp" data-u="${k}">🎭 ${t('roleplay')}</button>` : ''}</div></div>`;
  } else if (hasYou) acts = `<div class="btns mt"><button class="btn s sm" data-a="rp" data-u="${k}">🎭 ${t('roleplay')}</button></div>`;
  return `<button class="back" data-a="unitback">${t('back')}</button><div class="card"><div class="wrow" style="border:0;padding:0"><img src="e/${u.ic}.svg" width="46" height="46" alt=""><div class="t"><b style="font-size:20px">${esc(utitle(u))}</b><span class="gl">${esc(uother(u))}</span></div></div>
  ${u.sit ? `<p class="desc">${esc(S.cfg.ui === 'es' ? u.ds : u.dn)}</p>` : ''}${acts}
  <div class="srow mt"><div class="l"><b>${t('prio')}</b><small>${on ? t('prioOn') : t('prioOff')}</small></div><button class="sw ${on ? 'on' : ''}" data-a="prio" data-u="${k}" aria-label="${t('prio')}"></button></div></div>
  ${u.ctx.length ? `<div class="card"><h2>${t('dialogues')}</h2>${dialHTML(k)}<button class="btn s sm mt" data-a="dial" data-u="${k}">${t('playAll')}</button></div>` : ''}
  <div class="card"><h2>${u.sit ? t('phrases') : t('unitWords')} (${ws.length})</h2>${ws.map(wrow).join('')}</div>`;
}
function vMe() {
  const c = counts(), d = today(), started = WA.length - c.b[0], a7 = acc7();
  const bars = []; let mx = 1; for (let k = 13; k >= 0; k--) mx = Math.max(mx, LG(d - k).a);
  for (let k = 13; k >= 0; k--) { const n = LG(d - k).a; bars.push(`<div><i class="${n ? '' : 'z'}" style="height:${n ? Math.max(8, Math.round(70 * n / mx)) : 3}px"></i><span>${new Date((d - k) * 864e5).getUTCDate()}</span></div>`); }
  const units = U.map((u, k) => { const ws = WA.filter(w => w.u === k); if (!ws.length) return ''; const m = ws.filter(w => status(w.i) === 6).length; return `<div class="kv"><span>${esc(utitle(u))}</span><span><b>${m}</b>/${ws.length}</span></div><div class="bar ok"><i style="width:${Math.round(100 * m / ws.length)}%"></i></div>`; }).join('');
  const weak = weakList().slice(0, 8);
  const cfg = S.cfg, seg = (key, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${String(cfg[key]) === String(v) ? 'on' : ''}" data-a="cfg" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
  return `<div class="card"><h2>${t('stats')}</h2><div class="stats"><div class="stat"><b>${started}</b><span>${t('started')}</span></div><div class="stat"><b>${c.b[6]}</b><span>${t('mastered2')}</span></div><div class="stat"><b>${a7 == null ? '–' : a7 + '%'}</b><span>${t('acc')}</span></div></div>
   <h2 class="mt2">${t('last14')}</h2><div class="days">${bars.join('')}</div></div>
  <div class="card"><h2>${t('report')}</h2><p class="small" style="margin:0 0 10px">${t('reportSub')}</p>
   ${weak.length ? `<div class="small" style="font-weight:700;margin-bottom:4px">${t('weak')}</div>${weak.map(w => wrow(W[w])).join('')}` : `<div class="small">${t('noWeak')}</div>`}
   <div class="btns two mt"><button class="btn sm" data-a="share">${t('share')}</button><button class="btn s sm" data-a="copyrep">${t('copy')}</button></div></div>
  <div class="card"><h2>${t('byUnit')}</h2>${units}</div>
  <div class="card"><h2>${t('settings')}</h2>
   <div class="srow"><div class="l">${t('npd')}</div>${seg('npd', [[5, '5'], [8, '8'], [12, '12'], [20, '20']])}</div>
   <div class="srow"><div class="l">${t('mode')}</div>${seg('mode', [['course', t('mCourse')], ['mix', t('mMix')], ['sit', t('mSit')]])}</div>
   <div class="srow"><div class="l">${t('ui')}</div>${seg('ui', [['en', 'EN'], ['es', 'ES']])}</div>
   <div class="srow"><div class="l">${t('gl')}</div>${seg('gl', [['en', 'English'], ['es', 'Español']])}</div>
   <div class="srow"><div class="l">${t('voice')}<small>${t('vNote')}</small><small><b>${esc(Voice.info())}</b></small></div>${seg('voice', [['auto', t('vAuto')], ['device', t('vDev')], ['bundled', t('vBun')]])}</div>
   ${Voice.voices().length ? `<div class="srow"><div class="l">${t('vPick')}<small>${t('vTip')}</small></div><select class="field sel" id="vname"><option value="">${t('vBest')}</option>${Voice.voices().map(v => `<option ${S.cfg.vname === v.name ? 'selected' : ''} value="${esc(v.name)}">${esc(v.name)}</option>`).join('')}</select></div>` : ''}
   ${window.PBSync && PBSync.conf() ? `<div class="srow"><div class="l">👩‍🏫 ${t('tvOn')}<small>${t('tvSub', { n: PBSync.voice.count() })}</small></div><button class="sw ${cfg.tv !== false ? 'on' : ''}" data-a="tog" data-k="tv" aria-label="${esc(t('tvOn'))}"></button></div>` : ''}
   <div class="srow"><div class="l">${t('auto')}</div><button class="sw ${cfg.auto ? 'on' : ''}" data-a="tog" data-k="auto" aria-label="${t('auto')}"></button></div>
   <div class="srow"><div class="l">${t('slowDef')}</div><button class="sw ${cfg.slow ? 'on' : ''}" data-a="tog" data-k="slow" aria-label="${t('slowDef')}"></button></div>
   <div class="srow"><div class="l">${t('strict')}<small>${t('strictSub')}</small></div><button class="sw ${cfg.strict ? 'on' : ''}" data-a="tog" data-k="strict" aria-label="${t('strict')}"></button></div></div>
  ${installCard()}
  ${syncCard()}
  <div class="card"><h2>${t('backup')}</h2><div class="btns two"><button class="btn s sm" data-a="export">${t('export')}</button><button class="btn s sm" data-a="import">${t('import')}</button></div>
   <button class="btn bad sm mt" data-a="reset">${t('reset')}</button></div>
  <div class="card"><h2>${t('about')}</h2><p class="small" style="margin:0">${t('aboutTxt', { n: WA.length, u: U.filter(u => !u.sit && !u.tch).length, s: U.filter(u => u.sit).length })}</p></div>`;
}
/* install as an app (Android/Windows: browser prompt; iPad/iPhone: Share > Add to Home Screen) */
let instEv = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); instEv = e; if (V.tab === 'me' && !M) render(); });
const standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
function installCard() {
  if (NA() || standalone() || location.protocol !== 'https:') return '';
  const how = isIOS() ? t('instIOS') : instEv ? '' : t('instOther');
  return `<div class="card"><h2>📲 ${t('inst')}</h2><p class="small" style="margin:0 0 10px">${t('instSub')}</p>${instEv ? `<button class="btn sm" data-a="install">${t('instBtn')}</button>` : `<div class="fb warn small">${how}</div>`}</div>`;
}
function syncCard() {
  if (!window.PBSync) return '';
  const c = PBSync.conf(), st = PBSync.state;
  if (!c) return `<div class="card"><h2>${t('sync')}</h2><p class="small" style="margin:0 0 10px">${t('syncSub')}</p><div class="kv"><span>${t('syncOff')}</span></div><button class="btn sm mt" data-a="syncsetup">${t('syncSetup')}</button></div>`;
  return `<div class="card"><h2>${t('sync')}</h2><div class="kv"><span>${t('syncOn', { r: esc(c.repo) })}</span></div>
   <div class="small">${st.running ? t('syncing') : t('syncLast', { t: st.last ? ago(st.last) : t('syncNever') })}</div>${st.err ? `<div class="fb bad mt small">${esc(T.en['e_' + st.err] ? t('e_' + st.err) : st.err)}</div>` : ''}
   <div class="btns mt"><button class="btn sm" data-a="syncnow">${t('syncNow')}</button><div class="btns two"><button class="btn s sm" data-a="synccode">${t('syncCopy')}</button><button class="btn s sm" data-a="synctch">${t('syncTeacher')}</button></div></div>
   <div class="small mt">${t('syncWarn')}</div><button class="btn g sm mt" data-a="syncout">${t('syncOut')}</button></div>`;
}
function weakList() { return Object.keys(S.cards).map(Number).filter(i => S.cards[i].x > 0).sort((a, b) => S.cards[b].x - S.cards[a].x || S.cards[a].b - S.cards[b].b); }
function reportText() {
  const c = counts(), d = today(), L = [];
  L.push(t('reportHead')); L.push(`${t('rDate')}: ${dayStr(d)} · ${t('rStreak')}: ${streak()}`);
  L.push(`${t('rStarted')}: ${WA.length - c.b[0]} / ${WA.length}`); L.push(`${t('rBoxes')}: ${c.b.slice(1, 6).reduce((a, b) => a + b, 0)} (${c.b.slice(1, 6).join(' / ')})`);
  L.push(`${t('rMast')}: ${c.b[6]}`); const a = acc7(); if (a != null) L.push(`${t('rAcc')}: ${a}%`);
  L.push('', t('rUnits') + ':'); U.forEach((u, k) => { const ws = WA.filter(w => w.u === k); if (ws.length) L.push(`• ${utitle(u)}: ${ws.filter(w => status(w.i) === 6).length}/${ws.length} ✓ · ${ws.filter(w => status(w.i) > 0).length} started`); });
  const wk = weakList().slice(0, 10); if (wk.length) { L.push('', t('rWeak') + ':'); wk.forEach(i => L.push(`• ${W[i].pl} — ${gloss(W[i])} (×${S.cards[i].x})`)); }
  return L.join('\n');
}
function shareText(txt) {
  const n = NA();
  if (n && n.share) { try { n.share(txt); return; } catch (e) {} }
  copyText(txt);
}
function copyText(txt) {
  const done = () => toast(t('copied'));
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done, fb); return; } } catch (e) {}
  fb();
  function fb() { const ta = document.createElement('textarea'); ta.value = txt; ta.style.cssText = 'position:fixed;opacity:0;top:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); done(); }
}

/* ------------------------------------------------------------ sheets */
function sheetHTML() {
  const s = V.sheet; if (!s) return '';
  let b = '';
  if (s.k === 'word') {
    const w = W[s.i], c = S.cards[s.i];
    b = `<div class="center">${picHTML(w, 'lg')}<div class="pl mt" style="font-size:28px">${esc(w.pl)}</div><div class="ipa">/${esc(w.ipa)}/</div><div class="gl mt" style="font-size:18px">${esc(gloss(w))}${regChip(w)}</div>
    <div class="mt" style="display:flex;gap:12px;justify-content:center;align-items:center"><button class="say big${tvCls(w)}" data-a="play" data-i="${w.i}" aria-label="${t('say')}">${speakerSvg}</button><button class="say slow" data-a="play" data-i="${w.i}" data-s="1" aria-label="${t('slow')}">🐢</button>${genBtn(w)}</div>
    ${note(w) ? `<div class="fb warn mt" style="text-align:left"><h4>${t('note')}</h4>${esc(note(w))}</div>` : ''}
    <div class="mt">${stTag(w.i)}${c ? ` <span class="small">✓ ${c.c} · ✗ ${c.x}</span>` : ''}</div></div>`;
  } else if (s.k === 'box') {
    const ids = WA.filter(w => status(w.i) === s.b).map(w => w.i);
    b = `<h3>${s.b === 6 ? '🏆 ' + t('mastered') : t('box1', { n: s.b })}</h3><div class="small">${s.b === 6 ? '' : (s.b === 1 ? t('every1') : t('everyN', { n: INT[s.b] }))}</div>
    ${ids.length ? `<div class="card mt" style="padding:6px 14px">${ids.slice(0, 80).map(i => wrow(W[i])).join('')}</div>${ids.length > 80 ? `<div class="small center">+${ids.length - 80}</div>` : ''}<button class="btn mt" data-a="free" data-b="${s.b}">${t('practiceBox')}</button><div class="small center mt">${t('practiceNote')}</div>` : `<div class="empty">${t('emptyBox')}</div>`}`;
  } else if (s.k === 'welcome') {
    b = `<div class="center"><div style="font-size:46px">📦</div><h3>${T.en.welcome} · ${T.es.welcome.replace('Bienvenido a ', '')}</h3><p class="gl">${T.en.wTxt}<br>${T.es.wTxt}</p></div>
    <div class="btns two"><button class="btn" data-a="lang" data-v="en">English</button><button class="btn" data-a="lang" data-v="es">Español</button></div>`;
  } else if (s.k === 'reset') {
    b = `<h3>${t('resetQ')}</h3><p class="gl">${t('resetSub')}</p><div class="btns two"><button class="btn g" data-a="close">${t('close')}</button><button class="btn bad" data-a="resetgo">${t('resetYes')}</button></div>`;
  } else if (s.k === 'sync') {
    b = `<h3>${t('sync')}</h3><p class="gl small">${t('syncSub')}</p>
    <label class="small" for="srepo">${t('syncRepo')}</label><input class="field" id="srepo" value="MarvinCG/polski-box-data" autocomplete="off" autocapitalize="off" spellcheck="false">
    <label class="small mt" style="display:block" for="stok">${t('syncToken')}</label><input class="field" id="stok" type="password" placeholder="github_pat_…" autocomplete="off" autocapitalize="off" spellcheck="false">
    <label class="small mt" style="display:block" for="scode">${t('syncCode')}</label><input class="field" id="scode" placeholder="PBX1.…" autocomplete="off" autocapitalize="off" spellcheck="false">
    <div id="serr"></div><button class="btn mt" data-a="syncgo" id="sgo">${t('syncGo')}</button><button class="btn g sm mt" data-a="close">${t('close')}</button>`;
  } else if (s.k === 'import') {
    b = `<h3>${t('import')}</h3><textarea class="field mt" id="imp" placeholder="${esc(t('importPh'))}"></textarea><button class="btn mt" data-a="importgo">${t('importGo')}</button>`;
  }
  const dismiss = s.k === 'welcome' ? '' : 'data-a="close"';
  return `<div class="ov" ${dismiss} id="ov"><div class="sheet" data-stop="1"><div class="grab"></div>${b}${s.k === 'word' || s.k === 'box' ? `<button class="btn g sm mt2" data-a="close">${t('close')}</button>` : ''}</div></div>`;
}

/* ------------------------------------------------------------ dialogue player */
let dRun = 0;
async function playDialogue(ui) {
  const id = ++dRun, u = U[ui];
  for (let j = 0; j < u.ctx.length; j++) {
    if (id !== dRun) return;
    const e = document.getElementById(`dl${ui}_${j}`); if (e) { e.classList.add('cur'); try { e.scrollIntoView({ block: 'nearest' }); } catch (x) {} }
    await Voice.say(u.ctx[j]);
    if (e) e.classList.remove('cur');
    await new Promise(r => setTimeout(r, 250));
  }
}
const stopDialogue = () => { dRun++; Voice.stop(); document.querySelectorAll('.dl.cur').forEach(e => e.classList.remove('cur')); };

/* ------------------------------------------------------------ session */
function startSession(kind, ids) {
  const d = today(); let intro = [], rev = [];
  if (kind === 'free') rev = shuffle(ids).slice(0, 20);
  else if (kind === 'sit') intro = WA.filter(w => w.u === ids.u && !S.cards[w.i]).map(w => w.i).slice(0, 8);
  else {
    rev = dueIds().slice(0, 40);
    const left = kind === 'more' ? 5 : Math.max(0, S.cfg.npd - (S.intro.d === d ? S.intro.n : 0));
    intro = newPool().slice(0, left);
  }
  if (!rev.length && !intro.length) return;
  stopDialogue();
  M = { kind, intro, rev, q: [], i: 0, ii: 0, phase: intro.length ? 'intro' : 'ex', st: { a: 0, ok: 0, nw: 0, up: 0, down: 0 }, total: 0, sheet: null, cur: null };
  if (!intro.length) buildQueue();
  V.sheet = null; renderSession(); render();
}
function buildQueue() {
  const d = today();
  if (M.intro.length) {
    M.intro.forEach(i => { if (!S.cards[i]) S.cards[i] = { b: 1, d: d, s: 0, c: 0, x: 0, l: d, t: Date.now() }; });
    if (M.kind !== 'sit') S.intro = { d: d, n: (S.intro.d === d ? S.intro.n : 0) + M.intro.length }; M.st.nw = M.intro.length; save();
  }
  M.q = shuffle(M.intro).concat(shuffle(M.rev)).map(i => ({ i: i, r: 0 })); M.total = M.q.length; M.i = 0; M.phase = 'ex';
}
const exType = i => ['A', 'A', 'B', 'C', 'D', 'E', 'E'][status(i)] || 'A';
const alts = w => { const o = [w.pl]; if (w.pl.indexOf(' / ') > 0) w.pl.split(' / ').forEach(p => o.push(p)); return o; };
const clean = s => s.toLowerCase().replace(/[…\.\?!,;:„”"«»]/g, ' ').replace(/\s+/g, ' ').trim();
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
const words2 = s => clean(s).split(' ').filter(Boolean);
const needsBuild = w => Math.max(...alts(w).map(a => words2(a).length)) > 3;
function distract(w, n, fn) {
  const kindShort = words2(w.pl).length <= 2, seen = new Set([fn(w)]), out = [];
  const same = shuffle(WA.filter(x => x.u === w.u && x.i !== w.i)), other = shuffle(WA.filter(x => x.u !== w.u));
  for (const pool of [[same, true], [other, true], [same, false], [other, false]]) {
    for (const x of pool[0]) {
      if (out.length >= n) break; const s = fn(x); if (seen.has(s)) continue;
      if (pool[1] && (words2(x.pl).length <= 2) !== kindShort) continue;
      seen.add(s); out.push(x);
    }
  }
  return out;
}
function renderSession() {
  const h = $('#exw'); if (!h) return;
  if (!M && window.PBGames && PBGames.active()) { h.innerHTML = `<div class="ex game">${PBGames.html()}</div>`; renderMSheet(); PBGames.after && PBGames.after(); return; }
  if (!M) { h.innerHTML = ''; renderMSheet(); return; }
  stopDialogue();
  let body = '';
  if (M.phase === 'intro') body = introHTML();
  else if (M.phase === 'sum') body = M.kind === 'rp' ? rpSum() : sumHTML();
  else if (M.phase === 'rp') body = rpHTML();
  else body = exHTML();
  h.innerHTML = `<div class="ex">${body}</div>`; renderMSheet();
  const first = $('.field', h); if (first && M.phase === 'ex') { try { first.focus(); } catch (e) {} }
}
const tr = x => S.cfg.gl === 'es' ? x.es : x.en;
const spk = x => S.cfg.ui === 'es' ? x.w : x.we;
function startRP(k) {
  stopDialogue(); M = { kind: 'rp', u: k, j: 0, shown: false, hint: false, phase: 'rp', st: { a: 0, ok: 0, nw: 0, up: 0, down: 0 }, q: [], i: 0, total: 0, sheet: null, cur: null };
  V.sheet = null; renderSession();
}
function rpHTML() {
  const L = U[M.u].ctx, j = M.j, l = L[j], you = l.w === 'Tú';
  const hist = L.slice(Math.max(0, j - 2), j).map(x => `<div class="dl ${x.w === 'Tú' ? 'you' : ''}" style="opacity:.65"><small>${esc(spk(x))}</small><b>${esc(x.pl)}</b><span>${esc(tr(x))}</span></div>`).join('');
  let main = '', foot = '';
  if (!you) {
    if (S.cfg.auto) setTimeout(() => { if (M && M.phase === 'rp' && M.j === j) play(l); }, 250);
    main = `<div class="dl cur"><small>${esc(spk(l))}</small><b>${esc(l.pl)}</b><span>${esc(tr(l))}</span></div><div class="center"><button class="say big" data-a="rpplay">${speakerSvg}</button></div>`;
    foot = `<button class="btn" data-a="rpnext">${t('next')}</button>`;
  } else if (!M.shown) {
    const hint = M.hint ? `<div class="ipa center mt" style="font-size:20px">${esc(l.pl.split(' ').slice(0, 2).join(' '))} …</div>` : '';
    main = `<div class="q">${t('rpYour')}</div><div class="card center" style="margin:0"><div class="small">${t('rpSay')}</div><div class="pl mt" style="font-size:22px">${esc(tr(l))}</div>${hint}</div><div class="small center">${t('rpTip')}</div>`;
    foot = `<button class="btn" data-a="rpshow">${t('rpShow')}</button><button class="btn g sm" data-a="rphint">${t('rpHint')}</button>`;
  } else {
    if (S.cfg.auto) setTimeout(() => { if (M && M.phase === 'rp' && M.j === j && M.shown) play(l); }, 250);
    main = `<div class="dl you cur"><small>${esc(spk(l))}</small><b>${esc(l.pl)}</b><span>${esc(tr(l))}</span></div><div class="center"><button class="say big" data-a="rpplay">${speakerSvg}</button></div>`;
    foot = `<button class="btn" data-a="rpnext">${t('next')}</button>`;
  }
  return `${topBar(j / L.length, (j + 1) + '/' + L.length)}<div class="stage"><div class="q">🎭 ${esc(utitle(U[M.u]))}</div>${hist}${main}</div><div class="foot">${foot}</div>`;
}
function rpSum() {
  return `<div class="stage"><div class="sum"><div class="em">🎭</div><h2>${t('rpDone')}</h2><p class="gl">${t('rpDoneSub')}</p></div></div><div class="foot"><button class="btn s" data-a="rpagain">${t('rpAgain')}</button><button class="btn" data-a="mdone">${t('close')}</button></div>`;
}
function renderMSheet() {
  const h = $('#exs'); if (!h) return;
  h.innerHTML = (M && M.sheet) ? `<div class="ov" data-a="mclose" style="z-index:30"><div class="sheet" data-stop="1"><div class="grab"></div><h3>${t('quit')}</h3><p class="gl">${t('quitSub')}</p><div class="btns two"><button class="btn g" data-a="mclose">${t('keep')}</button><button class="btn bad" data-a="mquit">${t('quitYes')}</button></div></div></div>` : '';
}
function topBar(p, label) { return `<div class="exTop"><button class="x" data-a="mask" aria-label="${t('quitYes')}">✕</button><div class="bar"><i style="width:${Math.round(p * 100)}%"></i></div><small>${label}</small></div>`; }
function introHTML() {
  const w = W[M.intro[M.ii]], last = M.ii === M.intro.length - 1;
  if (S.cfg.auto) setTimeout(() => { if (M && M.phase === 'intro' && M.intro[M.ii] === w.i) play(w); }, 250);
  return `${topBar(M.ii / M.intro.length, (M.ii + 1) + '/' + M.intro.length)}<div class="stage intro ex2"><div class="q">${t('newWord')}${w.tch ? ' · 👩‍🏫' : ''}</div><div class="lr"><div class="lhs">${picHTML(w, 'lg')}</div><div class="rhs">
  <div><div class="pl">${esc(w.pl)}</div><div class="ipa">/${esc(w.ipa)}/</div><div class="gl mt" style="font-size:19px">${esc(gloss(w))}${regChip(w)}</div></div>
  <div style="display:flex;gap:12px;justify-content:center;align-items:center"><button class="say big${tvCls(w)}" data-a="play" data-i="${w.i}">${speakerSvg}</button><button class="say slow" data-a="play" data-i="${w.i}" data-s="1">🐢</button>${genBtn(w)}</div>
  ${note(w) ? `<div class="fb warn" style="text-align:left"><h4>${t('note')}</h4>${esc(note(w))}</div>` : `<div class="small">${t('intro')}</div>`}</div></div></div>
  <div class="foot"><button class="btn" data-a="inext">${last ? t('gotIt') : t('next')}</button></div>`;
}
function opts(list, correct) {
  return `<div class="opts">${list.map((x, k) => `<button class="opt" data-a="opt" data-k="${k}" data-c="${k === correct ? 1 : 0}">${esc(x)}</button>`).join('')}</div>`;
}
function exHTML() {
  const it = M.q[M.i], w = W[it.i], ty = exType(it.i), build = needsBuild(w);
  M.cur = { it, w, ty, build, done: false, tokens: [], used: [], hint: 0 };
  const lab = Math.min(M.i + 1, M.q.length) + '/' + M.q.length;
  let st = '';
  const speak = (big) => `<div style="text-align:center;display:flex;gap:12px;justify-content:center;align-items:center"><button class="say big${tvCls(w)}" data-a="play" data-i="${w.i}">${speakerSvg}</button><button class="say slow" data-a="play" data-i="${w.i}" data-s="1">🐢</button>${genBtn(w)}</div>`;
  if (ty === 'A') {
    const ds = shuffle([w].concat(distract(w, 3, gloss))); st = `<div class="q">${t('qMean')}</div>${lr(`${picHTML(w, 'lg')}<div class="center"><div class="pl">${esc(w.pl)}</div><div class="ipa">/${esc(w.ipa)}/</div></div>${speak()}`, opts(ds.map(gloss), ds.indexOf(w)))}`;
    if (S.cfg.auto) setTimeout(() => { if (M && M.cur && M.cur.w === w && !M.cur.done) play(w); }, 250);
  } else if (ty === 'B') {
    const ds = shuffle([w].concat(distract(w, 3, gloss))); st = `<div class="q">${t('qListen')}</div>${lr(speak(), opts(ds.map(gloss), ds.indexOf(w)))}`;
    setTimeout(() => { if (M && M.cur && M.cur.w === w && !M.cur.done) play(w); }, 250);
  } else if (ty === 'C') {
    const ds = shuffle([w].concat(distract(w, 3, x => x.pl))); st = `<div class="q">${t('qSay')}</div>${lr(`${picHTML(w, 'md')}<div class="center"><div class="pl" style="font-size:22px">${esc(gloss(w))}</div></div>`, opts(ds.map(x => x.pl), ds.indexOf(w)))}`;
  } else {
    const dict = ty === 'E';
    const q = `<div class="q">${t(dict ? (build ? 'qBuildL' : 'qDict') : (build ? 'qBuild' : 'qWrite'))}</div>`;
    const prompt = dict ? speak() : `${picHTML(w, 'md')}<div class="center"><div class="pl" style="font-size:22px">${esc(gloss(w))}</div></div>`;
    if (build) {
      const toks = words2(w.pl.split(' / ')[0]); M.cur.tokens = shuffle(toks.map((x, k) => ({ x, k })));
      st = q + lr(prompt, `<div class="line" id="line"></div><div class="chips" id="chips">${M.cur.tokens.map((o, k) => `<button class="ch" data-a="chip" data-k="${k}">${esc(o.x)}</button>`).join('')}</div>`);
    } else {
      st = q + lr(prompt, `<input class="field" id="ans" placeholder="${esc(t('typeHere'))}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done"><div class="keys">${'ą ć ę ł ń ó ś ź ż'.split(' ').map(c => `<button data-a="key" data-c="${c}">${c}</button>`).join('')}</div>`);
    }
    if (dict) setTimeout(() => { if (M && M.cur && M.cur.w === w && !M.cur.done) play(w); }, 250);
  }
  const foot = (ty === 'D' || ty === 'E') ? `<div class="foot" id="foot"><button class="btn" data-a="check">${t('check')}</button><div class="btns two"><button class="btn g sm" data-a="hint">${t('hint')}</button><button class="btn g sm" data-a="dk">${t('dk')}</button></div></div>` : `<div class="foot" id="foot"><button class="btn g sm" data-a="dk">${t('dk')}</button></div>`;
  return `${topBar(M.i / M.q.length, lab)}<div class="stage ex2" id="stage">${st}</div>${foot}`;
}
const lr = (l, r) => `<div class="lr"><div class="lhs">${l}</div><div class="rhs">${r}<div id="fb"></div></div></div>`;
function typed() { const e = $('#ans'); return e ? e.value : ''; }
function judge(w, text) {
  const u = clean(text); if (!u) return null;
  const a = alts(w).map(clean);
  if (a.indexOf(u) >= 0) return 'ok';
  if (a.some(x => fold(x) === fold(u))) return S.cfg.strict ? 'no' : 'acc';
  return 'no';
}
function finishEx(res) { // res: 'ok' | 'acc' | 'no'
  const C = M.cur; if (!C || C.done) return; C.done = true;
  const w = C.w, ok = res !== 'no', d = today(), it = C.it;
  if (it.r === 0) {
    M.st.a++; if (ok) M.st.ok++;
    const l = S.log[d] || (S.log[d] = { a: 0, ok: 0, n: 0 }); l.a++; if (ok) { l.ok++; l.x = (l.x || 0) + 2; }
    if (M.kind !== 'free') {
      const c = S.cards[w.i];
      if (c) { c.s++; c.l = d; c.t = Date.now(); if (ok) { c.c++; const was = c.b; c.b = Math.min(6, c.b + 1); c.d = d + (c.b === 6 ? MAST : INT[c.b]); if (c.b > was) M.st.up++; } else { c.x++; c.b = 1; c.d = d + 1; M.st.down++; } }
    }
    save();
  }
  if (!ok && it.r < 2) { const at = Math.min(M.i + 3, M.q.length); M.q.splice(at, 0, { i: it.i, r: it.r + 1 }); }
  const last = M.i >= M.q.length - 1;
  const head = res === 'ok' ? `<h4>✓ ${t('right')}</h4>` : res === 'acc' ? `<h4>✓ ${t('accent')} <b>${esc(w.pl)}</b></h4>` : `<h4>✗ ${t('wrong')}</h4>`;
  const fb = $('#fb'); if (fb) fb.innerHTML = `<div class="fb ${res === 'ok' ? 'ok' : res === 'acc' ? 'warn' : 'bad'} pop">${head}<div class="wrow" style="border:0;padding:6px 0 0">${picHTML(w, 'sm')}<div class="t"><b class="pl" style="font-size:20px">${esc(w.pl)}</b><span class="ipa">/${esc(w.ipa)}/</span><span class="gl">${esc(gloss(w))}${regChip(w)}</span></div><button class="say" data-a="play" data-i="${w.i}">${speakerSvg}</button></div>${note(w) ? `<div class="note">${esc(note(w))}</div>` : ''}${!ok && it.r < 2 ? `<div class="note">${t('tryAgain')}</div>` : ''}</div>`;
  const foot = $('#foot'); if (foot) foot.innerHTML = `<button class="btn" data-a="enext" id="nextbtn">${last ? t('cont') : t('next')}</button>`;
  const st = $('#stage'); if (st) setTimeout(() => { st.scrollTop = st.scrollHeight; }, 30);
  if (C.ty === 'C' || C.ty === 'D' || !ok) play(w); else if (C.ty === 'E') play(w);
}
function sumHTML() {
  const s = M.st, pct = s.a ? Math.round(100 * s.ok / s.a) : 0, more = (M.kind === 'daily' || M.kind === 'more') && newPool().length > 0;
  return `<div class="stage"><div class="sum"><div class="em">${pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div><h2>${t('sumTitle')}</h2></div>
  <div class="stats"><div class="stat"><b>${s.a}</b><span>${t('sumA')}</span></div><div class="stat"><b>${pct}%</b><span>${t('sumOk')}</span></div><div class="stat"><b>${s.nw}</b><span>${t('sumNew')}</span></div></div>
  <div class="card" style="margin:0"><div class="kv"><span>⬆️ ${t('sumUp')}</span><b>${s.up}</b></div><div class="kv"><span>⬇️ ${t('sumDown')}</span><b>${s.down}</b></div>${M.kind === 'daily' || M.kind === 'more' || M.kind === 'sit' ? `<div class="kv"><span>📅</span><b>${t('sumNext')}</b></div>` : ''}</div></div>
  <div class="foot">${more ? `<button class="btn s" data-a="msmore">${t('more')}</button>` : ''}<button class="btn" data-a="mdone">${t('close')}</button></div>`;
}
function endSession() { stopDialogue(); M = null; renderSession(); render(); if (window.PBSync) PBSync.soon(800); }

/* ------------------------------------------------------------ actions */
const A = {
  tab: d => { stopDialogue(); V.tab = d.k; V.unit = null; V.sheet = null; render(); const m = $('#main'); if (m) m.scrollTop = 0; },
  start: () => startSession('daily'), more: () => startSession('more'),
  free: d => { const b = Number(d.b); startSession('free', WA.filter(w => status(w.i) === b).map(w => w.i)); },
  play: d => { play(W[d.i], !!d.s, !!d.g); },
  word: d => { V.sheet = { k: 'word', i: Number(d.i) }; render(); },
  boxsheet: d => { V.sheet = { k: 'box', b: Number(d.b) }; render(); },
  close: () => { V.sheet = null; render(); },
  unit: d => { V.unit = Number(d.u); render(); const m = $('#main'); if (m) m.scrollTop = 0; },
  unitback: () => { stopDialogue(); V.unit = null; render(); },
  prio: d => { const u = Number(d.u), k = S.q.indexOf(u); if (k >= 0) S.q.splice(k, 1); else S.q.unshift(u); S.qt = Date.now(); save(); render(); },
  dial: d => { playDialogue(Number(d.u)); },
  line: d => { stopDialogue(); Voice.say(U[d.u].ctx[d.j]); },
  cfg: d => { const k = d.k; let v = d.v; if (k === 'npd') v = Number(v); S.cfg[k] = v; S.cfgT = Date.now(); save(); render(); },
  tog: d => { S.cfg[d.k] = d.k === 'tv' ? S.cfg.tv === false : !S.cfg[d.k]; S.cfgT = Date.now(); save(); render(); },
  share: () => shareText(reportText()), copyrep: () => copyText(reportText()),
  export: () => shareText(JSON.stringify(S)),
  import: () => { V.sheet = { k: 'import' }; render(); },
  importgo: () => { try { const o = JSON.parse(($('#imp').value || '').trim()); if (!o || typeof o.cards !== 'object') throw 0; const dev = S.dev; S = norm(o); S.dev = dev; S.cfg.ok = true; Object.keys(S.cards).forEach(k => { S.cards[k].t = Date.now(); }); save(); V.sheet = null; render(); toast(t('importOk')); } catch (e) { toast(t('importBad')); } },
  reset: () => { V.sheet = { k: 'reset' }; render(); },
  resetgo: () => { const c = S.cfg, dev = S.dev; S = blank(); S.cfg = c; S.dev = dev; S.resetAt = Date.now(); save(); V.sheet = null; render(); },
  lang: d => { S.cfg.ui = d.v; S.cfg.gl = d.v; S.cfg.ok = true; S.cfgT = Date.now(); save(); V.sheet = null; render(); },
  /* session */
  mask: () => { if (M) { M.sheet = true; renderMSheet(); } },
  mclose: () => { if (M) { M.sheet = null; renderMSheet(); } },
  mquit: () => endSession(), mdone: () => endSession(),
  msmore: () => { M = null; renderSession(); startSession('more'); },
  inext: () => { if (!M) return; if (M.ii < M.intro.length - 1) { M.ii++; renderSession(); } else { buildQueue(); renderSession(); } },
  opt: (d, el) => {
    const C = M && M.cur; if (!C || C.done) return; const ok = d.c === '1';
    document.querySelectorAll('.opt').forEach(b => { b.disabled = true; if (b.dataset.c === '1') b.classList.add('ok'); });
    if (!ok) { el.classList.add('bad', 'shake'); } finishEx(ok ? 'ok' : 'no');
  },
  key: d => { const e = $('#ans'); if (!e) return; const p = e.selectionStart == null ? e.value.length : e.selectionStart; e.value = e.value.slice(0, p) + d.c + e.value.slice(e.selectionEnd == null ? p : e.selectionEnd); e.focus(); try { e.setSelectionRange(p + 1, p + 1); } catch (x) {} },
  chip: (d, el) => {
    const C = M && M.cur; if (!C || C.done) return; const k = Number(d.k), o = C.tokens[k];
    if (C.used.indexOf(k) >= 0) return; C.used.push(k); el.classList.add('used'); drawLine();
  },
  unchip: d => { const C = M && M.cur; if (!C || C.done) return; const k = Number(d.k); const at = C.used.indexOf(k); if (at >= 0) { C.used.splice(at, 1); const b = document.querySelector(`#chips [data-k="${k}"]`); if (b) b.classList.remove('used'); drawLine(); } },
  check: () => {
    const C = M && M.cur; if (!C || C.done) return;
    if (C.build) { if (!C.used.length) return; const got = C.used.map(k => C.tokens[k].x).join(' '); finishEx(judgeBuild(C.w, got)); }
    else { const r = judge(C.w, typed()); if (r) { const e = $('#ans'); if (e) e.disabled = true; finishEx(r); } }
  },
  dk: () => { const C = M && M.cur; if (!C || C.done) return; document.querySelectorAll('.opt').forEach(b => { b.disabled = true; if (b.dataset.c === '1') b.classList.add('ok'); }); const e = $('#ans'); if (e) e.disabled = true; finishEx('no'); },
  hint: () => {
    const C = M && M.cur; if (!C || C.done || C.build) { if (C && C.build && !C.done) { /* place next correct chip */ const want = words2(C.w.pl.split(' / ')[0]); const next = want[C.used.length]; const k = C.tokens.findIndex((o, j) => o.x === next && C.used.indexOf(j) < 0); if (k >= 0 && C.used.length < want.length) { C.used.push(k); const b = document.querySelector(`#chips [data-k="${k}"]`); if (b) b.classList.add('used'); drawLine(); } } return; }
    C.hint++; const target = clean(C.w.pl.split(' / ')[0]); const e = $('#ans'); if (!e) return; const n = Math.min(C.hint, target.length); e.value = target.slice(0, n); e.focus();
  },
  sitlearn: d => startSession('sit', { u: Number(d.u) }),
  sitpractice: d => { const k = Number(d.u); startSession('free', WA.filter(w => w.u === k && status(w.i) > 0).map(w => w.i)); },
  rp: d => startRP(Number(d.u)),
  rpplay: () => { if (M && M.phase === 'rp') play(U[M.u].ctx[M.j]); },
  rpshow: () => { if (M) { M.shown = true; renderSession(); } },
  rphint: () => { if (M) { M.hint = true; renderSession(); } },
  rpnext: () => { if (!M) return; M.j++; M.shown = false; M.hint = false; if (M.j >= U[M.u].ctx.length) M.phase = 'sum'; renderSession(); },
  rpagain: () => { if (M) startRP(M.u); },
  sitopen: d => { stopDialogue(); V.tab = 'sit'; V.unit = Number(d.u); V.sheet = null; render(); const m = $('#main'); if (m) m.scrollTop = 0; },
  install: async () => { if (!instEv) return; instEv.prompt(); try { await instEv.userChoice; } catch (e) {} instEv = null; render(); },
  syncsetup: () => { V.sheet = { k: 'sync' }; render(); },
  syncgo: async () => {
    const code = PBSync.readCode(($('#scode') || {}).value);
    const repo = code ? code.r : ($('#srepo') || {}).value || '', tok = code ? code.t : ($('#stok') || {}).value || '';
    const er = $('#serr'), btn = $('#sgo'); if (!repo || !tok) return; if (btn) { btn.disabled = true; btn.textContent = t('syncing'); }
    try { await PBSync.connect(repo, tok); V.sheet = null; render(); toast(t('syncDone')); }
    catch (e) { if (er) er.innerHTML = `<div class="fb bad mt small">${esc(T.en['e_' + e.message] ? t('e_' + e.message) : e.message)}</div>`; if (btn) { btn.disabled = false; btn.textContent = t('syncGo'); } }
  },
  syncnow: () => { PBSync.run('manual'); render(); },
  synccode: () => copyText(PBSync.makeCode(PBSync.conf())),
  synctch: () => copyText((location.protocol === 'https:' ? location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '') : SITE) + 'teacher.html#' + PBSync.makeCode(PBSync.conf(), { n: 'teacher' })),
  syncout: () => { PBSync.disconnect(); render(); },
  enext: () => { if (!M) return; M.i++; if (M.i >= M.q.length) { M.phase = 'sum'; } renderSession(); }
};
function judgeBuild(w, got) { const want = alts(w).map(clean); const g = clean(got); return want.indexOf(g) >= 0 ? 'ok' : (want.some(x => fold(x) === fold(g)) ? 'acc' : 'no'); }
function drawLine() { const C = M.cur, l = $('#line'); if (!l) return; l.innerHTML = C.used.map(k => `<button class="ch in" data-a="unchip" data-k="${k}">${esc(C.tokens[k].x)}</button>`).join(''); }

/* ------------------------------------------------------------ boot */
function boot() {
  const app = $('#app'); app.innerHTML = '<div id="base" style="display:contents"></div><div id="exw"></div><div id="exs"></div>';
  app.addEventListener('click', e => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.classList.contains('ov') && e.target.closest('[data-stop]')) return;
    const k = a.dataset.a;
    if (k.slice(0, 2) === 'g:') { if (window.PBGames) PBGames.act(k.slice(2), a.dataset, a); return; }
    const f = A[k]; if (f) f(a.dataset, a);
  });
  app.addEventListener('change', e => { if (e.target.id === 'vname') { S.cfg.vname = e.target.value; save(); render(); Voice.say({ pl: 'Dzień dobry! Miło mi.' }); } });
  app.addEventListener('input', e => { if (e.target.id === 'q') { V.q = e.target.value; const r = $('#wres'); if (r) r.innerHTML = wresHTML(); } });
  /* keyboard & mouse (Samsung DeX, tablets with keyboard, PC) */
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tg = e.target, typing = tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT');
    if (tg && tg.id === 'ans' && e.key === 'Enter') { e.preventDefault(); if (M && M.cur && M.cur.done) A.enext(); else A.check(); return; }
    if (window.PBGames && PBGames.active() && !M && PBGames.key(e, typing)) { e.preventDefault(); return; }
    if (e.key === 'Escape') { if (!(window.__back && window.__back()) && V.tab !== 'today') A.tab({ k: 'today' }); e.preventDefault(); return; }
    if (typing) return;
    const ex = $('#exw .ex');
    if (ex) {
      if (/^[1-9]$/.test(e.key)) { const b = ex.querySelectorAll('.opt:not([disabled])')[Number(e.key) - 1]; if (b) { b.click(); e.preventDefault(); } return; }
      if (e.key === 'Enter') { const b = ex.querySelector('#nextbtn') || ex.querySelector('.foot .btn:not(.g):not(.s):not([disabled])'); if (b) { b.click(); e.preventDefault(); } return; }
      if (e.key === ' ') { const b = ex.querySelector('.say.big'); if (b) { b.click(); e.preventDefault(); } return; }
      if (e.key === 'Backspace') { const l = ex.querySelectorAll('#line .ch'); if (l.length) { l[l.length - 1].click(); e.preventDefault(); } }
      return;
    }
    if (!V.sheet && /^[1-6]$/.test(e.key)) { const k = ['today', 'sit', 'games', 'box', 'words', 'me'][Number(e.key) - 1]; A.tab({ k }); e.preventDefault(); }
  });
  window.__back = function () {
    if (!M && window.PBGames && PBGames.active()) return PBGames.back();
    if (M) { if (M.sheet) M.sheet = null; else if (M.phase === 'sum') return endSessionRet(); else M.sheet = true; renderMSheet(); return true; }
    if (V.sheet && V.sheet.k !== 'welcome') { V.sheet = null; render(); return true; }
    if (V.unit != null) { stopDialogue(); V.unit = null; render(); return true; }
    if (V.tab !== 'today') { V.tab = 'today'; render(); return true; }
    return false;
  };
  function endSessionRet() { endSession(); return true; }
  if (!S.cfg.ok) V.sheet = { k: 'welcome' };
  const hs = (location.hash || '').slice(1); if (['games', 'sit', 'box', 'words', 'me'].indexOf(hs) >= 0) V.tab = hs;
  render();
  if (window.PBSync) PBSync.attach({
    get: () => S,
    set: n => { const keep = { cfg: { voice: S.cfg.voice, vname: S.cfg.vname, ok: S.cfg.ok || n.cfg.ok } }; S = norm(n); Object.assign(S.cfg, keep.cfg); store.set(S); if (!M && !(window.PBGames && PBGames.active())) render(); },
    custom: list => { setCustom(list); if (!M && !(window.PBGames && PBGames.active())) render(); },
    device: () => deviceName(),
    status: () => { if (!M && !(window.PBGames && PBGames.active())) { const sy = $('.chip.sy'); if (sy) { sy.classList.toggle('spin', !!PBSync.state.running); } if (V.tab === 'me') render(); } }
  });
}
/* teacher words come from words.json in the data repository: ids CB + position (the file is append-only) */
function setCustom(list) {
  for (let i = W.length - 1; i >= CB; i--) delete W[i];
  W.length = Math.min(W.length, CB);
  const live = [];
  (list || []).forEach((e, k) => {
    if (!e || e.del || !e.pl) return;
    const w = { i: CB + k, vk: 't' + k, u: TU, pl: e.pl, es: e.es || '', en: e.en || e.es || '', ipa: e.ipa || (window.PolishIPA ? PolishIPA(e.pl) : ''), em: e.em || '📝', tch: 1, at: e.at || 0 };
    if (e.r === 'F' || e.r === 'I') w.r = e.r;
    if (e.ne || e.nn) { w.ne = e.ne || e.nn; w.nn = e.nn || e.ne; }
    W[CB + k] = w; live.push(w);
  });
  WA = W.filter(Boolean);
}
function deviceName() { const u = navigator.userAgent; return /iPad/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1) ? 'iPad' : /Android/.test(u) ? (NA() ? 'Android app' : 'Android') : /Windows/.test(u) ? 'Windows' : /Mac/.test(u) ? 'Mac' : 'web'; }
window.__pause = function () { stopDialogue(); };
window.__pb = { S: () => S, M: () => M, A, render, today, W, U, WA: () => WA }; // used by the self-test
/* small API for games.js */
window.PB = { S: () => S, W: () => W, WA: () => WA, U, t, T, esc, shuffle, gloss, play, stop: () => Voice.stop(), picHTML, status, newPool, save, today, render,
  renderSession, speakerSvg, regChip, note, words2, clean, fold, M: () => M, toast,
  introduce(ids) { const d = today(); ids.forEach(i => { if (!S.cards[i]) S.cards[i] = { b: 1, d: d, s: 0, c: 0, x: 0, l: d, t: Date.now() }; }); save(); },
  xp(n) { const d = today(), l = S.log[d] || (S.log[d] = { a: 0, ok: 0, n: 0 }); l.x = (l.x || 0) + n; save(); },
  xpTotal() { let x = 0; const add = L => { for (const k in L) x += L[k].x || 0; }; add(S.log); for (const k in (S.ol || {})) add(S.ol[k]); return x; },
  best(k, v) { S.gb = S.gb || {}; if (v == null) return S.gb[k] || 0; if (v > (S.gb[k] || 0)) { S.gb[k] = v; save(); return true; } return false; }
};
S.devs = S.devs || {}; S.devs[S.dev] = { n: deviceName(), t: Date.now() };
boot();
})();
