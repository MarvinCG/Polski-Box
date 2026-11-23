/* Offline cache for Polski Box (web / iPad / Windows). The build replaces VERSION. */
const VERSION = 'pb-dev';
const CORE = ['./', 'index.html', 'style.css', 'app.js', 'games.js', 'sync.js', 'ipa.js', 'data.js', 'audio-hd.js', 'manifest.webmanifest', 'icons/icon-192.png', 'teacher.html', 'teacher.js', 'recorder.js', 'vendor/lame.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // GitHub API, LanguageTool, Gemini: always live
  const media = /\/(a|e|icons)\//.test(u.pathname);
  if (media) {   // pictures & audio: cache first, keep forever
    e.respondWith(caches.open(VERSION).then(c => c.match(e.request).then(r => r || fetch(e.request).then(n => { if (n.ok) c.put(e.request, n.clone()); return n; }))));
    return;
  }
  // app files: network first so updates arrive, cache when offline
  e.respondWith(fetch(e.request).then(n => { if (n.ok) { const copy = n.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return n; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
