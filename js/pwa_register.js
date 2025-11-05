// js/pwa_register.js (Correction)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // ⭐ Le chemin RELATIF : remonte d'un niveau (de /js/) pour trouver sw.js (à la racine de Wait_times/)
    navigator.serviceWorker.register('../sw.js') 
      .then((reg) => {
        console.log('Service Worker enregistré. Portée:', reg.scope); 
        // NOTE : La portée sera /js/ si vous faites ça, mais c'est mieux que 404 pour l'instant.
      })
      .catch((error) => {
        console.error('Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}
