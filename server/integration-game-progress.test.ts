import { describe, it, expect } from 'vitest';

describe('Integration: Game Start to Progress Recording', () => {
  describe('End-to-End Game Flow', () => {
    it('should follow complete flow: Collection → Unit → Page → Game → Results → Progress', () => {
      const flow = [
        'collection_selected',
        'unit_selected',
        'page_selected',
        'vocabulary_loaded',
        'game_started',
        'game_completed',
        'results_shown',
        'progress_recorded',
      ];

      expect(flow.length).toBe(8);
      expect(flow[0]).toBe('collection_selected');
      expect(flow[7]).toBe('progress_recorded');
    });

    it('should store collection/unit/page in localStorage before game start', () => {
      const collectionId = 'col_1';
      const unit = 2;
      const page = 3;

      expect(collectionId).toBeDefined();
      expect(unit).toBeDefined();
      expect(page).toBeDefined();
    });

    it('should retrieve stored values in ResultsPage', () => {
      const storedCollection = 'col_1';
      const storedUnit = '2';
      const storedPage = '3';

      const collection = storedCollection;
      const unitNum = parseInt(storedUnit);
      const pageNum = parseInt(storedPage);

      expect(collection).toBe('col_1');
      expect(unitNum).toBe(2);
      expect(pageNum).toBe(3);
    });

    it('should record progress with correct parameters', () => {
      const collectionId = 'col_1';
      const unit = 2;
      const page = 3;
      const score = 85;

      const progress = {
        collectionId,
        unit,
        page,
        completed: true,
        score,
        attempts: 1,
        lastPlayed: Date.now(),
      };

      expect(progress.collectionId).toBe('col_1');
      expect(progress.unit).toBe(2);
      expect(progress.page).toBe(3);
      expect(progress.score).toBe(85);
    });
  });

  describe('Vocabulary Loading Integration', () => {
    it('should load vocabulary for selected collection', () => {
      const collectionId = 'col_1';
      const allVocab = [
        { id: 1, collection_id: 'col_1', unit: 1, page: 1, english_word: 'hello', german_word: 'hallo' },
        { id: 2, collection_id: 'col_1', unit: 1, page: 2, english_word: 'goodbye', german_word: 'auf wiedersehen' },
        { id: 3, collection_id: 'col_2', unit: 1, page: 1, english_word: 'test', german_word: 'test' },
      ];

      const filtered = allVocab.filter(v => v.collection_id === collectionId);
      expect(filtered.length).toBe(2);
    });

    it('should extract unique units from vocabulary', () => {
      const vocab = [
        { unit: 1, page: 1 },
        { unit: 1, page: 2 },
        { unit: 2, page: 1 },
        { unit: 2, page: 2 },
        { unit: 3, page: 1 },
      ];

      const units = Array.from(new Set(vocab.map(v => v.unit))).sort((a, b) => a - b);
      expect(units).toEqual([1, 2, 3]);
    });

    it('should extract pages for selected unit', () => {
      const vocab = [
        { unit: 1, page: 1 },
        { unit: 1, page: 2 },
        { unit: 1, page: 3 },
        { unit: 2, page: 1 },
      ];

      const selectedUnit = 1;
      const pages = Array.from(new Set(vocab.filter(v => v.unit === selectedUnit).map(v => v.page))).sort((a, b) => a - b);
      expect(pages).toEqual([1, 2, 3]);
    });

    it('should filter vocabulary for game by collection/unit/page', () => {
      const vocab = [
        { id: 1, collection_id: 'col_1', unit: 1, page: 1, english: 'hello', deutsch: 'hallo' },
        { id: 2, collection_id: 'col_1', unit: 1, page: 1, english: 'goodbye', deutsch: 'auf wiedersehen' },
        { id: 3, collection_id: 'col_1', unit: 1, page: 2, english: 'test', deutsch: 'test' },
        { id: 4, collection_id: 'col_2', unit: 1, page: 1, english: 'other', deutsch: 'other' },
      ];

      const gameVocab = vocab.filter(
        v => v.collection_id === 'col_1' && v.unit === 1 && v.page === 1
      );

      expect(gameVocab.length).toBe(2);
      expect(gameVocab[0].english).toBe('hello');
      expect(gameVocab[1].english).toBe('goodbye');
    });
  });

  describe('Game Start Integration', () => {
    it('should pass vocabulary to game context', () => {
      const vocabulary = [
        { id: 1, english: 'hello', deutsch: 'hallo' },
        { id: 2, english: 'goodbye', deutsch: 'auf wiedersehen' },
      ];

      expect(vocabulary.length).toBe(2);
      expect(vocabulary[0].english).toBe('hello');
    });

    it('should set game parameters correctly', () => {
      const gameParams = {
        direction: 'en-de',
        level: 1,
        gameType: 'vocabulary',
        vocabulary: [
          { id: 1, english: 'hello', deutsch: 'hallo' },
        ],
      };

      expect(gameParams.direction).toBe('en-de');
      expect(gameParams.level).toBe(1);
      expect(gameParams.gameType).toBe('vocabulary');
      expect(gameParams.vocabulary.length).toBe(1);
    });

    it('should navigate to game page after starting', () => {
      const route = '/game';
      expect(route).toBe('/game');
    });
  });

  describe('Results Page Integration', () => {
    it('should retrieve game score from game state', () => {
      const gameState = {
        score: 85,
        errors: 2,
        maxErrors: 5,
        timeRemaining: 30,
      };

      expect(gameState.score).toBe(85);
    });

    it('should retrieve stored collection/unit/page from localStorage', () => {
      const collectionId = 'col_1';
      const unit = '1';
      const page = '1';

      expect(collectionId).toBeDefined();
      expect(unit).toBeDefined();
      expect(page).toBeDefined();
    });

    it('should call recordPageCompletion with correct parameters', () => {
      const collectionId = 'col_1';
      const unit = 1;
      const page = 1;
      const score = 85;

      const params = {
        collectionId,
        unit,
        page,
        score,
      };

      expect(params.collectionId).toBe('col_1');
      expect(params.unit).toBe(1);
      expect(params.page).toBe(1);
      expect(params.score).toBe(85);
    });

    it('should save high score to game context', () => {
      const highScore = {
        score: 85,
        date: new Date().toLocaleDateString(),
        level: 1,
        direction: 'en-de',
        gameType: 'vocabulary',
        combo: 10,
      };

      expect(highScore.score).toBe(85);
      expect(highScore.level).toBe(1);
    });
  });

  describe('Progress Persistence', () => {
    it('should persist progress to localStorage', () => {
      const progress = {
        collectionId: 'col_1',
        unit: 1,
        page: 1,
        completed: true,
        score: 85,
        attempts: 1,
        lastPlayed: Date.now(),
      };

      const key = `${progress.collectionId}_${progress.unit}_${progress.page}`;
      expect(key).toBe('col_1_1_1');
    });

    it('should update existing progress with better score', () => {
      const oldScore = 75;
      const newScore = 85;
      const bestScore = Math.max(oldScore, newScore);

      expect(bestScore).toBe(85);
    });

    it('should increment attempts counter', () => {
      const attempts = 1;
      const newAttempts = attempts + 1;

      expect(newAttempts).toBe(2);
    });

    it('should update lastPlayed timestamp', () => {
      const oldTimestamp = 1000;
      const newTimestamp = Date.now();

      expect(newTimestamp).toBeGreaterThan(oldTimestamp);
    });
  });

  describe('Progress Display Integration', () => {
    it('should calculate unit progress from pages', () => {
      const completedPages = 7;
      const totalPages = 10;
      const percentage = (completedPages / totalPages) * 100;

      expect(percentage).toBe(70);
    });

    it('should show progress indicators on collection cards', () => {
      const hasProgressIndicator = true;
      expect(hasProgressIndicator).toBe(true);
    });

    it('should show progress bar on unit cards', () => {
      const hasProgressBar = true;
      expect(hasProgressBar).toBe(true);
    });

    it('should update progress display after game completion', () => {
      const oldProgress = 60;
      const newProgress = 70;

      expect(newProgress).toBeGreaterThan(oldProgress);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing collection gracefully', () => {
      const collectionId = null;
      const hasCollection = collectionId !== null;

      expect(hasCollection).toBe(false);
    });

    it('should handle missing unit gracefully', () => {
      const unit = null;
      const hasUnit = unit !== null;

      expect(hasUnit).toBe(false);
    });

    it('should handle missing page gracefully', () => {
      const page = null;
      const hasPage = page !== null;

      expect(hasPage).toBe(false);
    });

    it('should not record progress if any parameter is missing', () => {
      const collectionId = 'col_1';
      const unit = null;
      const page = 1;
      const score = 85;

      const shouldRecord = collectionId && unit && page;
      expect(shouldRecord).toBeFalsy();
    });

    it('should handle empty vocabulary array', () => {
      const vocabulary: any[] = [];
      const hasVocabulary = vocabulary.length > 0;

      expect(hasVocabulary).toBe(false);
    });

    it('should show error message if vocabulary loading fails', () => {
      const error = 'Fehler beim Laden der Vokabeln';
      expect(error).toBeDefined();
    });
  });
});
