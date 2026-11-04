/**
 * Liest die Excel-Listen "Komplett Lernjahr 1/2" (Vokabeln mit je drei Beispielsätzen).
 *
 * Lernjahr 1: A Seite | B Englisch | C Deutsch | D/E Satz | F/G engl I/deu I | H/I engl II/deu II
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

function readSentences(row: CellValue[], first: number): ImportSentence[] {
  const out: ImportSentence[] = [];
  for (let i = 0; i < 3; i++) out.push({ en: cellText(row[first + 2 * i]), de: cellText(row[first + 2 * i + 1]) });
  return out;
}

function check(item: ImportVocab, errors: string[]): void {
  const where = `Zeile ${item.excelRow} (${item.english})`;
  if (!item.english || !item.deutsch) errors.push(`${where}: Englisch oder Deutsch fehlt.`);
  if (item.sentences.some((s) => !s.en || !s.de)) errors.push(`${where}: nicht alle drei Sätze sind vollständig.`);
  if (new Set(item.sentences.map((s) => s.en.toLowerCase())).size < 3) errors.push(`${where}: Sätze sind nicht verschieden.`);
}

export function parseLernjahr1(rows: CellValue[][]): ParsedList {
  const vocab: ImportVocab[] = [];
  const errors: string[] = [];
  let unit = '';
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    if (r.every((c) => c === null || c === undefined || cellText(c) === '')) continue;
    const a = cellText(r[0]);
    const b = cellText(r[1]);
    if (!b && a) {
      // Zeile mit Unit-Titel; Hinweiszeilen am Ende der Datei werden ignoriert
      if (/^hinweis/i.test(a)) continue;
      unit = a;
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
    const item: ImportVocab = { unit, page, english: b, deutsch: cellText(r[2]), sentences: readSentences(r, 3), excelRow: i + 1 };
    check(item, errors);
    vocab.push(item);
  }
  return { vocab, errors };
}

export function parseLernjahr2(rows: CellValue[][]): ParsedList {
  const vocab: ImportVocab[] = [];
  const errors: string[] = [];
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
    const item: ImportVocab = { unit, page, english: cellText(r[2]), deutsch: cellText(r[3]), sentences: readSentences(r, 4), excelRow: i + 1 };
    check(item, errors);
    vocab.push(item);
  }
  return { vocab, errors };
}
