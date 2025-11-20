// 1. DÉTERMINER L'ADRESSE DU WEBSOCKET
let wsUrl;

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    // Cas Local : Ton main.js ouvre le socket sur le port 5001 en mode dev
    wsUrl = "ws://localhost:5001";
} else {
    // Cas En Ligne (Production) : Le socket utilise le même port que le site (80 ou 443)
    // On vérifie si on est en sécurisé (https) ou non
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    wsUrl = `${protocol}://${window.location.host}`;
}

// 2. CONNEXION
console.log("Tentative de connexion vers :", wsUrl);
let ws = new WebSocket(wsUrl);

// 3. GESTION DES ÉVÉNEMENTS
ws.addEventListener("open", (event) => {
    console.log("✅ WebSocket connecté !");
});

ws.addEventListener("message", (event) => {
    // Si le serveur envoie un "ping" pour garder la connexion, on ne fait rien ou on log
    if(event.data === 'ping') {
        console.log("Ping reçu du serveur");
        // Optionnel : répondre 'pong' si le serveur est strict, 
        // mais ton main.js gère le keepAlive tout seul côté serveur.
        return;
    }
    console.log("Message reçu :", event.data);
});

ws.addEventListener("close", (event) => {
    console.warn("❌ WebSocket déconnecté");
});

// 4. GESTION DES SLIDERS (Ton code HTML)
const sliderOut = document.querySelector('.controllTD');

// Quand l'utilisateur bouge le slider, on envoie à TouchDesigner
if(sliderOut){
    sliderOut.addEventListener('input', (e) => {
        const value = e.target.value; // Valeur entre 0 et 100 souvent
        // On envoie un JSON propre
        const data = {
            action: "slider1",
            val: parseFloat(value) / 100 // On normalise entre 0 et 1 pour TD
        };
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    });
}