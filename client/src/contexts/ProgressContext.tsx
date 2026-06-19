import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface PageProgress {
  collectionId: string;
  unit: number;
  page: number;
  completed: boolean;
  score: number;
  attempts: number;
  lastPlayed: number; // timestamp
}

export interface UnitProgress {
  collectionId: string;
  unit: number;
  totalPages: number;
  completedPages: number;
  averageScore: number;
}

export interface CollectionProgress {
  collectionId: string;
  name: string;
  totalUnits: number;
  completedUnits: number;
  totalPages: number;
  completedPages: number;
  averageScore: number;
}

interface ProgressContextType {
  pageProgress: Map<string, PageProgress>;
  unitProgress: Map<string, UnitProgress>;
  collectionProgress: Map<string, CollectionProgress>;
  recordPageCompletion: (collectionId: string, unit: number, page: number, score: number) => void;
  getPageProgress: (collectionId: string, unit: number, page: number) => PageProgress | undefined;
  getUnitProgress: (collectionId: string, unit: number) => UnitProgress | undefined;
  getCollectionProgress: (collectionId: string) => CollectionProgress | undefined;
  calculateCollectionStats: (collectionId: string, totalUnits: number, totalPages: number) => void;
  loadProgressFromStorage: () => void;
  clearProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageProgress, setPageProgress] = useState<Map<string, PageProgress>>(new Map());
  const [unitProgress, setUnitProgress] = useState<Map<string, UnitProgress>>(new Map());
  const [collectionProgress, setCollectionProgress] = useState<Map<string, CollectionProgress>>(new Map());

  // Load progress from localStorage on mount
  const loadProgressFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('vokabel-champion-progress');
      if (saved) {
        const data = JSON.parse(saved);
        setPageProgress(new Map(data.pageProgress || []));
        setUnitProgress(new Map(data.unitProgress || []));
        setCollectionProgress(new Map(data.collectionProgress || []));
      }
    } catch (error) {
      console.error('Error loading progress from storage:', error);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    try {
      const data = {
        pageProgress: Array.from(pageProgress.entries()),
        unitProgress: Array.from(unitProgress.entries()),
        collectionProgress: Array.from(collectionProgress.entries()),
      };
      localStorage.setItem('vokabel-champion-progress', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving progress to storage:', error);
    }
  }, [pageProgress, unitProgress, collectionProgress]);

  // Load progress on mount
  useEffect(() => {
    loadProgressFromStorage();
  }, [loadProgressFromStorage]);

  const recordPageCompletion = useCallback(
    (collectionId: string, unit: number, page: number, score: number) => {
      const key = `${collectionId}_${unit}_${page}`;
      
      setPageProgress((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(key);
        
        updated.set(key, {
          collectionId,
          unit,
          page,
          completed: true,
          score: Math.max(existing?.score || 0, score),
          attempts: (existing?.attempts || 0) + 1,
          lastPlayed: Date.now(),
        });
        
        return updated;
      });
    },
    []
  );

  const getPageProgress = useCallback(
    (collectionId: string, unit: number, page: number) => {
      const key = `${collectionId}_${unit}_${page}`;
      return pageProgress.get(key);
    },
    [pageProgress]
  );

  const getUnitProgress = useCallback(
    (collectionId: string, unit: number) => {
      const key = `${collectionId}_${unit}`;
      return unitProgress.get(key);
    },
    [unitProgress]
  );

  const getCollectionProgress = useCallback(
    (collectionId: string) => {
      return collectionProgress.get(collectionId);
    },
    [collectionProgress]
  );

  const calculateCollectionStats = useCallback(
    (collectionId: string, totalUnits: number, totalPages: number) => {
      // Count completed pages and units
      let completedPages = 0;
      let completedUnits = new Set<number>();
      let totalScore = 0;
      let scoreCount = 0;

      pageProgress.forEach((progress) => {
        if (progress.collectionId === collectionId && progress.completed) {
          completedPages++;
          completedUnits.add(progress.unit);
          totalScore += progress.score;
          scoreCount++;
        }
      });

      const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

      setCollectionProgress((prev) => {
        const updated = new Map(prev);
        updated.set(collectionId, {
          collectionId,
          name: `Collection ${collectionId}`,
          totalUnits,
          completedUnits: completedUnits.size,
          totalPages,
          completedPages,
          averageScore,
        });
        return updated;
      });
    },
    [pageProgress]
  );

  const clearProgress = useCallback(() => {
    setPageProgress(new Map());
    setUnitProgress(new Map());
    setCollectionProgress(new Map());
    localStorage.removeItem('vokabel-champion-progress');
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        pageProgress,
        unitProgress,
        collectionProgress,
        recordPageCompletion,
        getPageProgress,
        getUnitProgress,
        getCollectionProgress,
        calculateCollectionStats,
        loadProgressFromStorage,
        clearProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};
