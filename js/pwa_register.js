// js/pwa_register.js (Méthode Robuste pour GitHub Pages)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 1. Récupère le chemin du dépôt (ex: /Wait_times/)
    const BASE_URL = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

    // 2. Tente d'enregistrer le SW à l'endroit exact
    navigator.serviceWorker.register(BASE_URL + 'sw.js')
      .then((reg) => {
        console.log('Service Worker enregistré. Portée:', reg.scope); 
      })
      .catch((error) => {
        console.error('Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}
