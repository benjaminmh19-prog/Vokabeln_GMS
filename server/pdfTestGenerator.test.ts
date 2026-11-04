import { describe, expect, it } from 'vitest';
import { buildQuestionAnswer, getDefaultInstructions, isSentenceItem, isSentenceTest, wordsBeforeSentences } from '../client/src/lib/pdfTestGenerator';

const word = { english: 'school', deutsch: 'die Schule' };
const sentence = { english: 'I go to school every day.', deutsch: 'Ich gehe jeden Tag zur Schule.' };

describe('Testtypen', () => {
  it('Wörter: Richtung EN→DE, DE→EN und gemischt', () => {
    expect(buildQuestionAnswer('english-to-german', word, 0)).toEqual({ question: 'school', answer: 'die Schule' });
    expect(buildQuestionAnswer('german-to-english', word, 0)).toEqual({ question: 'die Schule', answer: 'school' });
    expect(buildQuestionAnswer('mixed', word, 0).question).toBe('school');
    expect(buildQuestionAnswer('mixed', word, 1).question).toBe('die Schule');
  });

  it('Sätze: deutscher Satz als Frage, englischer als Lösung', () => {
    expect(buildQuestionAnswer('sentences-de-en', sentence, 3)).toEqual({
      question: 'Ich gehe jeden Tag zur Schule.',
      answer: 'I go to school every day.',
    });
    expect(buildQuestionAnswer('sentences-en-de', sentence, 3).question).toBe('I go to school every day.');
  });

  it('erkennt Satztests und liefert passende Anweisungen', () => {
    expect(isSentenceTest('sentences-de-en')).toBe(true);
    expect(isSentenceTest('sentences-en-de')).toBe(true);
    expect(isSentenceTest('mixed')).toBe(false);
    expect(getDefaultInstructions('sentences-de-en')).toMatch(/Sätze/);
    expect(getDefaultInstructions('english-to-german')).toMatch(/Wörter/);
  });

  it('Test mit Wörtern und Sätzen: Einträge als Satz markieren, Wörter zuerst', () => {
    expect(isSentenceItem('english-to-german', { isSentence: true })).toBe(true);
    expect(isSentenceItem('english-to-german', {})).toBe(false);
    expect(isSentenceItem('sentences-de-en', {})).toBe(true);
    const items = [{ id: 's1', isSentence: true }, { id: 'w1' }, { id: 's2', isSentence: true }, { id: 'w2' }];
    expect(wordsBeforeSentences(items).map((i) => i.id)).toEqual(['w1', 'w2', 's1', 's2']);
    expect(getDefaultInstructions('english-to-german', true)).toMatch(/Wörter[\s\S]*Sätzen/);
    expect(getDefaultInstructions('english-to-german', false)).not.toMatch(/Sätzen/);
  });
});
