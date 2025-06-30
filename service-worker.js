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

// Instalar y cachear los archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .catch(error => {
        console.error('❌ Error cacheando archivos:', error);
      })
  );
});

// Activar y limpiar cachés antiguos si hay versiones anteriores
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      )
    )
  );
});

// Interceptar peticiones y responder desde caché o red
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
