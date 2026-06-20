import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export interface Vocabulary {
  id: string;
  collection_id: string;
  unit: string;
  page: number;
  english: string;
  deutsch: string;
}

function normalizeUnit(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

function parsePage(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    return parseInt(value, 10);
  }
  return NaN;
}

/** Display label for a unit (supports "Unit 1", "1", "Zoom in", etc.) */
export function formatUnitLabel(unit: string): string {
  const trimmed = unit.trim();
  if (/^unit\s+\d+$/i.test(trimmed)) return trimmed;
  if (/^\d+$/.test(trimmed)) return `Unit ${trimmed}`;
  return trimmed;
}

/** Sort numbered units first, then named units like "Zoom in" */
export function sortUnits(units: string[]): string[] {
  return [...units].sort((a, b) => {
    const extractNum = (u: string) => {
      const match = u.match(/(?:unit\s*)?(\d+)/i);
      return match ? parseInt(match[1], 10) : null;
    };
    const numA = extractNum(a);
    const numB = extractNum(b);
    if (numA !== null && numB !== null) return numA - numB;
    if (numA !== null) return -1;
    if (numB !== null) return 1;
    return a.localeCompare(b, 'de');
  });
}

export function useVocabularyByCollection(collectionId?: string) {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const transformed = vocabQuery.data
        .filter((v) => v.collection_id === collectionId)
        .map((v) => ({
          id: v.id,
          collection_id: v.collection_id,
          unit: normalizeUnit(v.unit),
          page: parsePage(v.page),
          english: v.english,
          deutsch: v.deutsch,
        }))
        .filter((v) => v.unit && !isNaN(v.page));

      setVocabulary(transformed);
      setError(null);
      setIsLoading(false);
    }
  }, [collectionId, vocabQuery.data, vocabQuery.isLoading, vocabQuery.error]);

  const getUnits = (): string[] => {
    if (vocabulary.length === 0) return [];
    const units = Array.from(new Set(vocabulary.map((v) => v.unit)));
    return sortUnits(units);
  };

  const getPagesByUnit = (unit: string): number[] => {
    if (vocabulary.length === 0) return [];
    const pages = Array.from(
      new Set(vocabulary.filter((v) => v.unit === unit).map((v) => v.page))
    );
    return pages.sort((a, b) => a - b);
  };

  const getVocabularyByPage = (unit: string, page: number): Vocabulary[] => {
    return vocabulary.filter((v) => v.unit === unit && v.page === page);
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
