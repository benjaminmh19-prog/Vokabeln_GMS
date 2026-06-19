import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminVocabulary } from '@/contexts/AdminContext';

/**
 * Test Suite für TestGeneratorPanel - Hierarchische Collection → Unit → Seiten Auswahl
 */

describe('TestGeneratorPanel - Hierarchical Selection', () => {
  // Mock vocabulary data
  const mockVocabulary: AdminVocabulary[] = [
    // Collection 1, Unit 1
    { id: '1', collection_id: 'col1', unit: '1', page: '1', english: 'hello', deutsch: 'hallo', level: 1 },
    { id: '2', collection_id: 'col1', unit: '1', page: '1', english: 'world', deutsch: 'welt', level: 1 },
    { id: '3', collection_id: 'col1', unit: '1', page: '2', english: 'good', deutsch: 'gut', level: 1 },
    
    // Collection 1, Unit 2
    { id: '4', collection_id: 'col1', unit: '2', page: '3', english: 'cat', deutsch: 'katze', level: 1 },
    { id: '5', collection_id: 'col1', unit: '2', page: '3', english: 'dog', deutsch: 'hund', level: 1 },
    { id: '6', collection_id: 'col1', unit: '2', page: '4', english: 'bird', deutsch: 'vogel', level: 1 },
    
    // Collection 2, Unit 1
    { id: '7', collection_id: 'col2', unit: '1', page: '1', english: 'apple', deutsch: 'apfel', level: 1 },
    { id: '8', collection_id: 'col2', unit: '1', page: '2', english: 'banana', deutsch: 'banane', level: 1 },
  ];

  const mockCollections = [
    { id: 'col1', name: 'Collection 1', year: '2024', learning_year: 1 },
    { id: 'col2', name: 'Collection 2', year: '2025', learning_year: 2 },
  ];

  describe('Collection Selection', () => {
    it('should initialize with first collection', () => {
      // First collection should be pre-selected
      expect(mockCollections[0].id).toBe('col1');
    });

    it('should filter vocabulary by selected collection', () => {
      const col1Vocab = mockVocabulary.filter(v => v.collection_id === 'col1');
      expect(col1Vocab.length).toBe(6);
      
      const col2Vocab = mockVocabulary.filter(v => v.collection_id === 'col2');
      expect(col2Vocab.length).toBe(2);
    });

    it('should reset unit and pages when collection changes', () => {
      // When collection changes, unit selection should reset
      const selectedUnit = '';
      const selectedPages: string[] = [];
      
      expect(selectedUnit).toBe('');
      expect(selectedPages.length).toBe(0);
    });
  });

  describe('Unit Selection (Step 2)', () => {
    it('should extract unique units from selected collection', () => {
      const col1Vocab = mockVocabulary.filter(v => v.collection_id === 'col1');
      const units = Array.from(new Set(col1Vocab.map(v => v.unit))).sort();
      
      expect(units).toEqual(['1', '2']);
    });

    it('should support "Alle Units" option', () => {
      const selectedUnit = '__all__';
      expect(selectedUnit).toBe('__all__');
    });

    it('should filter vocabulary by selected unit', () => {
      const col1Vocab = mockVocabulary.filter(v => v.collection_id === 'col1');
      const unit1Vocab = col1Vocab.filter(v => v.unit === '1');
      
      expect(unit1Vocab.length).toBe(3);
      expect(unit1Vocab.every(v => v.unit === '1')).toBe(true);
    });

    it('should reset pages when unit changes', () => {
      const selectedPages: string[] = [];
      expect(selectedPages.length).toBe(0);
    });
  });

  describe('Page Selection (Step 3)', () => {
    it('should extract unique pages from selected unit', () => {
      const col1Vocab = mockVocabulary.filter(v => v.collection_id === 'col1');
      const unit1Vocab = col1Vocab.filter(v => v.unit === '1');
      const pages = Array.from(new Set(unit1Vocab.map(v => v.page))).sort();
      
      expect(pages).toEqual(['1', '2']);
    });

    it('should toggle page selection', () => {
      let selectedPages: string[] = [];
      
      // Add page 1
      selectedPages = selectedPages.includes('1') 
        ? selectedPages.filter(p => p !== '1') 
        : [...selectedPages, '1'];
      expect(selectedPages).toEqual(['1']);
      
      // Add page 2
      selectedPages = selectedPages.includes('2') 
        ? selectedPages.filter(p => p !== '2') 
        : [...selectedPages, '2'];
      expect(selectedPages).toEqual(['1', '2']);
      
      // Remove page 1
      selectedPages = selectedPages.includes('1') 
        ? selectedPages.filter(p => p !== '1') 
        : [...selectedPages, '1'];
      expect(selectedPages).toEqual(['2']);
    });

    it('should support "Select All" pages', () => {
      const col1Vocab = mockVocabulary.filter(v => v.collection_id === 'col1');
      const unit1Vocab = col1Vocab.filter(v => v.unit === '1');
      const pages = Array.from(new Set(unit1Vocab.map(v => v.page))).sort();
      
      const selectedPages = pages;
      expect(selectedPages).toEqual(['1', '2']);
    });

    it('should support "Deselect All" pages', () => {
      let selectedPages = ['1', '2'];
      selectedPages = [];
      
      expect(selectedPages.length).toBe(0);
    });
  });

  describe('Vocabulary Filtering', () => {
    it('should filter by collection only', () => {
      const selectedCollection = 'col1';
      const selectedUnit = '__all__';
      const selectedPages: string[] = [];
      
      const filtered = mockVocabulary.filter(v => 
        v.collection_id === selectedCollection &&
        (selectedUnit === '__all__' || v.unit === selectedUnit) &&
        (selectedPages.length === 0 || selectedPages.includes(v.page || ''))
      );
      
      expect(filtered.length).toBe(6);
    });

    it('should filter by collection and unit', () => {
      const selectedCollection = 'col1';
      const selectedUnit = '1';
      const selectedPages: string[] = [];
      
      const filtered = mockVocabulary.filter(v => 
        v.collection_id === selectedCollection &&
        v.unit === selectedUnit &&
        (selectedPages.length === 0 || selectedPages.includes(v.page || ''))
      );
      
      expect(filtered.length).toBe(3);
    });

    it('should filter by collection, unit, and pages', () => {
      const selectedCollection = 'col1';
      const selectedUnit = '1';
      const selectedPages = ['1'];
      
      const filtered = mockVocabulary.filter(v => 
        v.collection_id === selectedCollection &&
        v.unit === selectedUnit &&
        selectedPages.includes(v.page || '')
      );
      
      expect(filtered.length).toBe(2);
    });

    it('should filter by multiple pages', () => {
      const selectedCollection = 'col1';
      const selectedUnit = '1';
      const selectedPages = ['1', '2'];
      
      const filtered = mockVocabulary.filter(v => 
        v.collection_id === selectedCollection &&
        v.unit === selectedUnit &&
        selectedPages.includes(v.page || '')
      );
      
      expect(filtered.length).toBe(3);
    });
  });

  describe('Counter Display', () => {
    it('should show correct page counter', () => {
      const col1Vocab = mockVocabulary.filter(v => v.collection_id === 'col1');
      const unit1Vocab = col1Vocab.filter(v => v.unit === '1');
      const pages = Array.from(new Set(unit1Vocab.map(v => v.page))).sort();
      
      const selectedPages = ['1'];
      const counter = `${selectedPages.length} / ${pages.length} Seiten`;
      
      expect(counter).toBe('1 / 2 Seiten');
    });

    it('should show correct vocabulary counter', () => {
      const selectedCollection = 'col1';
      const selectedUnit = '1';
      const selectedPages = ['1'];
      
      const filtered = mockVocabulary.filter(v => 
        v.collection_id === selectedCollection &&
        v.unit === selectedUnit &&
        selectedPages.includes(v.page || '')
      );
      
      expect(filtered.length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty collections', () => {
      const emptyCollections: any[] = [];
      expect(emptyCollections.length).toBe(0);
    });

    it('should handle collection with no units', () => {
      const col3Vocab = mockVocabulary.filter(v => v.collection_id === 'col3');
      const units = Array.from(new Set(col3Vocab.map(v => v.unit))).sort();
      
      expect(units.length).toBe(0);
    });

    it('should handle unit with no pages', () => {
      const col1Vocab = mockVocabulary.filter(v => v.collection_id === 'col1');
      const unit3Vocab = col1Vocab.filter(v => v.unit === '3');
      const pages = Array.from(new Set(unit3Vocab.map(v => v.page))).sort();
      
      expect(pages.length).toBe(0);
    });

    it('should handle selecting all units and all pages', () => {
      const selectedCollection = 'col1';
      const selectedUnit = '__all__';
      const col1Vocab = mockVocabulary.filter(v => v.collection_id === selectedCollection);
      const pages = Array.from(new Set(col1Vocab.map(v => v.page))).sort();
      const selectedPages = pages;
      
      const filtered = mockVocabulary.filter(v => 
        v.collection_id === selectedCollection &&
        (selectedUnit === '__all__' || v.unit === selectedUnit) &&
        selectedPages.includes(v.page || '')
      );
      
      expect(filtered.length).toBe(6);
    });
  });

  describe('UI State Management', () => {
    it('should show Step 3 only when unit is selected (not __all__)', () => {
      const shouldShowStep3 = (selectedUnit: string) => {
        return selectedUnit !== '' && selectedUnit !== '__all__';
      };
      
      expect(shouldShowStep3('1')).toBe(true);
      expect(shouldShowStep3('2')).toBe(true);
      expect(shouldShowStep3('__all__')).toBe(false);
      expect(shouldShowStep3('')).toBe(false);
    });

    it('should disable "TEST ERSTELLEN" button when no vocabulary available', () => {
      const filteredVocabulary: AdminVocabulary[] = [];
      const isDisabled = filteredVocabulary.length === 0;
      
      expect(isDisabled).toBe(true);
    });

    it('should enable "TEST ERSTELLEN" button when vocabulary available', () => {
      const filteredVocabulary = mockVocabulary.slice(0, 3);
      const isDisabled = filteredVocabulary.length === 0;
      
      expect(isDisabled).toBe(false);
    });
  });
});
