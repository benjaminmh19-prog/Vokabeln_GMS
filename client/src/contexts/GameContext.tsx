import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  GameState,
  GameMode,
  GameDirection,
  GameLevel,
  GameType,
  SelectedContent,
  Vocabulary,
  HighScore,
  WordError,
  MAX_ERRORS,
  TIME_LIMITS,
  POINTS_PER_WORD,
  COMBO_MULTIPLIER,
} from '@/types/game';
import { validateAnswer } from '@/lib/authUtils';

interface GameContextType {
  gameState: GameState;
  highScores: HighScore[];
  setGameMode: (mode: GameMode) => void;
  startGame: (
    direction: GameDirection,
    level: GameLevel,
    gameType: GameType,
    selectedContent: SelectedContent,
    words: Vocabulary[]
  ) => void;
  submitAnswer: (answer: string) => void;
  nextWord: () => void;
  endGame: () => void;
  resetGame: () => void;
  addHighScore: (score: HighScore) => void;
  clearHighScores: () => void;
  getErroredWords: () => WordError[];
  clearErroredWords: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    mode: 'menu',
    direction: 'en-de',
    level: 1,
    gameType: 'vocabulary',
    selectedContent: null,
    currentWordIndex: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    errors: 0,
    maxErrors: MAX_ERRORS[1],
    timeRemaining: TIME_LIMITS[1],
    totalTime: TIME_LIMITS[1],
    isGameActive: false,
    words: [],
    currentWord: null,
    answered: false,
    isCorrect: null,
    wordsCompleted: 0,
    targetWords: 20,
    erroredWords: [],
    correctStreak: 0,
  });

  const [highScores, setHighScores] = useState<HighScore[]>(() => {
    const saved = localStorage.getItem('vokabel-champion-highscores');
    return saved ? JSON.parse(saved) : [];
  });

  const [erroredWords, setErroredWords] = useState<WordError[]>(() => {
    const saved = localStorage.getItem('vokabel-champion-errored-words');
    return saved ? JSON.parse(saved) : [];
  });

  // Save high scores to localStorage
  useEffect(() => {
    localStorage.setItem('vokabel-champion-highscores', JSON.stringify(highScores));
  }, [highScores]);

  // Save errored words to localStorage
  useEffect(() => {
    localStorage.setItem('vokabel-champion-errored-words', JSON.stringify(erroredWords));
  }, [erroredWords]);

  // Timer effect - auto-end game when time runs out
  useEffect(() => {
    if (!gameState.isGameActive || gameState.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          // Auto-end game when time runs out
          return {
            ...prev,
            timeRemaining: 0,
            isGameActive: false,
          };
        }
        return {
          ...prev,
          timeRemaining: newTime,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isGameActive]);

  const setGameMode = useCallback((mode: GameMode) => {
    setGameState((prev) => ({
      ...prev,
      mode,
    }));
  }, []);

  // Get words with error weighting - errors repeat more often
  const getWeightedWords = (words: Vocabulary[]): Vocabulary[] => {
    const weighted: Vocabulary[] = [];
    
    words.forEach((word) => {
      weighted.push(word);
      
      // Find if this word has been errored before
      const errorEntry = erroredWords.find(
        (e) => e.word.toLowerCase() === word.english.toLowerCase() || 
               e.word.toLowerCase() === word.deutsch.toLowerCase()
      );
      
      if (errorEntry && errorEntry.errorCount > 0) {
        // Add duplicates based on error count (max 3 duplicates)
        const duplicates = Math.min(errorEntry.errorCount, 3);
        for (let i = 0; i < duplicates; i++) {
          weighted.push(word);
        }
      }
    });
    
    return weighted.sort(() => Math.random() - 0.5);
  };

  const startGame = useCallback(
    (
      direction: GameDirection,
      level: GameLevel,
      gameType: GameType,
      selectedContent: SelectedContent,
      words: Vocabulary[]
    ) => {
      // Get weighted words (errors appear more often)
      let weightedWords = getWeightedWords(words);

      // For random mode, assign a fixed direction to each word
      if (direction === 'random') {
        weightedWords = weightedWords.map((word) => ({
          ...word,
          direction: Math.random() > 0.5 ? 'en-de' : 'de-en',
        }));
      }

      const initialDirection = (weightedWords[0] as any)?.direction || direction;

      setGameState((prev) => ({
        ...prev,
        mode: 'game',
        direction,
        currentDirection: initialDirection as 'en-de' | 'de-en',
        level,
        gameType,
        selectedContent,
        words: weightedWords,
        currentWord: weightedWords[0] || null,
        currentWordIndex: 0,
        score: 0,
        combo: 0,
        maxCombo: 0,
        errors: 0,
        maxErrors: MAX_ERRORS[level],
        timeRemaining: TIME_LIMITS[level],
        totalTime: TIME_LIMITS[level],
        isGameActive: true,
        answered: false,
        isCorrect: null,
        wordsCompleted: 0,
        targetWords: level === 'challenge' ? 20 : undefined,
        erroredWords: [],
        correctStreak: 0,
      }));
    },
    [erroredWords]
  );

  const submitAnswer = useCallback((answer: string) => {
    setGameState((prev) => {
      if (!prev.currentWord || prev.answered) return prev;

      // Use the currentDirection that was set when the word was shown
      const currentDirection = prev.currentDirection || prev.direction;
      const correctAnswer = currentDirection === 'en-de' ? prev.currentWord.deutsch : prev.currentWord.english;
      
      // Use validateAnswer to support multiple answers separated by commas or semicolons
      const isCorrect = validateAnswer(answer, correctAnswer);

      let newScore = prev.score;
      let newCombo = prev.combo;
      let newMaxCombo = prev.maxCombo;
      let newErrors = prev.errors;
      let newWordsCompleted = prev.wordsCompleted || 0;
      let newCorrectStreak = prev.correctStreak || 0;
      let newLevel = prev.level;
      let newErroredWords = [...(prev.erroredWords || [])];

      if (isCorrect) {
        const basePoints = typeof prev.level === 'number' 
        ? POINTS_PER_WORD[prev.level]
        : POINTS_PER_WORD['challenge'] || 5;
        const comboBonus = Math.floor(basePoints * (prev.combo * (COMBO_MULTIPLIER - 1)));
        newScore = prev.score + basePoints + comboBonus;
        newCombo = prev.combo + 1;
        newMaxCombo = Math.max(prev.maxCombo, newCombo);
        newWordsCompleted += 1;
        newCorrectStreak += 1;

        // Adaptive difficulty: increase level after 15 correct answers in a row
        if (newCorrectStreak >= 15 && prev.level !== 3 && prev.level !== 'challenge') {
          const nextLevel = (prev.level as number) + 1;
          newLevel = nextLevel as GameLevel;
          newCorrectStreak = 0; // Reset streak for new level
        }
      } else {
        newErrors = prev.errors + 1;
        newCombo = 0;
        newCorrectStreak = 0;

        // Track errored word
        const wordToTrack = currentDirection === 'en-de' ? prev.currentWord.english : prev.currentWord.deutsch;
        const existingError = newErroredWords.find((e) => e.word.toLowerCase() === wordToTrack.toLowerCase());
        
        if (existingError) {
          existingError.errorCount += 1;
          existingError.lastError = new Date().toISOString();
        } else {
          newErroredWords.push({
            word: wordToTrack,
            errorCount: 1,
            lastError: new Date().toISOString(),
          });
        }

        // Update global error tracking
        setErroredWords((prev) => {
          const existing = prev.find((e) => e.word.toLowerCase() === wordToTrack.toLowerCase());
          if (existing) {
            return prev.map((e) =>
              e.word.toLowerCase() === wordToTrack.toLowerCase()
                ? { ...e, errorCount: e.errorCount + 1, lastError: new Date().toISOString() }
                : e
            );
          }
          return [
            ...prev,
            {
              word: wordToTrack,
              errorCount: 1,
              lastError: new Date().toISOString(),
            },
          ];
        });
      }

      const isChallengeComplete = prev.level === 'challenge' && newWordsCompleted >= (prev.targetWords || 20);
      const maxErrorsForLevel = typeof prev.level === 'number'
        ? MAX_ERRORS[prev.level]
        : MAX_ERRORS['challenge'] || 999;
      const isGameOver = newErrors >= prev.maxErrors || prev.timeRemaining <= 0 || isChallengeComplete;

      return {
        ...prev,
        level: newLevel,
        answered: true,
        isCorrect,
        score: newScore,
        combo: newCombo,
        maxCombo: newMaxCombo,
        errors: newErrors,
        isGameActive: !isGameOver,
        wordsCompleted: newWordsCompleted,
        erroredWords: newErroredWords,
        correctStreak: newCorrectStreak,
      };
    });
  }, []);

  const nextWord = useCallback(() => {
    setGameState((prev) => {
      const nextIndex = prev.currentWordIndex + 1;
      const isChallengeComplete = prev.level === 'challenge' && (prev.wordsCompleted || 0) >= (prev.targetWords || 20);
      const isGameOver =
        nextIndex >= prev.words.length ||
        prev.errors >= prev.maxErrors ||
        prev.timeRemaining <= 0 ||
        isChallengeComplete;

      if (isGameOver) {
        return {
          ...prev,
          mode: 'results',
          isGameActive: false,
          answered: false,
        };
      }

      // For random mode, use the direction assigned to this word
      const nextWord = prev.words[nextIndex] as any;
      const newDirection = (nextWord?.direction || prev.direction) as 'en-de' | 'de-en';

      return {
        ...prev,
        currentWordIndex: nextIndex,
        currentWord: prev.words[nextIndex] || null,
        currentDirection: newDirection as 'en-de' | 'de-en',
        answered: false,
        isCorrect: null,
      };
    });
  }, []);

  const endGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      mode: 'results',
      isGameActive: false,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState((prev) => {
      // Handle challenge level which may not have a TIME_LIMIT entry
      const timeLimit = typeof prev.level === 'number' 
        ? TIME_LIMITS[prev.level]
        : TIME_LIMITS['challenge'] || 180;
      
      return {
        ...prev,
        mode: 'menu',
        currentWordIndex: 0,
        score: 0,
        combo: 0,
        maxCombo: 0,
        errors: 0,
        timeRemaining: timeLimit,
        isGameActive: false,
        words: [],
        currentWord: null,
        answered: false,
        isCorrect: null,
        wordsCompleted: 0,
        targetWords: 20,
        erroredWords: [],
        correctStreak: 0,
      };
    });
  }, []);

  const addHighScore = useCallback((score: HighScore) => {
    // Add player_id from localStorage if available
    const playerId = localStorage.getItem('currentPlayerId');
    const scoreWithPlayer = {
      ...score,
      player_id: playerId || undefined,
    };
    
    setHighScores((prev) => {
      const updated = [...prev, scoreWithPlayer].sort((a, b) => b.score - a.score).slice(0, 50);
      return updated;
    });
  }, []);

  const clearHighScores = useCallback(() => {
    setHighScores([]);
  }, []);

  const getErroredWords = useCallback(() => {
    return erroredWords.sort((a, b) => b.errorCount - a.errorCount);
  }, [erroredWords]);

  const clearErroredWords = useCallback(() => {
    setErroredWords([]);
  }, []);

  const value: GameContextType = {
    gameState,
    highScores,
    setGameMode,
    startGame,
    submitAnswer,
    nextWord,
    endGame,
    resetGame,
    addHighScore,
    clearHighScores,
    getErroredWords,
    clearErroredWords,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
