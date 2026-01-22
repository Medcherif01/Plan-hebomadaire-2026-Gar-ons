// Service Worker pour les notifications push
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Notification Push reçue:', event);
  
  let data = {
    title: 'Rappel Plan Hebdomadaire',
    body: 'Veuillez compléter votre plan hebdomadaire.',
    icon: 'https://cdn.glitch.global/1c613b14-019c-488a-a856-d55d64d174d0/al-kawthar-international-schools-jeddah-saudi-arabia-modified.png?v=1739565146299',
    badge: 'https://cdn.glitch.global/1c613b14-019c-488a-a856-d55d64d174d0/al-kawthar-international-schools-jeddah-saudi-arabia-modified.png?v=1739565146299',
    tag: 'plan-reminder',
    requireInteraction: true,
    data: {
      url: 'https://plan-hebdomadaire-2026-boys.vercel.app',
      playSound: true
    }
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
    } catch (e) {
      console.error('Erreur parsing push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    data: data.data,
    vibrate: [200, 100, 200, 100, 200],
    silent: false, // Force le son de notification
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Ouvrir'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ]
  };

  // Jouer un son de notification si demandé
  if (data.data && data.data.playSound) {
    // Le navigateur jouera automatiquement le son système
    // On peut aussi envoyer un message aux clients
    event.waitUntil(
      Promise.all([
        self.registration.showNotification(data.title, options),
        self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'PLAY_NOTIFICATION_SOUND',
              data: data
            });
          });
        })
      ])
    );
  } else {
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification cliquée:', event);
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});
