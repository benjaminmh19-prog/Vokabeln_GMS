import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface MultiplayerPlayer {
  id: string;
  name: string;
  score: number;
  wordsCompleted: number;
  isActive: boolean;
  lastUpdate: number;
}

export interface MultiplayerSession {
  id: string;
  hostName: string;
  players: MultiplayerPlayer[];
  startTime: number;
  endTime?: number;
  isActive: boolean;
}

interface MultiplayerContextType {
  sessions: MultiplayerSession[];
  currentSession: MultiplayerSession | null;
  createSession: (hostName: string) => string;
  joinSession: (sessionId: string, playerName: string) => void;
  leaveSession: (sessionId: string) => void;
  updatePlayerScore: (sessionId: string, playerId: string, score: number, wordsCompleted: number) => void;
  endSession: (sessionId: string) => void;
  getSessionLeaderboard: (sessionId: string) => MultiplayerPlayer[];
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export const MultiplayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<MultiplayerSession[]>(() => {
    const saved = localStorage.getItem('vokabel-champion-multiplayer-sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentSession, setCurrentSession] = useState<MultiplayerSession | null>(null);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('vokabel-champion-multiplayer-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Clean up inactive sessions every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) =>
        prev.filter((session) => {
          if (!session.isActive) return false;
          const timeSinceStart = Date.now() - session.startTime;
          return timeSinceStart < 1800000; // 30 minutes
        })
      );
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const createSession = useCallback((hostName: string): string => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSession: MultiplayerSession = {
      id: sessionId,
      hostName,
      players: [
        {
          id: `player-${Date.now()}`,
          name: hostName,
          score: 0,
          wordsCompleted: 0,
          isActive: true,
          lastUpdate: Date.now(),
        },
      ],
      startTime: Date.now(),
      isActive: true,
    };

    setSessions((prev) => [...prev, newSession]);
    setCurrentSession(newSession);
    return sessionId;
  }, []);

  const joinSession = useCallback((sessionId: string, playerName: string) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId && session.isActive) {
          const newPlayer: MultiplayerPlayer = {
            id: `player-${Date.now()}`,
            name: playerName,
            score: 0,
            wordsCompleted: 0,
            isActive: true,
            lastUpdate: Date.now(),
          };

          const updatedSession = {
            ...session,
            players: [...session.players, newPlayer],
          };

          setCurrentSession(updatedSession);
          return updatedSession;
        }
        return session;
      })
    );
  }, []);

  const leaveSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          const updatedSession = {
            ...session,
            players: session.players.filter((p) => p.isActive),
            isActive: session.players.length > 1,
          };
          if (currentSession?.id === sessionId) {
            setCurrentSession(null);
          }
          return updatedSession;
        }
        return session;
      })
    );
  }, [currentSession]);

  const updatePlayerScore = useCallback(
    (sessionId: string, playerId: string, score: number, wordsCompleted: number) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === sessionId) {
            const updatedSession = {
              ...session,
              players: session.players.map((player) =>
                player.id === playerId
                  ? {
                      ...player,
                      score,
                      wordsCompleted,
                      lastUpdate: Date.now(),
                    }
                  : player
              ),
            };

            if (currentSession?.id === sessionId) {
              setCurrentSession(updatedSession);
            }

            return updatedSession;
          }
          return session;
        })
      );
    },
    [currentSession]
  );

  const endSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          const updatedSession = {
            ...session,
            isActive: false,
            endTime: Date.now(),
          };

          if (currentSession?.id === sessionId) {
            setCurrentSession(null);
          }

          return updatedSession;
        }
        return session;
      })
    );
  }, [currentSession]);

  const getSessionLeaderboard = useCallback((sessionId: string): MultiplayerPlayer[] => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return [];

    return [...session.players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.wordsCompleted - a.wordsCompleted;
    });
  }, [sessions]);

  return (
    <MultiplayerContext.Provider
      value={{
        sessions,
        currentSession,
        createSession,
        joinSession,
        leaveSession,
        updatePlayerScore,
        endSession,
        getSessionLeaderboard,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within MultiplayerProvider');
  }
  return context;
};
