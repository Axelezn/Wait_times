// sw.js (Service Worker)
// Incrémentez la version à chaque changement dans la liste 'urlsToCache'
const CACHE_NAME = 'dlp-wait-times-cache-v2'; 

// Liste des fichiers statiques à mettre en cache lors de l'installation
const urlsToCache = [
  // RACINE (IMPORTANT : Le Service Worker doit avoir le chemin de la racine pour l'installation)
  '/', 
  '/index.html',
  '/disneyland_park.html',
  '/disneyland_studios.html',
  '/manifest.json',
  '/README.md', // Optionnel, mais vous pouvez le cacher si vous voulez

  // DOSSIER CSS
  '/css/index.css',
  '/css/park-styles.css',

  // DOSSIER JS
  '/js/config.js',          // J'ai supposé que config.js est le fichier "timetables.js"
  '/js/app-park.js',        // ANCIEN : /js/park.js
  '/js/app-studios.js',
  '/js/pwa_register.js',
  '/js/timetables.js',      // Ajouté ce fichier aussi, s'il contient du JS essentiel

  // DOSSIER IMGS (Remplace /icons/)
  '/imgs/dlppark.png',      // L'icône réelle de l'application devra probablement être ici
  '/imgs/dlpstudios.png',    // L'icône réelle de l'application devra probablement être ici
  
  // Icone appli PWA
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
             // Il est normal que '/' échoue si l'hébergeur ne le sert pas directement
             console.error('Erreur lors de la mise en cache (certains fichiers peuvent avoir échoué) :', err);
        });
      })
  );
});

// Stratégie de mise en cache : Cache-First
// Répond avec la version en cache si elle existe, sinon va au réseau.
self.addEventListener('fetch', (event) => {
  // 🚫 Ignorer les requêtes API pour s'assurer des données en temps réel (l'API ne doit pas être cachée)
  if (event.request.url.includes('api.themeparks.wiki')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la ressource est dans le cache, on la retourne (hors-ligne OK)
        if (response) {
          return response;
        }
        // Sinon, on fait une requête réseau (pour les nouvelles ressources ou les premières fois)
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
          // Filtre tous les caches qui commencent par 'dlp-wait-times-cache-' mais qui NE sont PAS le CACHE_NAME actuel
          return cacheName.startsWith('dlp-wait-times-cache-') && cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});