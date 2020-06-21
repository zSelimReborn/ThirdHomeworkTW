var cacheName = 'pwa-esempio';
var filesToCache = [
  './',
  './index.html',
  './css/stylesheet.css',
  './images/pwa-logo.svg',  
  './js/core.js',
  './js/mymap.js',
  './js/button.js',
  './js/account.js',
];

/* Inizializza il service worker e memorizza nella cache i contenuti */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Servi i Contenuti memorizzati quando il sito è offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
