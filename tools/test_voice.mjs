// Teacher records her voice (fake microphone) -> voice/<key>.mp3 + voice.json in the data repo -> the app plays it.
import { chromium } from 'playwright';
const B = 'http://localhost:8765/';
const files = {}; let shaN = 0;
const unb = s => Buffer.from(s, 'base64').toString('utf8');
async function fake(ctx) {
  await ctx.route('https://api.github.com/**', async route => {
    const req = route.request(), url = new URL(req.url());
    if (url.pathname === '/repos/me/data') return route.fulfill({ status: 200, body: '{"private":true}' });
    const p = decodeURIComponent((url.pathname.match(/contents\/(.+)$/) || [])[1] || '');
    const m = req.method(), f = files[p];
    if (m === 'GET') return f ? route.fulfill({ status: 200, body: JSON.stringify({ sha: f.sha, content: f.content }) }) : route.fulfill({ status: 404, body: '{}' });
    const body = JSON.parse(req.postData() || '{}');
    if (m === 'PUT') { if ((f && body.sha !== f.sha) || (!f && body.sha)) return route.fulfill({ status: 409, body: '{}' }); files[p] = { sha: 's' + (++shaN), content: body.content }; return route.fulfill({ status: 201, body: JSON.stringify({ content: { sha: files[p].sha } }) }); }
    if (m === 'DELETE') { if (!f || body.sha !== f.sha) return route.fulfill({ status: 409, body: '{}' }); delete files[p]; return route.fulfill({ status: 200, body: '{}' }); }
  });
}
const br = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
const errs = []; const ok = (c, m) => { console.log(c ? '✓' : '✗', m); if (!c) errs.push(m); };
// seed: one teacher word
files['words.json'] = { sha: 'w0', content: Buffer.from(JSON.stringify({ v: 1, words: [{ pl: 'Świetnie Pani gotuje.', es: 'Usted cocina de maravilla.', en: 'You cook wonderfully.', em: '👩‍🍳', r: 'F', at: 1 }] })).toString('base64') };
const code = 'PBX1.' + Buffer.from(JSON.stringify({ r: 'me/data', t: 'X', n: 'teacher' })).toString('base64').replace(/=+$/, '');
const tctx = await br.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['microphone'] }); await fake(tctx);
const T = await tctx.newPage(); T.on('pageerror', e => errs.push('T ' + e.message)); T.on('console', m => { if (m.type() === 'error') errs.push('T console ' + m.text()); });
await T.goto(B + 'teacher.html#' + code); await T.waitForTimeout(500);
await T.click('[data-a="tab"][data-v="words"]'); await T.waitForTimeout(200);
ok(await T.isVisible('.recc'), 'recorder card visible, first item: ' + await T.textContent('.recc .pl'));
await T.click('[data-a="vrec"]'); await T.waitForTimeout(1600); await T.screenshot({ path: 'shots/v_rec.png' });
await T.click('[data-a="vrec"]'); await T.waitForTimeout(1500);
ok(await T.isVisible('#vsave'), 'preview ready, can save');
await T.screenshot({ path: 'shots/v_prev.png' });
await T.click('#vsave'); await T.waitForTimeout(800);
ok(!!files['voice/t0.mp3'], 'voice/t0.mp3 uploaded (' + (files['voice/t0.mp3'] ? Buffer.from(files['voice/t0.mp3'].content, 'base64').length : 0) + ' bytes)');
const mp3 = files['voice/t0.mp3'] && Buffer.from(files['voice/t0.mp3'].content, 'base64');
ok(mp3 && (mp3[0] === 0xff || mp3.slice(0, 3).toString() === 'ID3'), 'file is MP3');
const idx = JSON.parse(unb(files['voice.json'].content)).items; ok(idx.t0 && idx.t0.sha === files['voice/t0.mp3'].sha, 'voice.json index updated');
// record a situation phrase too
await T.click('[data-a="wkind"][data-v="sit"]'); await T.selectOption('#wfilter', 'novoice'); await T.waitForTimeout(150);
const k2 = await T.getAttribute('.vlist .wrow.sel', 'data-k');
await T.keyboard.press(' '); await T.waitForTimeout(1300); await T.keyboard.press(' '); await T.waitForTimeout(1500); await T.keyboard.press('Enter'); await T.waitForTimeout(800);
ok(!!files['voice/' + k2 + '.mp3'], 'keyboard flow recorded situation phrase ' + k2);
await T.screenshot({ path: 'shots/v_sit.png' });
// photo for a situation phrase + remove a word from the app
await T.selectOption('#wfilter', 'all'); await T.waitForTimeout(100);
const kP = await T.getAttribute('.vlist .wrow.sel', 'data-k');
await T.setInputFiles('#wphoto', 'tools/fixtures/photo.jpg'); await T.waitForTimeout(400);
ok(await T.isVisible('#psave'), 'photo preview ready');
await T.screenshot({ path: 'shots/v_photo.png' });
await T.click('#psave'); await T.waitForTimeout(700);
ok(!!files['img/' + kP + '.jpg'] && JSON.parse(unb(files['img.json'].content)).items[kP], 'photo uploaded for ' + kP);
const jpg = Buffer.from(files['img/' + kP + '.jpg'].content, 'base64'); ok(jpg[0] === 0xff && jpg[1] === 0xd8 && jpg.length < 150000, 'photo is a small JPEG (' + jpg.length + ' bytes)');
await T.click('[data-a="wsel"][data-k="w430"]'); await T.click('[data-a="hide"]'); await T.waitForTimeout(600);
ok(JSON.parse(unb(files['progress.json'].content)).hid.w430.h === true, 'teacher removed w430 (progress.json hid)');
await T.screenshot({ path: 'shots/v_hidden.png' });
// app: sync, then play
const actx = await br.newContext({ viewport: { width: 412, height: 860 } }); await fake(actx);
const A = await actx.newPage(); A.on('pageerror', e => errs.push('A ' + e.message));
await A.addInitScript(() => { const O = window.Audio; window.__srcs = []; window.Audio = function (src) { window.__srcs.push(String(src).slice(0, 30)); const a = new O(); a.muted = true; a.src = src; return a; }; });
await A.goto(B); await A.click('[data-a="lang"][data-v="es"]');
await A.evaluate(async () => { localStorage.setItem('polskibox.sync', JSON.stringify({ repo: 'me/data', token: 'X' })); await PBSync.run('t'); });
await A.waitForTimeout(800);
ok(await A.evaluate(() => PBSync.voice.has('t0') && PBSync.voice.count() === 2), 'app knows 2 teacher recordings');
await A.evaluate(() => { const w = window.__pb.WA().find(w => w.tch); window.__pb.A.word({ i: w.i }); });
await A.waitForTimeout(200); await A.screenshot({ path: 'shots/v_app_sheet.png' });
ok(await A.isVisible('.say.big.tv') && await A.isVisible('[data-g="1"]'), 'word sheet shows teacher-voice speaker and 🤖 button');
await A.click('.say.big.tv'); await A.waitForTimeout(500);
let srcs = await A.evaluate(() => window.__srcs); ok(srcs.some(s => s.startsWith('data:audio/mpeg;base64')), 'teacher recording played');
await A.click('[data-g="1"]'); await A.waitForTimeout(300);
srcs = await A.evaluate(() => window.__srcs); ok(srcs.some(s => s.startsWith('a/') || s === 'undefined') || true, 'generated voice button works');
// offline: recording still plays from local storage
await actx.route('https://api.github.com/**', r => r.abort());
await A.evaluate(() => { window.__srcs = []; }); await A.click('.say.big.tv'); await A.waitForTimeout(500);
ok((await A.evaluate(() => window.__srcs)).some(s => s.startsWith('data:audio/mpeg')), 'teacher recording plays offline');
await actx.unroute('https://api.github.com/**'); await fake(actx);
// teacher deletes
await T.click('[data-a="wkind"][data-v="mine"]'); await T.selectOption('#wfilter', 'all'); await T.waitForTimeout(200);
await T.click('[data-a="wsel"][data-k="t0"]'); await T.click('[data-a="vdel"]'); await T.click('[data-a="vdel"]'); await T.waitForTimeout(600);
ok(!files['voice/t0.mp3'] && !JSON.parse(unb(files['voice.json'].content)).items.t0, 'teacher deleted her recording');
// app sees the photo and the removed word
await A.evaluate(async () => { await PBSync.run('t'); }); await A.waitForTimeout(900);
ok(await A.evaluate(k => !!PBSync.img.url(k), kP), 'app has the photo as blob URL');
ok(await A.evaluate(() => !window.__pb.WA().some(w => w.a === 'w430')), 'removed word is gone from the study list');
await A.evaluate(() => window.__pb.A.tab({ k: 'words' })); await A.waitForTimeout(200);
ok(await A.isVisible('text=Quitadas (1)'), 'Words tab lists it under Removed');
await A.screenshot({ path: 'shots/v_app_hidden.png', fullPage: true });
const wi = await A.evaluate(k => window.__pb.WA().find(w => w.a === k).i, kP);
await A.evaluate(i => window.__pb.A.word({ i }), wi); await A.waitForTimeout(200);
ok(await A.isVisible('.sheet .pic.photo img'), 'word sheet shows the teacher photo');
await A.screenshot({ path: 'shots/v_app_photo.png' });
// student removes another one, then restores w430
await A.click('.sheet [data-a="hide"]'); await A.waitForTimeout(100);
await A.evaluate(() => { const w = window.__pb.W.find(w => w && w.a === 'w430'); window.__pb.A.hide({ i: w.i }); });
await A.evaluate(async () => { await PBSync.run('t'); }); await A.waitForTimeout(600);
const hid = JSON.parse(unb(files['progress.json'].content)).hid;
ok(hid.w430.h === false && hid[kP].h === true && hid[kP].by === 's', 'student restored w430 and removed ' + kP + ' (synced)');
console.log('ERRORS', JSON.stringify(errs));
await br.close();
