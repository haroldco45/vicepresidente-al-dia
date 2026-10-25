// Vicepresidente al Día — service worker (Vibras Positivas HM)
// Red primero: siempre intenta traer lo más nuevo; si no hay señal, usa lo guardado.
const CACHE = 'vice-al-dia-v1';
const BASE = ['./', 'index.html', 'app.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'data/noticias.json', 'data/videos.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put(e.request.url.split('?')[0], copia));
      return r;
    }).catch(() => caches.match(e.request.url.split('?')[0]))
  );
});
