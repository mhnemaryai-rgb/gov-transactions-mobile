// Service worker: يحاول الشبكة أولاً لجلب أحدث نسخة، ويستخدم النسخة المخزّنة فقط عند عدم توفر إنترنت.
const CACHE_NAME = 'tx-tracker-mobile-v5';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// شبكة أولاً: عند توفر إنترنت يجلب أحدث نسخة من الموقع تلقائيًا ويحدّث المخزن المؤقت،
// وعند انقطاع الإنترنت يستخدم آخر نسخة محفوظة حتى يستمر التطبيق بالعمل بدون اتصال.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
