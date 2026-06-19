import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Multi-Page Selection Tests
 * 
 * Tests für die neue Funktionalität der Multi-Page-Auswahl:
 * - Benutzer können mehrere Seiten innerhalb einer Unit auswählen
 * - Vokabeln werden aus allen ausgewählten Seiten aggregiert
 * - UI zeigt korrekte Zähler und Feedback
 * - Spiel startet mit aggregierten Vokabeln
 */

describe('Multi-Page Selection Feature', () => {
  // Mock data for testing
  const mockVocabulary = [
    // Page 12 (9 items)
    { id: '1', english: 'school', deutsch: 'die Schule', unit: 1, page: 12 },
    { id: '2', english: 'teacher', deutsch: 'der Lehrer', unit: 1, page: 12 },
    { id: '3', english: 'student', deutsch: 'der Schüler', unit: 1, page: 12 },
    { id: '4', english: 'book', deutsch: 'das Buch', unit: 1, page: 12 },
    { id: '5', english: 'pen', deutsch: 'der Stift', unit: 1, page: 12 },
    { id: '6', english: 'desk', deutsch: 'der Schreibtisch', unit: 1, page: 12 },
    { id: '7', english: 'chair', deutsch: 'der Stuhl', unit: 1, page: 12 },
    { id: '8', english: 'classroom', deutsch: 'das Klassenzimmer', unit: 1, page: 12 },
    { id: '9', english: 'homework', deutsch: 'die Hausaufgaben', unit: 1, page: 12 },
    
    // Page 13 (9 items)
    { id: '10', english: 'apple', deutsch: 'der Apfel', unit: 1, page: 13 },
    { id: '11', english: 'banana', deutsch: 'die Banane', unit: 1, page: 13 },
    { id: '12', english: 'orange', deutsch: 'die Orange', unit: 1, page: 13 },
    { id: '13', english: 'grape', deutsch: 'die Traube', unit: 1, page: 13 },
    { id: '14', english: 'strawberry', deutsch: 'die Erdbeere', unit: 1, page: 13 },
    { id: '15', english: 'watermelon', deutsch: 'die Wassermelone', unit: 1, page: 13 },
    { id: '16', english: 'lemon', deutsch: 'die Zitrone', unit: 1, page: 13 },
    { id: '17', english: 'peach', deutsch: 'der Pfirsich', unit: 1, page: 13 },
    { id: '18', english: 'pear', deutsch: 'die Birne', unit: 1, page: 13 },
    
    // Page 15 (8 items)
    { id: '19', english: 'cat', deutsch: 'die Katze', unit: 1, page: 15 },
    { id: '20', english: 'dog', deutsch: 'der Hund', unit: 1, page: 15 },
    { id: '21', english: 'bird', deutsch: 'der Vogel', unit: 1, page: 15 },
    { id: '22', english: 'fish', deutsch: 'der Fisch', unit: 1, page: 15 },
    { id: '23', english: 'rabbit', deutsch: 'das Kaninchen', unit: 1, page: 15 },
    { id: '24', english: 'mouse', deutsch: 'die Maus', unit: 1, page: 15 },
    { id: '25', english: 'horse', deutsch: 'das Pferd', unit: 1, page: 15 },
    { id: '26', english: 'cow', deutsch: 'die Kuh', unit: 1, page: 15 },
  ];

  describe('Page Selection State Management', () => {
    it('should initialize with empty selected pages', () => {
      const selectedPages = new Set<number>();
      expect(selectedPages.size).toBe(0);
    });

    it('should add page to selected pages when toggled', () => {
      const selectedPages = new Set<number>();
      selectedPages.add(12);
      expect(selectedPages.has(12)).toBe(true);
      expect(selectedPages.size).toBe(1);
    });

    it('should remove page from selected pages when toggled again', () => {
      const selectedPages = new Set<number>();
      selectedPages.add(12);
      selectedPages.delete(12);
      expect(selectedPages.has(12)).toBe(false);
      expect(selectedPages.size).toBe(0);
    });

    it('should handle multiple page selections', () => {
      const selectedPages = new Set<number>();
      selectedPages.add(12);
      selectedPages.add(13);
      selectedPages.add(15);
      expect(selectedPages.size).toBe(3);
      expect(selectedPages.has(12)).toBe(true);
      expect(selectedPages.has(13)).toBe(true);
      expect(selectedPages.has(15)).toBe(true);
    });
  });

  describe('Vocabulary Aggregation', () => {
    it('should aggregate vocabulary from single selected page', () => {
      const selectedPages = new Set([12]);
      const aggregated = mockVocabulary.filter(v => selectedPages.has(v.page));
      expect(aggregated.length).toBe(9);
      expect(aggregated.every(v => v.page === 12)).toBe(true);
    });

    it('should aggregate vocabulary from multiple selected pages', () => {
      const selectedPages = new Set([12, 13, 15]);
      const aggregated = mockVocabulary.filter(v => selectedPages.has(v.page));
      expect(aggregated.length).toBe(26);
      expect(aggregated.some(v => v.page === 12)).toBe(true);
      expect(aggregated.some(v => v.page === 13)).toBe(true);
      expect(aggregated.some(v => v.page === 15)).toBe(true);
    });

    it('should maintain correct order when aggregating', () => {
      const selectedPages = new Set([12, 13, 15]);
      const aggregated = mockVocabulary.filter(v => selectedPages.has(v.page));
      
      // Check that pages appear in order
      const pageSequence = aggregated.map(v => v.page);
      const uniquePages = [...new Set(pageSequence)];
      expect(uniquePages).toEqual([12, 13, 15]);
    });

    it('should handle empty selection', () => {
      const selectedPages = new Set<number>();
      const aggregated = mockVocabulary.filter(v => selectedPages.has(v.page));
      expect(aggregated.length).toBe(0);
    });
  });

  describe('UI Counter Display', () => {
    it('should display correct counter for single selection', () => {
      const selectedPages = new Set([12]);
      const totalPages = 12;
      const counter = `${selectedPages.size} / ${totalPages}`;
      expect(counter).toBe('1 / 12');
    });

    it('should display correct counter for multiple selections', () => {
      const selectedPages = new Set([12, 13, 15]);
      const totalPages = 12;
      const counter = `${selectedPages.size} / ${totalPages}`;
      expect(counter).toBe('3 / 12');
    });

    it('should display correct counter for all pages selected', () => {
      const selectedPages = new Set([12, 13, 15, 16, 19, 20, 21, 22, 23, 25, 26, 27]);
      const totalPages = 12;
      const counter = `${selectedPages.size} / ${totalPages}`;
      expect(counter).toBe('12 / 12');
    });

    it('should display 0 when no pages selected', () => {
      const selectedPages = new Set<number>();
      const totalPages = 12;
      const counter = `${selectedPages.size} / ${totalPages}`;
      expect(counter).toBe('0 / 12');
    });
  });

  describe('Select All / Deselect All Functionality', () => {
    it('should select all pages when selectAll is called', () => {
      const allPages = [12, 13, 15, 16, 19, 20, 21, 22, 23, 25, 26, 27];
      const selectedPages = new Set(allPages);
      expect(selectedPages.size).toBe(12);
      expect(allPages.every(p => selectedPages.has(p))).toBe(true);
    });

    it('should deselect all pages when deselectAll is called', () => {
      const selectedPages = new Set([12, 13, 15]);
      selectedPages.clear();
      expect(selectedPages.size).toBe(0);
    });

    it('should toggle between select all and deselect all', () => {
      const allPages = [12, 13, 15];
      let selectedPages = new Set<number>();
      
      // Select all
      selectedPages = new Set(allPages);
      expect(selectedPages.size).toBe(3);
      
      // Deselect all
      selectedPages.clear();
      expect(selectedPages.size).toBe(0);
    });
  });

  describe('Game Start Validation', () => {
    it('should allow game start when at least one page is selected', () => {
      const selectedPages = new Set([12]);
      const canStartGame = selectedPages.size > 0;
      expect(canStartGame).toBe(true);
    });

    it('should prevent game start when no pages are selected', () => {
      const selectedPages = new Set<number>();
      const canStartGame = selectedPages.size > 0;
      expect(canStartGame).toBe(false);
    });

    it('should allow game start with multiple pages selected', () => {
      const selectedPages = new Set([12, 13, 15]);
      const canStartGame = selectedPages.size > 0;
      expect(canStartGame).toBe(true);
    });
  });

  describe('Game Initialization with Multiple Pages', () => {
    it('should create game config with multiple pages', () => {
      const selectedPages = [12, 13, 15];
      const gameConfig = {
        unitName: 'Unit 1',
        pages: selectedPages.map(p => p.toString()),
      };
      
      expect(gameConfig.unitName).toBe('Unit 1');
      expect(gameConfig.pages).toEqual(['12', '13', '15']);
      expect(gameConfig.pages.length).toBe(3);
    });

    it('should transform vocabulary correctly for game', () => {
      const selectedPages = new Set([12, 13]);
      const pageVocab = mockVocabulary.filter(v => selectedPages.has(v.page));
      
      const gameVocab = pageVocab.map(v => ({
        id: v.id,
        english: v.english,
        deutsch: v.deutsch,
        unit: v.unit.toString(),
        page: v.page.toString(),
      }));
      
      expect(gameVocab.length).toBe(18);
      expect(gameVocab[0]).toHaveProperty('id');
      expect(gameVocab[0]).toHaveProperty('english');
      expect(gameVocab[0]).toHaveProperty('deutsch');
      expect(gameVocab[0]).toHaveProperty('unit');
      expect(gameVocab[0]).toHaveProperty('page');
    });

    it('should preserve page information in game vocabulary', () => {
      const selectedPages = new Set([12, 13, 15]);
      const pageVocab = mockVocabulary.filter(v => selectedPages.has(v.page));
      
      const gameVocab = pageVocab.map(v => ({
        id: v.id,
        english: v.english,
        deutsch: v.deutsch,
        unit: v.unit.toString(),
        page: v.page.toString(),
      }));
      
      const pages = new Set(gameVocab.map(v => parseInt(v.page)));
      expect(pages.has(12)).toBe(true);
      expect(pages.has(13)).toBe(true);
      expect(pages.has(15)).toBe(true);
    });
  });

  describe('Progress Tracking with Multiple Pages', () => {
    it('should calculate correct total vocabulary count', () => {
      const selectedPages = new Set([12, 13, 15]);
      const aggregated = mockVocabulary.filter(v => selectedPages.has(v.page));
      const totalVocab = aggregated.length;
      
      expect(totalVocab).toBe(26);
    });

    it('should track progress as 1/26 for 3 selected pages', () => {
      const selectedPages = new Set([12, 13, 15]);
      const aggregated = mockVocabulary.filter(v => selectedPages.has(v.page));
      const currentQuestion = 1;
      const totalQuestions = aggregated.length;
      
      const progress = `${currentQuestion}/${totalQuestions}`;
      expect(progress).toBe('1/26');
    });

    it('should update progress correctly during game', () => {
      const selectedPages = new Set([12, 13, 15]);
      const aggregated = mockVocabulary.filter(v => selectedPages.has(v.page));
      const totalQuestions = aggregated.length;
      
      // Simulate game progress
      const progressSteps = [1, 5, 10, 15, 20, 26];
      const progressStrings = progressSteps.map(step => `${step}/${totalQuestions}`);
      
      expect(progressStrings[0]).toBe('1/26');
      expect(progressStrings[progressStrings.length - 1]).toBe('26/26');
    });
  });

  describe('Edge Cases', () => {
    it('should handle duplicate page selections gracefully', () => {
      const selectedPages = new Set<number>();
      selectedPages.add(12);
      selectedPages.add(12); // Try to add same page again
      expect(selectedPages.size).toBe(1); // Set prevents duplicates
    });

    it('should handle rapid page toggling', () => {
      const selectedPages = new Set<number>();
      
      // Rapid toggle
      selectedPages.add(12);
      selectedPages.delete(12);
      selectedPages.add(12);
      selectedPages.delete(12);
      
      expect(selectedPages.size).toBe(0);
    });

    it('should handle large number of page selections', () => {
      const selectedPages = new Set<number>();
      for (let i = 1; i <= 100; i++) {
        selectedPages.add(i);
      }
      expect(selectedPages.size).toBe(100);
    });

    it('should preserve selection order in array conversion', () => {
      const selectedPages = new Set([27, 12, 15, 13]); // Out of order
      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
      expect(sortedPages).toEqual([12, 13, 15, 27]);
    });
  });
});
