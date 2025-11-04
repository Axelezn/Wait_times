// js/app_studios.js

// ⭐ CONSTANTES D'IDENTIFICATION ET DE RAFFRAICHISSEMENT
const DESTINATION_ID = 'e8d0207f-da8a-4048-bec8-117aa946b2c2';
// ⭐ ID DU PARC WALT DISNEY STUDIOS
const DISNEY_STUDIOS_PARK_ID = 'ca888437-ebb4-4d50-aed2-d227f7096968'; 
const API_URL = `https://api.themeparks.wiki/v1/entity/${DESTINATION_ID}/live`; 
const REFRESH_INTERVAL = 90000; // Actualisation toutes les 60 secondes (1 minute)

// --- DÉFINITION DES ZONES (LANDS) pour les Studios ---
function getLandName(attraction) {
    const externalId = attraction.externalId || '';
    
    // Basé sur les IDs externes des Studios
    if (externalId.startsWith('P2AC')) return "Avengers Campus"; 
    if (externalId.startsWith('P2TM')) return "Toon Studio"; 
    if (externalId.startsWith('P2HA')) return "Hollywood Boulevard"; 
    
    // Basé sur le nom pour les zones principales
    if (attraction.name.includes("Ratatouille")) return "Worlds of Pixar"; 
    if (attraction.name.includes("Crush's Coaster")) return "Worlds of Pixar";
    
    return "Autre / Production Courtyard"; 
}

// --- FONCTION PRINCIPALE DE LANCEMENT ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Appel initial foction
    fetchAttractionTimes();
    
    // 2. Actualisation automatique toutes les 60 secondes
    setInterval(fetchAttractionTimes, REFRESH_INTERVAL);
    
    console.log(`[STUDIOS DEBUG] Actualisation automatique réglée toutes les ${REFRESH_INTERVAL / 1000} secondes.`);
});

async function fetchAttractionTimes() {
    const listElement = document.getElementById('attractions-list');
    
    // Affiche un message de chargement à chaque rafraîchissement
    if (listElement.innerHTML === '' || listElement.querySelector('li')) {
        listElement.innerHTML = '<li>⌛ Chargement des temps d\'attente...</li>';
    }

    try {
        const response = await fetch(API_URL); 
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        const liveData = data.liveData || [];

        // 1. FILTRAGE : ATTRACTIONS du Parc Walt Disney Studios uniquement
        const attractions = liveData.filter(entity => 
            entity.entityType === 'ATTRACTION' && entity.parkId === DISNEY_STUDIOS_PARK_ID
        );
        
        console.log(`[STUDIOS DEBUG] Attractions filtrées pour les Studios: ${attractions.length}`);

        listElement.innerHTML = ''; 
        
        if (attractions.length === 0) {
            listElement.innerHTML = '<li>Aucune attraction du Parc Studios trouvée ou ouverte actuellement.</li>';
            return;
        }

        // 2. REGROUPEMENT par Zone
        const attractionsByLand = attractions.reduce((acc, attraction) => {
            const land = getLandName(attraction);
            if (!acc[land]) { acc[land] = []; }
            acc[land].push(attraction);
            return acc;
        }, {});

        // 3. AFFICHAGE par Zone
        const landOrder = ["Avengers Campus", "Worlds of Pixar", "Toon Studio", "Hollywood Boulevard", "Autre / Production Courtyard"];
        
        landOrder.forEach(land => {
            const attractionsInLand = attractionsByLand[land];
            if (attractionsInLand && attractionsInLand.length > 0) {
                
                // Titre de la Zone
                const landHeader = document.createElement('h2');
                landHeader.textContent = `🎬 ${land}`;
                landHeader.style.cssText = 'grid-column: 1 / -1;'; 
                listElement.appendChild(landHeader);

                // Tri des attractions par temps d'attente
                attractionsInLand.sort((a, b) => {
                    const waitA = a.queue?.STANDBY?.waitTime ?? Infinity;
                    const waitB = b.queue?.STANDBY?.waitTime ?? Infinity;
                    return waitA - waitB;
                });
                
                // Affichage des cartes d'attraction
                attractionsInLand.forEach(attraction => {
                    const card = document.createElement('li');
                    card.classList.add('attraction-card');

                    let waitHtml = '';
                    let waitTime = attraction.queue?.STANDBY?.waitTime ?? null;
                    
                    // ⭐ Intégration de getTimeClass pour la coloration par attraction ⭐
                    // Ceci dépend du chargement de js/config.js avant ce script.
                    const timeClass = (typeof getTimeClass === 'function') ? 
                                       getTimeClass(attraction.name, waitTime) : 'time'; 
                    
                    if (attraction.status === 'OPERATING' && waitTime !== null && waitTime >= 0) {
                        waitHtml = `<p class="wait-time">Attente : <span class="${timeClass}">${waitTime} min</span></p>`;
                    } else if (attraction.status === 'CLOSED' || attraction.status === 'REFURBISHMENT' || waitTime === null) {
                        let statusText = attraction.status === 'CLOSED' ? 'Fermé' : 
                                         attraction.status === 'REFURBISHMENT' ? 'En Réhabilitation' : 
                                         'Indisponible';
                                         
                        waitHtml = `<p class="wait-time status-closed">${statusText}</p>`;
                    } else {
                        waitHtml = `<p class="wait-time">État : ${attraction.status}</p>`; 
                    }

                    card.innerHTML = `
                        <div class="name">${attraction.name}</div>
                        ${waitHtml}
                    `;
                    
                    listElement.appendChild(card);
                });
            }
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des données de l'API (Studios) :", error);
        listElement.innerHTML = `<li>❌ Échec Critique : Impossible de charger les données. (${error.message}). Vérifiez la console (F12).</li>`;
    }
}