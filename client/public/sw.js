// Service Worker for offline support and caching
// Improved with SPA navigation fallback and comprehensive asset caching

const CACHE_VERSION = 'v1';
const CACHE_NAME = `vokabel-champion-${CACHE_VERSION}`;
const RUNTIME_CACHE = `vokabel-champion-runtime-${CACHE_VERSION}`;
const ASSETS_CACHE = `vokabel-champion-assets-${CACHE_VERSION}`;

// Files to cache on install (critical for SPA)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
];

// Asset patterns to cache at runtime
const ASSET_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.png$/,
  /\.jpg$/,
  /\.svg$/,
  /\.json$/,
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Failed to cache some static assets:', err);
        });
      }),
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old cache versions
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (except for Supabase)
  if (url.hostname !== self.location.hostname && !url.hostname.includes('supabase')) {
    return;
  }

  // Handle API requests (network first, fallback to cache)
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle HTML (SPA navigation)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(htmlFirstStrategy(request));
    return;
  }

  // Handle assets (cache first)
  if (isAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default: cache first
  event.respondWith(cacheFirstStrategy(request));
});

// Network first strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', request.url);
    const cached = await caches.match(request);
    return cached || new Response('Offline - Data not available', { status: 503 });
  }
}

// HTML first strategy (for SPA navigation)
async function htmlFirstStrategy(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful HTML responses
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] HTML request failed, trying cache:', request.url);
    
    // Try to return cached response
    let cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Fallback to index.html for SPA routes
    console.log('[SW] Returning index.html as fallback for SPA route');
    cached = await caches.match('/index.html');
    return cached || new Response('Offline', { status: 503 });
  }
}

// Cache first strategy (for assets)
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(ASSETS_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Asset request failed:', request.url);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Check if URL is an asset
function isAsset(pathname) {
  return ASSET_PATTERNS.some((pattern) => pattern.test(pathname));
}

// Background sync for pending data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  if (event.tag === 'sync-game-results') {
    event.waitUntil(syncGameResults());
  }
});

async function syncGameResults() {
  try {
    console.log('[SW] Syncing game results...');
    // Sync pending game results with the server
    const db = await openIndexedDB();
    const pendingResults = await getPendingResults(db);
    
    for (const result of pendingResults) {
      try {
        await fetch('/api/game-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
        });
        await deletePendingResult(db, result.id);
      } catch (error) {
        console.error('[SW] Failed to sync result:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// IndexedDB helpers for offline data persistence
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('vokabel-champion', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-results')) {
        db.createObjectStore('pending-results', { keyPath: 'id' });
      }
    };
  });
}

async function getPendingResults(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-results'], 'readonly');
    const store = transaction.objectStore('pending-results');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function deletePendingResult(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-results'], 'readwrite');
    const store = transaction.objectStore('pending-results');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    Promise.all([
      caches.delete(RUNTIME_CACHE),
      caches.delete(ASSETS_CACHE),
    ]).then(() => {
      console.log('[SW] Caches cleared');
      event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
    });
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then((size) => {
      event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
    });
  }
});

// Calculate total cache size
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}
