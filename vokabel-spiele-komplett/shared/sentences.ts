/**
 * Gemeinsame Logik für Beispielsätze und die Mini-Spiele.
 * Reine Funktionen ohne React/Server-Abhängigkeiten, damit sie im Client,
 * im Import-Skript und in den Tests identisch verwendet werden.
 */

// ---------------------------------------------------------------------------
// Satz-Import (Markdown-Tabelle -> Zeilen -> Zuordnung zu Vokabeln)
// ---------------------------------------------------------------------------

export interface SentenceRow {
  /** Lernwort so, wie es in der Liste steht, z. B. "welcome (to)" */
  word: string;
  en: string;
  de: string;
}

/**
 * Liest Markdown-Tabellen mit drei Spalten:
 * Englisches Wort | Beispielsatz (Englisch) | Übersetzung (Deutsch)
 * Kopfzeile und Trennzeile werden übersprungen. Leere Zeilen auch.
 */
export function parseSentenceMarkdown(text: string): SentenceRow[] {
  const rows: SentenceRow[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line.startsWith('|')) continue;
    const cells = line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim());
    if (cells.length < 3) continue;
    const [word, en, de] = cells;
    if (!word || !en || !de) continue;
    if (/^:?-{2,}:?$/.test(word)) continue; // Trennzeile
    if (/^englisches wort/i.test(word)) continue; // Kopfzeile
    rows.push({ word, en, de });
  }
  return rows;
}

