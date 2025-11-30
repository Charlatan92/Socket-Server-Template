// ==============================================
// 1. GÉNÉRATION ID UNIQUE (Le Ticket)
// ==============================================
// On crée un ID aléatoire unique pour cet utilisateur
const myClientId = 'user_' + Math.random().toString(36).substr(2, 9);
console.log("Mon ID Client est :", myClientId);

// ==============================================
// 2. CONFIGURATION ET CONNEXION
// ==============================================
let wsUrl;

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    wsUrl = "ws://localhost:5001";
} else {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    wsUrl = `${protocol}://${window.location.host}`;
}

let ws = new WebSocket(wsUrl);
const feedbackDiv = document.getElementById('feedback-msg'); 

// ==============================================
// 3. RÉCEPTION (FILTRÉE)
// ==============================================

ws.addEventListener("message", (event) => {
    if(event.data === 'ping') return; 

    try {
        const data = JSON.parse(event.data);

        if (data.type === "server_feedback") {
            
            // --- C'EST ICI QUE TOUT SE JOUE ---
            // On vérifie si le message nous est destiné
            if (data.targetId !== myClientId) {
                // Ce n'est pas pour nous, on ignore !
                console.log("Message ignoré (destiné à un autre client)");
                return; 
            }
            // ----------------------------------

            console.log("Retour serveur (Pour moi) :", data.status);

            if (data.status === "success") {
                if(feedbackDiv) {
                    feedbackDiv.innerText = "✅ " + data.message;
                    feedbackDiv.style.color = "var(--amos-green)";
                }
                btnSend.disabled = true;
                btnSend.innerText = "Contribution validée !";
                btnSend.style.backgroundColor = "#ccc";
            } 
            else if (data.status === "error") {
                if(feedbackDiv) {
                    feedbackDiv.innerText = "❌ " + data.message;
                    feedbackDiv.style.color = "red";
                }
                alert("Erreur : " + data.message);
                // On réactive le bouton en cas d'erreur pour qu'il puisse réessayer
                btnSend.innerText = "Réessayer";
            }
        }
    } catch (e) {
        // Ignorer les erreurs de parsing
    }
});

// ==============================================
// 4. ENVOI (AVEC ID)
// ==============================================

const btnSend = document.getElementById('btn-send');
const inputName = document.getElementById('user-name');
const inputChoice = document.getElementById('user-choice');

btnSend.addEventListener('click', () => {
    const nameVal = inputName.value; 
    const choiceVal = inputChoice.value;

    if (nameVal.trim() === "") {
        alert("Merci d'entrer un nom !");
        return;
    }

    const payload = {
        nom: nameVal,      
        choix: choiceVal,
        clientId: myClientId // <--- ON COLLE LE TICKET ICI
    };

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
        
        if(feedbackDiv) {
            feedbackDiv.innerText = "Envoi en cours...";
            feedbackDiv.style.color = "orange";
        }
    } else {
        alert("Erreur de connexion.");
    }
});