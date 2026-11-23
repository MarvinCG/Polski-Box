// Scroll stays put during background updates; editing words/lines; permanent delete — app <-> teacher page.
import { chromium } from 'playwright';
const B = 'http://localhost:8765/';
const files = {}; let shaN = 0;
const unb = s => Buffer.from(s, 'base64').toString('utf8');
const prog = () => JSON.parse(unb(files['progress.json'].content));
async function fake(ctx) {
  await ctx.route('https://api.github.com/**', async route => {
    const req = route.request(), url = new URL(req.url());
    if (url.pathname === '/repos/me/data') return route.fulfill({ status: 200, body: '{"private":true}' });
    const p = decodeURIComponent((url.pathname.match(/contents\/(.+)$/) || [])[1] || ''), m = req.method(), f = files[p];
    if (m === 'GET') return f ? route.fulfill({ status: 200, body: JSON.stringify({ sha: f.sha, content: f.content }) }) : route.fulfill({ status: 404, body: '{}' });
    const body = JSON.parse(req.postData() || '{}');
    if (m === 'PUT') { if ((f && body.sha !== f.sha) || (!f && body.sha)) return route.fulfill({ status: 409, body: '{}' }); files[p] = { sha: 's' + (++shaN), content: body.content }; return route.fulfill({ status: 201, body: JSON.stringify({ content: { sha: files[p].sha } }) }); }
    if (m === 'DELETE') { delete files[p]; return route.fulfill({ status: 200, body: '{}' }); }
  });
  await ctx.route('https://api.languagetool.org/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"matches":[]}' }));
}
const br = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const errs = []; const ok = (c, m) => { console.log(c ? '✓' : '✗', m); if (!c) errs.push(m); };
files['words.json'] = { sha: 'w0', content: Buffer.from(JSON.stringify({ v: 1, words: [] })).toString('base64') };

/* ---------------- app: scroll */
const actx = await br.newContext({ viewport: { width: 412, height: 800 }, hasTouch: true }); await fake(actx);
const A = await actx.newPage(); A.on('pageerror', e => errs.push('A ' + e.message));
await A.addInitScript(() => { window.Audio = function () { const a = { play: () => { setTimeout(() => a.onended && a.onended(), 5); return Promise.resolve(); }, pause() {} }; return a; }; });
await A.goto(B); await A.click('[data-a="lang"][data-v="es"]');
await A.evaluate(async () => { localStorage.setItem('polskibox.sync', JSON.stringify({ repo: 'me/data', token: 'X' })); await PBSync.run('t'); });
await A.click('[data-a="tab"][data-k="me"]'); await A.waitForTimeout(200);
const scrollTo = y => A.evaluate(y => { const m = document.getElementById('main'); m.scrollTop = y; return m.scrollTop; }, y);
const top = () => A.evaluate(() => document.getElementById('main').scrollTop);
const y1 = await scrollTo(1400);
await A.evaluate(() => { PBSync.state.running = true; window.__pb.render; }); // background events while scrolled
await A.evaluate(async () => { await PBSync.run('t'); });
await A.waitForTimeout(1800);
ok(Math.abs(await top() - y1) < 4, `Progress keeps its scroll through a sync (${y1} → ${await top()})`);
const tog = await A.$('[data-a="tog"][data-k="slow"]'); await tog.scrollIntoViewIfNeeded(); const y2 = await top();
await tog.click(); await A.waitForTimeout(150);
ok(Math.abs(await top() - y2) < 4, `toggling a setting keeps the scroll (${y2} → ${await top()})`);
await A.waitForTimeout(5500);   // the save() → sync 4 s later used to jump to the top
ok(Math.abs(await top() - y2) < 4, `…and the sync that follows does not jump to the top (${await top()})`);
await A.click('[data-a="tog"][data-k="slow"]');
// long unit list: open a word and close it
await A.click('[data-a="tab"][data-k="sit"]'); await A.click('.ucard >> nth=8'); await A.waitForTimeout(150);
const y3 = await scrollTo(900); const row = await A.evaluateHandle(() => { const m = document.getElementById('main'), r = m.getBoundingClientRect(); return [...document.querySelectorAll('[data-a="word"]')].find(b => { const q = b.getBoundingClientRect(); return q.top > r.top + 40 && q.bottom < r.bottom - 40; }); });
await row.asElement().click(); await A.waitForTimeout(150); await A.click('.sheet [data-a="close"]'); await A.waitForTimeout(150);
ok(Math.abs(await top() - y3) < 4, `opening and closing a word keeps the list position (${y3} → ${await top()})`);

