/* Polski Box sync: keeps progress and the teacher's words in a private GitHub repository
   (default MarvinCG/polski-box-data) through the GitHub contents API.
   Nothing here is sent anywhere else. The token is stored only on this device. */
(function () {
'use strict';
const KEY = 'polskibox.sync', API = 'https://api.github.com';
const NA = () => window.Native || null;

/* ---------------- tiny storage helpers (Android SharedPreferences + localStorage) */
function sget(k) {
  try { const n = NA(); if (n && n.load) { const v = n.load(k); if (v) return v; } } catch (e) {}
  try { return localStorage.getItem(k); } catch (e) { return null; }
}
function sset(k, v) {
  try { const n = NA(); if (n && n.save) n.save(k, v == null ? '' : v); } catch (e) {}
  try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {}
}

/* ---------------- base64 for UTF-8 text */
const b64e = s => btoa(unescape(encodeURIComponent(s)));
const b64d = s => decodeURIComponent(escape(atob(String(s).replace(/\s/g, ''))));

/* ---------------- HTTP: native bridge on Android (no CORS issues), fetch elsewhere */
let hid = 0; const hwait = {};
window.__httpDone = function (id, status, body) { const f = hwait[id]; if (f) { delete hwait[id]; f({ status: Number(status), text: body || '' }); } };
function http(method, url, headers, body) {
  const n = NA();
  if (n && n.http) {
    return new Promise(res => { const id = ++hid; hwait[id] = res; try { n.http(method, url, JSON.stringify(headers), body || '', id); } catch (e) { delete hwait[id]; res({ status: 0, text: String(e) }); } });
  }
  return fetch(url, { method, headers, body: body || undefined, cache: 'no-store' })
    .then(r => r.text().then(text => ({ status: r.status, text })))
    .catch(e => ({ status: 0, text: String(e) }));
}

/* ---------------- configuration */
function conf() { try { const c = JSON.parse(sget(KEY) || 'null'); return c && c.repo && c.token ? c : null; } catch (e) { return null; } }
function setConf(c) { sset(KEY, c ? JSON.stringify(c) : null); }
/* A pairing code carries repo + token so another device (or the teacher) can connect in one step. */
const CODE = 'PBX1.';
function makeCode(c, extra) { return CODE + b64e(JSON.stringify(Object.assign({ r: c.repo, t: c.token }, extra || {}))).replace(/=+$/, ''); }
function readCode(s) {
  s = String(s || '').trim(); const m = s.match(/PBX1\.([A-Za-z0-9+/_-]+)/); if (!m) return null;
  try { let b = m[1].replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '='; const o = JSON.parse(b64d(b)); return o.r && o.t ? o : null; } catch (e) { return null; }
}

/* ---------------- GitHub contents API */
function gh(c, method, path, body) {
  const h = { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + c.token, 'X-GitHub-Api-Version': '2022-11-28' };
  if (body) h['Content-Type'] = 'application/json';
  return http(method, `${API}/repos/${c.repo}/contents/${path}`, h, body ? JSON.stringify(body) : '');
}
async function getFile(c, path) {
  const r = await gh(c, 'GET', path + '?t=' + Date.now());
  if (r.status === 404) return { sha: null, data: null };
  if (r.status !== 200) throw httpErr(r);
  const j = JSON.parse(r.text); return { sha: j.sha, data: JSON.parse(b64d(j.content)) };
}
async function putFile(c, path, data, sha, msg) {
  const body = { message: msg, content: b64e(JSON.stringify(data, null, 1)) }; if (sha) body.sha = sha;
  const r = await gh(c, 'PUT', path, body);
  if (r.status === 200 || r.status === 201) return JSON.parse(r.text).content.sha;
  throw httpErr(r);
}
function httpErr(r) {
  const e = new Error(r.status === 401 ? 'token' : r.status === 403 ? 'forbidden' : r.status === 404 ? 'repo' : r.status === 409 || r.status === 422 ? 'conflict' : r.status === 0 ? 'offline' : 'http' + r.status);
  e.status = r.status; return e;
}

/* ---------------- merging (pure; tested in tools/test_sync.mjs) */
const SYNC_CFG = ['npd', 'mode', 'ui', 'gl', 'strict', 'auto', 'slow'];
function cardT(c) { return c ? (c.t || (c.l || 0) * 864e5) : -1; }
function mergeLog(a, b) { const o = Object.assign({}, a || {}); for (const d in (b || {})) { const x = o[d], y = b[d]; o[d] = !x ? y : { a: Math.max(x.a || 0, y.a || 0), ok: Math.max(x.ok || 0, y.ok || 0), n: Math.max(x.n || 0, y.n || 0), x: Math.max(x.x || 0, y.x || 0) }; } return o; }
/** local: app state S. remote: progress.json content (or null). Returns the new local state. */
function merge(local, remote) {
  const S = JSON.parse(JSON.stringify(local));
  if (!remote) return S;
  const ra = Math.max(S.resetAt || 0, remote.resetAt || 0);
  if (ra > (S.resetAt || 0)) { S.resetAt = ra; for (const id in S.cards) if (cardT(S.cards[id]) < ra) delete S.cards[id]; }
  const rc = remote.cards || {};
  for (const id in rc) { const a = S.cards[id], b = rc[id]; if (cardT(b) < ra) continue; if (!a || cardT(b) > cardT(a) || (cardT(b) === cardT(a) && (b.s || 0) > (a.s || 0))) S.cards[id] = b; }
  const ri = remote.intro; if (ri && (ri.d > S.intro.d || (ri.d === S.intro.d && ri.n > S.intro.n))) S.intro = ri;
  if ((remote.qt || 0) > (S.qt || 0)) { S.q = remote.q || []; S.qt = remote.qt; }
  if ((remote.cfgT || 0) > (S.cfgT || 0)) { SYNC_CFG.forEach(k => { if (remote.cfg && k in remote.cfg) S.cfg[k] = remote.cfg[k]; }); S.cfgT = remote.cfgT; }
  const logs = remote.logs || {}; S.ol = S.ol || {};
  for (const dev in logs) { if (dev === S.dev) S.log = mergeLog(S.log, logs[dev]); else S.ol[dev] = mergeLog(S.ol[dev], logs[dev]); }
  S.gb = S.gb || {}; const gb = remote.gb || {}; for (const k in gb) S.gb[k] = Math.max(S.gb[k] || 0, gb[k]);
  S.seenT = Math.max(S.seenT || 0, remote.seenT || 0);
  S.devs = Object.assign({}, remote.devs || {}, S.devs || {});
  return S;
}
function toRemote(S) {
  const cfg = {}; SYNC_CFG.forEach(k => cfg[k] = S.cfg[k]);
  const logs = Object.assign({}, S.ol || {}); logs[S.dev] = S.log;
  return { v: 2, cards: S.cards, intro: S.intro, q: S.q, qt: S.qt || 0, cfg, cfgT: S.cfgT || 0, logs, gb: S.gb || {}, seenT: S.seenT || 0, devs: S.devs || {}, resetAt: S.resetAt || 0 };
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ---------------- the sync engine, wired to the app by PBSync.attach(api) */
let api = null, busy = null, again = false, timer = null;
const st = { last: Number(sget('polskibox.synclast') || 0), err: '', running: false };
async function run(reason) {
  const c = conf(); if (!c || !api) return;
  if (busy) { again = true; return busy; }
  st.running = true; st.err = ''; api.status && api.status();
  busy = (async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const rf = await getFile(c, 'progress.json');
        const mergedS = merge(api.get(), rf.data);
        api.set(mergedS);
        const up = toRemote(api.get());
        if (!rf.data || !same(up, Object.assign({}, rf.data))) await putFile(c, 'progress.json', up, rf.sha, `progress (${api.device()})`);
        try { const wf = await getFile(c, 'words.json'); const list = (wf.data && wf.data.words) || []; sset('polskibox.custom', JSON.stringify(list)); api.custom(list); } catch (e) { if (e.message !== 'repo') throw e; }
        st.last = Date.now(); sset('polskibox.synclast', String(st.last)); break;
      } catch (e) {
        st.err = e.message || 'error';
        if (e.message !== 'conflict') break;
      }
    }
  })();
  try { await busy; } finally { busy = null; st.running = false; api.status && api.status(); }
  if (again) { again = false; return run('again'); }
}
function soon(ms) { clearTimeout(timer); if (conf()) timer = setTimeout(() => run('soon'), ms == null ? 2500 : ms); }

window.PBSync = {
  attach(a) {
    api = a;
    try { const cached = JSON.parse(sget('polskibox.custom') || '[]'); if (cached.length) api.custom(cached); } catch (e) {}
    if (conf()) setTimeout(() => run('boot'), 800);
    setInterval(() => { if (document.visibilityState !== 'hidden') run('tick'); }, 4 * 60 * 1000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') run('hide'); else soon(500); });
  },
  conf, setConf, makeCode, readCode, merge, toRemote, run, soon, state: st,
  /** Check a repo + token and create the data files if the repository is empty. */
  async connect(repo, token) {
    const c = { repo: repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/\/$/, ''), token: token.trim() };
    const r = await http('GET', `${API}/repos/${c.repo}`, { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + c.token }, '');
    if (r.status !== 200) throw httpErr(r);
    const meta = JSON.parse(r.text);
    const w = await getFile(c, 'words.json'); if (!w.data) await putFile(c, 'words.json', { v: 1, words: [] }, null, 'create words.json');
    setConf(c); await run('connect');
    return { private: !!meta.private };
  },
  disconnect() { setConf(null); },
  getFile: (p) => getFile(conf(), p), putFile: (p, d, s, m) => putFile(conf(), p, d, s, m), http
};
})();
