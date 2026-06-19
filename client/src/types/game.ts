// Game Types and Constants

export type GameMode = 'selection' | 'game' | 'results' | 'menu';
export type GameDirection = 'en-de' | 'de-en' | 'random';
export type GameLevel = 1 | 2 | 3 | 'challenge';
export type GameType = 'vocabulary' | 'sentences';

export interface Vocabulary {
  id?: string;
  english: string;
  deutsch: string;
  unit?: string;
  page?: string;
}

export interface WordWithDirection extends Vocabulary {
  direction?: 'en-de' | 'de-en'; // For random mode: which direction this word should be tested
}

export interface Sentence {
  english: string;
  deutsch: string;
  englishSentence: string; // e.g., "The ___ is red"
  deutschSentence: string; // e.g., "Das ___ ist rot"
  word: Vocabulary; // The word to fill in
}

export interface Unit {
  name: string;
  pages: { [pageNum: string]: Vocabulary[] };
}

export interface SelectedContent {
  unitName: string;
  pages: string[];
}

export interface WordError {
  word: string;
  errorCount: number;
  lastError: string; // ISO date
}

export interface GameState {
  mode: GameMode;
  direction: GameDirection;
  currentDirection?: 'en-de' | 'de-en';
  level: GameLevel;
  gameType: GameType;
  selectedContent: SelectedContent | null;
  currentWordIndex: number;
  score: number;
  combo: number;
  maxCombo: number;
  errors: number;
  maxErrors: number;
  timeRemaining: number;
  totalTime: number;
  isGameActive: boolean;
  words: Vocabulary[];
  currentWord: Vocabulary | null;
  sentences?: Sentence[];
  currentSentence?: Sentence | null;
  answered: boolean;
  isCorrect: boolean | null;
  wordsCompleted?: number; // For challenge mode
  targetWords?: number; // For challenge mode
  erroredWords?: WordError[]; // Track wrong words
  correctStreak?: number; // For adaptive difficulty
}

export interface HighScore {
  score: number;
  date: string;
  level: GameLevel;
  direction: GameDirection;
  gameType: GameType;
  combo: number;
  unit?: string;
  errors?: number;
  timeSpent?: number;
}

export interface GameStatistics {
  totalGames: number;
  totalScore: number;
  wrongWords: { word: string; count: number }[];
  correctWords: { word: string; count: number }[];
  averageCombo: number;
  bestLevel: GameLevel;
  unitStats: { [unitName: string]: { gamesPlayed: number; errorRate: number; averageScore: number } };
}

export interface SessionErrors {
  [word: string]: number; // word -> error count in this session
}

export const MAX_ERRORS = {
  1: 5,
  2: 10,
  3: 10,
  challenge: 999, // No limit for challenge mode
};

export const TIME_LIMITS = {
  1: 60, // 1 minute
  2: 90, // 1.5 minutes
  3: 120, // 2 minutes
  challenge: 180, // 3 minutes
};

export const POINTS_PER_WORD = {
  1: 10,
  2: 15,
  3: 20,
  challenge: 5, // Lower points for challenge mode
};

export const COMBO_MULTIPLIER = 1.1; // 10% increase per combo

// Player Profile Types
export interface PlayerStats {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  bestLevel: GameLevel;
  maxCombo: number;
  totalTimeSpent: number; // in seconds
  unitProgress: { [unitName: string]: { completed: number; total: number } };
  lastPlayedDate: string; // ISO date
}

export interface PlayerProfile {
  id?: string; // UUID from Supabase or local ID
  name: string;
  createdDate: string; // ISO date
  stats: PlayerStats;
  highScores: HighScore[];
  erroredWords: WordError[];
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly';
  startDate: string; // ISO date
  endDate: string; // ISO date
  targetScore: number;
  reward: number; // bonus points
  completed: boolean;
  playerScore?: number;
}

export interface LearningRecommendation {
  unitName: string;
  reason: 'high_error_rate' | 'not_practiced' | 'weak_performance';
  errorRate: number;
  suggestedLevel: GameLevel;
  priority: 'high' | 'medium' | 'low';
}
