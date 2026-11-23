// Simulates the Android bridge (window.Native) to check that sync goes through Native.http and speech through Native.speak.
import { chromium } from 'playwright';
const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 1280, height: 800 } });
const store = {}; let nativeHttp = 0, speak = 0, files = {};
await ctx.exposeFunction('__nh', async (method, url, headers, body) => {
  nativeHttp++; const u = new URL(url);
  if (u.pathname === '/repos/me/data') return [200, '{"private":true}'];
  const p = (u.pathname.match(/contents\/(.+)$/) || [])[1];
  if (method === 'GET') return files[p] ? [200, JSON.stringify({ sha: 'x' + p.length + files[p].length, content: files[p] })] : [404, '{}'];
  const b = JSON.parse(body); files[p] = b.content; return [201, JSON.stringify({ content: { sha: 'x' + p.length + b.content.length } })];
});
await ctx.exposeFunction('__ns', () => { speak++; });
await ctx.addInitScript(() => {
  const mem = {};
  window.Native = {
    ttsReady: () => true, ttsInfo: () => 'ready', stop() {},
    speak: (t, r, id) => { window.__ns(); setTimeout(() => window.__ttsDone && window.__ttsDone(String(id)), 10); },
    save: (k, v) => { mem[k] = v; }, load: k => mem[k] || '', share() {},
    http: (m, u, h, b, id) => { window.__nh(m, u, h, b).then(([s, t]) => window.__httpDone(id, s, t)); }
  };
});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await ctx.route('https://api.github.com/**', r => { errs.push('fetch used instead of Native.http'); r.abort(); });
await p.goto('http://localhost:8765/'); await p.click('[data-a="lang"][data-v="es"]');
await p.click('[data-a="tab"][data-k="me"]'); await p.click('[data-a="syncsetup"]');
await p.fill('#srepo', 'me/data'); await p.fill('#stok', 'T'); await p.click('#sgo'); await p.waitForTimeout(600);
await p.click('[data-a="tab"][data-k="today"]'); await p.click('[data-a="start"]'); await p.waitForTimeout(500);
const info = await p.evaluate(() => { window.__pb.A.tab({ k: 'me' }); return document.body.innerText.includes('Voz del teléfono') || document.body.innerText.includes('polaco listo'); });
console.log('native http calls', nativeHttp, 'files', Object.keys(files), 'speak', speak, 'voice info ok', info, 'ERRORS', errs);
await br.close();
