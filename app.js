// app.js

// ⭐ ID de la Destination (Disneyland Paris Resort)
const DESTINATION_ID = 'e8d0207f-da8a-4048-bec8-117aa946b2c2';
// ⭐ ID du Parc Disneyland pour le filtrage
const DISNEYLAND_PARK_ID = 'dae968d5-630d-4719-8b06-3d107e944401'; 
// URL de l'API (DIRECTE - AUCUN PROXY CORS)
const API_URL = `https://api.themeparks.wiki/v1/entity/${DESTINATION_ID}/live`; 

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

// --- FONCTION PRINCIPALE ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAttractionTimes();
});

async function fetchAttractionTimes() {
    const listElement = document.getElementById('attractions-list');
    listElement.innerHTML = '<li>⌛ Chargement des temps d\'attente...</li>';

    try {
        // Requête directe
        const response = await fetch(API_URL); 
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        const liveData = data.liveData || [];

        // 1. FILTRAGE et initialisation de l'affichage
        const attractions = liveData.filter(entity => 
            entity.entityType === 'ATTRACTION' && entity.parkId === DISNEYLAND_PARK_ID
        );

        listElement.innerHTML = ''; 
        
        if (attractions.length === 0) {
            listElement.innerHTML = '<li>Aucune attraction du Parc Disneyland trouvée ou ouverte actuellement.</li>';
            return;
        }

        // 2. REGROUPEMENT par Land
        const attractionsByLand = attractions.reduce((acc, attraction) => {
            const land = getLandName(attraction);
            if (!acc[land]) {
                acc[land] = [];
            }
            acc[land].push(attraction);
            return acc;
        }, {});

        // 3. AFFICHAGE par Land
        const landOrder = ["Main Street, U.S.A.", "Frontierland", "Adventureland", "Fantasyland", "Discoveryland", "Autre / Non Classé"];
        
        landOrder.forEach(land => {
            const attractionsInLand = attractionsByLand[land];
            if (attractionsInLand && attractionsInLand.length > 0) {
                
                // Ajouter le titre du Land
                const landHeader = document.createElement('h2');
                landHeader.textContent = `🌍 ${land}`;
                landHeader.style.cssText = 'grid-column: 1 / -1; color: #E84D3C; margin-top: 30px; border-bottom: 2px solid #E84D3C; padding-bottom: 5px;';
                listElement.appendChild(landHeader);

                // Trier les attractions du Land par temps d'attente
                attractionsInLand.sort((a, b) => {
                    const waitA = a.queue?.STANDBY?.waitTime ?? Infinity;
                    const waitB = b.queue?.STANDBY?.waitTime ?? Infinity;
                    return waitA - waitB;
                });
                
                // Afficher chaque attraction
                attractionsInLand.forEach(attraction => {
                    const card = document.createElement('li');
                    card.classList.add('attraction-card');

                    let waitHtml = '';
                    let waitTime = attraction.queue?.STANDBY?.waitTime ?? null;

                    // Gérer les cas : OPERATING, CLOSED, REFURBISHMENT
                    if (attraction.status === 'OPERATING' && waitTime !== null && waitTime >= 0) {
                        waitHtml = `<p class="wait-time">Attente : <span class="time">${waitTime} min</span></p>`;
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
        console.error("Erreur lors de la récupération des données de l'API :", error);
        listElement.innerHTML = `<li>❌ Échec Critique : Impossible de charger les données. (${error.message}). Veuillez vous assurer d'ouvrir le fichier via un serveur web local (http://).</li>`;
    }
}