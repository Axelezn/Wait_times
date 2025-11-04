// js/park.js

// ⭐ CONSTANTES D'IDENTIFICATION ET DE RAFFRAICHISSEMENT
const DESTINATION_ID = 'e8d0207f-da8a-4048-bec8-117aa946b2c2';
const DISNEYLAND_PARK_ID = 'dae968d5-630d-4719-8b06-3d107e944401'; 
const API_URL = `https://api.themeparks.wiki/v1/entity/${DESTINATION_ID}/live`; 
const REFRESH_INTERVAL = 90000; // Actualisation toutes les 60 secondes (1 minute)

// --- DÉFINITION DES LANDS ---
function getLandName(attraction) {
    const externalId = attraction.externalId || '';
    
    if (externalId.startsWith('P1RA')) return "Frontierland"; 
    if (externalId.startsWith('P1DA')) return "Discoveryland"; 
    if (externalId.startsWith('P1AA')) return "Adventureland"; 
    if (externalId.startsWith('P1NA')) return "Fantasyland"; 
    if (externalId.startsWith('P1MA')) return "Main Street, U.S.A."; 
    
    if (attraction.name.includes("Princess Pavilion")) return "Fantasyland";
    
    return "Autre / Non Classé"; 
}

// --- FONCTION PRINCIPALE DE LANCEMENT ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Appel initial immédiat
    fetchAttractionTimes();
    
    // 2. Actualisation automatique toutes les 60 secondes
    setInterval(fetchAttractionTimes, REFRESH_INTERVAL);
    
    console.log(`[PARK DEBUG] Actualisation automatique réglée toutes les ${REFRESH_INTERVAL / 1000} secondes.`);
});

async function fetchAttractionTimes() {
    const listElement = document.getElementById('attractions-list');
    
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

        const attractions = liveData.filter(entity => 
            entity.entityType === 'ATTRACTION' && entity.parkId === DISNEYLAND_PARK_ID
        );
        
        console.log(`[PARK DEBUG] Attractions filtrées pour Disneyland Park: ${attractions.length}`);

        listElement.innerHTML = ''; 
        
        if (attractions.length === 0) {
            listElement.innerHTML = '<li>Aucune attraction du Parc Disneyland trouvée ou ouverte actuellement.</li>';
            return;
        }

        const attractionsByLand = attractions.reduce((acc, attraction) => {
            const land = getLandName(attraction);
            if (!acc[land]) { acc[land] = []; }
            acc[land].push(attraction);
            return acc;
        }, {});

        const landOrder = ["Main Street, U.S.A.", "Frontierland", "Adventureland", "Fantasyland", "Discoveryland", "Autre / Non Classé"];
        
        landOrder.forEach(land => {
            const attractionsInLand = attractionsByLand[land];
            if (attractionsInLand && attractionsInLand.length > 0) {
                
                const landHeader = document.createElement('h2');
                landHeader.textContent = `🌍 ${land}`;
                landHeader.style.cssText = 'grid-column: 1 / -1;'; 
                listElement.appendChild(landHeader);

                attractionsInLand.sort((a, b) => {
                    const waitA = a.queue?.STANDBY?.waitTime ?? Infinity;
                    const waitB = b.queue?.STANDBY?.waitTime ?? Infinity;
                    return waitA - waitB;
                });
                
                attractionsInLand.forEach(attraction => {
                    const card = document.createElement('li');
                    card.classList.add('attraction-card');

                    let waitHtml = '';
                    let waitTime = attraction.queue?.STANDBY?.waitTime ?? null;
                    
                    // ⭐ Intégration de getTimeClass pour la coloration par attraction ⭐
                    // VEUILLEZ VOUS ASSURER QUE config.js EST CHARGÉ AVANT !
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
        console.error("Erreur lors de la récupération des données de l'API (Disneyland Park) :", error);
        listElement.innerHTML = `<li>❌ Échec Critique : Impossible de charger les données. (${error.message}). Vérifiez la console (F12).</li>`;
    }
}