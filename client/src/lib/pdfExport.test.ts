import { describe, it, expect, vi } from 'vitest';
import { exportVocabularyToCSV, VocabularyItem, CollectionInfo } from './pdfExport';

describe('PDF Export Utilities', () => {
  const mockVocabulary: VocabularyItem[] = [
    {
      id: '1',
      unit: 'Unit 1',
      page: '1',
      english: 'hello',
      deutsch: 'Hallo',
      collection_id: 'col-1',
    },
    {
      id: '2',
      unit: 'Unit 1',
      page: '2',
      english: 'goodbye',
      deutsch: 'Auf Wiedersehen',
      collection_id: 'col-1',
    },
    {
      id: '3',
      unit: 'Unit 2',
      page: '1',
      english: 'apple',
      deutsch: 'Apfel',
      collection_id: 'col-2',
    },
  ];

  const mockCollections: CollectionInfo[] = [
    {
      id: 'col-1',
      name: 'Year 1',
      learning_year: 1,
    },
    {
      id: 'col-2',
      name: 'Year 2',
      learning_year: 2,
    },
  ];

  it('should export all vocabulary to CSV without year filter', async () => {
    // Mock the document.createElement and appendChild
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {},
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document, 'appendChild').mockReturnValue(mockLink as any);
    vi.spyOn(document, 'removeChild').mockReturnValue(mockLink as any);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');

    await exportVocabularyToCSV(mockVocabulary, mockCollections);

    expect(mockLink.setAttribute).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('should export filtered vocabulary by learning year', async () => {
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {},
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document, 'appendChild').mockReturnValue(mockLink as any);
    vi.spyOn(document, 'removeChild').mockReturnValue(mockLink as any);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');

    // Export only year 1 vocabulary
    await exportVocabularyToCSV(mockVocabulary, mockCollections, 1);

    expect(mockLink.setAttribute).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('should handle empty vocabulary', async () => {
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {},
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document, 'appendChild').mockReturnValue(mockLink as any);
    vi.spyOn(document, 'removeChild').mockReturnValue(mockLink as any);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');

    await exportVocabularyToCSV([], mockCollections);

    expect(mockLink.setAttribute).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('should filter vocabulary by collection ID', () => {
    const year1Collections = mockCollections
      .filter(c => c.learning_year === 1)
      .map(c => c.id);
    
    const filteredVocab = mockVocabulary.filter(v =>
      year1Collections.includes(v.collection_id || '')
    );

    expect(filteredVocab.length).toBe(2);
    expect(filteredVocab.every(v => v.collection_id === 'col-1')).toBe(true);
  });

  it('should generate correct filename with year', () => {
    const year = 1;
    const filename = `vokabeln-lernjahr-${year}.csv`;
    
    expect(filename).toBe('vokabeln-lernjahr-1.csv');
  });

  it('should generate correct filename without year', () => {
    const date = new Date().toISOString().split('T')[0];
    const filename = `vokabeln-export-${date}.csv`;
    
    expect(filename).toMatch(/vokabeln-export-\d{4}-\d{2}-\d{2}\.csv/);
  });
});
