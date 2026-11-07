/**
 * Import einer Excel-Liste (Vokabeln mit mehreren Beispielsätzen) aus dem Admin-Bereich.
 *
 * Eine Sammlung wird über das Lernjahr gefunden: gibt es genau eine mit diesem Lernjahr,
 * werden ihre Vokabeln und Sätze ersetzt; gibt es keine, wird sie angelegt.
 * Der Austausch läuft in einer Transaktion (bei einem Fehler bleibt alles wie vorher).
 */
import { randomUUID } from 'node:crypto';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '../drizzle/schema';
import { getDb } from './db';
import { readXlsxRows } from '../shared/xlsxReader';
import { parseLernjahr1, parseLernjahr2, type ParsedList } from '../shared/lernjahrImport';

export type ListFormat = 1 | 2;

export interface ImportSummary {
  vocabCount: number;
  sentenceCount: number;
  sentencesPerVocab: number;
  units: { unit: string; count: number }[];
  collection: {
    id: string;
    name: string;
    isNew: boolean;
    oldVocabCount: number;
    oldSentenceCount: number;
  };
}

export interface ImportResult {
  ok: boolean;
  errors: string[];
  summary?: ImportSummary;
  applied: boolean;
  /** Sicherung der ersetzten Daten (nur wenn angewendet und etwas ersetzt wurde) */
  backup?: { collection: string; name: string; vocabulary: unknown[]; sentences: unknown[] };
}

/** Datei lesen und prüfen, ohne Datenbank. */
export function parseUpload(fileBase64: string, format: ListFormat): { parsed?: ParsedList; errors: string[] } {
  let rows;
  try {
    rows = readXlsxRows(Buffer.from(fileBase64, 'base64'));
  } catch (e) {
    return { errors: [`Die Datei konnte nicht gelesen werden (${e instanceof Error ? e.message : 'unbekannter Fehler'}). Bitte eine .xlsx-Datei hochladen.`] };
  }
  const parsed = format === 1 ? parseLernjahr1(rows) : parseLernjahr2(rows);
  if (parsed.vocab.length === 0 && parsed.errors.length === 0) {
    return { errors: ['In der Datei wurden keine Vokabeln gefunden. Stimmt das gewählte Spaltenformat?'] };
  }
  return { parsed, errors: parsed.errors };
}

export async function importList(opts: {
  fileBase64: string;
  format: ListFormat;
  year: number;
  name?: string;
  apply: boolean;
}): Promise<ImportResult> {
  const { parsed, errors } = parseUpload(opts.fileBase64, opts.format);
  if (!parsed || errors.length > 0) {
    return { ok: false, errors: errors.slice(0, 40), applied: false };
  }
  const db = await getDb();
  if (!db) return { ok: false, errors: ['Keine Verbindung zur Datenbank.'], applied: false };

  const existing = await db.select().from(schema.collections).where(eq(schema.collections.learning_year, opts.year));
  if (existing.length > 1) {
    return {
      ok: false,
      errors: [`Es gibt ${existing.length} Sammlungen mit Lernjahr ${opts.year} (${existing.map((c) => c.name).join(', ')}). Bitte nur eine pro Lernjahr verwenden.`],
      applied: false,
    };
  }

  let collection: { id: string; name: string; isNew: boolean };
  if (existing.length === 1) {
    collection = { id: existing[0].id, name: existing[0].name, isNew: false };
  } else {
    const name = opts.name?.trim();
    if (!name) return { ok: false, errors: [`Für Lernjahr ${opts.year} gibt es noch keine Sammlung. Bitte einen Namen angeben.`], applied: false };
    const preferred = `col-${String(opts.year).padStart(3, '0')}`;
    const taken = await db.select({ id: schema.collections.id }).from(schema.collections).where(eq(schema.collections.id, preferred));
    collection = { id: taken.length ? randomUUID() : preferred, name, isNew: true };
  }

  const oldVocab = collection.isNew
    ? []
    : await db.select().from(schema.admin_vocabulary).where(eq(schema.admin_vocabulary.collection_id, collection.id));
  const oldIds = oldVocab.map((v) => v.id);
  const oldSentences = oldIds.length
    ? await db.select().from(schema.vocab_sentences).where(inArray(schema.vocab_sentences.vocabulary_id, oldIds))
    : [];

  const units = new Map<string, number>();
  for (const v of parsed.vocab) units.set(v.unit, (units.get(v.unit) ?? 0) + 1);
  const summary: ImportSummary = {
    vocabCount: parsed.vocab.length,
    sentenceCount: parsed.vocab.length * parsed.sentencesPerVocab,
    sentencesPerVocab: parsed.sentencesPerVocab,
    units: Array.from(units, ([unit, count]) => ({ unit, count })),
    collection: { ...collection, oldVocabCount: oldVocab.length, oldSentenceCount: oldSentences.length },
  };

  if (!opts.apply) return { ok: true, errors: [], summary, applied: false };

  const BATCH = 500;
  await db.transaction(async (tx) => {
    if (collection.isNew) {
      await tx.insert(schema.collections).values({ id: collection.id, name: collection.name, learning_year: opts.year });
    } else {
      if (oldIds.length) await tx.delete(schema.vocab_sentences).where(inArray(schema.vocab_sentences.vocabulary_id, oldIds));
      await tx.delete(schema.admin_vocabulary).where(eq(schema.admin_vocabulary.collection_id, collection.id));
    }
    const ids = parsed.vocab.map(() => randomUUID());
    for (let i = 0; i < parsed.vocab.length; i += BATCH) {
      await tx.insert(schema.admin_vocabulary).values(
        parsed.vocab.slice(i, i + BATCH).map((v, k) => ({
          id: ids[i + k],
          collection_id: collection.id,
          unit: v.unit,
          page: v.page,
          english: v.english,
          deutsch: v.deutsch,
        })),
      );
    }
    const sentences = parsed.vocab.flatMap((v, idx) =>
      v.sentences.map((s) => ({ id: randomUUID(), vocabulary_id: ids[idx], sentence_en: s.en, sentence_de: s.de })),
    );
    for (let i = 0; i < sentences.length; i += BATCH) {
      await tx.insert(schema.vocab_sentences).values(sentences.slice(i, i + BATCH)).onConflictDoNothing();
    }
  });

  return {
    ok: true,
    errors: [],
    summary,
    applied: true,
    backup: collection.isNew ? undefined : { collection: collection.id, name: collection.name, vocabulary: oldVocab, sentences: oldSentences },
  };
}
