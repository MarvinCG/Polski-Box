// End-to-end test of v2: sync between two devices, teacher page, teacher words in the app, all six games.
// GitHub, LanguageTool and Gemini are simulated with page.route, so nothing leaves this machine.
import { chromium } from 'playwright';
const B = 'http://localhost:8765/';
const files = {};           // fake repo: path -> {sha, content(b64)}
let shaN = 0, puts = 0;
const b64 = s => Buffer.from(s, 'utf8').toString('base64');
const unb = s => Buffer.from(s, 'base64').toString('utf8');
async function fakeGitHub(ctx) {
  await ctx.route('https://api.github.com/**', async (route) => {
    const req = route.request(), url = new URL(req.url());
    if (req.headers()['authorization'] !== 'Bearer TESTTOKEN') return route.fulfill({ status: 401, body: '{}' });
    if (url.pathname === '/repos/me/data') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ private: true }) });
    const m = url.pathname.match(/^\/repos\/me\/data\/contents\/(.+)$/); if (!m) return route.fulfill({ status: 404, body: '{}' });
    const p = m[1];
    if (req.method() === 'GET') { const f = files[p]; return f ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sha: f.sha, content: f.content }) }) : route.fulfill({ status: 404, body: '{}' }); }
    if (req.method() === 'PUT') {
      const body = JSON.parse(req.postData()); const f = files[p];
      if ((f && body.sha !== f.sha) || (!f && body.sha)) return route.fulfill({ status: 409, body: '{}' });
      files[p] = { sha: 's' + (++shaN), content: body.content }; puts++;
      return route.fulfill({ status: f ? 200 : 201, contentType: 'application/json', body: JSON.stringify({ content: { sha: files[p].sha } }) });
    }
    route.fulfill({ status: 405, body: '{}' });
  });
  await ctx.route('https://api.languagetool.org/**', route => {
    const txt = new URLSearchParams(route.request().postData()).get('text');
    const i = txt.indexOf('Swietnie');
    const matches = i >= 0 ? [{ message: 'Possible spelling mistake', offset: i, length: 8, context: { text: txt, offset: i, length: 8 }, replacements: [{ value: 'Świetnie' }] }] : [];
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ matches }) });
  });
  await ctx.route('https://generativelanguage.googleapis.com/**', route => {
    const out = { corrected: 'Świetnie Pani gotuje.', ok: true, problems: [], es: 'Usted cocina de maravilla.', en: 'You cook wonderfully.', register: 'F', emoji: '👩‍🍳', note_es: 'Dicho a la mamá.', note_en: 'Said to her mum.' };
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(out) }] } }] }) });
  });
}
const br = await chromium.launch();
const errs = [];
async function newDevice(name, vp) {
  const ctx = await br.newContext({ viewport: vp || { width: 412, height: 860 } }); await fakeGitHub(ctx);
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(name + ' console: ' + m.text()); });
  await p.addInitScript(() => { window.speechSynthesis && (window.speechSynthesis.speak = () => {}); window.Audio = function () { const a = { play: () => { setTimeout(() => a.onended && a.onended(), 5); return Promise.resolve(); }, pause() {} }; return a; }; });
  await p.goto(B); await p.waitForTimeout(300);
  await p.click('[data-a="lang"][data-v="es"]');
  return { ctx, p };
}
const ok = (c, m) => { if (!c) { errs.push('ASSERT ' + m); console.log('✗', m); } else console.log('✓', m); };

/* ---- device A: study, connect sync */
const A = await newDevice('A');
await A.p.click('[data-a="start"]');
for (let k = 0; k < 8; k++) { await A.p.click('[data-a="inext"]'); }
for (let k = 0; k < 40; k++) {
  const done = await A.p.evaluate(() => { const M = window.__pb.M(); return !M || M.phase === 'sum'; }); if (done) break;
  await A.p.evaluate(() => { const b = document.querySelector('.opt[data-c="1"]'); if (b) b.click(); else { const d = document.querySelector('[data-a="dk"]'); if (d) d.click(); } });
  await A.p.waitForTimeout(30);
  await A.p.evaluate(() => { const n = document.getElementById('nextbtn'); if (n) n.click(); });
}
await A.p.evaluate(() => { const b = document.querySelector('[data-a="mdone"]'); if (b) b.click(); });
const cardsA = await A.p.evaluate(() => Object.keys(window.__pb.S().cards).length);
ok(cardsA === 8, 'device A started 8 words (' + cardsA + ')');
await A.p.click('[data-a="tab"][data-k="me"]'); await A.p.click('[data-a="syncsetup"]');
await A.p.fill('#srepo', 'me/data'); await A.p.fill('#stok', 'TESTTOKEN'); await A.p.click('#sgo');
await A.p.waitForTimeout(800);
ok(!!files['progress.json'] && !!files['words.json'], 'sync created progress.json and words.json');
ok(Object.keys(JSON.parse(unb(files['progress.json'].content)).cards).length === 8, 'remote has the 8 cards');
const code = await A.p.evaluate(() => PBSync.makeCode(PBSync.conf()));
const tlink = await A.p.evaluate(() => PBSync.makeCode(PBSync.conf(), { n: 'teacher' }));
await A.p.screenshot({ path: 'shots/v2_sync.png' });

