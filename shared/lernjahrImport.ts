/**
 * Liest die Excel-Listen "Komplett Lernjahr 1/2" (Vokabeln mit je drei Beispielsätzen).
 *
 * Lernjahr 1: A Seite | B Englisch | C Deutsch | danach Satzpaare Englisch/Deutsch (3, auch 4 bis 6 möglich; die Zahl wird erkannt)
 *             Units stehen als eigene Zeilen davor ("Unit 1: My school and I").
 * Lernjahr 2: A Unit | B Seite | C Englisch | D Deutsch | E/F Satz | G/H engl I/deu I | I/J engl II/deu II
 */
import type { CellValue } from './xlsxReader';

export interface ImportSentence {
  en: string;
  de: string;
}

export interface ImportVocab {
  unit: string;
  page: string;
  english: string;
  deutsch: string;
  sentences: ImportSentence[];
  /** Zeile in der Excel-Datei (1-basiert), für Fehlermeldungen */
  excelRow: number;
}

export interface ParsedList {
  vocab: ImportVocab[];
  errors: string[];
  /** Sätze pro Vokabel (aus den Spalten erkannt; 3 bei den bisherigen Listen) */
  sentencesPerVocab: number;
}

export const MIN_SENTENCES = 3;
export const MAX_SENTENCES = 6;

/**
 * Erkennt, wie viele Satzpaare (Englisch + Deutsch) die Liste hat:
 * ab Spalte `first` zählen die Spalten bis zur letzten befüllten Zelle in einer Datenzeile.
 */
function detectPairs(rows: CellValue[][], first: number): number {
  let last = -1;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    for (let c = r.length - 1; c > last; c--) {
      if (cellText(r[c]) !== '') {
        last = c;
        break;
      }
    }
  }
  return last < first ? 0 : Math.ceil((last - first + 1) / 2);
}

/** Excel macht aus "true" und "false" Wahrheitswerte; hier wieder Text. */
export function cellText(v: CellValue | undefined): string {
  if (v === null || v === undefined) return '';
  if (v === true) return 'true';
  if (v === false) return 'false';
  return String(v).replace(/\s+/g, ' ').trim();
}

function pageOf(v: CellValue | undefined): string | null {
  if (typeof v === 'number' && Number.isInteger(v)) return String(v);
  const t = cellText(v);
  return /^\d+$/.test(t) ? t : null;
}

function readSentences(row: CellValue[], first: number, pairs: number): ImportSentence[] {
  const out: ImportSentence[] = [];
  for (let i = 0; i < pairs; i++) out.push({ en: cellText(row[first + 2 * i]), de: cellText(row[first + 2 * i + 1]) });
  return out;
}

function check(item: ImportVocab, errors: string[]): void {
  const where = `Zeile ${item.excelRow} (${item.english})`;
  const n = item.sentences.length;
  if (!item.english || !item.deutsch) errors.push(`${where}: Englisch oder Deutsch fehlt.`);
  if (item.sentences.some((s) => !s.en || !s.de)) errors.push(`${where}: nicht alle ${n} Sätze sind vollständig.`);
  if (new Set(item.sentences.map((s) => s.en.toLowerCase())).size < n) errors.push(`${where}: Sätze sind nicht verschieden.`);
}

function pairsOrError(rows: CellValue[][], first: number, errors: string[]): number {
  const pairs = detectPairs(rows, first);
  if (pairs < MIN_SENTENCES) {
    errors.push(`In der Liste sind nur ${pairs} Satzpaare erkennbar, nötig sind mindestens ${MIN_SENTENCES}.`);
  } else if (pairs > MAX_SENTENCES) {
    errors.push(`In der Liste sind ${pairs} Satzpaare erkennbar (höchstens ${MAX_SENTENCES}). Steht rechts neben den Sätzen noch etwas, z. B. eine Notiz?`);
  }
  return pairs;
}

export function parseLernjahr1(rows: CellValue[][]): ParsedList {
  const vocab: ImportVocab[] = [];
  const errors: string[] = [];
  const pairs = pairsOrError(rows, 3, errors);
  let unit = '';
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    if (r.every((c) => c === null || c === undefined || cellText(c) === '')) continue;
    const a = cellText(r[0]);
    const b = cellText(r[1]);
    if (!b && a) {
      // Zeile mit Unit-Titel; Hinweiszeilen am Ende der Datei werden ignoriert
      if (/^hinweis/i.test(a)) continue;
      // nur "Unit 1" statt "Unit 1: My school and I"
      unit = a.replace(/^(Unit\s*\d+)\s*:.*$/i, '$1');
      continue;
    }
    const page = pageOf(r[0]);
    if (!unit) {
      errors.push(`Zeile ${i + 1}: Vokabel vor der ersten Unit-Zeile.`);
      continue;
    }
    if (!page) {
      errors.push(`Zeile ${i + 1} (${b}): Seitenzahl fehlt oder ist keine ganze Zahl.`);
      continue;
    }
    const item: ImportVocab = { unit, page, english: b, deutsch: cellText(r[2]), sentences: readSentences(r, 3, pairs), excelRow: i + 1 };
    check(item, errors);
    vocab.push(item);
  }
  return { vocab, errors, sentencesPerVocab: pairs };
}

export function parseLernjahr2(rows: CellValue[][]): ParsedList {
  const vocab: ImportVocab[] = [];
  const errors: string[] = [];
  const pairs = pairsOrError(rows, 4, errors);
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    if (r.every((c) => c === null || c === undefined || cellText(c) === '')) continue;
    const unit = cellText(r[0]);
    const page = pageOf(r[1]);
    if (!unit) {
      errors.push(`Zeile ${i + 1}: Unit fehlt.`);
      continue;
    }
    if (!page) {
      errors.push(`Zeile ${i + 1} (${cellText(r[2])}): Seitenzahl fehlt oder ist keine ganze Zahl.`);
      continue;
    }
    const item: ImportVocab = { unit, page, english: cellText(r[2]), deutsch: cellText(r[3]), sentences: readSentences(r, 4, pairs), excelRow: i + 1 };
    check(item, errors);
    vocab.push(item);
  }
  return { vocab, errors, sentencesPerVocab: pairs };
}
