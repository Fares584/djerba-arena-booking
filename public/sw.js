
const CACHE_NAME = 'djerba-arena-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner le cache si disponible, sinon faire la requête réseau
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Récupérer les données en attente de synchronisation
  const pendingData = JSON.parse(localStorage.getItem('pendingSync') || '[]');
  
  for (const item of pendingData) {
    try {
      // Synchroniser avec Supabase selon le type de données
      await syncToSupabase(item);
      // Supprimer l'élément synchronisé
      removePendingItem(item.id);
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }
  }
}

async function syncToSupabase(item) {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  
  if (!response.ok) {
    throw new Error('Erreur de synchronisation');
  }
}

function removePendingItem(itemId) {
  const pendingData = JSON.parse(localStorage.getItem('pendingSync') || '[]');
  const updatedData = pendingData.filter(item => item.id !== itemId);
  localStorage.setItem('pendingSync', JSON.stringify(updatedData));
}
