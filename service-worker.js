const CACHE_NAME = 'costos-receta-v1';
const FILES_TO_CACHE = [
  './',
  'index.html',
  'styles.css',
  'script.js',
  'desktop-preview.png',
  'favicon.ico',
  'mobile-preview.png',
  'icon-192.png',
  'icon-512.png'
];

// Instalar y cachear los archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('KAITO 💙: Guardando herramientas en el caché para uso offline...');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación: Limpiamos versiones antiguas del caché
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia: Intentar cargar de la red, si falla, usar el caché
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
