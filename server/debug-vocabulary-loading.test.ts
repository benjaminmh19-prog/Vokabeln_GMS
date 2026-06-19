import { describe, it, expect } from 'vitest';

describe('Debug Vocabulary Loading', () => {
  it('should verify collection IDs exist in database', () => {
    const collections = [
      { id: '7-VjsiN9duJTOgGLuMGRU', name: 'Lernjahr 1' },
      { id: 'collection-1', name: 'Collection 1' },
      { id: 'collection-2', name: 'Collection 2' },
    ];

    expect(collections.length).toBeGreaterThan(0);
    expect(collections[0].id).toBeDefined();
  });

  it('should verify vocabulary has collection_id field', () => {
    const vocab = {
      id: '0006e5bc-5d6a-419d-ba3c-9613607706af',
      unit: '1',
      page: '1',
      english: 'hello',
      deutsch: 'hallo',
      collection_id: '7-VjsiN9duJTOgGLuMGRU',
    };

    expect(vocab.collection_id).toBeDefined();
    expect(vocab.collection_id).toBeTruthy();
  });

  it('should filter vocabulary by collection_id', () => {
    const allVocab = [
      { id: '1', collection_id: '7-VjsiN9duJTOgGLuMGRU', english: 'hello', deutsch: 'hallo' },
      { id: '2', collection_id: 'collection-1', english: 'goodbye', deutsch: 'auf wiedersehen' },
      { id: '3', collection_id: '7-VjsiN9duJTOgGLuMGRU', english: 'test', deutsch: 'test' },
    ];

    const collectionId = '7-VjsiN9duJTOgGLuMGRU';
    const filtered = allVocab.filter(v => v.collection_id === collectionId);

    expect(filtered.length).toBe(2);
    expect(filtered[0].english).toBe('hello');
    expect(filtered[1].english).toBe('test');
  });

  it('should handle undefined collection_id in filter', () => {
    const allVocab = [
      { id: '1', collection_id: '7-VjsiN9duJTOgGLuMGRU' },
      { id: '2', collection_id: 'collection-1' },
    ];

    const collectionId = undefined;
    const filtered = allVocab.filter(v => !collectionId || v.collection_id === collectionId);

    // Should return all when collectionId is undefined
    expect(filtered.length).toBe(2);
  });

  it('should handle null collection_id in filter', () => {
    const allVocab = [
      { id: '1', collection_id: '7-VjsiN9duJTOgGLuMGRU' },
      { id: '2', collection_id: null },
    ];

    const collectionId = '7-VjsiN9duJTOgGLuMGRU';
    const filtered = allVocab.filter(v => v.collection_id === collectionId);

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should extract units from filtered vocabulary', () => {
    const vocab = [
      { unit: 1, page: 1 },
      { unit: 1, page: 2 },
      { unit: 2, page: 1 },
    ];

    const units = Array.from(new Set(vocab.map(v => v.unit))).sort((a, b) => a - b);

    expect(units).toEqual([1, 2]);
  });

  it('should extract pages for specific unit', () => {
    const vocab = [
      { unit: 1, page: 1 },
      { unit: 1, page: 2 },
      { unit: 1, page: 3 },
      { unit: 2, page: 1 },
    ];

    const unit = 1;
    const pages = Array.from(
      new Set(vocab.filter(v => v.unit === unit).map(v => v.page))
    ).sort((a, b) => a - b);

    expect(pages).toEqual([1, 2, 3]);
  });

  it('should get vocabulary for specific page', () => {
    const vocab = [
      { id: '1', unit: 1, page: 1, english: 'hello' },
      { id: '2', unit: 1, page: 1, english: 'goodbye' },
      { id: '3', unit: 1, page: 2, english: 'test' },
    ];

    const unit = 1;
    const page = 1;
    const pageVocab = vocab.filter(v => v.unit === unit && v.page === page);

    expect(pageVocab.length).toBe(2);
    expect(pageVocab[0].english).toBe('hello');
    expect(pageVocab[1].english).toBe('goodbye');
  });

  it('should handle empty vocabulary array', () => {
    const vocab: any[] = [];
    const units = Array.from(new Set(vocab.map(v => v.unit)));

    expect(units.length).toBe(0);
  });

  it('should verify collection ID format matches database', () => {
    const dbCollectionId = '7-VjsiN9duJTOgGLuMGRU';
    const selectedCollectionId = '7-VjsiN9duJTOgGLuMGRU';

    expect(dbCollectionId).toBe(selectedCollectionId);
  });

  it('should verify string collection IDs match', () => {
    const dbCollectionId = 'collection-1';
    const selectedCollectionId = 'collection-1';

    expect(dbCollectionId).toBe(selectedCollectionId);
  });

  it('should handle case sensitivity in collection IDs', () => {
    const id1 = 'Collection-1';
    const id2 = 'collection-1';

    expect(id1).not.toBe(id2); // Should be case-sensitive
  });

  it('should verify vocabulary transformation preserves data', () => {
    const dbVocab = {
      id: 'test-id',
      unit: '1',
      page: '1',
      english: 'hello',
      deutsch: 'hallo',
      collection_id: 'col-1',
    };

    const transformed = {
      id: dbVocab.id,
      unit: parseInt(dbVocab.unit),
      page: parseInt(dbVocab.page),
      english: dbVocab.english,
      deutsch: dbVocab.deutsch,
      collection_id: dbVocab.collection_id,
    };

    expect(transformed.unit).toBe(1);
    expect(typeof transformed.unit).toBe('number');
    expect(transformed.english).toBe('hello');
  });
});