/* ---------------- app: edit a phrase (beer → water) */
const beer = await A.evaluate(() => { const w = window.__pb.WA().find(w => /czegoś/.test(w.pl)); return { i: w.i, pl: w.pl, a: w.a, key: w.vk }; });
ok(!!beer.i, 'found the drink phrase: ' + beer.pl);
await A.evaluate(i => window.__pb.A.word({ i }), beer.i); await A.click('.sheet [data-a="edit"]'); await A.waitForTimeout(100);
await A.fill('#e_pl', 'Napijesz się wody?'); await A.fill('#e_es', '¿Quieres agua?'); await A.click('[data-a="edcheck"]'); await A.waitForTimeout(300);
ok(await A.isVisible('text=Sin errores de ortografía.'), 'spelling check in the edit form');
await A.screenshot({ path: 'shots/e_edit.png' });
await A.click('[data-a="edsave"]'); await A.waitForTimeout(150);
const after = await A.evaluate(i => { const w = window.__pb.W[i]; return { pl: w.pl, es: w.es, ipa: w.ipa, a: w.a, ed: w.ed }; }, beer.i);
ok(after.pl === 'Napijesz się wody?' && after.es === '¿Quieres agua?' && after.ed && !after.a && after.ipa.includes('vɔdɨ'), 'phrase edited, IPA recomputed, old recording dropped');
await A.screenshot({ path: 'shots/e_sheet.png' });
await A.evaluate(async () => { await PBSync.run('t'); });
ok(prog().ed && prog().ed[beer.key] && prog().ed[beer.key].pl === 'Napijesz się wody?' && prog().ed[beer.key].pc, 'edit synced to progress.json');

/* ---------------- app: delete for good */
const del = await A.evaluate(() => { const w = window.__pb.WA().find(w => /Moje uznanie/.test(w.pl)) || window.__pb.WA()[450]; return { i: w.i, key: w.vk, pl: w.pl }; });
await A.evaluate(i => window.__pb.A.word({ i }), del.i); await A.click('.sheet [data-a="delw"]'); await A.waitForTimeout(80);
ok(await A.isVisible('text=¿Eliminar para siempre?'), 'delete asks for a second tap');
await A.click('.sheet [data-a="delw"]'); await A.waitForTimeout(100);
ok(await A.evaluate(k => !window.__pb.WA().some(w => w.vk === k), del.key), 'deleted: ' + del.pl);
await A.click('[data-a="tab"][data-k="words"]'); await A.waitForTimeout(100);
ok(!(await A.isVisible('text=Quitadas')), 'not listed under Removed');
await A.evaluate(async () => { await PBSync.run('t'); });
ok(prog().hid[del.key].x === true, 'permanent delete synced');

