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
btnSend.addEventListener('click', () => {
    
    // 1. Récupérer les valeurs
    const nameVal = inputName.value; 
    const choiceVal = inputChoice.value;

    // 2. Petit contrôle : on vérifie si le nom n'est pas vide
    if (nameVal.trim() === "") {
        alert("Merci d'entrer un nom !");
        return;
    }

    // 3. Créer l'objet JSON pour TouchDesigner
    const payload = {
        action: "user_submit", // Identifiant de l'action pour ton DAT Python
        userName: nameVal,
        userChoice: choiceVal
    };

    // 4. Envoyer si la connexion est ouverte
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
        console.log("Envoyé :", payload);
        
        // Optionnel : Feedback visuel ou vider le champ
        // inputName.value = ""; 
        // alert("Envoyé !");
    } else {
        console.error("Impossible d'envoyer : WebSocket déconnecté.");
        alert("Erreur de connexion au serveur.");
    }
});