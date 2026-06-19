import { createContext, useContext, useState, useEffect } from 'react';
import { isOnline, onOnlineStatusChange } from '@/lib/cacheUtils';

interface OfflineContextType {
  isOnline: boolean;
  lastSyncTime: number | null;
  syncPending: boolean;
  setSyncPending: (pending: boolean) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnlineState, setIsOnlineState] = useState(isOnline());
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncPending, setSyncPending] = useState(false);

  useEffect(() => {
    const unsubscribe = onOnlineStatusChange((online) => {
      setIsOnlineState(online);
      if (online) {
        // When coming back online, mark sync as pending
        setSyncPending(true);
        setLastSyncTime(Date.now());
      }
    });

    return unsubscribe;
  }, []);

  const value: OfflineContextType = {
    isOnline: isOnlineState,
    lastSyncTime,
    syncPending,
    setSyncPending,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}
