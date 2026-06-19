import { useState, useEffect } from 'react';
import { Unit, Vocabulary } from '@/types/game';

export const useVocabulary = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        const response = await fetch('/data/vocabulary.json');
        if (!response.ok) throw new Error('Failed to load vocabulary');

        const data = await response.json();
        const unitsArray = Object.entries(data).map(([name, pages]) => ({
          name,
          pages: pages as { [key: string]: Vocabulary[] },
        }));

        setUnits(unitsArray);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUnits([]);
      } finally {
        setLoading(false);
      }
    };

    loadVocabulary();
  }, []);

  return { units, loading, error };
};
