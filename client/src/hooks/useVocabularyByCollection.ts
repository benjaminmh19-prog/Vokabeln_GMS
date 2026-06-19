import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export interface Vocabulary {
  id: string;
  collection_id: string;
  unit: number;
  page: number;
  english: string;
  deutsch: string;
}

// Helper function to extract unit number from string like "Unit 1" or just "1"
function parseUnit(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Extract number from "Unit 1" or just "1"
    const match = value.match(/\d+/);
    return match ? parseInt(match[0], 10) : NaN;
  }
  return NaN;
}

// Helper function to parse page number
function parsePage(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    return parseInt(value, 10);
  }
  return NaN;
}

export function useVocabularyByCollection(collectionId?: string) {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query ALL vocabulary using public tRPC endpoint
  const vocabQuery = trpc.admin_vocabulary.list.useQuery();

  useEffect(() => {
    if (!collectionId) {
      setVocabulary([]);
      setIsLoading(false);
      return;
    }

    if (vocabQuery.isLoading) {
      setIsLoading(true);
    } else if (vocabQuery.error) {
      setError('Fehler beim Laden der Vokabeln');
      setIsLoading(false);
      setVocabulary([]);
    } else if (vocabQuery.data) {
      // Transform DB data to Vocabulary interface and filter by collection
      const transformed = vocabQuery.data
        .filter(v => v.collection_id === collectionId)
        .map(v => ({
          id: v.id,
          collection_id: v.collection_id,
          unit: parseUnit(v.unit),
          page: parsePage(v.page),
          english: v.english,
          deutsch: v.deutsch,
        }))
        .filter(v => !isNaN(v.unit) && !isNaN(v.page)); // Filter out invalid entries

      setVocabulary(transformed);
      setError(null);
      setIsLoading(false);
    }
  }, [collectionId, vocabQuery.data, vocabQuery.isLoading, vocabQuery.error]);

  // Get unique units for selected collection
  const getUnits = (): number[] => {
    if (vocabulary.length === 0) return [];
    const units = Array.from(new Set(vocabulary.map(v => v.unit)));
    return units.sort((a, b) => a - b);
  };

  // Get pages for a specific unit
  const getPagesByUnit = (unit: number): number[] => {
    if (vocabulary.length === 0) return [];
    const pages = Array.from(
      new Set(vocabulary.filter(v => v.unit === unit).map(v => v.page))
    );
    return pages.sort((a, b) => a - b);
  };

  // Get vocabulary for specific page
  const getVocabularyByPage = (unit: number, page: number): Vocabulary[] => {
    return vocabulary.filter(v => v.unit === unit && v.page === page);
  };

  return {
    vocabulary,
    isLoading,
    error,
    getUnits,
    getPagesByUnit,
    getVocabularyByPage,
    refetch: vocabQuery.refetch,
  };
}
