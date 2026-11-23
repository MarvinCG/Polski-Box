import { chromium } from 'playwright';
const B = 'http://localhost:8765/';
const br = await chromium.launch();
const errs = [];
async function page(vp, name, fn) {
  const ctx = await br.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: vp.width < 800 });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(name + ' console: ' + m.text()); });
  await p.goto(B); await p.waitForTimeout(400);
  await p.evaluate(() => { const b = document.querySelector('[data-a="lang"][data-v="es"]'); if (b) b.click(); });
  await fn(p); await ctx.close();
}
const shot = (p, n) => p.screenshot({ path: `shots/${n}.png` });
for (const [vp, tag] of [[{ width: 412, height: 860 }, 'ph'], [{ width: 1280, height: 800 }, 'dx'], [{ width: 860, height: 400 }, 'ls']]) {
  await page(vp, tag, async p => {
    await shot(p, tag + '_today');
    await p.click('[data-a="tab"][data-k="games"]'); await p.waitForTimeout(200); await shot(p, tag + '_games');
    await p.click('[data-a="tab"][data-k="me"]'); await p.waitForTimeout(200); await shot(p, tag + '_me');
    await p.click('[data-a="tab"][data-k="today"]'); await p.click('[data-a="start"]'); await p.waitForTimeout(300); await shot(p, tag + '_intro');
    for (let k = 0; k < 8; k++) { await p.keyboard.press('Enter'); await p.waitForTimeout(80); }
    await p.waitForTimeout(200); await shot(p, tag + '_ex');
    await p.keyboard.press('1'); await p.waitForTimeout(200); await shot(p, tag + '_ex_fb');
  });
}
console.log('ERRORS', JSON.stringify(errs, null, 1));
await br.close();
