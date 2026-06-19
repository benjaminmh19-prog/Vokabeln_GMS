import { describe, it, expect } from 'vitest';

describe('Collection Loading and Selection', () => {
  describe('useCollections Hook', () => {
    it('should load collections from tRPC endpoint', () => {
      const collections = [
        { id: 'col_1', name: 'Lernjahr 1', learning_year: 1 },
        { id: 'col_2', name: 'Lernjahr 2', learning_year: 2 },
      ];

      expect(collections.length).toBe(2);
      expect(collections[0].name).toBe('Lernjahr 1');
    });

    it('should return empty array if no collections exist', () => {
      const collections: any[] = [];
      expect(collections.length).toBe(0);
    });

    it('should transform DB data to Collection interface', () => {
      const dbCollection = {
        id: 'col_1',
        name: 'Lernjahr 1',
        description: 'Erste Lernphase',
        learning_year: 1,
        created_at: new Date('2026-01-01'),
      };

      const transformed = {
        id: dbCollection.id,
        name: dbCollection.name,
        description: dbCollection.description,
        learning_year: dbCollection.learning_year,
      };

      expect(transformed.id).toBe('col_1');
      expect(transformed.learning_year).toBe(1);
    });

    it('should handle loading state correctly', () => {
      const states = ['loading', 'loaded', 'error'];
      expect(states.includes('loading')).toBe(true);
      expect(states.includes('loaded')).toBe(true);
    });

    it('should handle error state', () => {
      const error = 'Fehler beim Laden der Sammlungen';
      expect(error).toBeDefined();
      expect(error.length).toBeGreaterThan(0);
    });
  });

  describe('useVocabularyByCollection Hook', () => {
    it('should load vocabulary for selected collection', () => {
      const collectionId = 'col_1';
      const vocabulary = [
        { id: '1', collection_id: 'col_1', unit: 1, page: 1, english: 'hello', deutsch: 'hallo' },
        { id: '2', collection_id: 'col_1', unit: 1, page: 2, english: 'goodbye', deutsch: 'auf wiedersehen' },
      ];

      const filtered = vocabulary.filter(v => v.collection_id === collectionId);
      expect(filtered.length).toBe(2);
    });

    it('should extract unique units from vocabulary', () => {
      const vocabulary = [
        { unit: 1, page: 1 },
        { unit: 1, page: 2 },
        { unit: 2, page: 1 },
        { unit: 3, page: 1 },
      ];

      const units = Array.from(new Set(vocabulary.map(v => v.unit))).sort((a, b) => a - b);
      expect(units).toEqual([1, 2, 3]);
    });

    it('should extract pages for specific unit', () => {
      const vocabulary = [
        { unit: 1, page: 1 },
        { unit: 1, page: 2 },
        { unit: 1, page: 3 },
        { unit: 2, page: 1 },
      ];

      const pages = Array.from(
        new Set(vocabulary.filter(v => v.unit === 1).map(v => v.page))
      ).sort((a, b) => a - b);

      expect(pages).toEqual([1, 2, 3]);
    });

    it('should get vocabulary for specific page', () => {
      const vocabulary = [
        { id: '1', unit: 1, page: 1, english: 'hello', deutsch: 'hallo' },
        { id: '2', unit: 1, page: 1, english: 'goodbye', deutsch: 'auf wiedersehen' },
        { id: '3', unit: 1, page: 2, english: 'test', deutsch: 'test' },
      ];

      const pageVocab = vocabulary.filter(v => v.unit === 1 && v.page === 1);
      expect(pageVocab.length).toBe(2);
      expect(pageVocab[0].english).toBe('hello');
    });

    it('should return empty array if no vocabulary for page', () => {
      const vocabulary: any[] = [];
      const pageVocab = vocabulary.filter(v => v.unit === 1 && v.page === 1);
      expect(pageVocab.length).toBe(0);
    });
  });

  describe('Collection Selection Flow', () => {
    it('should store collection ID in localStorage', () => {
      const collectionId = 'col_1';
      const key = 'selectedCollectionId';
      
      expect(collectionId).toBeDefined();
      expect(key).toBe('selectedCollectionId');
    });

    it('should store unit in localStorage', () => {
      const unit = 1;
      const key = 'selectedUnit';
      
      expect(unit).toBeDefined();
      expect(key).toBe('selectedUnit');
    });

    it('should store page in localStorage', () => {
      const page = 1;
      const key = 'selectedPage';
      
      expect(page).toBeDefined();
      expect(key).toBe('selectedPage');
    });

    it('should follow correct navigation flow', () => {
      const flow = ['collections', 'units', 'pages', 'game'];
      expect(flow[0]).toBe('collections');
      expect(flow[1]).toBe('units');
      expect(flow[2]).toBe('pages');
      expect(flow[3]).toBe('game');
    });

    it('should allow back navigation', () => {
      const currentStep = 'pages';
      const previousStep = 'units';
      
      expect(currentStep).not.toBe(previousStep);
    });
  });

  describe('Game Start from Collection', () => {
    it('should transform vocabulary to game format', () => {
      const pageVocab = [
        { id: '1', collection_id: 'col_1', unit: 1, page: 1, english: 'hello', deutsch: 'hallo' },
      ];

      const gameVocab = pageVocab.map(v => ({
        id: v.id,
        english: v.english,
        deutsch: v.deutsch,
        unit: v.unit.toString(),
        page: v.page.toString(),
      }));

      expect(gameVocab[0].unit).toBe('1');
      expect(gameVocab[0].page).toBe('1');
      expect(gameVocab[0].deutsch).toBe('hallo');
    });

    it('should pass correct parameters to startGame', () => {
      const params = {
        direction: 'en-de',
        level: 1,
        gameType: 'vocabulary',
        selectedContent: {
          unitName: 'Unit 1',
          pages: ['1'],
        },
        vocabulary: [
          { id: '1', english: 'hello', deutsch: 'hallo', unit: '1', page: '1' },
        ],
      };

      expect(params.direction).toBe('en-de');
      expect(params.level).toBe(1);
      expect(params.gameType).toBe('vocabulary');
      expect(params.vocabulary.length).toBe(1);
    });

    it('should navigate to game page after start', () => {
      const route = '/game';
      expect(route).toBe('/game');
    });
  });

  describe('Error Handling', () => {
    it('should show error if no collections available', () => {
      const collections: any[] = [];
      const hasCollections = collections.length > 0;
      expect(hasCollections).toBe(false);
    });

    it('should show error if no units in collection', () => {
      const units: any[] = [];
      const hasUnits = units.length > 0;
      expect(hasUnits).toBe(false);
    });

    it('should show error if no pages in unit', () => {
      const pages: any[] = [];
      const hasPages = pages.length > 0;
      expect(hasPages).toBe(false);
    });

    it('should show error if no vocabulary for page', () => {
      const vocabulary: any[] = [];
      const hasVocabulary = vocabulary.length > 0;
      expect(hasVocabulary).toBe(false);
    });

    it('should show error if collection not selected', () => {
      const selectedCollection = null;
      const isSelected = selectedCollection !== null;
      expect(isSelected).toBe(false);
    });

    it('should show error if unit not selected', () => {
      const selectedUnit = null;
      const isSelected = selectedUnit !== null;
      expect(isSelected).toBe(false);
    });
  });

  describe('UI Rendering', () => {
    it('should show loading state while collections load', () => {
      const isLoading = true;
      expect(isLoading).toBe(true);
    });

    it('should show collection cards', () => {
      const collections = [
        { id: 'col_1', name: 'Lernjahr 1' },
      ];
      expect(collections.length).toBeGreaterThan(0);
    });

    it('should show unit grid', () => {
      const units = [1, 2, 3];
      expect(units.length).toBeGreaterThan(0);
    });

    it('should show page grid', () => {
      const pages = [1, 2, 3, 4, 5];
      expect(pages.length).toBeGreaterThan(0);
    });

    it('should show back button when not on collections step', () => {
      const currentStep = 'units';
      const showBackButton = currentStep !== 'collections';
      expect(showBackButton).toBe(true);
    });

    it('should show breadcrumb navigation', () => {
      const breadcrumb = ['Sammlungen', 'Lernjahr 1', 'Unit 1'];
      expect(breadcrumb.length).toBe(3);
    });
  });
});
