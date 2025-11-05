// sw.js (Service Worker)
// Incrémentez la version à chaque changement dans la liste 'urlsToCache'
const CACHE_NAME = 'dlp-wait-times-cache-v5'; // ⭐ PASSAGE À LA V5 pour forcer la mise à jour !

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

  // DOSSIER JS
  '/js/timetables.js',      // ⭐ C'est le fichier qui contient les seuils de temps (config)
  '/js/app-park.js', 
  '/js/app-studios.js',
  '/js/pwa_register.js',
  // REMARQUE: J'ai retiré '/js/config.js' car il ne doit pas exister si vous avez 'timetables.js'

  // DOSSIER IMGS (Images des liens vers les parcs)
  '/imgs/dlppark.png',
  '/imgs/dlpstudios.png',
  
  // ⭐ DOSSIER ICONS (Icônes PWA - C'EST CORRECT MAIS SENSIBLE) ⭐
  '/icons/icon-192x192.png', 
  '/icons/icon-512x512.png'
];

// Installation du Service Worker et mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources statiques');
        return cache.addAll(urlsToCache).catch((err) => {
             // L'erreur est souvent ici si un fichier est mal nommé ou manquant
             console.error('Erreur lors de la mise en cache (Vérifiez les chemins):', err);
             // J'ai retiré le commentaire sur la racine, car c'est généralement un bug mineur
        });
      })
  );
});

// Stratégie de mise en cache : Cache-First
self.addEventListener('fetch', (event) => {
  // 🚫 Ignorer les requêtes API pour s'assurer des données en temps réel
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
