import vocabularyData from '@/data/vocabulary.json';
import { AdminVocabulary } from '@/contexts/AdminContext';
import { Vocabulary } from '@/types/game';

/**
 * Load all vocabulary from the local JSON file
 * Converts the nested structure into a flat AdminVocabulary array
 * Uses unique IDs with 'json_' prefix to avoid conflicts with Supabase
 */
export function loadVocabularyFromJSON(): AdminVocabulary[] {
  const allVocabulary: AdminVocabulary[] = [];
  let globalIndex = 0;

  // Iterate through all units
  Object.entries(vocabularyData).forEach(([unitName, pages]) => {
    // Iterate through all pages in the unit
    Object.entries(pages as Record<string, Vocabulary[]>).forEach(([pageNum, words]) => {
      // Iterate through all words on the page
      words.forEach((word) => {
        allVocabulary.push({
          // Use unique ID with 'json_' prefix to distinguish from Supabase
          id: `json_${unitName}_${pageNum}_${globalIndex}`,
          unit: unitName,
          page: pageNum,
          english: word.english,
          deutsch: word.deutsch,
        });
        globalIndex++;
      });
    });
  });

  return allVocabulary;
}

/**
 * Merge vocabulary from JSON and Supabase
 * Uses unique ID prefixes to prevent conflicts:
 * - JSON vocabulary: id starts with 'json_'
 * - Supabase vocabulary: id is UUID or numeric
 * 
 * Deduplication logic:
 * - If same english+deutsch exists in both, Supabase takes precedence
 * - Otherwise, both are included
 */
export function mergeVocabulary(
  jsonVocab: AdminVocabulary[],
  supabaseVocab: AdminVocabulary[]
): AdminVocabulary[] {
  // Create a map of Supabase vocabulary for deduplication
  // Key: english + deutsch combination (language-agnostic)
  const supabaseMap = new Map(
    supabaseVocab.map((v) => [
      `${v.english.toLowerCase()}|${v.deutsch.toLowerCase()}`,
      v
    ])
  );

  // Filter out JSON vocabulary that has exact duplicate in Supabase
  const uniqueJsonVocab = jsonVocab.filter((v) => {
    const key = `${v.english.toLowerCase()}|${v.deutsch.toLowerCase()}`;
    return !supabaseMap.has(key);
  });

  // Combine: Supabase vocabulary + unique JSON vocabulary
  // Supabase takes precedence for duplicates
  return [...supabaseVocab, ...uniqueJsonVocab];
}

/**
 * Get all vocabulary combined from JSON and Supabase
 * Ensures no ID conflicts and proper deduplication
 */
export async function getAllVocabularyCombined(
  supabaseVocab: AdminVocabulary[]
): Promise<AdminVocabulary[]> {
  const jsonVocab = loadVocabularyFromJSON();
  return mergeVocabulary(jsonVocab, supabaseVocab);
}

/**
 * Check if a vocabulary item is from JSON (local)
 */
export function isJsonVocabulary(vocab: AdminVocabulary): boolean {
  return vocab.id?.startsWith('json_') ?? false;
}

/**
 * Check if a vocabulary item is from Supabase (remote)
 */
export function isSupabaseVocabulary(vocab: AdminVocabulary): boolean {
  return !(vocab.id?.startsWith('json_') ?? false);
}

/**
 * Get source of vocabulary item for debugging
 */
export function getVocabularySource(vocab: AdminVocabulary): 'json' | 'supabase' {
  return isJsonVocabulary(vocab) ? 'json' : 'supabase';
}

/**
 * Separate vocabulary by source
 */
export function separateVocabularyBySource(
  vocabulary: AdminVocabulary[]
): { json: AdminVocabulary[]; supabase: AdminVocabulary[] } {
  return {
    json: vocabulary.filter(isJsonVocabulary),
    supabase: vocabulary.filter(isSupabaseVocabulary),
  };
}
