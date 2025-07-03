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
  console.log('🛠 SW: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 SW: Cacheando archivos...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch(error => {
        console.error('❌ SW: Error cacheando archivos:', error);
      })
  );
});

// Activar y limpiar cachés antiguos
self.addEventListener('activate', event => {
  console.log('✅ SW: Activado');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🧹 SW: Borrando caché antigua:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  console.log('🔄 SW: Interceptando →', event.request.url);

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
      })
  );
});
