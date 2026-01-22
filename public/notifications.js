// ============================================================================
// Gestion des Notifications Push - Frontend
// ============================================================================

let pushManager = null;
let swRegistration = null;
let isNotificationsInitialized = false;

// Enregistrer le Service Worker
async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Worker non supporté par ce navigateur');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
        });
        
        console.log('✅ Service Worker enregistré:', registration.scope);
        swRegistration = registration;
        
        // Attendre que le SW soit actif
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker activé');
        
        return registration;
    } catch (error) {
        console.error('❌ Erreur enregistrement Service Worker:', error);
        return null;
    }
}

// Vérifier l'état de la permission de notification
function checkNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('⚠️ Notifications non supportées par ce navigateur');
        return 'unsupported';
    }
    
    return Notification.permission;
}

// Demander la permission pour les notifications
async function requestNotificationPermission() {
    const permission = checkNotificationPermission();
    
    if (permission === 'unsupported') {
        return false;
    }
    
    if (permission === 'granted') {
        console.log('✅ Permission notifications déjà accordée');
        return true;
    }
    
    if (permission === 'denied') {
        console.warn('⚠️ Permission notifications refusée précédemment');
        alert('Les notifications sont bloquées. Veuillez activer les notifications dans les paramètres de votre navigateur.');
        return false;
    }
    
    // Demander la permission
    try {
        const result = await Notification.requestPermission();
        if (result === 'granted') {
            console.log('✅ Permission notifications accordée');
            return true;
        } else {
            console.warn('⚠️ Permission notifications refusée');
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur demande permission:', error);
        return false;
    }
}

// Convertir une clé publique VAPID en Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// S'abonner aux notifications push
async function subscribeToPushNotifications(username) {
    try {
        // Vérifier que le Service Worker est enregistré
        if (!swRegistration) {
            console.error('❌ Service Worker non enregistré');
            return false;
        }
        
        // Obtenir la clé publique VAPID depuis le serveur
        const keyResponse = await fetch('/api/vapid-public-key');
        if (!keyResponse.ok) {
            throw new Error('Impossible de récupérer la clé VAPID');
        }
        
        const { publicKey } = await keyResponse.json();
        const applicationServerKey = urlBase64ToUint8Array(publicKey);
        
        // S'abonner au push manager
        const subscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        });
        
        console.log('✅ Abonnement push créé:', subscription);
        
        // Envoyer l'abonnement au serveur
        const response = await fetch('/api/subscribe-push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                subscription: subscription
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur serveur');
        }
        
        const result = await response.json();
        console.log('✅ Abonnement enregistré sur le serveur:', result.message);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur abonnement push:', error);
        return false;
    }
}

// Se désabonner des notifications push
async function unsubscribeFromPushNotifications(username) {
    try {
        if (!swRegistration) {
            console.error('❌ Service Worker non enregistré');
            return false;
        }
        
        // Se désabonner du push manager
        const subscription = await swRegistration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
            console.log('✅ Désabonnement push local effectué');
        }
        
        // Informer le serveur
        const response = await fetch('/api/unsubscribe-push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur serveur');
        }
        
        console.log('✅ Désabonnement enregistré sur le serveur');
        return true;
        
    } catch (error) {
        console.error('❌ Erreur désabonnement push:', error);
        return false;
    }
}

// Vérifier si l'utilisateur est déjà abonné
async function isUserSubscribed() {
    if (!swRegistration) {
        return false;
    }
    
    try {
        const subscription = await swRegistration.pushManager.getSubscription();
        return subscription !== null;
    } catch (error) {
        console.error('❌ Erreur vérification abonnement:', error);
        return false;
    }
}

