/* Polski Box games. Every game mixes words you already started with up to two brand-new ones,
   which are introduced first and then join your learning box (box 1). */
(function () {
'use strict';
const P = () => window.PB;
const GT = {
  en: {
    title: 'Games', sub: 'Play with your words. Every round brings up to two new ones.', play: 'Play', best: 'Best', lvl: 'Level {n}', xp: '{n} XP', toNext: '{n} XP to level {l}',
    today: 'Game of the day', newIn: 'New words in this game', newSub: 'Listen and look. They join your box after the game.', go: 'Let’s play!',
    score: 'Score', record: 'New record!', again: 'Play again', close: 'Close', practised: 'Words in this game', earned: '+{n} XP', time: 'Time', moves: 'Moves', round: 'Round',
    mem: 'Pairs', memD: 'Find the Polish word for each picture.', blitz: 'Blitz', blitzD: '60 seconds. How many can you get? Streaks multiply points.',
    listen: 'Listen & tap', listenD: 'Hear the word, tap the right picture.', spell: 'Spell it', spellD: 'Build the word letter by letter — mind ą, ę, ł…',
    order: 'Word order', orderD: 'Put the sentence back together.', reg: 'Formal or informal?', regD: 'Pan / Pani for her parents, ty for her brother. Can you tell?',
    formal: 'Formal', informal: 'Informal', regF: 'Formal: uses Pan / Pani / Państwo or polite forms — for her parents and relatives.', regI: 'Informal: uses ty — for her brother and friends.',
    check: 'Check', hint: 'Hint', dk: 'Show answer', replay: 'Listen again', next: 'Next', notEnough: 'Learn a few more words first — this game needs {n}.',
    right: 'Correct!', wrong: 'Not quite', quit: 'Quit game'
  },
  es: {
    title: 'Juegos', sub: 'Juega con tus palabras. Cada partida trae hasta dos nuevas.', play: 'Jugar', best: 'Récord', lvl: 'Nivel {n}', xp: '{n} XP', toNext: 'Faltan {n} XP para el nivel {l}',
    today: 'Juego del día', newIn: 'Palabras nuevas en este juego', newSub: 'Escucha y mira. Entran a tu caja al terminar.', go: '¡A jugar!',
    score: 'Puntos', record: '¡Nuevo récord!', again: 'Jugar otra vez', close: 'Cerrar', practised: 'Palabras de esta partida', earned: '+{n} XP', time: 'Tiempo', moves: 'Movimientos', round: 'Ronda',
    mem: 'Parejas', memD: 'Encuentra la palabra polaca de cada imagen.', blitz: 'Contrarreloj', blitzD: '60 segundos. ¿Cuántas aciertas? Las rachas multiplican los puntos.',
    listen: 'Escucha y toca', listenD: 'Oye la palabra y toca la imagen correcta.', spell: 'Deletrea', spellD: 'Arma la palabra letra por letra — ojo con ą, ę, ł…',
    order: 'Ordena la frase', orderD: 'Vuelve a armar la frase.', reg: '¿Formal o informal?', regD: 'Pan / Pani para sus papás, ty para su hermano. ¿Sabes distinguirlo?',
    formal: 'Formal', informal: 'Informal', regF: 'Formal: usa Pan / Pani / Państwo o formas de cortesía — para sus papás y familiares.', regI: 'Informal: usa ty — para su hermano y amigos.',
    check: 'Comprobar', hint: 'Pista', dk: 'Ver respuesta', replay: 'Escuchar otra vez', next: 'Siguiente', notEnough: 'Aprende unas palabras más primero — este juego necesita {n}.',
    right: '¡Correcto!', wrong: 'No del todo', quit: 'Salir del juego'
  },
  pl: {
    title: 'Gry', sub: 'Baw się swoimi słówkami. Każda runda przynosi do dwóch nowych.', play: 'Graj', best: 'Rekord', lvl: 'Poziom {n}', xp: '{n} XP', toNext: 'Brakuje {n} XP do poziomu {l}',
    today: 'Gra dnia', newIn: 'Nowe słówka w tej grze', newSub: 'Posłuchaj i popatrz. Po grze trafią do twojego pudełka.', go: 'Gramy!',
    score: 'Punkty', record: 'Nowy rekord!', again: 'Zagraj jeszcze raz', close: 'Zamknij', practised: 'Słówka z tej gry', earned: '+{n} XP', time: 'Czas', moves: 'Ruchy', round: 'Runda',
    mem: 'Pary', memD: 'Znajdź polskie słowo do każdego obrazka.', blitz: 'Na czas', blitzD: '60 sekund. Ile zgadniesz? Serie mnożą punkty.',
    listen: 'Posłuchaj i dotknij', listenD: 'Usłysz słowo i dotknij właściwego obrazka.', spell: 'Przeliteruj', spellD: 'Ułóż słowo litera po literze — uważaj na ą, ę, ł…',
    order: 'Szyk zdania', orderD: 'Złóż zdanie z powrotem.', reg: 'Formalnie czy nieformalnie?', regD: 'Pan / Pani do jej rodziców, ty do jej brata. Rozróżnisz?',
    formal: 'Formalnie', informal: 'Nieformalnie', regF: 'Formalnie: Pan / Pani / Państwo lub formy grzecznościowe — do jej rodziców i krewnych.', regI: 'Nieformalnie: na „ty” — do jej brata i przyjaciół.',
    check: 'Sprawdź', hint: 'Podpowiedź', dk: 'Pokaż odpowiedź', replay: 'Posłuchaj jeszcze raz', next: 'Dalej', notEnough: 'Najpierw naucz się kilku słówek — ta gra potrzebuje {n}.',
    right: 'Dobrze!', wrong: 'Nie całkiem', quit: 'Wyjdź z gry'
  }
};
const g = (k, v) => { const ui = P().S().cfg.ui; let s = (GT[ui] || GT.en)[k] || (ui === 'pl' && GT.es[k]) || GT.en[k] || k; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s; };
const GAMES = [
  { k: 'mem', ic: '🃏', need: 6 }, { k: 'blitz', ic: '⚡', need: 8 }, { k: 'listen', ic: '👂', need: 6 },
  { k: 'spell', ic: '🔤', need: 4 }, { k: 'order', ic: '🧩', need: 3 }, { k: 'reg', ic: '🎩', need: 6 }
];
const esc = s => P().esc(s), sh = a => P().shuffle(a), W = () => P().W(), gl = w => P().gloss(w);
const tok = pl => pl.split(' / ')[0].replace(/\([^)]*\)/g, ' ').split(/\s+/).map(x => x.replace(/^[„"«(¡¿]+|[.,!?…;:”"»)]+$/g, '')).filter(Boolean);
const isWord = w => !/…|\d|-/.test(w.pl) && tok(w.pl).length <= 2 && w.pl.length <= 22;
const hasPic = w => isWord(w) && (w.em || (w.p && w.p[0] !== '#'));
const isPhrase = w => { const n = tok(w.pl).length; return n >= 3 && n <= 9 && !/…/.test(w.pl); };
const hasReg = w => w.r === 'F' || w.r === 'I';
const spellable = w => isWord(w) && /^[a-ząćęłńóśźż ]+$/i.test(w.pl.split(' / ')[0]) && w.pl.split(' / ')[0].length >= 3 && w.pl.split(' / ')[0].length <= 12;
const FILTER = { mem: isWord, blitz: isWord, listen: hasPic, spell: spellable, order: isPhrase, reg: hasReg };

