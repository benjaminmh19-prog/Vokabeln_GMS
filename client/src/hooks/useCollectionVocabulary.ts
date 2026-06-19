import { useState, useEffect } from 'react';
import { Vocabulary } from '@/types/game';
import { useAdmin } from '@/contexts/AdminContext';

interface UseCollectionVocabularyResult {
  vocabulary: Vocabulary[];
  isLoading: boolean;
  error: string | null;
  loadVocabulary: (collectionId: string, unit: number, page: number) => Promise<void>;
}

export function useCollectionVocabulary(): UseCollectionVocabularyResult {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAllVocabulary } = useAdmin();

  const loadVocabulary = async (collectionId: string, unit: number, page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Get all vocabulary for the collection
      const allVocab = await getAllVocabulary();
      
      // Filter by collection ID, unit, and page
      const filtered = allVocab.filter(
        (v: any) => 
          v.collection_id === collectionId && 
          v.unit === unit && 
          v.page === page
      );

      // Transform to Vocabulary type
      const transformed: Vocabulary[] = filtered.map((v: any) => ({
        id: v.id,
        english: v.english_word,
        deutsch: v.german_word,
        unit: v.unit,
        page: v.page,
        collectionId: v.collection_id,
      }));

      setVocabulary(transformed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vocabulary';
      setError(errorMessage);
      console.error('Error loading vocabulary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vocabulary,
    isLoading,
    error,
    loadVocabulary,
  };
}
