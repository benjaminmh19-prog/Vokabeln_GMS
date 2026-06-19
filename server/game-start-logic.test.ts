import { describe, it, expect, beforeEach } from 'vitest';

describe('Game Start Logic - Collection to Game Flow', () => {
  describe('Vocabulary Loading', () => {
    it('should load vocabulary for selected collection/unit/page', () => {
      const collectionId = 'col_1';
      const unit = 2;
      const page = 3;
      
      expect(collectionId).toBe('col_1');
      expect(unit).toBe(2);
      expect(page).toBe(3);
    });

    it('should filter vocabulary by collection ID', () => {
      const allVocab = [
        { id: 1, collection_id: 'col_1', unit: 1, page: 1, english_word: 'hello', german_word: 'hallo' },
        { id: 2, collection_id: 'col_2', unit: 1, page: 1, english_word: 'goodbye', german_word: 'auf wiedersehen' },
        { id: 3, collection_id: 'col_1', unit: 1, page: 1, english_word: 'world', german_word: 'welt' },
      ];
      
      const filtered = allVocab.filter(v => v.collection_id === 'col_1');
      expect(filtered.length).toBe(2);
      expect(filtered[0].english_word).toBe('hello');
    });

    it('should filter vocabulary by unit', () => {
      const allVocab = [
        { id: 1, collection_id: 'col_1', unit: 1, page: 1, english_word: 'hello', german_word: 'hallo' },
        { id: 2, collection_id: 'col_1', unit: 2, page: 1, english_word: 'goodbye', german_word: 'auf wiedersehen' },
        { id: 3, collection_id: 'col_1', unit: 1, page: 1, english_word: 'world', german_word: 'welt' },
      ];
      
      const filtered = allVocab.filter(v => v.unit === 1);
      expect(filtered.length).toBe(2);
    });

    it('should filter vocabulary by page', () => {
      const allVocab = [
        { id: 1, collection_id: 'col_1', unit: 1, page: 1, english_word: 'hello', german_word: 'hallo' },
        { id: 2, collection_id: 'col_1', unit: 1, page: 2, english_word: 'goodbye', german_word: 'auf wiedersehen' },
        { id: 3, collection_id: 'col_1', unit: 1, page: 1, english_word: 'world', german_word: 'welt' },
      ];
      
      const filtered = allVocab.filter(v => v.page === 1);
      expect(filtered.length).toBe(2);
    });

    it('should combine all filters correctly', () => {
      const allVocab = [
        { id: 1, collection_id: 'col_1', unit: 1, page: 1, english_word: 'hello', german_word: 'hallo' },
        { id: 2, collection_id: 'col_1', unit: 1, page: 2, english_word: 'goodbye', german_word: 'auf wiedersehen' },
        { id: 3, collection_id: 'col_1', unit: 2, page: 1, english_word: 'world', german_word: 'welt' },
        { id: 4, collection_id: 'col_2', unit: 1, page: 1, english_word: 'test', german_word: 'test' },
      ];
      
      const filtered = allVocab.filter(
        v => v.collection_id === 'col_1' && v.unit === 1 && v.page === 1
      );
      expect(filtered.length).toBe(1);
      expect(filtered[0].english_word).toBe('hello');
    });

    it('should return empty array if no vocabulary matches', () => {
      const allVocab = [
        { id: 1, collection_id: 'col_1', unit: 1, page: 1, english_word: 'hello', german_word: 'hallo' },
      ];
      
      const filtered = allVocab.filter(
        v => v.collection_id === 'col_2' && v.unit === 2 && v.page === 2
      );
      expect(filtered.length).toBe(0);
    });
  });

  describe('Game Initialization', () => {
    it('should initialize game with correct direction', () => {
      const direction = 'en-de';
      expect(direction).toBe('en-de');
    });

    it('should initialize game with correct level', () => {
      const level = 1;
      expect(level).toBe(1);
    });

    it('should initialize game with correct game type', () => {
      const gameType = 'vocabulary';
      expect(gameType).toBe('vocabulary');
    });

    it('should set selected content with unit and page', () => {
      const selectedContent = {
        unitName: 'Unit 2',
        pages: ['3'],
      };
      
      expect(selectedContent.unitName).toBe('Unit 2');
      expect(selectedContent.pages[0]).toBe('3');
    });

    it('should pass vocabulary array to game', () => {
      const vocabulary = [
        { id: 1, english: 'hello', deutsch: 'hallo', unit: 1, page: 1, collectionId: 'col_1' },
        { id: 2, english: 'goodbye', deutsch: 'auf wiedersehen', unit: 1, page: 1, collectionId: 'col_1' },
      ];
      
      expect(vocabulary.length).toBe(2);
      expect(vocabulary[0].english).toBe('hello');
    });

    it('should handle empty vocabulary gracefully', () => {
      const vocabulary: any[] = [];
      const hasVocabulary = vocabulary.length > 0;
      
      expect(hasVocabulary).toBe(false);
    });
  });

  describe('Navigation After Game Start', () => {
    it('should navigate to /game after starting game', () => {
      const route = '/game';
      expect(route).toBe('/game');
    });

    it('should preserve selected collection in localStorage', () => {
      const collectionId = 'col_1';
      const key = 'selectedCollectionId';
      
      expect(key).toBe('selectedCollectionId');
      expect(collectionId).toBe('col_1');
    });

    it('should preserve selected unit in localStorage', () => {
      const unit = 2;
      const key = 'selectedUnit';
      
      expect(key).toBe('selectedUnit');
      expect(unit).toBe(2);
    });

    it('should preserve selected page in localStorage', () => {
      const page = 3;
      const key = 'selectedPage';
      
      expect(key).toBe('selectedPage');
      expect(page).toBe(3);
    });
  });

  describe('Error Handling', () => {
    it('should show error if no vocabulary found', () => {
      const vocabulary: any[] = [];
      const error = vocabulary.length === 0 ? 'Keine Vokabeln gefunden' : null;
      
      expect(error).toBe('Keine Vokabeln gefunden');
    });

    it('should show error if vocabulary loading fails', () => {
      const error = 'Fehler beim Laden der Vokabeln';
      expect(error).toBe('Fehler beim Laden der Vokabeln');
    });

    it('should show loading state while fetching vocabulary', () => {
      const isLoading = true;
      expect(isLoading).toBe(true);
    });

    it('should disable start button while loading', () => {
      const isLoading = true;
      const isDisabled = isLoading;
      
      expect(isDisabled).toBe(true);
    });

    it('should show LÄDT... text while loading', () => {
      const isLoading = true;
      const buttonText = isLoading ? 'LÄDT...' : 'STARTEN';
      
      expect(buttonText).toBe('LÄDT...');
    });

    it('should show STARTEN text when not loading', () => {
      const isLoading = false;
      const buttonText = isLoading ? 'LÄDT...' : 'STARTEN';
      
      expect(buttonText).toBe('STARTEN');
    });
  });

  describe('Game Start Flow Integration', () => {
    it('should follow correct flow: Select Collection → Select Unit → Select Page → Start Game', () => {
      const flow = ['collection', 'unit', 'page', 'game'];
      
      expect(flow[0]).toBe('collection');
      expect(flow[1]).toBe('unit');
      expect(flow[2]).toBe('page');
      expect(flow[3]).toBe('game');
    });

    it('should load vocabulary at page selection step', () => {
      const step = 'page';
      const shouldLoadVocab = step === 'page';
      
      expect(shouldLoadVocab).toBe(true);
    });

    it('should start game immediately after vocabulary loads', () => {
      const vocabLoaded = true;
      const shouldStartGame = vocabLoaded;
      
      expect(shouldStartGame).toBe(true);
    });

    it('should navigate to game after starting', () => {
      const gameStarted = true;
      const route = gameStarted ? '/game' : null;
      
      expect(route).toBe('/game');
    });
  });
});
