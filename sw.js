// sw.js (Service Worker)
// Incrémentez la version à chaque changement dans la liste 'urlsToCache'
const CACHE_NAME = 'dlp-wait-times-cache-v3'; // IMPORTANT : Incrémenté à v3 pour forcer la mise à jour chez l'utilisateur

// Liste des fichiers statiques à mettre en cache lors de l'installation
const urlsToCache = [
  // RACINE
  '/', 
  '/index.html',
  '/disneyland_park.html',
  '/disneyland_studios.html',
  '/manifest.json',
  '/README.md', 

  // DOSSIER CSS
  '/css/index.css',
  '/css/park-styles.css',

  // DOSSIER IMGS (Contient les images de liens)
  '/imgs/dlppark.png',
  '/imgs/dlpstudios.png',

  // ⭐ DOSSIER ICONS (Contient les icônes PWA) ⭐
  '/icons/icon-192x192.png', 
  '/icons/icon-512x512.png',
  
  // DOSSIER JS
  '/js/timetables.js',      // C'est votre ancien config.js, nous le laissons
  '/js/app-park.js',
  '/js/app-studios.js',
  '/js/pwa_register.js',
];

// Installation du Service Worker et mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources statiques');
        return cache.addAll(urlsToCache).catch((err) => {
             console.error('Erreur lors de la mise en cache (certains fichiers peuvent avoir échoué) :', err);
        });
      })
  );
});

// Stratégie de mise en cache : Cache-First
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes API
  if (event.request.url.includes('api.themeparks.wiki')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Mise à jour : suppression des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation et nettoyage des anciens caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName.startsWith('dlp-wait-times-cache-') && cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
