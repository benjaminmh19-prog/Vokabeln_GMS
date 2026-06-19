import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'games' | 'streak' | 'accuracy' | 'time';
  target: number; // e.g., 5 games, 10 streak, 80% accuracy
  reward: number; // XP reward
  completed: boolean;
  progress: number;
}

export interface DailyChallengesContextType {
  challenges: DailyChallenge[];
  todaysChallenges: DailyChallenge[];
  completedChallenges: string[];
  totalDailyReward: number;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  completeChallenge: (challengeId: string) => void;
  resetDailyChallenges: () => void;
  getTodaysChallenges: () => DailyChallenge[];
}

const DailyChallengesContext = createContext<DailyChallengesContextType | undefined>(undefined);

export function DailyChallengesProvider({ children }: { children: React.ReactNode }) {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  // Initialize daily challenges
  useEffect(() => {
    loadDailyChallenges();
  }, []);

  const loadDailyChallenges = () => {
    // Check if challenges are already loaded for today
    const playerId = localStorage.getItem('currentPlayerId') || 'guest';
    const stored = localStorage.getItem(`dailyChallenges_${playerId}`);
    const storedDate = localStorage.getItem(`dailyChallengesDate_${playerId}`);
    const today = new Date().toDateString();

    if (stored && storedDate === today) {
      const data = JSON.parse(stored);
      setChallenges(data.challenges);
      setCompletedChallenges(data.completed);
    } else {
      // Generate new daily challenges
      const newChallenges = generateDailyChallenges();
      setChallenges(newChallenges);
      setCompletedChallenges([]);
      const playerId = localStorage.getItem('currentPlayerId') || 'guest';
      localStorage.setItem(`dailyChallenges_${playerId}`, JSON.stringify({
        challenges: newChallenges,
        completed: [],
      }));
      localStorage.setItem(`dailyChallengesDate_${playerId}`, today);
    }
  };

  const generateDailyChallenges = (): DailyChallenge[] => {
    return [
      {
        id: 'daily_games_5',
        title: '🎮 Spielmeister',
        description: 'Spiele 5 Spiele',
        type: 'games',
        target: 5,
        reward: 50,
        completed: false,
        progress: 0,
      },
      {
        id: 'daily_streak_10',
        title: '🔥 Streak-König',
        description: 'Erreiche eine Serie von 10 richtigen Antworten',
        type: 'streak',
        target: 10,
        reward: 75,
        completed: false,
        progress: 0,
      },
      {
        id: 'daily_accuracy_80',
        title: '🎯 Präzisions-Experte',
        description: 'Erreiche 80% Genauigkeit in einem Spiel',
        type: 'accuracy',
        target: 80,
        reward: 60,
        completed: false,
        progress: 0,
      },
      {
        id: 'daily_time_challenge',
        title: '⏱️ Zeit-Herausforderung',
        description: 'Spiele Level 3 unter 2 Minuten',
        type: 'time',
        target: 120, // 2 minutes in seconds
        reward: 100,
        completed: false,
        progress: 0,
      },
    ];
  };

  const updateChallengeProgress = (challengeId: string, progress: number) => {
    setChallenges((prev) =>
      prev.map((challenge) => {
        if (challenge.id === challengeId) {
          const newProgress = Math.min(progress, challenge.target);
          const completed = newProgress >= challenge.target;

          if (completed && !challenge.completed) {
            // Challenge just completed
            setCompletedChallenges((prev) => [...prev, challengeId]);
          }

          return {
            ...challenge,
            progress: newProgress,
            completed,
          };
        }
        return challenge;
      })
    );
  };

  const completeChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((challenge) => {
        if (challenge.id === challengeId) {
          return { ...challenge, completed: true };
        }
        return challenge;
      })
    );

    if (!completedChallenges.includes(challengeId)) {
      setCompletedChallenges((prev) => [...prev, challengeId]);
    }
  };

  const resetDailyChallenges = () => {
    const newChallenges = generateDailyChallenges();
    setChallenges(newChallenges);
    setCompletedChallenges([]);
    const today = new Date().toDateString();
    const playerId = localStorage.getItem('currentPlayerId') || 'guest';
    localStorage.setItem(`dailyChallenges_${playerId}`, JSON.stringify({
      challenges: newChallenges,
      completed: [],
    }));
    localStorage.setItem(`dailyChallengesDate_${playerId}`, today);
  };



  // Save challenges to localStorage whenever they change
  useEffect(() => {
    const playerId = localStorage.getItem('currentPlayerId') || 'guest';
    localStorage.setItem(`dailyChallenges_${playerId}`, JSON.stringify({
      challenges,
      completed: completedChallenges,
    }));
  }, [challenges, completedChallenges]);

  const getTodaysChallenges = (): DailyChallenge[] => {
    return challenges;
  };

  const totalDailyReward = challenges
    .filter((c) => c.completed)
    .reduce((sum, c) => sum + c.reward, 0);

  const value: DailyChallengesContextType = {
    challenges,
    todaysChallenges: challenges,
    completedChallenges,
    totalDailyReward,
    updateChallengeProgress,
    completeChallenge,
    resetDailyChallenges,
    getTodaysChallenges,
  };

  return (
    <DailyChallengesContext.Provider value={value}>
      {children}
    </DailyChallengesContext.Provider>
  );
}

export function useDailyChallenges() {
  const context = useContext(DailyChallengesContext);
  if (context === undefined) {
    throw new Error('useDailyChallenges must be used within DailyChallengesProvider');
  }
  return context;
}
