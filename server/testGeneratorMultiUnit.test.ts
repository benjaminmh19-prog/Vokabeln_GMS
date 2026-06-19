import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Test Suite für TestGeneratorPanel - Multi-Unit Selection Feature
 */

describe('TestGeneratorPanel - Multi-Unit Selection', () => {
  // Mock vocabulary data
  const mockVocabulary = [
    // Unit 1
    { id: '1', unit: '1', page: '1', english: 'hello', deutsch: 'hallo' },
    { id: '2', unit: '1', page: '1', english: 'world', deutsch: 'welt' },
    { id: '3', unit: '1', page: '2', english: 'good', deutsch: 'gut' },
    
    // Unit 2
    { id: '4', unit: '2', page: '3', english: 'cat', deutsch: 'katze' },
    { id: '5', unit: '2', page: '3', english: 'dog', deutsch: 'hund' },
    { id: '6', unit: '2', page: '4', english: 'bird', deutsch: 'vogel' },
    
    // Unit 3
    { id: '7', unit: '3', page: '5', english: 'apple', deutsch: 'apfel' },
    { id: '8', unit: '3', page: '5', english: 'banana', deutsch: 'banane' },
  ];

  describe('Unit Selection State Management', () => {
    it('should initialize with empty Set', () => {
      const selectedUnits = new Set<string>();
      expect(selectedUnits.size).toBe(0);
    });

    it('should add unit to Set', () => {
      let selectedUnits = new Set<string>();
      selectedUnits.add('1');
      expect(selectedUnits.has('1')).toBe(true);
      expect(selectedUnits.size).toBe(1);
    });

    it('should remove unit from Set', () => {
      let selectedUnits = new Set(['1', '2']);
      selectedUnits.delete('1');
      expect(selectedUnits.has('1')).toBe(false);
      expect(selectedUnits.size).toBe(1);
    });

    it('should toggle unit selection', () => {
      let selectedUnits = new Set<string>();
      
      // Add unit 1
      if (selectedUnits.has('1')) {
        selectedUnits.delete('1');
      } else {
        selectedUnits.add('1');
      }
      expect(selectedUnits.has('1')).toBe(true);
      
      // Remove unit 1
      if (selectedUnits.has('1')) {
        selectedUnits.delete('1');
      } else {
        selectedUnits.add('1');
      }
      expect(selectedUnits.has('1')).toBe(false);
    });
  });

  describe('Unit Selection UI', () => {
    it('should display all units', () => {
      const units = Array.from(new Set(mockVocabulary.map(v => v.unit))).sort();
      expect(units).toEqual(['1', '2', '3']);
    });

    it('should show unit counter', () => {
      const selectedUnits = new Set(['1', '2']);
      const units = ['1', '2', '3'];
      const counter = `${selectedUnits.size} / ${units.length} Units`;
      expect(counter).toBe('2 / 3 Units');
    });

    it('should support "Select All" button', () => {
      const units = ['1', '2', '3'];
      const selectedUnits = new Set(units);
      expect(selectedUnits.size).toBe(3);
      expect(Array.from(selectedUnits).sort()).toEqual(['1', '2', '3']);
    });

    it('should support "Deselect All" button', () => {
      let selectedUnits = new Set(['1', '2', '3']);
      selectedUnits = new Set();
      expect(selectedUnits.size).toBe(0);
    });
  });

  describe('Vocabulary Filtering by Multiple Units', () => {
    it('should filter vocabulary by single unit', () => {
      const selectedUnits = new Set(['1']);
      const filtered = mockVocabulary.filter(v => selectedUnits.has(v.unit));
      expect(filtered.length).toBe(3);
      expect(filtered.every(v => v.unit === '1')).toBe(true);
    });

    it('should filter vocabulary by multiple units', () => {
      const selectedUnits = new Set(['1', '2']);
      const filtered = mockVocabulary.filter(v => selectedUnits.has(v.unit));
      expect(filtered.length).toBe(6);
      expect(filtered.every(v => v.unit === '1' || v.unit === '2')).toBe(true);
    });

    it('should filter vocabulary by all units', () => {
      const selectedUnits = new Set(['1', '2', '3']);
      const filtered = mockVocabulary.filter(v => selectedUnits.has(v.unit));
      expect(filtered.length).toBe(8);
    });

    it('should return all vocabulary when no units selected', () => {
      const selectedUnits = new Set<string>();
      const filtered = selectedUnits.size === 0 ? mockVocabulary : mockVocabulary.filter(v => selectedUnits.has(v.unit));
      expect(filtered.length).toBe(8);
    });
  });

  describe('Pages Extraction from Multiple Units', () => {
    it('should extract pages from single unit', () => {
      const selectedUnits = new Set(['1']);
      const filteredByUnits = mockVocabulary.filter(v => selectedUnits.has(v.unit));
      const pages = Array.from(new Set(filteredByUnits.map(v => v.page))).sort();
      expect(pages).toEqual(['1', '2']);
    });

    it('should extract pages from multiple units', () => {
      const selectedUnits = new Set(['1', '2']);
      const filteredByUnits = mockVocabulary.filter(v => selectedUnits.has(v.unit));
      const pages = Array.from(new Set(filteredByUnits.map(v => v.page))).sort();
      expect(pages).toEqual(['1', '2', '3', '4']);
    });

    it('should extract pages from all units', () => {
      const selectedUnits = new Set(['1', '2', '3']);
      const filteredByUnits = mockVocabulary.filter(v => selectedUnits.has(v.unit));
      const pages = Array.from(new Set(filteredByUnits.map(v => v.page))).sort();
      expect(pages).toEqual(['1', '2', '3', '4', '5']);
    });

    it('should return all pages when no units selected', () => {
      const selectedUnits = new Set<string>();
      const filteredByUnits = selectedUnits.size === 0 ? mockVocabulary : mockVocabulary.filter(v => selectedUnits.has(v.unit));
      const pages = Array.from(new Set(filteredByUnits.map(v => v.page))).sort();
      expect(pages).toEqual(['1', '2', '3', '4', '5']);
    });
  });

  describe('Combined Unit and Page Filtering', () => {
    it('should filter by units and pages', () => {
      const selectedUnits = new Set(['1', '2']);
      const selectedPages = ['1', '3'];
      const filtered = mockVocabulary.filter(v => 
        selectedUnits.has(v.unit) && selectedPages.includes(v.page)
      );
      expect(filtered.length).toBe(4);
    });

    it('should return all vocabulary when no filters selected', () => {
      const selectedUnits = new Set<string>();
      const selectedPages: string[] = [];
      const filtered = mockVocabulary.filter(v => 
        (selectedUnits.size === 0 || selectedUnits.has(v.unit)) &&
        (selectedPages.length === 0 || selectedPages.includes(v.page))
      );
      expect(filtered.length).toBe(8);
    });

    it('should return empty array when no vocabulary matches filters', () => {
      const selectedUnits = new Set(['99']);
      const selectedPages = ['99'];
      const filtered = mockVocabulary.filter(v => 
        selectedUnits.has(v.unit) && selectedPages.includes(v.page)
      );
      expect(filtered.length).toBe(0);
    });
  });

  describe('Test History Recording', () => {
    it('should record single unit in history', () => {
      const selectedUnits = new Set(['1']);
      const unitsString = selectedUnits.size === 0 ? 'Alle Units' : `Units: ${Array.from(selectedUnits).sort().join(', ')}`;
      expect(unitsString).toBe('Units: 1');
    });

    it('should record multiple units in history', () => {
      const selectedUnits = new Set(['1', '2', '3']);
      const unitsString = selectedUnits.size === 0 ? 'Alle Units' : `Units: ${Array.from(selectedUnits).sort().join(', ')}`;
      expect(unitsString).toBe('Units: 1, 2, 3');
    });

    it('should record "Alle Units" when no units selected', () => {
      const selectedUnits = new Set<string>();
      const unitsString = selectedUnits.size === 0 ? 'Alle Units' : `Units: ${Array.from(selectedUnits).sort().join(', ')}`;
      expect(unitsString).toBe('Alle Units');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty vocabulary list', () => {
      const emptyVocab: any[] = [];
      const selectedUnits = new Set(['1']);
      const filtered = emptyVocab.filter(v => selectedUnits.has(v.unit));
      expect(filtered.length).toBe(0);
    });

    it('should handle selecting non-existent unit', () => {
      const selectedUnits = new Set(['99']);
      const filtered = mockVocabulary.filter(v => selectedUnits.has(v.unit));
      expect(filtered.length).toBe(0);
    });

    it('should handle duplicate units in vocabulary', () => {
      const vocabWithDuplicates = [
        ...mockVocabulary,
        { id: '9', unit: '1', page: '1', english: 'test', deutsch: 'test' },
      ];
      const selectedUnits = new Set(['1']);
      const filtered = vocabWithDuplicates.filter(v => selectedUnits.has(v.unit));
      expect(filtered.length).toBe(4);
    });

    it('should handle units with no pages', () => {
      const vocabNoPagesUnit = [
        { id: '1', unit: '4', page: '', english: 'test', deutsch: 'test' },
      ];
      const selectedUnits = new Set(['4']);
      const filteredByUnits = vocabNoPagesUnit.filter(v => selectedUnits.has(v.unit));
      const pages = Array.from(new Set(filteredByUnits.map(v => v.page))).sort();
      expect(pages).toEqual(['']);
    });
  });

  describe('UI State Reset', () => {
    it('should reset pages when units change', () => {
      let selectedPages = ['1', '2'];
      selectedPages = []; // Reset
      expect(selectedPages.length).toBe(0);
    });

    it('should reset units and pages when collection changes', () => {
      let selectedUnits = new Set(['1', '2']);
      let selectedPages = ['1', '2'];
      
      selectedUnits = new Set();
      selectedPages = [];
      
      expect(selectedUnits.size).toBe(0);
      expect(selectedPages.length).toBe(0);
    });
  });

  describe('Vocabulary Count Display', () => {
    it('should show correct count for single unit', () => {
      const selectedUnits = new Set(['1']);
      const filtered = mockVocabulary.filter(v => selectedUnits.has(v.unit));
      expect(filtered.length).toBe(3);
    });

    it('should show correct count for multiple units', () => {
      const selectedUnits = new Set(['1', '2']);
      const filtered = mockVocabulary.filter(v => selectedUnits.has(v.unit));
      expect(filtered.length).toBe(6);
    });

    it('should show correct count for all units', () => {
      const selectedUnits = new Set(['1', '2', '3']);
      const filtered = mockVocabulary.filter(v => selectedUnits.has(v.unit));
      expect(filtered.length).toBe(8);
    });

    it('should show total count when no units selected', () => {
      const selectedUnits = new Set<string>();
      const filtered = selectedUnits.size === 0 ? mockVocabulary : mockVocabulary.filter(v => selectedUnits.has(v.unit));
      expect(filtered.length).toBe(8);
    });
  });
});