/* ---- teacher page */
const T = await newDevice('T', { width: 1280, height: 900 });
await T.p.goto(B + 'teacher.html#' + tlink); await T.p.waitForTimeout(500);
await T.p.fill('#f_pl', 'Swietnie Pani gotuje.');
await T.p.click('#bcheck'); await T.p.waitForTimeout(400);
ok(await T.p.isVisible('[data-a="ltfix"]'), 'LanguageTool suggestion shown');
await T.p.click('[data-a="ltfix"]'); await T.p.waitForTimeout(400);
ok((await T.p.inputValue('#f_pl')) === 'Świetnie Pani gotuje.', 'suggestion applied to the Polish field');
await T.p.fill('#f_es', 'Usted cocina de maravilla.');
ok(!(await T.p.isVisible('#f_en')), 'no English field');
await T.p.click('[data-a="reg"][data-v="F"]'); await T.p.fill('#f_em', '👩‍🍳');
ok(!(await T.p.isVisible('#s_key')), 'no Gemini settings any more');
await T.p.setInputFiles('#fphoto', 'tools/fixtures/photo.jpg'); await T.p.waitForTimeout(400);
ok(await T.p.isVisible('.phrow img.thumb'), 'photo preview in the add form');
await T.p.screenshot({ path: 'shots/v2_teacher.png', fullPage: true });
await T.p.click('#badd'); await T.p.waitForTimeout(500);
let words = JSON.parse(unb(files['words.json'].content)).words;
ok(words.length === 1 && words[0].pl === 'Świetnie Pani gotuje.' && words[0].r === 'F' && words[0].ipa.includes('ˈɕfʲɛtɲɛ'), 'word saved with register and IPA');
ok(!!files['img/t0.jpg'] && JSON.parse(unb(files['img.json'].content)).items.t0, 'photo of the new word uploaded');
await T.p.fill('#f_pl', 'Tak, gram.'); await T.p.fill('#f_es', 'Sí, juego.'); await T.p.click('#badd'); await T.p.waitForTimeout(400);
words = JSON.parse(unb(files['words.json'].content)).words; ok(words.length === 2, 'second word saved');
await T.p.screenshot({ path: 'shots/v2_teacher2.png', fullPage: true });

/* ---- device A gets the teacher words */
await A.p.evaluate(() => PBSync.run('test')); await A.p.waitForTimeout(500);
await A.p.click('[data-a="tab"][data-k="today"]'); await A.p.waitForTimeout(100);
ok(await A.p.isVisible('.tchc'), 'Today shows “New from your teacher”');
await A.p.screenshot({ path: 'shots/v2_today_tch.png' });
await A.p.click('.tchc [data-a="sitlearn"]'); await A.p.waitForTimeout(200);
await A.p.screenshot({ path: 'shots/v2_tch_intro.png' });
const introPl = await A.p.evaluate(() => window.__pb.W[window.__pb.M().intro[0]].pl);
ok(introPl === 'Świetnie Pani gotuje.' || introPl === 'Tak, gram.', 'teacher word is introduced first: ' + introPl);
await A.p.evaluate(() => { window.__pb.A.mquit(); });

/* ---- device B (tablet / DeX) connects with the code and receives the progress */
const Bd = await newDevice('B', { width: 1280, height: 800 });
await Bd.p.click('[data-a="tab"][data-k="me"]'); await Bd.p.click('[data-a="syncsetup"]');
await Bd.p.fill('#scode', code); await Bd.p.click('#sgo'); await Bd.p.waitForTimeout(800);
const cardsB = await Bd.p.evaluate(() => Object.keys(window.__pb.S().cards).length);
ok(cardsB >= 8, 'device B received the cards (' + cardsB + ')');
ok(await Bd.p.evaluate(() => window.__pb.WA().some(w => w.tch)), 'device B has the teacher words');

