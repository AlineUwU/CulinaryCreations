const CACHE_NAME = 'costos-receta-v1';
const urlsToCache = [
  'CulinaryCreations/',
  'CulinaryCreations/index.html',
  'CulinaryCreations/styles.css',
  'CulinaryCreations/script.js',
  'CulinaryCreations/icon-192.png',
  'CulinaryCreations/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Si es una navegación (HTML), devuelve index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/CulinaryCreations/index.html');
        }
      });
    })
  );
});
