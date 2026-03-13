const CACHE_NAME = 'sport-service-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/assets/css/argon-dashboard.min.css',
        '/assets/js/argon-dashboard.min.js',
        '/assets/js/core/bootstrap.min.js',
        '/assets/js/core/popper.min.js',
      ]).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
