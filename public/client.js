// ==============================================
// 1. CONFIGURATION ET CONNEXION
// ==============================================
let wsUrl;

// Détection automatique (Local vs Production)
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    wsUrl = "ws://localhost:5001";
} else {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    wsUrl = `${protocol}://${window.location.host}`;
}

console.log("Tentative de connexion vers :", wsUrl);
let ws = new WebSocket(wsUrl);

// ==============================================
// 2. ÉVÉNEMENTS WEBSOCKET
// ==============================================

ws.addEventListener("open", (event) => {
    console.log("✅ WebSocket connecté !");
});

ws.addEventListener("message", (event) => {
    if(event.data === 'ping') return; // Ignorer les pings du serveur
    console.log("Message reçu :", event.data);
});

ws.addEventListener("close", (event) => {
    console.warn("❌ WebSocket déconnecté - Rechargement conseillé");
});

// ==============================================
// 3. GESTION DU FORMULAIRE
// ==============================================

const btnSend = document.getElementById('btn-send');
const inputName = document.getElementById('user-name');
const inputChoice = document.getElementById('user-choice');

// Fonction pour envoyer les données
// Fonction pour envoyer les données
btnSend.addEventListener('click', () => {
    
    // 1. Récupérer les valeurs
    const nameVal = inputName.value; 
    const choiceVal = inputChoice.value;

    // 2. Petit contrôle (optionnel)
    if (nameVal.trim() === "") {
        alert("Merci d'entrer un nom !");
        return;
    }

    // 3. Créer l'objet JSON PLAT (Correction ici)
    // Cela va créer : {"nom": "Banane", "choix": "option_2"}
    const payload = {
        nom: nameVal,      // Tu peux renommer "nom" par ce que tu veux (ex: "slider1" si besoin)
        choix: choiceVal   // Idem pour "choix"
    };

    // 4. Envoyer
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
        console.log("Envoyé :", payload);
    } else {
        console.error("Impossible d'envoyer : WebSocket déconnecté.");
    }
});