/* ---------------- teacher page sees both, edits a dialogue line, deletes a word, voice goes stale */
const code = 'PBX1.' + Buffer.from(JSON.stringify({ r: 'me/data', t: 'X' })).toString('base64').replace(/=+$/, '');
const tctx = await br.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['microphone'] }); await fake(tctx);
const T = await tctx.newPage(); T.on('pageerror', e => errs.push('T ' + e.message));
await T.goto(B + 'teacher.html#' + code); await T.waitForTimeout(500);
await T.click('[data-a="tab"][data-v="words"]'); await T.click('[data-a="wkind"][data-v="sit"]'); await T.waitForTimeout(150);
ok(!(await T.isVisible(`[data-a="wsel"][data-k="${del.key}"]`)), 'teacher: deleted word is gone from her list');
ok(await T.isVisible(`[data-a="wsel"][data-k="${beer.key}"] >> text=Napijesz się wody?`), 'teacher: sees the edited phrase');
// list scroll stays when selecting
await T.evaluate(() => { document.querySelector('.vlist').scrollTop = 700; });
const lt0 = await T.evaluate(() => document.querySelector('.vlist').scrollTop);
const vis = await T.evaluateHandle(() => { const l = document.querySelector('.vlist'), r = l.getBoundingClientRect(); return [...l.querySelectorAll('.wrow')].find(b => { const q = b.getBoundingClientRect(); return q.top > r.top + 30 && q.bottom < r.bottom - 30; }); });
await vis.asElement().click(); await T.waitForTimeout(200);
ok(Math.abs(await T.evaluate(() => document.querySelector('.vlist').scrollTop) - lt0) < 4, 'teacher: list keeps its scroll when she picks a word');
// record voice for the edited phrase, then the student edits it again -> stale
await T.click(`[data-a="wsel"][data-k="${beer.key}"]`); await T.waitForTimeout(150);
await T.click('[data-a="vrec"]'); await T.waitForTimeout(1200); await T.click('[data-a="vrec"]'); await T.waitForTimeout(1300); await T.click('#vsave'); await T.waitForTimeout(600);
ok(!!files['voice/' + beer.key + '.mp3'], 'teacher recorded the edited phrase');
await A.evaluate(async () => { await PBSync.run('t'); }); await A.waitForTimeout(400);
ok(await A.evaluate(i => window.__pb.W[i] && document && true, beer.i) && await A.evaluate(k => PBSync.voice.has(k), beer.key), 'app sees her new recording');
// dialogue line edit from the teacher page
await T.click('[data-a="wkind"][data-v="dlg"]'); await T.waitForTimeout(150);
const lineKey = await T.getAttribute('.vlist .wrow.sel', 'data-k');
await T.click('[data-a="edopen"]'); await T.fill('#t_pl', 'Dzień dobry wszystkim!'); await T.fill('#t_es', '¡Buenos días a todos!'); await T.click('#edsave'); await T.waitForTimeout(500);
ok(prog().ed[lineKey] && prog().ed[lineKey].by === 't', 'teacher edited a dialogue line');
await T.screenshot({ path: 'shots/e_teacher.png' });
// teacher deletes a situation word for good
await T.click('[data-a="wkind"][data-v="sit"]'); await T.waitForTimeout(150);
const tdel = await T.getAttribute('.vlist .wrow.sel', 'data-k');
await T.click('[data-a="delx"]'); await T.click('[data-a="delx"]'); await T.waitForTimeout(500);
ok(prog().hid[tdel].x === true, 'teacher deleted ' + tdel + ' for good');
// app receives both
await A.evaluate(async () => { await PBSync.run('t'); }); await A.waitForTimeout(1600);
ok(await A.evaluate(k => window.__pb.U.some(u => (u.ctx || []).some(l => l.vk === k && l.pl === 'Dzień dobry wszystkim!')), lineKey), 'app shows the edited dialogue line');
ok(await A.evaluate(k => !window.__pb.WA().some(w => w.vk === k), tdel), 'app no longer has the word the teacher deleted');
// student restores the original of the beer phrase -> her recording (for the edited text) is now stale for the original? restore = original audio comes back
await A.evaluate(i => window.__pb.A.word({ i }), beer.i); await A.click('.sheet [data-a="edit"]'); await A.click('[data-a="edreset"]'); await A.waitForTimeout(100);
ok(await A.evaluate(i => window.__pb.W[i].pl, beer.i) === beer.pl && await A.evaluate(i => window.__pb.W[i].a, beer.i) === beer.a, 'restore brings back the original text and recording');
ok(await A.evaluate(i => !window.__pb.tvHas(window.__pb.W[i]), beer.i), 'her recording of the edited text is not played for the original text');
await A.evaluate(async () => { await PBSync.run('t'); }); await T.evaluate(() => window.__refresh()); await T.waitForTimeout(400);
await T.click('[data-a="wkind"][data-v="sit"]'); await T.click(`[data-a="wsel"][data-k="${beer.key}"]`); await T.waitForTimeout(600);
ok(await T.isVisible('text=La frase cambió') || await T.isVisible('text=Zwrot zmienił się'), 'teacher sees that her recording is out of date');
console.log('ERRORS', JSON.stringify(errs.filter(e => !/Failed to load resource/.test(e))));
await br.close();
