import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Flame,
  TrendingUp,
  Crown,
  Star,
  Zap,
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  username: string;
  best_score: number;
  total_score: number;
  games_played: number;
  rank?: number;
}

export default function LeaderboardPage() {
  const [, navigate] = useLocation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentPlayerRank, setCurrentPlayerRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
    const playerId = localStorage.getItem('currentPlayerId');
    setCurrentPlayerId(playerId);
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Load all players sorted by best_score
      const { data: players, error } = await supabase
        .from('players')
        .select('id, name, username, best_score, total_score, games_played')
        .order('best_score', { ascending: false })
        .limit(100);

      if (error) {
        toast.error('Fehler beim Laden des Leaderboards');
        console.error(error);
        return;
      }

      // Add rank to each player
      const rankedPlayers: LeaderboardEntry[] = (players || []).map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

      setLeaderboard(rankedPlayers);

      // Find current player's rank
      const playerId = localStorage.getItem('currentPlayerId');
      if (playerId) {
        const playerRank = rankedPlayers.findIndex((p) => p.id === playerId) + 1;
        if (playerRank > 0) {
          setCurrentPlayerRank(playerRank);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Fehler beim Laden des Leaderboards');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-[#FFD700] to-[#FFA500]';
    if (rank === 2) return 'from-[#C0C0C0] to-[#A9A9A9]';
    if (rank === 3) return 'from-[#CD7F32] to-[#8B4513]';
    return 'from-[#6BCB77] to-[#5AB366]';
  };

  const getTextColor = (rank: number) => {
    if (rank === 1) return 'text-[#2E3192]';
    if (rank === 2) return 'text-white';
    if (rank === 3) return 'text-white';
    return 'text-white';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] flex items-center justify-center">
        <div className="text-center">
          <div className="arcade-title text-[#2E3192] text-3xl">LOADING...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate('/selection')}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold border-2 border-[#2E3192] rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            ZURÜCK
          </Button>
          <div className="flex items-center gap-3">
            <Crown className="w-10 h-10 text-[#2E3192]" />
            <h1 className="arcade-title text-[#2E3192] text-4xl md:text-5xl">LEADERBOARD</h1>
          </div>
          <div className="w-32" /> {/* Spacer for alignment */}
        </div>

        {/* Current Player Rank Card */}
        {currentPlayerRank && (
          <Card className="border-4 border-[#2E3192] shadow-lg mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-[#2E3192]">#{currentPlayerRank}</div>
                  <div>
                    <p className="text-sm font-bold text-[#2E3192] uppercase">Deine Position</p>
                    <p className="text-xs text-[#2E3192] opacity-75">
                      {currentPlayerRank === 1
                        ? 'Du bist der Champion!'
                        : `${100 - currentPlayerRank} Spieler vor dir`}
                    </p>
                  </div>
                </div>
                <Zap className="w-12 h-12 text-[#2E3192]" />
              </div>
            </div>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card className="border-4 border-[#2E3192] shadow-lg overflow-hidden">
          <div className="p-8">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#2E3192] font-bold text-lg">Noch keine Spieler im Leaderboard</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 50).map((player, index) => {
                  const isCurrentPlayer = player.id === currentPlayerId;
                  const rank = index + 1;
                  const bgGradient = getRankColor(rank);
                  const textColor = getTextColor(rank);

                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-3 border-[#2E3192] transition-all transform ${
                        isCurrentPlayer
                          ? `bg-gradient-to-r ${bgGradient} shadow-lg scale-105`
                          : 'bg-white hover:bg-[#FFF8E7]'
                      }`}
                    >
                      {/* Rank */}
                      <div
                        className={`flex items-center justify-center w-16 h-16 rounded-lg font-bold text-2xl ${
                          isCurrentPlayer
                            ? `bg-gradient-to-r ${bgGradient} ${textColor} border-2 border-white`
                            : 'bg-[#FFE5B4] text-[#2E3192]'
                        }`}
                      >
                        {getRankIcon(rank)}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 ml-6">
                        <p className={`font-bold text-lg ${isCurrentPlayer ? 'text-white' : 'text-[#2E3192]'}`}>
                          {player.name}
                        </p>
                        <p className={`text-sm ${isCurrentPlayer ? 'text-white opacity-90' : 'text-gray-600'}`}>
                          @{player.username}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-8 mr-4">
                        {/* Best Score */}
                        <div className="text-right">
                          <div className={`flex items-center gap-2 ${isCurrentPlayer ? 'text-white' : 'text-[#2E3192]'}`}>
                            <Trophy className="w-5 h-5" />
                            <span className="font-bold text-lg">{player.best_score}</span>
                          </div>
                          <p className={`text-xs ${isCurrentPlayer ? 'text-white opacity-75' : 'text-gray-600'}`}>
                            Best Score
                          </p>
                        </div>

                        {/* Games Played */}
                        <div className="text-right">
                          <div className={`flex items-center gap-2 ${isCurrentPlayer ? 'text-white' : 'text-[#2E3192]'}`}>
                            <Flame className="w-5 h-5" />
                            <span className="font-bold text-lg">{player.games_played}</span>
                          </div>
                          <p className={`text-xs ${isCurrentPlayer ? 'text-white opacity-75' : 'text-gray-600'}`}>
                            Spiele
                          </p>
                        </div>

                        {/* Average Score */}
                        <div className="text-right">
                          <div className={`flex items-center gap-2 ${isCurrentPlayer ? 'text-white' : 'text-[#2E3192]'}`}>
                            <TrendingUp className="w-5 h-5" />
                            <span className="font-bold text-lg">
                              {player.games_played > 0
                                ? Math.round(player.total_score / player.games_played)
                                : 0}
                            </span>
                          </div>
                          <p className={`text-xs ${isCurrentPlayer ? 'text-white opacity-75' : 'text-gray-600'}`}>
                            Ø Score
                          </p>
                        </div>
                      </div>

                      {/* Current Player Badge */}
                      {isCurrentPlayer && (
                        <div className="ml-4 px-4 py-2 bg-white rounded-lg border-2 border-white">
                          <Star className="w-6 h-6 text-[#2E3192]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button
            onClick={() => navigate('/selection')}
            className="bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all"
          >
            <Zap className="w-5 h-5 mr-2 inline" />
            SPIELEN
          </Button>
        </div>
      </div>
    </div>
  );
}
