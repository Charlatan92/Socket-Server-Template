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

// Référence pour le message de retour (feedback)
const feedbackDiv = document.getElementById('feedback-msg'); 

// ==============================================
// 2. ÉVÉNEMENTS WEBSOCKET (RÉCEPTION)
// ==============================================

ws.addEventListener("open", (event) => {
    console.log("✅ WebSocket connecté !");
});

ws.addEventListener("message", (event) => {
    // 1. Ignorer le ping du serveur (keep-alive)
    if(event.data === 'ping') return; 

    // 2. Traiter la réponse de TouchDesigner
    try {
        // On tente de lire le JSON
        const data = JSON.parse(event.data);

        // On vérifie si c'est bien notre message de retour (type défini dans le Python TD)
        if (data.type === "server_feedback") {
            
            console.log("Retour serveur :", data.status);

            // CAS 1 : SUCCÈS (Place trouvée)
            if (data.status === "success") {
                if(feedbackDiv) {
                    feedbackDiv.innerText = "✅ " + data.message;
                    feedbackDiv.style.color = "green";
                }
                // Optionnel : On désactive le bouton pour éviter les doublons
                btnSend.disabled = true;
                btnSend.innerText = "Validé !";
            } 
            
            // CAS 2 : ERREUR (Tableau plein ou collision)
            else if (data.status === "error") {
                if(feedbackDiv) {
                    feedbackDiv.innerText = "❌ " + data.message;
                    feedbackDiv.style.color = "red";
                }
                alert("Erreur : " + data.message);
            }
        }
    } catch (e) {
        // Si ce n'est pas du JSON (message broadcast simple), on l'affiche juste en console
        console.log("Message brut reçu :", event.data);
    }
});

ws.addEventListener("close", (event) => {
    console.warn("❌ WebSocket déconnecté - Rechargement conseillé");
    if(feedbackDiv) feedbackDiv.innerText = "Connexion perdue...";
});

// ==============================================
// 3. GESTION DU FORMULAIRE (ENVOI)
// ==============================================

const btnSend = document.getElementById('btn-send');
const inputName = document.getElementById('user-name');
const inputChoice = document.getElementById('user-choice');

// Fonction pour envoyer les données
btnSend.addEventListener('click', () => {
    
    // A. Récupérer les valeurs
    const nameVal = inputName.value; 
    const choiceVal = inputChoice.value;

    // B. Petit contrôle
    if (nameVal.trim() === "") {
        alert("Merci d'entrer un nom !");
        return;
    }

    // C. Créer l'objet JSON PLAT
    // Cela va créer : {"nom": "Banane", "choix": "option_2"}
    const payload = {
        nom: nameVal,      
        choix: choiceVal   
    };

    // D. Envoyer
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
        console.log("Envoyé :", payload);
        
        // Petit feedback immédiat en attendant la réponse du serveur
        if(feedbackDiv) {
            feedbackDiv.innerText = "Envoi en cours...";
            feedbackDiv.style.color = "orange";
        }
    } else {
        console.error("Impossible d'envoyer : WebSocket déconnecté.");
        alert("Erreur de connexion. Rechargez la page.");
    }
});