/* ---- all six games on device B (wide screen) */
for (const gk of ['mem', 'blitz', 'listen', 'spell', 'order', 'reg']) {
  await Bd.p.click('[data-a="tab"][data-k="games"]'); await Bd.p.waitForTimeout(80);
  await Bd.p.click(`[data-a="g:start"][data-g="${gk}"]`); await Bd.p.waitForTimeout(120);
  const ph = await Bd.p.evaluate(() => PBGames._G() && PBGames._G().phase);
  if (ph === 'new') { await Bd.p.screenshot({ path: `shots/v2_g_${gk}_new.png` }); await Bd.p.click('[data-a="g:begin"]'); }
  await Bd.p.waitForTimeout(120); await Bd.p.screenshot({ path: `shots/v2_g_${gk}.png` });
  for (let step = 0; step < 220; step++) {
    const st = await Bd.p.evaluate(() => { const G = PBGames._G(); return G ? G.phase : 'none'; });
    if (st !== 'play') break;
    await Bd.p.evaluate((gk) => {
      const G = PBGames._G(), c = G.cur, A = (n, d) => PBGames.act(n, d || {});
      if (gk === 'mem') { const t = G.tiles; if (G.lock) return; const i = t.findIndex(o => !o.ok && G.open.indexOf(t.indexOf(o)) < 0); if (i < 0) return; const j = G.open.length ? t.findIndex((o, k) => k !== G.open[0] && !o.ok && o.i === t[G.open[0]].i) : i; A('flip', { k: G.open.length ? j : i }); }
      else if (gk === 'blitz') { if (!c.done) A('pick', { k: Math.random() < 0.8 ? c.right : (c.right + 1) % 4 }); if (G.end - Date.now() > 2000) G.end = Date.now() + 1500; }
      else if (gk === 'listen') { if (!c.done) A('tap', { k: c.right }); else A('lnext'); }
      else if (gk === 'spell') { if (!c.done) { const p = c.built.length, k = c.tiles.findIndex((o, j) => o.c === c.target[p] && c.built.indexOf(j) < 0); A('letter', { k }); } else A('snext'); }
      else if (gk === 'order') { if (!c.done) { if (c.built.length < c.tiles.length) { const p = c.built.length, k = c.tiles.findIndex((o, j) => o.x === c.target[p] && c.built.indexOf(j) < 0); A('opick', { k }); } else A('ocheck'); } else A('onext'); }
      else if (gk === 'reg') { if (!G.ans) { const w = window.PB.W()[G.ids[G.r]]; A('reg', { v: w.r }); } else A('rnext'); }
    }, gk);
    await Bd.p.waitForTimeout(gk === 'mem' ? 40 : gk === 'blitz' ? 320 : 20);
    if (gk === 'mem') await Bd.p.waitForTimeout(30);
  }
  await Bd.p.waitForTimeout(gk === 'mem' ? 900 : 1800);
  const res = await Bd.p.evaluate(() => { const G = PBGames._G(); return G && { ph: G.phase, score: G.score, xp: G.xp }; });
  ok(res && res.ph === 'end' && res.score > 0, `game ${gk} finished with score ${res && res.score}`);
  await Bd.p.screenshot({ path: `shots/v2_g_${gk}_end.png` });
  await Bd.p.click('[data-a="g:quit"]');
}
const xpB = await Bd.p.evaluate(() => window.PB.xpTotal());
ok(xpB > 0, 'XP earned on device B: ' + xpB);
await Bd.p.click('[data-a="tab"][data-k="games"]'); await Bd.p.screenshot({ path: 'shots/v2_games_after.png' });
await Bd.p.evaluate(() => PBSync.run('test')); await Bd.p.waitForTimeout(600);
/* back on A: XP and new cards from B arrive */
await A.p.evaluate(() => PBSync.run('test')); await A.p.waitForTimeout(600);
const xpA = await A.p.evaluate(() => window.PB.xpTotal()), cardsA2 = await A.p.evaluate(() => Object.keys(window.__pb.S().cards).length);
ok(xpA >= xpB, `device A sees B's XP (${xpA})`); ok(cardsA2 >= cardsB, `device A sees B's new cards (${cardsA2})`);
/* keyboard on B: Esc goes back, 1-6 switch tabs */
await Bd.p.keyboard.press('2'); ok(await Bd.p.evaluate(() => document.querySelector('nav .on span').textContent) === 'Situaciones', 'key 2 opens Situations');
console.log('PUTS', puts, 'ERRORS', JSON.stringify(errs, null, 1));
await br.close();
