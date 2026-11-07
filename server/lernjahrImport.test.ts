import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { readXlsxRows } from '../shared/xlsxReader';
import { cellText, parseLernjahr1, parseLernjahr2 } from '../shared/lernjahrImport';
import { parseUpload } from './adminImport';

const load = (name: string) => readXlsxRows(fs.readFileSync(path.join(__dirname, 'fixtures', name)));

describe('xlsx-Leser', () => {
  it('liest Text, Zahlen, Wahrheitswerte und Sonderzeichen', () => {
    const rows = load('lernjahr1-mini.xlsx');
    expect(rows[0][1]).toBe('English');
    expect(rows[2][0]).toBe(6);
    expect(rows[4][3]).toBe('My school is big & nice.');
    expect(rows[4][5]).toBe('We go to school <today>.');
    expect(rows[5][1]).toBe(false);
  });
  it('weist Dateien ohne ZIP-Aufbau zurück', () => {
    expect(() => readXlsxRows(Buffer.from('kein excel'))).toThrow(/xlsx/);
  });
});

describe('Lernjahr 1 lesen', () => {
  const r = parseLernjahr1(load('lernjahr1-mini.xlsx'));
  it('ordnet Vokabeln den Unit-Titeln zu und ignoriert die Hinweiszeile', () => {
    expect(r.errors).toEqual([]);
    expect(r.vocab.map((v) => [v.unit, v.page, v.english])).toEqual([
      ['Welcome / Zoom in', '6', 'welcome (to)'],
      ['Unit 1', '12', 'school'],
      ['Unit 1', '13', 'false'],
    ]);
  });
  it('macht aus Excel-Wahrheitswerten wieder Text und liest drei Sätze', () => {
    const f = r.vocab[2];
    expect(f.english).toBe('false');
    expect(f.sentences).toHaveLength(3);
    expect(f.sentences[1]).toEqual({ en: 'Is it true or false?', de: 'Ist es wahr oder falsch?' });
  });
});

describe('Lernjahr 2 lesen', () => {
  const r = parseLernjahr2(load('lernjahr2-mini.xlsx'));
  it('liest Unit, Seite, Vokabel und Sätze', () => {
    expect(r.vocab[0]).toMatchObject({ unit: 'Zoom in', page: '6', english: 'star', deutsch: 'der Stern' });
    expect(r.vocab[0].sentences[2].de).toBe('Mia zeichnet einen Stern.');
  });
  it('meldet ungültige Seitenzahlen und doppelte Sätze mit Zeilennummer', () => {
    expect(r.errors.some((e) => e.includes('Zeile 5') && e.includes('Seitenzahl'))).toBe(true);
    expect(r.errors.some((e) => e.includes('Zeile 4') && e.includes('nicht verschieden'))).toBe(true);
  });
});

describe('cellText', () => {
  it('normalisiert Leerzeichen und Wahrheitswerte', () => {
    expect(cellText('  a   b ')).toBe('a b');
    expect(cellText(true)).toBe('true');
    expect(cellText(null)).toBe('');
  });
});

describe('Listen mit mehr als drei Sätzen (Admin-Import)', () => {
  const load = (n: string) => readXlsxRows(fs.readFileSync(path.join(__dirname, 'fixtures', n)));

  it('erkennt 4 Sätze pro Vokabel', () => {
    const r = parseLernjahr2(load('lernjahr3-4saetze.xlsx'));
    expect(r.errors).toEqual([]);
    expect(r.sentencesPerVocab).toBe(4);
    expect(r.vocab).toHaveLength(3);
    expect(r.vocab[0].sentences).toHaveLength(4);
    expect(r.vocab[2]).toMatchObject({ unit: 'Zoom in', page: '12', english: 'tree' });
  });

  it('meldet einen unvollständigen vierten Satz', () => {
    const r = parseLernjahr2(load('lernjahr3-unvollstaendig.xlsx'));
    expect(r.errors.some((e) => e.includes('Sätze sind vollständig') || e.includes('vollständig'))).toBe(true);
  });

  it('verlangt mindestens drei Sätze', () => {
    const r = parseLernjahr2(load('lernjahr3-zu-wenig.xlsx'));
    expect(r.errors.join(' ')).toContain('mindestens 3');
  });

  it('parseUpload liest base64 und meldet Fehler lesbar', () => {
    const ok = parseUpload(fs.readFileSync(path.join(__dirname, 'fixtures', 'lernjahr3-4saetze.xlsx')).toString('base64'), 2);
    expect(ok.errors).toEqual([]);
    expect(ok.parsed?.sentencesPerVocab).toBe(4);
    const bad = parseUpload(Buffer.from('keine excel datei').toString('base64'), 2);
    expect(bad.errors[0]).toContain('.xlsx');
  });
});