// Initialiser les notifications pour un utilisateur connecté
async function initializeNotifications(username) {
    if (isNotificationsInitialized) {
        console.log('ℹ️ Notifications déjà initialisées');
        return;
    }
    
    console.log(`🔔 Initialisation des notifications pour ${username}`);
    
    // Enregistrer le Service Worker
    const registration = await registerServiceWorker();
    if (!registration) {
        console.warn('⚠️ Impossible d\'enregistrer le Service Worker');
        return;
    }
    
    // Vérifier si déjà abonné
    const subscribed = await isUserSubscribed();
    if (subscribed) {
        console.log('ℹ️ Utilisateur déjà abonné aux notifications');
        isNotificationsInitialized = true;
        return;
    }
    
    // Demander la permission
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
        console.warn('⚠️ Permission notifications non accordée');
        return;
    }
    
    // S'abonner aux notifications
    const success = await subscribeToPushNotifications(username);
    if (success) {
        console.log('✅ Notifications initialisées avec succès');
        isNotificationsInitialized = true;
    } else {
        console.warn('⚠️ Échec de l\'abonnement aux notifications');
    }
}

// Tester l'envoi d'une notification
async function testNotification(username) {
    try {
        const response = await fetch('/api/test-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur serveur');
        }
        
        const result = await response.json();
        console.log('✅ Notification de test envoyée:', result.message);
        alert('Notification de test envoyée ! Vous devriez la recevoir dans quelques secondes.');
        
    } catch (error) {
        console.error('❌ Erreur test notification:', error);
        alert('Erreur lors de l\'envoi de la notification de test: ' + error.message);
    }
}

// Afficher un bouton pour activer/désactiver les notifications
function createNotificationToggleButton(username, container) {
    const button = document.createElement('button');
    button.id = 'notification-toggle-btn';
    button.className = 'pro-button accent-button';
    button.style.marginLeft = '10px';
    
    // Vérifier l'état initial
    isUserSubscribed().then(subscribed => {
        updateButton(subscribed);
    });
    
    function updateButton(isSubscribed) {
        if (isSubscribed) {
            button.innerHTML = '<i class="fas fa-bell-slash"></i> <span class="btn-text">Désactiver Notifications</span>';
            button.onclick = async () => {
                const success = await unsubscribeFromPushNotifications(username);
                if (success) {
                    updateButton(false);
                    alert('Notifications désactivées');
                }
            };
        } else {
            button.innerHTML = '<i class="fas fa-bell"></i> <span class="btn-text">Activer Notifications</span>';
            button.onclick = async () => {
                const permissionGranted = await requestNotificationPermission();
                if (permissionGranted) {
                    const success = await subscribeToPushNotifications(username);
                    if (success) {
                        updateButton(true);
                        alert('Notifications activées ! Vous recevrez des rappels chaque mardi pour compléter votre plan hebdomadaire.');
                    }
                }
            };
        }
    }
    
    if (container) {
        container.appendChild(button);
    }
    
    return button;
}

// Jouer un son de notification
function playNotificationSound() {
    try {
        // Créer un contexte audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Créer une série de bips
        const playBeep = (frequency, duration, delay) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            }, delay);
        };
        
        // Triple bip pour attirer l'attention
        playBeep(800, 0.2, 0);    // Premier bip
        playBeep(800, 0.2, 300);  // Deuxième bip
        playBeep(800, 0.2, 600);  // Troisième bip
        
        console.log('🔊 Son de notification joué');
    } catch (error) {
        console.error('❌ Erreur lecture son notification:', error);
    }
}

// Écouter les messages du Service Worker pour jouer le son
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PLAY_NOTIFICATION_SOUND') {
            console.log('🔔 Message reçu pour jouer le son');
            playNotificationSound();
        }
    });
}

// Exporter les fonctions pour utilisation globale
if (typeof window !== 'undefined') {
    window.NotificationManager = {
        initialize: initializeNotifications,
        subscribe: subscribeToPushNotifications,
        unsubscribe: unsubscribeFromPushNotifications,
        isSubscribed: isUserSubscribed,
        test: testNotification,
        createToggleButton: createNotificationToggleButton,
        playSound: playNotificationSound
    };
}
