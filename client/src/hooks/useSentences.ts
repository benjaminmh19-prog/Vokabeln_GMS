import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import type { SentenceItem } from '@shared/sentences';

/** Lädt alle Beispielsätze (klein genug, um sie auf einmal zu holen). */
export function useSentences() {
  const query = trpc.vocab_sentences.list.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const sentences = useMemo<SentenceItem[]>(
    () =>
      (query.data ?? []).map((s) => ({
        id: s.id,
        vocabulary_id: s.vocabulary_id,
        sentence_en: s.sentence_en,
        sentence_de: s.sentence_de,
        alt_en: s.alt_en,
      })),
    [query.data],
  );
  return { sentences, isLoading: query.isLoading, error: query.error };
}
