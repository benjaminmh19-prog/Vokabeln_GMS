import { describe, expect, it } from 'vitest';
import {
  buildMemoryPairs,
  isSentenceCorrect,
  matchSentencesToVocab,
  normalizeWord,
  parseSentenceMarkdown,
  pickSentences,
  prepareScramble,
  tokenizeSentence,
} from '@shared/sentences';

const TABLE = `| Englisches Wort / Ausdruck | Beispielsatz (Englisch) | Übersetzung (Deutsch) |
| :--- | :--- | :--- |
| welcome (to) | Welcome to our green school today. | Willkommen in unserer grünen Schule heute. |
| zero (0) | I have zero cats at home. | Ich habe null Katzen zu Hause. |
| I'm (= I am) | I'm a student at a big school. | Ich bin ein Schüler an einer großen Schule. |
`;

describe('parseSentenceMarkdown', () => {
  it('liest Zeilen und überspringt Kopf- und Trennzeile', () => {
    const rows = parseSentenceMarkdown(TABLE);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({
      word: 'welcome (to)',
      en: 'Welcome to our green school today.',
      de: 'Willkommen in unserer grünen Schule heute.',
    });
  });
});

describe('matchSentencesToVocab', () => {
  const vocab = [
    { id: 'a', english: 'welcome (to)', deutsch: 'willkommen' },
    { id: 'b', english: 'zero', deutsch: 'null' },
    { id: 'c', english: "I'm (= I am)", deutsch: 'ich bin' },
    { id: 'd1', english: 'number', deutsch: 'die Zahl' },
    { id: 'd2', english: 'number', deutsch: 'die Anzahl' },
    { id: 'e1', english: 'cat', deutsch: 'die Katze' },
    { id: 'e2', english: 'cat', deutsch: 'die Katze' },
  ];
  it('ordnet exakt und ohne Klammern zu, meldet Mehrdeutiges und Fehlendes', () => {
    const rows = [
      ...parseSentenceMarkdown(TABLE),
      { word: 'number', en: 'Eight is my lucky number.', de: 'Acht ist meine Glückszahl.' },
      { word: 'unicorn', en: 'A unicorn.', de: 'Ein Einhorn.' },
      { word: 'cat', en: 'My black cat sleeps on the bed.', de: 'Meine schwarze Katze schläft auf dem Bett.' },
    ];
    const r = matchSentencesToVocab(rows, vocab);
    expect(r.matched.map((m) => m.vocabs.map((v) => v.id))).toEqual([['a'], ['b'], ['c'], ['e1', 'e2']]);
    expect(r.ambiguous).toHaveLength(1);
    expect(r.ambiguous[0].candidates.map((c) => c.id)).toEqual(['d1', 'd2']);
    expect(r.unmatched.map((u) => u.word)).toEqual(['unicorn']);
  });
  it('erkennt gleiche Bedeutung bei anderer Reihenfolge der Übersetzungen', () => {
    const v = [
      { id: 'n1', english: 'number', deutsch: 'die Zahl; die Nummer; die Anzahl' },
      { id: 'n2', english: 'number', deutsch: 'die Anzahl; die Nummer; die Zahl' },
    ];
    const r = matchSentencesToVocab([{ word: 'number', en: 'Eight is my lucky number.', de: 'Acht ist meine Glückszahl.' }], v);
    expect(r.ambiguous).toHaveLength(0);
    expect(r.matched[0].vocabs.map((x) => x.id)).toEqual(['n1', 'n2']);
  });
  it('normalisiert Klammern', () => {
    expect(normalizeWord('Zero (0)')).toBe('zero');
    expect(normalizeWord('Sorry.')).toBe('sorry');
  });
});

