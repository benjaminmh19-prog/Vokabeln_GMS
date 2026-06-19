import { describe, it, expect, beforeEach } from 'vitest';

interface MockVocabulary {
  id: string;
  unit: string;
  page: string;
  english: string;
  deutsch: string;
  collection_id?: string;
}

interface MockCollection {
  id?: string;
  name: string;
  year?: string;
  learning_year?: number;
}

describe('Test Generator - Collection-based Filtering', () => {
  let vocabularies: MockVocabulary[];
  let collections: MockCollection[];

  beforeEach(() => {
    // Mock collections
    collections = [
      { id: 'col-1', name: 'Lernjahr 1', year: '1', learning_year: 1 },
      { id: 'col-2', name: 'Lernjahr 2', year: '2', learning_year: 2 },
      { id: 'col-3', name: 'Lernjahr 3', year: '3', learning_year: 3 },
    ];

    // Mock vocabularies from different collections
    vocabularies = [
      // Lernjahr 1
      { id: 'v1', unit: 'Unit 1', page: '20', english: 'hello', deutsch: 'hallo', collection_id: 'col-1' },
      { id: 'v2', unit: 'Unit 1', page: '21', english: 'goodbye', deutsch: 'auf wiedersehen', collection_id: 'col-1' },
      { id: 'v3', unit: 'Unit 2', page: '35', english: 'brother', deutsch: 'bruder', collection_id: 'col-1' },
      // Lernjahr 2
      { id: 'v4', unit: 'Unit 3', page: '57', english: 'pet', deutsch: 'haustier', collection_id: 'col-2' },
      { id: 'v5', unit: 'Unit 3', page: '58', english: 'guitar', deutsch: 'gitarre', collection_id: 'col-2' },
      { id: 'v6', unit: 'Unit 4', page: '79', english: 'church', deutsch: 'kirche', collection_id: 'col-2' },
      // Lernjahr 3
      { id: 'v7', unit: 'Unit 5', page: '101', english: 'rain', deutsch: 'regen', collection_id: 'col-3' },
      { id: 'v8', unit: 'Unit 6', page: '114', english: 'apple', deutsch: 'apfel', collection_id: 'col-3' },
    ];
  });

  it('should filter vocabularies by collection', () => {
    const selectedCollection = 'col-1';
    const filtered = vocabularies.filter(v => v.collection_id === selectedCollection);

    expect(filtered).toHaveLength(3);
    expect(filtered.every(v => v.collection_id === 'col-1')).toBe(true);
    expect(filtered[0].english).toBe('hello');
  });

  it('should return all vocabularies when collection is "all"', () => {
    const selectedCollection = 'all';
    const filtered = selectedCollection === 'all' 
      ? vocabularies 
      : vocabularies.filter(v => v.collection_id === selectedCollection);

    expect(filtered).toHaveLength(8);
  });

  it('should filter by collection and unit', () => {
    const selectedCollection = 'col-2';
    const selectedUnit = 'Unit 3';
    
    const filtered = vocabularies
      .filter(v => v.collection_id === selectedCollection)
      .filter(v => v.unit === selectedUnit);

    expect(filtered).toHaveLength(2);
    expect(filtered.every(v => v.collection_id === 'col-2' && v.unit === 'Unit 3')).toBe(true);
  });

  it('should filter by collection and pages', () => {
    const selectedCollection = 'col-1';
    const selectedPages = ['20', '35'];
    
    const filtered = vocabularies
      .filter(v => v.collection_id === selectedCollection)
      .filter(v => selectedPages.includes(v.page));

    expect(filtered).toHaveLength(2);
    expect(filtered.map(v => v.page).sort()).toEqual(['20', '35']);
  });

  it('should get unique units for a collection', () => {
    const selectedCollection = 'col-2';
    
    const filtered = vocabularies.filter(v => v.collection_id === selectedCollection);
    const uniqueUnits = Array.from(new Set(filtered.map(v => v.unit)));

    expect(uniqueUnits).toEqual(['Unit 3', 'Unit 4']);
  });

  it('should get unique pages for a collection and unit', () => {
    const selectedCollection = 'col-1';
    const selectedUnit = 'Unit 1';
    
    const filtered = vocabularies
      .filter(v => v.collection_id === selectedCollection)
      .filter(v => v.unit === selectedUnit);
    const uniquePages = Array.from(new Set(filtered.map(v => v.page)));

    expect(uniquePages).toEqual(['20', '21']);
  });

  it('should select random vocabularies from filtered collection', () => {
    const selectedCollection = 'col-2';
    const numberOfWords = 2;
    
    const filtered = vocabularies.filter(v => v.collection_id === selectedCollection);
    
    // Shuffle
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numberOfWords);

    expect(selected).toHaveLength(2);
    expect(selected.every(v => v.collection_id === 'col-2')).toBe(true);
  });

  it('should handle empty collection', () => {
    const selectedCollection = 'col-nonexistent';
    const filtered = vocabularies.filter(v => v.collection_id === selectedCollection);

    expect(filtered).toHaveLength(0);
  });

  it('should validate number of words does not exceed available', () => {
    const selectedCollection = 'col-1';
    const numberOfWords = 10;
    
    const filtered = vocabularies.filter(v => v.collection_id === selectedCollection);
    const isValid = numberOfWords <= filtered.length;

    expect(isValid).toBe(false);
    expect(filtered.length).toBe(3);
  });

  it('should generate multiple tests from same collection', () => {
    const selectedCollection = 'col-2';
    const numberOfTests = 3;
    const numberOfWords = 2;
    
    const filtered = vocabularies.filter(v => v.collection_id === selectedCollection);
    const tests = [];

    for (let i = 0; i < numberOfTests; i++) {
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, numberOfWords);
      tests.push(selected);
    }

    expect(tests).toHaveLength(3);
    expect(tests.every(test => test.length === 2)).toBe(true);
    expect(tests.every(test => test.every(v => v.collection_id === 'col-2'))).toBe(true);
  });

  it('should maintain collection context when switching between units', () => {
    const selectedCollection = 'col-1';
    let selectedUnit = 'Unit 1';
    
    let filtered = vocabularies
      .filter(v => v.collection_id === selectedCollection)
      .filter(v => v.unit === selectedUnit);
    
    expect(filtered).toHaveLength(2);

    // Switch to Unit 2
    selectedUnit = 'Unit 2';
    filtered = vocabularies
      .filter(v => v.collection_id === selectedCollection)
      .filter(v => v.unit === selectedUnit);
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].english).toBe('brother');
  });
});