/* pool = words you started (shuffled) + up to nNew new ones from your daily order */
function pool(f, size, nNew, need) {
  const S = P().S(), started = sh(P().WA().filter(w => S.cards[w.i] && f(w)).map(w => w.i));
  const want = Math.max(nNew, need - started.length);   // normally 2 new words; more only if you have too few to play
  const fresh = P().newPool().filter(i => W()[i] && f(W()[i])).slice(0, Math.max(0, want));
  return { ids: fresh.concat(started).slice(0, Math.max(size, fresh.length)), fresh };
}
function others(w, n, f, key) {
  const seen = new Set([key(w)]), out = [];
  for (const x of sh(P().WA().filter(x => x.i !== w.i && f(x)))) { if (out.length >= n) break; const k = key(x); if (seen.has(k)) continue; seen.add(k); out.push(x); }
  return out;
}

let G = null, timer = null;
const now = () => Date.now();
function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

function start(k) {
  const def = GAMES.find(x => x.k === k), f = FILTER[k];
  const size = { mem: 6, blitz: 40, listen: 8, spell: 6, order: 5, reg: 10 }[k];
  let pl;
  if (k === 'reg') { const S = P().S(); const a = sh(P().WA().filter(w => hasReg(w) && S.cards[w.i])), b = sh(P().WA().filter(w => hasReg(w) && !S.cards[w.i])); pl = { ids: a.concat(b).slice(0, size).map(w => w.i), fresh: [] }; }
  else pl = pool(f, size, 2, def.need);
  if (pl.ids.length < def.need) { P().toast(g('notEnough', { n: def.need })); return; }
  G = { k, ids: pl.ids, fresh: pl.fresh, phase: pl.fresh.length ? 'new' : 'play', score: 0, ok: 0, bad: 0, seen: new Set(), miss: new Set(), t0: now() };
  if (G.phase === 'play') begin();
  P().renderSession();
}
function begin() {
  if (G.fresh.length) P().introduce(G.fresh);
  G.phase = 'play'; G.t0 = now(); const k = G.k;
  if (k === 'mem') {
    const ids = G.ids.slice(0, 6); G.tiles = sh(ids.map(i => ({ i, s: 'pl' })).concat(ids.map(i => ({ i, s: 'gl' })))); G.open = []; G.moves = 0; G.done = 0; G.n = ids.length;
  } else if (k === 'blitz') {
    G.end = now() + 60000; G.combo = 1; nextBlitz();
    stopTimer(); timer = setInterval(() => { if (!G || G.k !== 'blitz' || G.phase !== 'play') return stopTimer(); const left = G.end - now(); const e = document.getElementById('gtime'); if (e) { e.style.width = Math.max(0, left / 600) + '%'; } const s = document.getElementById('gsec'); if (s) s.textContent = Math.max(0, Math.ceil(left / 1000)); if (left <= 0) finish(); }, 200);
  } else if (k === 'listen') { G.r = 0; G.n = Math.min(8, G.ids.length); nextListen(); }
  else if (k === 'spell') { G.r = 0; G.n = Math.min(6, G.ids.length); nextSpell(); }
  else if (k === 'order') { G.r = 0; G.n = Math.min(5, G.ids.length); nextOrder(); }
  else if (k === 'reg') { G.r = 0; G.n = Math.min(10, G.ids.length); G.ans = null; G.combo = 0; }
}
function finish() {
  stopTimer(); if (!G || G.phase === 'end') return;
  G.phase = 'end'; G.score = Math.max(0, Math.round(G.score));
  G.xp = Math.max(1, Math.round(G.score / 20)); P().xp(G.xp); G.rec = P().best(G.k, G.score);
  P().renderSession();
}
function quit() { stopTimer(); P().stop(); G = null; P().renderSession(); P().render(); if (window.PBSync) PBSync.soon(800); }

