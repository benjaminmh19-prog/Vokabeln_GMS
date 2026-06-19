// Service Worker utilities

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[App] Service Worker registered:', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available, notify user
              console.log('[App] New version available');
              notifyUpdateAvailable();
            }
          });
        });
      })
      .catch((error) => {
        console.warn('[App] Service Worker registration failed:', error);
      });
  });
}

function notifyUpdateAvailable(): void {
  // Dispatch custom event that app can listen to
  window.dispatchEvent(
    new CustomEvent('sw-update-available', {
      detail: { message: 'Eine neue Version ist verfügbar. Bitte aktualisieren Sie die Seite.' },
    })
  );
}

export function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }

  return navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      return Promise.all(registrations.map((registration) => registration.unregister()));
    })
    .then((results) => {
      console.log('[App] Service Workers unregistered');
      return results.length > 0;
    })
    .catch((error) => {
      console.warn('[App] Failed to unregister Service Workers:', error);
      return false;
    });
}

export function skipWaiting(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
}

export function clearCache(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
}

export function requestBackgroundSync(): void {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.log('Background Sync not supported');
    return;
  }

  navigator.serviceWorker.ready.then((registration) => {
    (registration as any).sync.register('sync-game-results').then(() => {
      console.log('[App] Background sync registered');
    });
  });
}

export function isSWSupported(): boolean {
  return 'serviceWorker' in navigator;
}

export function isPWAInstalled(): boolean {
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}