/** Vergleichsform eines Lernworts: Kleinschreibung, ohne Klammern, ohne Satzzeichen am Ende. */
export function normalizeWord(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[’`´]/g, "'")
    .replace(/[.!?…]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface VocabRef {
  id: string;
  english: string;
  deutsch?: string | null;
  collection_id?: string | null;
  unit?: string | number | null;
}

export interface MatchResult {
  /**
   * Zeile ist zugeordnet. Taucht dieselbe Vokabel in mehreren Units auf (gleiches Englisch und
   * gleiche deutsche Bedeutung), gehört der Satz zu allen diesen Einträgen.
   */
  matched: { row: SentenceRow; vocabs: VocabRef[] }[];
  /** Kein Treffer in der Vokabelliste */
  unmatched: SentenceRow[];
  /** Mehrere Vokabeln mit unterschiedlicher Bedeutung passen (z. B. "number" = Zahl / Anzahl). */
  ambiguous: { row: SentenceRow; candidates: VocabRef[] }[];
}

function sameMeaning(candidates: VocabRef[]): boolean {
  if (candidates.length === 1) return true;
  // Gleiche Bedeutung auch bei anderer Reihenfolge ("die Zahl; die Anzahl" = "die Anzahl; die Zahl")
  const key = (v: VocabRef) =>
    (v.deutsch ?? '')
      .toLowerCase()
      .split(/[;,]/)
      .map((p) => p.trim())
      .filter(Boolean)
      .sort()
      .join(';');
  const first = key(candidates[0]);
  return first !== '' && candidates.every((c) => key(c) === first);
}

/**
 * Ordnet Satzzeilen den Vokabeln zu. Zuerst gilt der exakte Text (ohne Groß-/Kleinschreibung),
 * danach die normalisierte Form ohne Klammern. Mehrdeutige Treffer werden nicht geraten.
 */
export function matchSentencesToVocab(rows: SentenceRow[], vocab: VocabRef[]): MatchResult {
  const exact = new Map<string, VocabRef[]>();
  const loose = new Map<string, VocabRef[]>();
  const push = (m: Map<string, VocabRef[]>, k: string, v: VocabRef) => {
    const list = m.get(k);
    if (list) list.push(v);
    else m.set(k, [v]);
  };
  for (const v of vocab) {
    push(exact, v.english.trim().toLowerCase(), v);
    push(loose, normalizeWord(v.english), v);
  }

  const result: MatchResult = { matched: [], unmatched: [], ambiguous: [] };
  for (const row of rows) {
    let candidates = exact.get(row.word.trim().toLowerCase()) ?? [];
    if (candidates.length === 0) candidates = loose.get(normalizeWord(row.word)) ?? [];
    if (candidates.length === 0) result.unmatched.push(row);
    else if (sameMeaning(candidates)) result.matched.push({ row, vocabs: candidates });
    else result.ambiguous.push({ row, candidates });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Sätze bilden
// ---------------------------------------------------------------------------

export interface SentenceTokens {
  /** Wörter zum Ziehen, Kommas bleiben am Wort ("Hello,") */
  tokens: string[];
  /** Satzzeichen am Satzende, wird fest hinter der Zeile angezeigt ("." "?" "!" oder "") */
  endMark: string;
}

export function tokenizeSentence(sentence: string): SentenceTokens {
  const trimmed = sentence.trim().replace(/\s+/g, ' ');
  const m = trimmed.match(/^(.*?)([.!?]+)$/);
  const body = m ? m[1].trim() : trimmed;
  return { tokens: body.split(' ').filter(Boolean), endMark: m ? m[2] : '' };
}

export function normalizeForCompare(value: string): string {
  return value
    .replace(/[’`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Prüft die gelegte Wortfolge gegen den Satz und optionale Alternativen. */
export function isSentenceCorrect(placed: string[], sentence: string, alternatives: string[] = []): boolean {
  const attempt = normalizeForCompare(placed.join(' '));
  return [sentence, ...alternatives].some((s) => normalizeForCompare(tokenizeSentence(s).tokens.join(' ')) === attempt);
}

// ---------------------------------------------------------------------------
// Buchstabensalat
// ---------------------------------------------------------------------------

export type ScrambleCell =
  | { kind: 'letter'; ch: string }
  | { kind: 'fixed'; ch: string }; // Leerzeichen, Bindestrich, Apostroph, ...

export interface ScrambleWord {
  /** Verben: "(to)" wird vorgegeben und nicht abgefragt */
  prefix: string;
  cells: ScrambleCell[];
  /** komplette Lösung zur Anzeige, z. B. "to play" */
  full: string;
  german: string;
  vocabId?: string;
}

const MIN_LETTERS = 2;
const MAX_LETTERS = 16;

/**
 * Bereitet ein Vokabelpaar für den Buchstabensalat auf. Gibt null zurück,
 * wenn der Eintrag nicht sinnvoll buchstabiert werden kann (zu kurz/lang, Zahlen, Satzbausteine).
 */
export function prepareScramble(english: string, deutsch: string, vocabId?: string): ScrambleWord | null {
  let en = english
    .replace(/\([^)]*\)/g, ' ') // "(= I am)", "(to)", "(0)"
    .split(/[;,/]/)[0] // erste Variante
    .replace(/\s+/g, ' ')
    .trim();
  if (!en) return null;
  if (/[0-9]/.test(en)) return null;
  if (/[?!]$/.test(en) || en.endsWith('...') || en.includes('…')) return null; // Satzbausteine

  en = en.replace(/\.+$/, '').trim();
  let prefix = '';
  if (/^to\s+\S/i.test(en)) {
    prefix = '(to)';
    en = en.replace(/^to\s+/i, '');
  }
  const letters = en.replace(/[^A-Za-zÄÖÜäöüß]/g, '');
  if (letters.length < MIN_LETTERS || letters.length > MAX_LETTERS) return null;
  if (en.split(' ').length > 3) return null;

  const cells: ScrambleCell[] = Array.from(en).map((ch) =>
    /[A-Za-zÄÖÜäöüß]/.test(ch) ? { kind: 'letter', ch } : { kind: 'fixed', ch },
  );
  const german = deutsch.trim();
  if (!german) return null;
  return { prefix, cells, full: prefix ? `to ${en}` : en, german, vocabId };
}

// ---------------------------------------------------------------------------
// Wörter-Memory
// ---------------------------------------------------------------------------

export interface MemoryPair {
  key: string;
  en: string;
  de: string;
}

/** Kurzform für Karten: erste Bedeutung, ohne Klammern. */
export function shortGerman(deutsch: string): string {
  return deutsch.split(/[;,/]/)[0].replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
}

export function shortEnglish(english: string): string {
  return english.split(/[;,]/)[0].replace(/\s+/g, ' ').trim();
}

/**
 * Wählt Paare mit eindeutigen Kartentexten (sonst gäbe es zwei gleiche Karten, z. B. "die Klasse").
 */
export function buildMemoryPairs<T extends { id?: string; english: string; deutsch: string }>(
  vocab: T[],
  count: number,
  rand: () => number = Math.random,
): MemoryPair[] {
  const pool = shuffled(vocab, rand);
  const usedEn = new Set<string>();
  const usedDe = new Set<string>();
  const out: MemoryPair[] = [];
  for (const v of pool) {
    const en = shortEnglish(v.english);
    const de = shortGerman(v.deutsch);
    if (!en || !de || en.length > 24 || de.length > 28) continue;
    const kEn = en.toLowerCase();
    const kDe = de.toLowerCase();
    if (usedEn.has(kEn) || usedDe.has(kDe)) continue;
    usedEn.add(kEn);
    usedDe.add(kDe);
    out.push({ key: v.id ?? `${kEn}|${kDe}`, en, de });
    if (out.length >= count) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Allgemein
// ---------------------------------------------------------------------------

export function shuffled<T>(list: T[], rand: () => number = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Mischt, bis die Reihenfolge von der Ausgangsreihenfolge abweicht (sofern möglich). */
export function shuffledDifferent<T>(list: T[], same: (a: T[], b: T[]) => boolean, rand: () => number = Math.random): T[] {
  if (list.length < 2) return [...list];
  for (let i = 0; i < 20; i++) {
    const s = shuffled(list, rand);
    if (!same(s, list)) return s;
  }
  return shuffled(list, rand);
}

export interface SentenceItem {
  id: string;
  vocabulary_id: string;
  sentence_en: string;
  sentence_de: string;
  alt_en?: string[] | null;
}

/**
 * Wählt für jede Vokabel höchstens einen zufälligen Satz, damit in einer Runde
 * kein Lernwort doppelt vorkommt, und liefert höchstens `count` Sätze.
 */
export function pickSentences(sentences: SentenceItem[], allowedVocabIds: Set<string>, count: number, rand: () => number = Math.random): SentenceItem[] {
  const byVocab = new Map<string, SentenceItem[]>();
  for (const s of sentences) {
    if (!allowedVocabIds.has(s.vocabulary_id)) continue;
    const list = byVocab.get(s.vocabulary_id);
    if (list) list.push(s);
    else byVocab.set(s.vocabulary_id, [s]);
  }
  const seen = new Set<string>();
  const one: SentenceItem[] = [];
  for (const list of Array.from(byVocab.values())) {
    const s = list[Math.floor(rand() * list.length)];
    const key = normalizeForCompare(s.sentence_en);
    if (seen.has(key)) continue; // derselbe Satz hängt an mehreren Einträgen derselben Vokabel
    seen.add(key);
    one.push(s);
  }
  return shuffled(one, rand).slice(0, count);
}
