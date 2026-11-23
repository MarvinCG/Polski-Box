// Random clicks on every visible control of the app (phone + DeX sizes) and the teacher page; reports any JavaScript error.
import { chromium } from 'playwright';
const B = 'http://localhost:8765/', files = {}; let shaN = 0;
async function fake(ctx) {
  await ctx.route('https://api.github.com/**', async route => {
    const req = route.request(), url = new URL(req.url()), m = req.method();
    if (url.pathname === '/repos/me/data') return route.fulfill({ status: 200, body: '{"private":true}' });
    const p = decodeURIComponent((url.pathname.match(/contents\/(.+)$/) || [])[1] || ''), f = files[p];
    if (m === 'GET') return f ? route.fulfill({ status: 200, body: JSON.stringify({ sha: f.sha, content: f.content }) }) : route.fulfill({ status: 404, body: '{}' });
    const body = JSON.parse(req.postData() || '{}');
    if (m === 'PUT') { if ((f && body.sha !== f.sha) || (!f && body.sha)) return route.fulfill({ status: 409, body: '{}' }); files[p] = { sha: 's' + (++shaN), content: body.content }; return route.fulfill({ status: 201, body: JSON.stringify({ content: { sha: files[p].sha } }) }); }
    if (m === 'DELETE') { delete files[p]; return route.fulfill({ status: 200, body: '{}' }); }
  });
  await ctx.route('https://api.languagetool.org/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"matches":[]}' }));
}
const SKIP = /^(resetgo|syncout|out|importgo|export|share|copy|synccode|synctch|install)$/;
const br = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const errs = [];
async function monkey(url, vp, n, tag, init) {
  const ctx = await br.newContext({ viewport: vp, permissions: ['microphone'] }); await fake(ctx);
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(`${tag}: ${e.message} @ ${(e.stack || '').split('\n').slice(1, 3).join(' | ')}`));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(`${tag} console: ${m.text()}`); });
  await p.addInitScript(() => { window.Audio = function () { const a = { play: () => { setTimeout(() => a.onended && a.onended(), 5); return Promise.resolve(); }, pause() {} }; return a; }; window.speechSynthesis && (window.speechSynthesis.speak = () => {}); });
  await p.goto(url); await p.waitForTimeout(300); if (init) await init(p);
  let seed = Number(process.env.SEED || 7); const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const r = rnd();
    const did = await p.evaluate(([r, skip]) => {
      const els = [...document.querySelectorAll('[data-a]')].filter(e => { if (new RegExp(skip).test(e.dataset.a) || e.disabled) return false; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; });
      if (!els.length) return '';
      const e = els[Math.floor(r * els.length)];
      const inp = document.querySelector('input.field:not([type=password]):not([type=file])'); if (inp && r < 0.08) { inp.value = 'Dzień dobry'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
      e.click(); return e.dataset.a;
    }, [r, SKIP.source]);
    if (r > 0.97) await p.keyboard.press(['Enter', ' ', 'Escape', '1', 'Backspace'][Math.floor(rnd() * 5)]);
    await p.waitForTimeout(did === 'vrec' ? 300 : 12);
  }
  await p.waitForTimeout(500); await ctx.close();
}
const code = 'PBX1.' + Buffer.from(JSON.stringify({ r: 'me/data', t: 'X' })).toString('base64').replace(/=+$/, '');
const conn = async p => { await p.evaluate(async () => { const b = document.querySelector('[data-a="lang"][data-v="es"]'); if (b) b.click(); localStorage.setItem('polskibox.sync', JSON.stringify({ repo: 'me/data', token: 'X' })); await PBSync.run('t'); }); };
await monkey(B, { width: 412, height: 860 }, 1500, 'phone', conn);
await monkey(B, { width: 1280, height: 800 }, 1500, 'dex', conn);
await monkey(B + 'teacher.html#' + code, { width: 1200, height: 860 }, 600, 'teacher');
await monkey(B, { width: 412, height: 860 }, 800, 'phone-pl', async p => { await p.evaluate(() => { const b = document.querySelector('[data-a="lang"][data-v="pl"]'); if (b) b.click(); }); });
const uniq = [...new Set(errs)];
console.log('ERRORS', uniq.length, JSON.stringify(uniq.slice(0, 20), null, 1));
await br.close();
