const CACHE_NAME = 'costos-receta-v1';
const urlsToCache = [
  '/CulinaryCreations/',
  '/CulinaryCreations/index.html',
  '/CulinaryCreations/styles.css',
  '/CulinaryCreations/script.js',
  '/CulinaryCreations/desktop-preview.png',
  '/CulinaryCreations/mobile-preview.png',
  '/CulinaryCreations/icon-192.png',
  '/CulinaryCreations/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(error => {
        console.error('❌ Error cacheando archivos:', error);
      });
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/CulinaryCreations/index.html');
        }
      });
    })
  );
});