/* ---------------- per-game round builders */
function nextBlitz() {
  const ids = G.ids, i = ids[Math.floor(Math.random() * ids.length)], w = W()[i];
  const dir = Math.random() < 0.7 ? 'pg' : 'gp', key = dir === 'pg' ? gl : (x => x.pl);
  const os = sh([w].concat(others(w, 3, isWord, key)));
  G.cur = { w, dir, opts: os, right: os.indexOf(w), done: false }; G.seen.add(i);
}
function nextListen() {
  const i = G.ids[G.r], w = W()[i];
  const os = sh([w].concat(others(w, 5, hasPic, gl)));
  G.cur = { w, opts: os, right: os.indexOf(w), wrong: [], rep: 0, done: false }; G.seen.add(i);
  setTimeout(() => { if (G && G.cur && G.cur.w === w) P().play(w); }, 350);
}
const PLAIN = { 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' };
const MARK = { a: 'ą', c: 'ć', e: 'ę', l: 'ł', n: 'ń', o: 'ó', s: 'ś', z: 'ż' };
function nextSpell() {
  const i = G.ids[G.r], w = W()[i], target = Array.from(w.pl.split(' / ')[0].toLowerCase());
  const extra = []; target.forEach(c => { if (PLAIN[c] && extra.length < 2) extra.push(PLAIN[c]); });
  for (const c of target) { if (extra.length >= 2) break; if (MARK[c] && !target.includes(MARK[c])) extra.push(MARK[c]); }
  while (extra.length < 2) extra.push('aeioyrnkt'[Math.floor(Math.random() * 9)]);
  G.cur = { w, target, tiles: sh(target.concat(extra).map((c, k) => ({ c, k }))), built: [], hints: 0, mist: 0, done: false }; G.seen.add(i);
}
function nextOrder() {
  const i = G.ids[G.r], w = W()[i], target = tok(w.pl);
  let tiles = sh(target.map((x, k) => ({ x, k }))); let guard = 0;
  while (tiles.map(o => o.x).join(' ') === target.join(' ') && guard++ < 6) tiles = sh(tiles);
  G.cur = { w, target, tiles, built: [], mist: 0, bad: null, done: false }; G.seen.add(i);
}

/* ---------------- rendering */
function top(label, pct) {
  return `<div class="exTop"><button class="x" data-a="g:quit" aria-label="${esc(g('quit'))}">✕</button><div class="bar"><i ${pct == null ? '' : `style="width:${Math.round(pct * 100)}%"`} id="gtime"></i></div><small>${label}</small></div>`;
}
const say = w => `<button class="say" data-a="g:say" data-i="${w.i}" aria-label="🔊">${P().speakerSvg}</button>`;
function html() {
  if (!G) return '';
  const name = g(G.k), k = G.k;
  if (G.phase === 'new') {
    return `${top(name)}<div class="stage"><div class="q">${GAMES.find(x => x.k === k).ic} ${esc(name)}</div><div class="card" style="margin:0"><h2>✨ ${g('newIn')}</h2><p class="small" style="margin:0 0 6px">${g('newSub')}</p>
      ${G.fresh.map(i => { const w = W()[i]; return `<div class="wrow">${P().picHTML(w, 'md')}<div class="t"><b class="pl" style="font-size:21px">${esc(w.pl)}</b><span class="ipa">/${esc(w.ipa)}/</span><span class="gl">${esc(gl(w))}${P().regChip(w)}</span></div>${say(w)}</div>`; }).join('')}</div></div>
      <div class="foot"><button class="btn" data-a="g:begin">${g('go')}</button></div>`;
  }
  if (G.phase === 'end') {
    const xs = Array.from(G.seen).map(i => W()[i]).filter(Boolean);
    return `<div class="stage"><div class="sum"><div class="em">${G.rec ? '🏆' : G.score > 0 ? '🎉' : '💪'}</div><h2>${esc(name)}</h2>${G.rec ? `<div class="tag m" style="font-size:14px">${g('record')}</div>` : ''}</div>
      <div class="stats"><div class="stat"><b>${G.score}</b><span>${g('score')}</span></div><div class="stat"><b>${P().best(k)}</b><span>${g('best')}</span></div><div class="stat"><b>${g('earned', { n: G.xp })}</b><span>XP</span></div></div>
      <div class="card" style="margin:0"><h2>${g('practised')}</h2>${xs.map(w => `<div class="wrow">${P().picHTML(w, 'sm')}<div class="t"><b>${esc(w.pl)}</b><span class="gl">${esc(gl(w))}${G.miss.has(w.i) ? ' · ✗' : ''}${G.fresh.indexOf(w.i) >= 0 ? ' · ✨' : ''}</span></div>${say(w)}</div>`).join('')}</div></div>
      <div class="foot"><button class="btn s" data-a="g:again">${g('again')}</button><button class="btn" data-a="g:quit">${g('close')}</button></div>`;
  }
  return GR[k]();
}
const GR = {
  mem() {
    const tiles = G.tiles.map((o, k) => {
      const w = W()[o.i], open = G.open.indexOf(k) >= 0 || o.ok;
      const face = !open ? '<span class="qm">?</span>' : o.s === 'pl' ? `<b>${esc(w.pl)}</b>` : `${P().picHTML(w, 'sm')}<span>${esc(gl(w))}</span>`;
      return `<button class="tile ${open ? 'open' : ''} ${o.ok ? 'ok' : ''} ${o.s}" data-a="g:flip" data-k="${k}" ${o.ok ? 'disabled' : ''}>${face}</button>`;
    }).join('');
    return `${top(`${G.done}/${G.n}`, G.done / G.n)}<div class="stage"><div class="q">🃏 ${g('mem')} · ${g('moves')}: ${G.moves}</div><div class="tiles mem">${tiles}</div></div>`;
  },
  blitz() {
    const c = G.cur, w = c.w;
    const prompt = c.dir === 'pg' ? `<div class="pl" style="font-size:30px">${esc(w.pl)}</div>` : `${P().picHTML(w, 'md')}<div class="pl" style="font-size:22px">${esc(gl(w))}</div>`;
    const labels = c.opts.map(x => c.dir === 'pg' ? gl(x) : x.pl);
    return `${top(`<span id="gsec">${Math.max(0, Math.ceil((G.end - now()) / 1000))}</span>s`, Math.max(0, (G.end - now()) / 60000))}<div class="stage ex2"><div class="q">⚡ ${g('score')}: <b>${G.score}</b>${G.combo > 1 ? ` · ×${G.combo}` : ''}</div>
      <div class="lr"><div class="lhs center">${prompt}</div><div class="rhs"><div class="opts">${labels.map((l, k) => `<button class="opt ${c.done ? (k === c.right ? 'ok' : k === c.pick ? 'bad' : '') : ''}" data-a="g:pick" data-k="${k}" ${c.done ? 'disabled' : ''}>${esc(l)}</button>`).join('')}</div></div></div></div>`;
  },
  listen() {
    const c = G.cur;
    const tiles = c.opts.map((w, k) => `<button class="tile pic6 ${c.wrong.indexOf(k) >= 0 ? 'bad' : ''} ${c.done && k === c.right ? 'ok' : ''}" data-a="g:tap" data-k="${k}" ${c.done || c.wrong.indexOf(k) >= 0 ? 'disabled' : ''}>${P().picHTML(w, 'md')}<span>${c.done ? esc(gl(w)) : ''}</span></button>`).join('');
    return `${top(`${G.r + 1}/${G.n}`, G.r / G.n)}<div class="stage"><div class="q">👂 ${g('listen')} · ${g('score')}: ${Math.round(G.score)}</div>
      <div class="center"><button class="say big" data-a="g:replay" aria-label="${esc(g('replay'))}">${P().speakerSvg}</button>${c.done ? `<div class="pl mt">${esc(c.w.pl)}</div>` : ''}</div><div class="tiles six">${tiles}</div></div>
      ${c.done ? `<div class="foot"><button class="btn" data-a="g:lnext" id="gnext">${g('next')}</button></div>` : ''}`;
  },
  spell() {
    const c = G.cur, w = c.w;
    const slots = c.target.map((ch, k) => `<span class="slot ${c.built[k] != null ? 'f' : ''} ${ch === ' ' ? 'sp' : ''}">${c.built[k] != null ? esc(c.tiles[c.built[k]].c) : ''}</span>`).join('');
    const tiles = c.tiles.map((o, k) => `<button class="ch ${c.built.indexOf(k) >= 0 ? 'used' : ''}" data-a="g:letter" data-k="${k}">${o.c === ' ' ? '␣' : esc(o.c)}</button>`).join('');
    return `${top(`${G.r + 1}/${G.n}`, G.r / G.n)}<div class="stage ex2"><div class="q">🔤 ${g('spell')} · ${g('score')}: ${Math.round(G.score)}</div>
      <div class="lr"><div class="lhs center">${P().picHTML(w, 'md')}<div class="pl" style="font-size:21px">${esc(gl(w))}</div><div>${say(w)}</div></div>
      <div class="rhs"><div class="slots ${c.shake ? 'shake' : ''}" data-a="g:unletter">${slots}</div><div class="chips">${tiles}</div>
      ${c.done ? `<div class="fb ok pop"><h4>✓ ${g('right')}</h4><b class="pl">${esc(w.pl)}</b> <span class="ipa">/${esc(w.ipa)}/</span></div>` : ''}</div></div></div>
      <div class="foot">${c.done ? `<button class="btn" data-a="g:snext" id="gnext">${g('next')}</button>` : `<div class="btns two"><button class="btn g sm" data-a="g:shint">${g('hint')}</button><button class="btn g sm" data-a="g:sdk">${g('dk')}</button></div>`}</div>`;
  },
  order() {
    const c = G.cur, w = c.w;
    const line = c.built.map((k, p) => `<button class="ch in ${c.bad && c.bad[p] ? 'badc' : ''}" data-a="g:ounpick" data-p="${p}">${esc(c.tiles[k].x)}</button>`).join('');
    const chips = c.tiles.map((o, k) => `<button class="ch ${c.built.indexOf(k) >= 0 ? 'used' : ''}" data-a="g:opick" data-k="${k}">${esc(o.x)}</button>`).join('');
    return `${top(`${G.r + 1}/${G.n}`, G.r / G.n)}<div class="stage ex2"><div class="q">🧩 ${g('order')} · ${g('score')}: ${Math.round(G.score)}</div>
      <div class="lr"><div class="lhs center">${P().picHTML(w, 'md')}<div class="pl" style="font-size:20px">${esc(gl(w))}</div>${P().regChip(w)}</div>
      <div class="rhs"><div class="line">${line}</div><div class="chips">${chips}</div>
      ${c.done ? `<div class="fb ${c.gave ? 'bad' : 'ok'} pop"><h4>${c.gave ? '✗ ' + g('wrong') : '✓ ' + g('right')}</h4><b class="pl" style="font-size:19px">${esc(w.pl)}</b><div>${say(w)}</div></div>` : ''}</div></div></div>
      <div class="foot">${c.done ? `<button class="btn" data-a="g:onext" id="gnext">${g('next')}</button>` : `<button class="btn" data-a="g:ocheck" ${c.built.length === c.tiles.length ? '' : 'disabled'}>${g('check')}</button><button class="btn g sm" data-a="g:odk">${g('dk')}</button>`}</div>`;
  },
  reg() {
    const w = W()[G.ids[G.r]], a = G.ans; G.seen.add(w.i);
    const btn = (r, ic, lab, n) => `<button class="opt big2 ${a ? (w.r === r ? 'ok' : a === r ? 'bad' : '') : ''}" data-a="g:reg" data-v="${r}" ${a ? 'disabled' : ''}><span style="font-size:26px">${ic}</span> ${lab} <small class="kb">${n}</small></button>`;
    return `${top(`${G.r + 1}/${G.n}`, G.r / G.n)}<div class="stage ex2"><div class="q">🎩 ${g('reg')} · ${g('score')}: ${Math.round(G.score)}${G.combo > 1 ? ` · ×${G.combo}` : ''}</div>
      <div class="lr"><div class="lhs center"><div class="pl" style="font-size:26px">${esc(w.pl)}</div><div class="gl mt">${esc(gl(w))}</div><div class="mt">${say(w)}</div></div>
      <div class="rhs"><div class="opts">${btn('F', '🤵', g('formal'), 'F')}${btn('I', '🧢', g('informal'), 'I')}</div>
      ${a ? `<div class="fb ${a === w.r ? 'ok' : 'bad'} pop"><h4>${a === w.r ? '✓ ' + g('right') : '✗ ' + g('wrong')}</h4>${g(w.r === 'F' ? 'regF' : 'regI')}${P().note(w) ? `<div class="note">${esc(P().note(w))}</div>` : ''}</div>` : ''}</div></div></div>
      ${a ? `<div class="foot"><button class="btn" data-a="g:rnext" id="gnext">${g('next')}</button></div>` : ''}`;
  }
};

/* ---------------- actions */
const ACT = {
  begin() { begin(); P().renderSession(); },
  again() { const k = G.k; G = null; start(k); },
  quit,
  say(d) { P().play(W()[Number(d.i)]); },
  flip(d) {
    const k = Number(d.k), o = G.tiles[k]; if (G.lock || o.ok || G.open.indexOf(k) >= 0) return;
    G.open.push(k); if (o.s === 'pl') P().play(W()[o.i]);
    if (G.open.length === 2) {
      G.moves++; const [a, b] = G.open.map(x => G.tiles[x]);
      if (a.i === b.i) { a.ok = b.ok = true; G.open = []; G.done++; G.seen.add(a.i); if (o.s !== 'pl') P().play(W()[o.i]); if (G.done === G.n) { const secs = (now() - G.t0) / 1000; G.score = Math.max(60, 600 - 18 * (G.moves - G.n) - 2 * secs); setTimeout(finish, 700); } }
      else { G.lock = true; G.miss.add(a.i); G.miss.add(b.i); setTimeout(() => { if (!G) return; G.open = []; G.lock = false; P().renderSession(); }, 950); }
    }
    P().renderSession();
  },
  pick(d) {
    const c = G.cur; if (!c || c.done || now() > G.end) return; const k = Number(d.k); c.done = true; c.pick = k;
    if (k === c.right) { G.score += 10 * G.combo; G.combo = Math.min(5, G.combo + 1); G.ok++; P().renderSession(); setTimeout(() => { if (G && G.phase === 'play') { nextBlitz(); P().renderSession(); } }, 280); }
    else { G.combo = 1; G.bad++; G.end -= 3000; G.miss.add(c.w.i); P().play(c.w); P().renderSession(); setTimeout(() => { if (G && G.phase === 'play') { nextBlitz(); P().renderSession(); } }, 1100); }
  },
  tap(d) {
    const c = G.cur, k = Number(d.k); if (c.done) return;
    if (k === c.right) { c.done = true; G.score += Math.max(20, 100 - 30 * c.wrong.length - 10 * c.rep); G.ok++; P().play(c.w); }
    else { c.wrong.push(k); G.miss.add(c.w.i); if (c.wrong.length >= 2) { c.done = true; P().play(c.w); } }
    P().renderSession();
  },
  replay() { const c = G.cur; if (c) { c.rep++; P().play(c.w); } },
  lnext() { G.r++; if (G.r >= G.n) return finish(); nextListen(); P().renderSession(); },
  letter(d) {
    const c = G.cur, k = Number(d.k); if (c.done || c.built.indexOf(k) >= 0) return;
    c.built.push(k); c.shake = false; checkSpell(); P().renderSession();
  },
  unletter() { const c = G.cur; if (c.done || !c.built.length) return; c.built.pop(); P().renderSession(); },
  shint() {
    const c = G.cur; if (c.done) return;
    let p = 0; while (p < c.built.length && c.tiles[c.built[p]].c === c.target[p]) p++;
    c.built = c.built.slice(0, p); const k = c.tiles.findIndex((o, j) => o.c === c.target[p] && c.built.indexOf(j) < 0);
    if (k >= 0) { c.built.push(k); c.hints++; } checkSpell(); P().renderSession();
  },
  sdk() { const c = G.cur; c.built = []; c.target.forEach(ch => { const k = c.tiles.findIndex((o, j) => o.c === ch && c.built.indexOf(j) < 0); c.built.push(k); }); c.hints += 5; G.miss.add(c.w.i); c.done = true; P().play(c.w); P().renderSession(); },
  snext() { G.r++; if (G.r >= G.n) return finish(); nextSpell(); P().renderSession(); },
  opick(d) { const c = G.cur, k = Number(d.k); if (c.done || c.built.indexOf(k) >= 0) return; c.built.push(k); c.bad = null; P().renderSession(); },
  ounpick(d) { const c = G.cur; if (c.done) return; c.built.splice(Number(d.p), 1); c.bad = null; P().renderSession(); },
  ocheck() {
    const c = G.cur; if (c.done) return; const got = c.built.map(k => c.tiles[k].x);
    const norm = s => P().fold(s.toLowerCase());
    if (got.map(norm).join(' ') === c.target.map(norm).join(' ')) { c.done = true; G.ok++; G.score += Math.max(20, 100 - 25 * c.mist); P().play(c.w); }
    else { c.mist++; G.miss.add(c.w.i); c.bad = got.map((x, p) => norm(x) !== norm(c.target[p])); }
    P().renderSession();
  },
  odk() { const c = G.cur; const used = new Set(); c.built = c.target.map(x => { const k = c.tiles.findIndex((o, j) => o.x === x && !used.has(j)); used.add(k); return k; }); c.done = true; c.gave = true; G.miss.add(c.w.i); P().play(c.w); P().renderSession(); },
  onext() { G.r++; if (G.r >= G.n) return finish(); nextOrder(); P().renderSession(); },
  reg(d) {
    if (G.ans) return; const w = W()[G.ids[G.r]]; G.ans = d.v;
    if (d.v === w.r) { G.combo++; G.score += 40 + 10 * Math.min(G.combo, 5); G.ok++; } else { G.combo = 0; G.miss.add(w.i); }
    P().play(w); P().renderSession();
  },
  rnext() { G.r++; G.ans = null; if (G.r >= G.n) return finish(); P().renderSession(); }
};
function checkSpell() {
  const c = G.cur; if (c.built.length < c.target.length) return;
  const got = c.built.map(k => c.tiles[k].c).join('');
  if (got === c.target.join('')) { c.done = true; G.ok++; G.score += Math.max(20, 100 - 20 * c.hints - 15 * c.mist); P().play(c.w); }
  else { c.mist++; c.shake = true; G.miss.add(c.w.i); let p = 0; while (p < c.built.length && c.tiles[c.built[p]].c === c.target[p]) p++; c.built = c.built.slice(0, p); }
}

/* ---------------- menu & today card */
function level(x) { const l = Math.floor(Math.sqrt(x / 40)) + 1; return { l, next: 40 * l * l, prev: 40 * (l - 1) * (l - 1) }; }
function menu() {
  const x = P().xpTotal(), lv = level(x), pct = (x - lv.prev) / Math.max(1, lv.next - lv.prev);
  const cards = GAMES.map(d => `<button class="gcard" data-a="g:start" data-g="${d.k}"><span class="gi">${d.ic}</span><b>${esc(g(d.k))}</b><small>${esc(g(d.k + 'D'))}</small><span class="gb">🏆 ${P().best(d.k)}</span></button>`).join('');
  return `<div class="card hero"><h2>${g('title')}</h2><div class="big">${g('lvl', { n: lv.l })} · ${g('xp', { n: x })}</div><div class="bar" style="background:rgba(255,255,255,.25)"><i style="width:${Math.round(pct * 100)}%;background:#fff"></i></div><p class="mt" style="margin-bottom:0">${g('toNext', { n: lv.next - x, l: lv.l + 1 })}</p></div>
    <p class="small" style="margin:0 2px 12px">${g('sub')}</p><div class="ggrid">${cards}</div>`;
}
function todayCard() {
  const d = GAMES[P().today() % GAMES.length];
  return `<div class="card"><h2>${g('today')}</h2><button class="wrow" style="border:0;padding:0" data-a="g:start" data-g="${d.k}"><span class="gi sm">${d.ic}</span><div class="t"><b style="font-size:18px">${esc(g(d.k))}</b><span class="gl">${esc(g(d.k + 'D'))}</span></div><span class="tag">${g('play')}</span></button></div>`;
}

/* ---------------- keyboard: numbers, letters (spell), Enter, Space, Backspace */
function key(e, typing) {
  if (!G || typing) return false;
  const k = e.key;
  if (k === 'Escape') { quit(); return true; }
  const nx = document.getElementById('gnext');
  if (k === 'Enter') { if (G.phase === 'new') { ACT.begin(); return true; } if (nx) { nx.click(); return true; } if (G.k === 'order' && G.cur && G.cur.built.length === G.cur.tiles.length) { ACT.ocheck(); return true; } return false; }
  if (G.phase !== 'play') return false;
  if (k === ' ') { if (G.k === 'listen') ACT.replay(); else if (G.cur && G.cur.w) P().play(G.cur.w); else if (G.k === 'reg') P().play(W()[G.ids[G.r]]); return true; }
  if (G.k === 'blitz' && /^[1-4]$/.test(k)) { ACT.pick({ k: Number(k) - 1 }); return true; }
  if (G.k === 'listen' && /^[1-6]$/.test(k)) { ACT.tap({ k: Number(k) - 1 }); return true; }
  if (G.k === 'reg' && /^[fi12]$/i.test(k)) { ACT.reg({ v: /^[f1]$/i.test(k) ? 'F' : 'I' }); return true; }
  if (G.k === 'spell') {
    if (k === 'Backspace') { ACT.unletter(); return true; }
    const ch = k.toLowerCase(); if (ch.length === 1) { const c = G.cur, j = c.tiles.findIndex((o, q) => o.c === ch && c.built.indexOf(q) < 0); if (j >= 0) { ACT.letter({ k: j }); return true; } }
  }
  if (G.k === 'order' && k === 'Backspace') { if (G.cur.built.length) ACT.ounpick({ p: G.cur.built.length - 1 }); return true; }
  return false;
}

window.PBGames = {
  menu, todayCard, html, key,
  active: () => !!G,
  act(name, d, el) { if (name === 'start') return start(d.g); if (!G) return; const f = ACT[name]; if (f) f(d, el); },
  back() { quit(); return true; },
  _G: () => G
};
})();