describe('Sätze bilden', () => {
  it('trennt das Satzzeichen am Ende ab und lässt Kommas am Wort', () => {
    expect(tokenizeSentence('Hello, what is your name?')).toEqual({
      tokens: ['Hello,', 'what', 'is', 'your', 'name'],
      endMark: '?',
    });
  });
  it('prüft Reihenfolge, akzeptiert Alternativen und typografische Apostrophe', () => {
    const s = "I don't like cold weather in winter.";
    expect(isSentenceCorrect(tokenizeSentence(s).tokens, s)).toBe(true);
    expect(isSentenceCorrect(['I', 'like', "don't", 'cold', 'weather', 'in', 'winter'], s)).toBe(false);
    expect(isSentenceCorrect(['In', 'winter', 'I', "don’t", 'like', 'cold', 'weather'], s, ['In winter I don\'t like cold weather.'])).toBe(true);
  });
  it('wählt pro Vokabel höchstens einen Satz', () => {
    const items = [
      { id: '1', vocabulary_id: 'a', sentence_en: 'A one.', sentence_de: 'Eins.' },
      { id: '2', vocabulary_id: 'a', sentence_en: 'A two.', sentence_de: 'Zwei.' },
      { id: '3', vocabulary_id: 'b', sentence_en: 'B.', sentence_de: 'B.' },
      { id: '4', vocabulary_id: 'x', sentence_en: 'X.', sentence_de: 'X.' },
      { id: '5', vocabulary_id: 'b2', sentence_en: 'B.', sentence_de: 'B.' },
    ];
    const picked = pickSentences(items, new Set(['a', 'b', 'b2']), 20);
    expect(picked).toHaveLength(2);
    expect(new Set(picked.map((p) => p.vocabulary_id))).toEqual(new Set(['a', 'b']));
    expect(pickSentences(items, new Set(['a', 'b']), 1)).toHaveLength(1);
  });
});

describe('prepareScramble', () => {
  it('gibt bei Verben (to) vor und fragt nur den Rest ab', () => {
    const w = prepareScramble('to play', 'spielen');
    expect(w?.prefix).toBe('(to)');
    expect(w?.cells.map((c) => c.ch).join('')).toBe('play');
    expect(w?.full).toBe('to play');
  });
  it('lässt Klammern, Varianten und Satzzeichen weg', () => {
    expect(prepareScramble('welcome (to)', 'willkommen')?.full).toBe('welcome');
    expect(prepareScramble('life, lives', 'das Leben')?.full).toBe('life');
    expect(prepareScramble('Sorry.', 'Tut mir leid.')?.full).toBe('Sorry');
  });
  it('markiert Leerzeichen und Bindestriche als fest', () => {
    const w = prepareScramble('exercise book', 'das Übungsheft');
    expect(w?.cells.filter((c) => c.kind === 'letter')).toHaveLength(12);
    expect(w?.cells.find((c) => c.kind === 'fixed')?.ch).toBe(' ');
  });
  it('lehnt Zahlen, Satzbausteine und zu lange Einträge ab', () => {
    expect(prepareScramble('zero (0)', 'null')?.full).toBe('zero');
    expect(prepareScramble('Excuse me!', 'Entschuldigung!')).toBeNull();
    expect(prepareScramble('Can you help me?', 'Kannst du mir helfen?')).toBeNull();
    expect(prepareScramble('x', 'x')).toBeNull();
    expect(prepareScramble('an', 'ein')?.full).toBe('an');
    expect(prepareScramble('pair of scissors', 'die Schere')?.full).toBe('pair of scissors');
    expect(prepareScramble('Where are you from?', 'Woher kommst du?')).toBeNull();
  });
});

describe('buildMemoryPairs', () => {
  it('verwendet Kurzformen und vermeidet doppelte Karten', () => {
    const vocab = [
      { id: '1', english: 'year', deutsch: 'die Klasse; die Jahrgangsstufe; das Jahr' },
      { id: '2', english: 'class', deutsch: 'die Klasse' },
      { id: '3', english: 'to go', deutsch: 'gehen; fahren' },
      { id: '4', english: 'school', deutsch: 'die Schule' },
    ];
    const pairs = buildMemoryPairs(vocab, 4, () => 0.3);
    const de = pairs.map((p) => p.de.toLowerCase());
    expect(new Set(de).size).toBe(de.length);
    expect(pairs.length).toBe(3);
    expect(pairs.find((p) => p.en === 'to go')?.de).toBe('gehen');
  });
});
