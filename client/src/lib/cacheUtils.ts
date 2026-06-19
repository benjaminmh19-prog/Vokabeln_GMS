// Cache utility for offline data persistence

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

const CACHE_PREFIX = 'vokabel_cache_';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Save data to localStorage with timestamp
 */
export function setCacheData<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
}

/**
 * Get data from localStorage if not expired
 */
export function getCacheData<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return null;

    const entry: CacheEntry<T> = JSON.parse(stored);
    const age = Date.now() - entry.timestamp;

    // Check if cache has expired
    if (entry.ttl && age > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('Failed to retrieve cached data:', error);
    return null;
  }
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear all cache:', error);
  }
}

/**
 * Get cache size in bytes
 */
export function getCacheSize(): number {
  try {
    let size = 0;
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          size += item.length + key.length;
        }
      }
    });
    return size;
  } catch (error) {
    console.warn('Failed to calculate cache size:', error);
    return 0;
  }
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Listen for online/offline changes
 */
export function onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
