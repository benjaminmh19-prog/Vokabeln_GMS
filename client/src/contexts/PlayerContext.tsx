import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PlayerProfile, Challenge, LearningRecommendation, PlayerStats, HighScore } from '@/types/game';

interface PlayerContextType {
  currentPlayer: PlayerProfile | null;
  allPlayers: PlayerProfile[];
  challenges: Challenge[];
  recommendations: LearningRecommendation[];
  isLoading: boolean;
  setCurrentPlayer: (player: PlayerProfile | null) => void;
  createPlayer: (name: string) => Promise<void>;
  selectPlayer: (name: string) => void;
  updatePlayerStats: (stats: Partial<PlayerStats>) => Promise<void>;
  addHighScore: (score: HighScore) => Promise<void>;
  generateRecommendations: () => void;
  generateChallenges: () => void;
  completeChallengeIfEligible: (challengeId: string, score: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentPlayer, setCurrentPlayerState] = useState<PlayerProfile | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerProfile[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Wrapper for setCurrentPlayer that also updates localStorage
  const setCurrentPlayer = useCallback((player: PlayerProfile | null) => {
    setCurrentPlayerState(player);
    if (player) {
      localStorage.setItem('currentPlayerId', player.id || '');
      localStorage.setItem('currentPlayerName', player.name);
      localStorage.setItem('currentPlayerUsername', player.name);
      generateChallengesForPlayer(player);
    } else {
      localStorage.removeItem('currentPlayerId');
      localStorage.removeItem('currentPlayerName');
      localStorage.removeItem('currentPlayerUsername');
    }
  }, []);

  // Load players from localStorage on mount
  useEffect(() => {
    const loadPlayers = async () => {
      setIsLoading(true);
      try {
        // Get current player ID from localStorage
        const lastPlayerId = localStorage.getItem('currentPlayerId');
        const lastPlayerName = localStorage.getItem('currentPlayerName');

        // Load all players from localStorage
        const saved = localStorage.getItem('vokabel_players');
        if (saved) {
          try {
            const players = JSON.parse(saved);
            setAllPlayers(players);
            
            // Set current player if we have an ID
            if (lastPlayerId) {
              const player = players.find((p: any) => p.id === lastPlayerId);
              if (player) {
                setCurrentPlayerState(player);
                generateChallengesForPlayer(player);
              }
            } else if (lastPlayerName) {
              const player = players.find((p: PlayerProfile) => p.name === lastPlayerName);
              if (player) {
                setCurrentPlayerState(player);
                generateChallengesForPlayer(player);
              }
            }
          } catch (e) {
            console.warn('Failed to parse saved players:', e);
          }
        }
      } catch (e) {
        console.error('Failed to load players:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayers();
  }, []);

  // Listen for storage changes (from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentPlayerId' || e.key === 'vokabel_players') {
        // Reload players when storage changes
        const saved = localStorage.getItem('vokabel_players');
        if (saved) {
          try {
            const players = JSON.parse(saved);
            setAllPlayers(players);
            
            const currentId = localStorage.getItem('currentPlayerId');
            if (currentId) {
              const player = players.find((p: any) => p.id === currentId);
              if (player) {
                setCurrentPlayerState(player);
              }
            }
          } catch (e) {
            console.warn('Failed to parse saved players on storage change:', e);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save players to localStorage whenever they change
  useEffect(() => {
    if (allPlayers.length > 0) {
      localStorage.setItem('vokabel_players', JSON.stringify(allPlayers));
    }
  }, [allPlayers]);

  const createPlayer = useCallback(async (name: string) => {
    try {
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newPlayer: PlayerProfile = {
        id: playerId,
        name,
        createdDate: new Date().toISOString(),
        stats: {
          gamesPlayed: 0,
          totalScore: 0,
          bestScore: 0,
          bestLevel: 1,
          maxCombo: 0,
          totalTimeSpent: 0,
          unitProgress: {},
          lastPlayedDate: new Date().toISOString(),
        },
        highScores: [],
        erroredWords: [],
      };

      setAllPlayers((prev) => [...prev, newPlayer]);
      setCurrentPlayer(newPlayer);
    } catch (e) {
      console.error('Failed to create player:', e);
    }
  }, [setCurrentPlayer]);

  const selectPlayer = useCallback((name: string) => {
    const player = allPlayers.find((p) => p.name === name);
    if (player) {
      setCurrentPlayer(player);
    }
  }, [allPlayers, setCurrentPlayer]);

  const updatePlayerStats = useCallback(async (stats: Partial<PlayerStats>) => {
    if (!currentPlayer) return;

    const updated: PlayerProfile = {
      ...currentPlayer,
      stats: { ...currentPlayer.stats, ...stats },
    };

    setCurrentPlayerState(updated);
    setAllPlayers((prev) =>
      prev.map((p) => (p.id === currentPlayer.id ? updated : p))
    );
  }, [currentPlayer]);

  const addHighScore = useCallback(async (score: HighScore) => {
    if (!currentPlayer) return;

    const updated: PlayerProfile = {
      ...currentPlayer,
      highScores: [score, ...currentPlayer.highScores].slice(0, 10),
      stats: {
        ...currentPlayer.stats,
        bestScore: Math.max(currentPlayer.stats.bestScore, score.score),
        bestLevel: score.level > currentPlayer.stats.bestLevel ? score.level : currentPlayer.stats.bestLevel,
      },
    };

    setCurrentPlayerState(updated);
    setAllPlayers((prev) =>
      prev.map((p) => (p.id === currentPlayer.id ? updated : p))
    );
  }, [currentPlayer]);

  const generateChallengesForPlayer = useCallback((player: PlayerProfile) => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const newChallenges: Challenge[] = [
      {
        id: `daily_${today.toISOString().split('T')[0]}`,
        name: `Daily Challenge - ${today.toLocaleDateString()}`,
        description: 'Complete 50 words correctly in any level',
        type: 'daily',
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        targetScore: 500,
        reward: 50,
        completed: false,
      },
      {
        id: `weekly_${weekStart.toISOString().split('T')[0]}`,
        name: `Weekly Challenge - Week of ${weekStart.toLocaleDateString()}`,
        description: 'Reach 2000 points this week',
        type: 'weekly',
        startDate: weekStart.toISOString(),
        endDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        targetScore: 2000,
        reward: 200,
        completed: false,
      },
    ];

    setChallenges(newChallenges);
  }, []);

  const generateRecommendations = useCallback(() => {
    if (!currentPlayer) return;

    const recs: LearningRecommendation[] = [];

    currentPlayer.erroredWords.forEach((errorWord) => {
      if (errorWord.errorCount >= 3) {
        const unitName = 'Unit 1';
        const existing = recs.find((r) => r.unitName === unitName);

        if (existing) {
          existing.errorRate = (existing.errorRate + errorWord.errorCount) / 2;
        } else {
          recs.push({
            unitName,
            reason: 'high_error_rate',
            errorRate: errorWord.errorCount,
            suggestedLevel: 1,
            priority: errorWord.errorCount >= 5 ? 'high' : 'medium',
          });
        }
      }
    });

    setRecommendations(recs);
  }, [currentPlayer]);

  const completeChallengeIfEligible = useCallback(
    (challengeId: string, score: number) => {
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId && score >= c.targetScore
            ? { ...c, completed: true, playerScore: score }
            : c
        )
      );
    },
    []
  );

  return (
    <PlayerContext.Provider
      value={{
        currentPlayer,
        allPlayers,
        challenges,
        recommendations,
        isLoading,
        setCurrentPlayer,
        createPlayer,
        selectPlayer,
        updatePlayerStats,
        addHighScore,
        generateRecommendations,
        generateChallenges: () => currentPlayer && generateChallengesForPlayer(currentPlayer),
        completeChallengeIfEligible,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
