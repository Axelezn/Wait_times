// js/pwa-register.js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Service Worker enregistré. Portée:', reg.scope);
      })
      .catch((error) => {
        console.error('Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}