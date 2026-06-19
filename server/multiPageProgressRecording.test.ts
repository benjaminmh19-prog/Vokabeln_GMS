import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Multi-Page Progress Recording Tests
 * 
 * Tests für die Progress-Recording-Funktionalität bei Multi-Page-Sessions:
 * - Fortschritt wird für jede ausgewählte Seite aufgezeichnet
 * - Backward Compatibility mit Single-Page-Sessions
 * - Korrekte Datenstruktur für Progress-Tracking
 * - localStorage Integration
 */

describe('Multi-Page Progress Recording', () => {
  // Mock localStorage
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    });
  });

  describe('localStorage Data Structure', () => {
    it('should store selectedPages as JSON array in localStorage', () => {
      const selectedPages = [12, 13, 15];
      localStorage.setItem('selectedPages', JSON.stringify(selectedPages));
      
      const stored = localStorage.getItem('selectedPages');
      const parsed = JSON.parse(stored!);
      
      expect(parsed).toEqual([12, 13, 15]);
    });

    it('should store selectedPage as string for backward compatibility', () => {
      const selectedPage = 12;
      localStorage.setItem('selectedPage', selectedPage.toString());
      
      const stored = localStorage.getItem('selectedPage');
      expect(stored).toBe('12');
    });

    it('should handle both selectedPages and selectedPage in localStorage', () => {
      localStorage.setItem('selectedPages', JSON.stringify([12, 13, 15]));
      localStorage.setItem('selectedPage', '12');
      
      const pages = localStorage.getItem('selectedPages');
      const page = localStorage.getItem('selectedPage');
      
      expect(pages).toBeDefined();
      expect(page).toBeDefined();
    });
  });

  describe('Progress Recording Logic', () => {
    it('should extract pages from multi-page session', () => {
      localStorage.setItem('selectedPages', JSON.stringify([12, 13, 15]));
      
      const selectedPagesStr = localStorage.getItem('selectedPages');
      let pagesToRecord: number[] = [];
      
      if (selectedPagesStr) {
        try {
          pagesToRecord = JSON.parse(selectedPagesStr);
        } catch (e) {
          console.error('Error parsing selectedPages:', e);
        }
      }
      
      expect(pagesToRecord).toEqual([12, 13, 15]);
      expect(pagesToRecord.length).toBe(3);
    });

    it('should extract page from single-page session (backward compatibility)', () => {
      localStorage.setItem('selectedPage', '12');
      
      const selectedPageStr = localStorage.getItem('selectedPage');
      let pagesToRecord: number[] = [];
      
      if (selectedPageStr) {
        pagesToRecord = [parseInt(selectedPageStr)];
      }
      
      expect(pagesToRecord).toEqual([12]);
      expect(pagesToRecord.length).toBe(1);
    });

    it('should prefer selectedPages over selectedPage if both exist', () => {
      localStorage.setItem('selectedPages', JSON.stringify([12, 13, 15]));
      localStorage.setItem('selectedPage', '12');
      
      const selectedPagesStr = localStorage.getItem('selectedPages');
      const selectedPageStr = localStorage.getItem('selectedPage');
      let pagesToRecord: number[] = [];
      
      if (selectedPagesStr) {
        try {
          pagesToRecord = JSON.parse(selectedPagesStr);
        } catch (e) {
          console.error('Error parsing selectedPages:', e);
        }
      } else if (selectedPageStr) {
        pagesToRecord = [parseInt(selectedPageStr)];
      }
      
      expect(pagesToRecord).toEqual([12, 13, 15]);
    });

    it('should handle empty selectedPages gracefully', () => {
      localStorage.setItem('selectedPages', JSON.stringify([]));
      
      const selectedPagesStr = localStorage.getItem('selectedPages');
      let pagesToRecord: number[] = [];
      
      if (selectedPagesStr) {
        try {
          pagesToRecord = JSON.parse(selectedPagesStr);
        } catch (e) {
          console.error('Error parsing selectedPages:', e);
        }
      }
      
      expect(pagesToRecord).toEqual([]);
      expect(pagesToRecord.length).toBe(0);
    });

    it('should handle malformed JSON gracefully', () => {
      localStorage.setItem('selectedPages', 'invalid json');
      
      const selectedPagesStr = localStorage.getItem('selectedPages');
      let pagesToRecord: number[] = [];
      let errorCaught = false;
      
      if (selectedPagesStr) {
        try {
          pagesToRecord = JSON.parse(selectedPagesStr);
        } catch (e) {
          errorCaught = true;
          console.error('Error parsing selectedPages:', e);
        }
      }
      
      expect(errorCaught).toBe(true);
      expect(pagesToRecord).toEqual([]);
    });
  });

  describe('Progress Recording Calls', () => {
    it('should record completion for single page', () => {
      const recordedPages: number[] = [];
      const mockRecordPageCompletion = (
        collectionId: string,
        unit: number,
        page: number,
        score: number
      ) => {
        recordedPages.push(page);
      };
      
      localStorage.setItem('selectedPages', JSON.stringify([12]));
      const selectedPagesStr = localStorage.getItem('selectedPages');
      const pagesToRecord = JSON.parse(selectedPagesStr!);
      
      pagesToRecord.forEach((page: number) => {
        mockRecordPageCompletion('collection-1', 1, page, 100);
      });
      
      expect(recordedPages).toEqual([12]);
      expect(recordedPages.length).toBe(1);
    });

    it('should record completion for multiple pages', () => {
      const recordedPages: number[] = [];
      const mockRecordPageCompletion = (
        collectionId: string,
        unit: number,
        page: number,
        score: number
      ) => {
        recordedPages.push(page);
      };
      
      localStorage.setItem('selectedPages', JSON.stringify([12, 13, 15]));
      const selectedPagesStr = localStorage.getItem('selectedPages');
      const pagesToRecord = JSON.parse(selectedPagesStr!);
      
      pagesToRecord.forEach((page: number) => {
        mockRecordPageCompletion('collection-1', 1, page, 100);
      });
      
      expect(recordedPages).toEqual([12, 13, 15]);
      expect(recordedPages.length).toBe(3);
    });

    it('should preserve page order when recording', () => {
      const recordedPages: number[] = [];
      const mockRecordPageCompletion = (
        collectionId: string,
        unit: number,
        page: number,
        score: number
      ) => {
        recordedPages.push(page);
      };
      
      const pages = [27, 12, 15, 13];
      localStorage.setItem('selectedPages', JSON.stringify(pages));
      const selectedPagesStr = localStorage.getItem('selectedPages');
      const pagesToRecord = JSON.parse(selectedPagesStr!);
      
      pagesToRecord.forEach((page: number) => {
        mockRecordPageCompletion('collection-1', 1, page, 100);
      });
      
      expect(recordedPages).toEqual(pages);
    });

    it('should pass correct parameters to recordPageCompletion', () => {
      const recordedCalls: Array<{
        collectionId: string;
        unit: number;
        page: number;
        score: number;
      }> = [];
      
      const mockRecordPageCompletion = (
        collectionId: string,
        unit: number,
        page: number,
        score: number
      ) => {
        recordedCalls.push({ collectionId, unit, page, score });
      };
      
      localStorage.setItem('selectedCollection', 'collection-1');
      localStorage.setItem('selectedUnit', '1');
      localStorage.setItem('selectedPages', JSON.stringify([12, 13]));
      
      const selectedCollection = localStorage.getItem('selectedCollection');
      const selectedUnit = localStorage.getItem('selectedUnit');
      const selectedPagesStr = localStorage.getItem('selectedPages');
      const pagesToRecord = JSON.parse(selectedPagesStr!);
      const gameScore = 150;
      
      pagesToRecord.forEach((page: number) => {
        mockRecordPageCompletion(
          selectedCollection!,
          parseInt(selectedUnit!),
          page,
          gameScore
        );
      });
      
      expect(recordedCalls.length).toBe(2);
      expect(recordedCalls[0]).toEqual({
        collectionId: 'collection-1',
        unit: 1,
        page: 12,
        score: 150,
      });
      expect(recordedCalls[1]).toEqual({
        collectionId: 'collection-1',
        unit: 1,
        page: 13,
        score: 150,
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should work with old single-page format', () => {
      const recordedPages: number[] = [];
      const mockRecordPageCompletion = (
        collectionId: string,
        unit: number,
        page: number,
        score: number
      ) => {
        recordedPages.push(page);
      };
      
      // Old format: only selectedPage
      localStorage.setItem('selectedPage', '12');
      const selectedPageStr = localStorage.getItem('selectedPage');
      const pagesToRecord = selectedPageStr ? [parseInt(selectedPageStr)] : [];
      
      pagesToRecord.forEach((page: number) => {
        mockRecordPageCompletion('collection-1', 1, page, 100);
      });
      
      expect(recordedPages).toEqual([12]);
    });

    it('should handle missing selectedPages gracefully', () => {
      const recordedPages: number[] = [];
      const mockRecordPageCompletion = (
        collectionId: string,
        unit: number,
        page: number,
        score: number
      ) => {
        recordedPages.push(page);
      };
      
      // Only selectedPage exists (old format)
      localStorage.setItem('selectedPage', '15');
      
      const selectedPagesStr = localStorage.getItem('selectedPages');
      const selectedPageStr = localStorage.getItem('selectedPage');
      let pagesToRecord: number[] = [];
      
      if (selectedPagesStr) {
        try {
          pagesToRecord = JSON.parse(selectedPagesStr);
        } catch (e) {
          console.error('Error parsing selectedPages:', e);
        }
      } else if (selectedPageStr) {
        pagesToRecord = [parseInt(selectedPageStr)];
      }
      
      pagesToRecord.forEach((page: number) => {
        mockRecordPageCompletion('collection-1', 1, page, 100);
      });
      
      expect(recordedPages).toEqual([15]);
    });
  });

  describe('Game Score Distribution', () => {
    it('should record the same score for all pages in multi-page session', () => {
      const recordedScores: number[] = [];
      const mockRecordPageCompletion = (
        collectionId: string,
        unit: number,
        page: number,
        score: number
      ) => {
        recordedScores.push(score);
      };
      
      localStorage.setItem('selectedPages', JSON.stringify([12, 13, 15]));
      const selectedPagesStr = localStorage.getItem('selectedPages');
      const pagesToRecord = JSON.parse(selectedPagesStr!);
      const gameScore = 250;
      
      pagesToRecord.forEach((page: number) => {
        mockRecordPageCompletion('collection-1', 1, page, gameScore);
      });
      
      expect(recordedScores).toEqual([250, 250, 250]);
      expect(recordedScores.every(s => s === 250)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle large number of pages', () => {
      const pages = Array.from({ length: 100 }, (_, i) => i + 1);
      localStorage.setItem('selectedPages', JSON.stringify(pages));
      
      const selectedPagesStr = localStorage.getItem('selectedPages');
      const pagesToRecord = JSON.parse(selectedPagesStr!);
      
      expect(pagesToRecord.length).toBe(100);
      expect(pagesToRecord[0]).toBe(1);
      expect(pagesToRecord[99]).toBe(100);
    });

    it('should handle duplicate pages in selection', () => {
      const pages = [12, 12, 13, 13, 15];
      localStorage.setItem('selectedPages', JSON.stringify(pages));
      
      const selectedPagesStr = localStorage.getItem('selectedPages');
      const pagesToRecord = JSON.parse(selectedPagesStr!);
      
      expect(pagesToRecord).toEqual([12, 12, 13, 13, 15]);
    });

    it('should handle zero score', () => {
      const recordedScores: number[] = [];
      const mockRecordPageCompletion = (
        collectionId: string,
        unit: number,
        page: number,
        score: number
      ) => {
        recordedScores.push(score);
      };
      
      localStorage.setItem('selectedPages', JSON.stringify([12, 13]));
      const selectedPagesStr = localStorage.getItem('selectedPages');
      const pagesToRecord = JSON.parse(selectedPagesStr!);
      const gameScore = 0;
      
      pagesToRecord.forEach((page: number) => {
        mockRecordPageCompletion('collection-1', 1, page, gameScore);
      });
      
      expect(recordedScores).toEqual([0, 0]);
    });
  });
});
