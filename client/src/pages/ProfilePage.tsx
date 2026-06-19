import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Trophy,
  Zap,
  Target,
  Clock,
  Flame,
  Star,
  Award,
  TrendingUp,
  Gamepad2,
} from 'lucide-react';
import AudioSettingsPanel from '@/components/audio/AudioSettingsPanel';

interface PlayerStats {
  id: string;
  name: string;
  username: string;
  total_score: number;
  best_score: number;
  games_played: number;
  created_at: string;
  updated_at: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
}

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentGames, setRecentGames] = useState<any[]>([]);

  useEffect(() => {
    loadPlayerProfile();
  }, []);

  const loadPlayerProfile = async () => {
    setIsLoading(true);
    try {
      const playerId = localStorage.getItem('currentPlayerId');
      if (!playerId) {
        toast.error('Spieler nicht gefunden');
        navigate('/auth');
        return;
      }

      // Load player stats
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (playerError || !player) {
        toast.error('Fehler beim Laden des Profils');
        return;
      }

      setPlayerStats(player);

      // Load recent games
      const { data: games } = await supabase
        .from('game_results')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentGames(games || []);

      // Generate achievements
      generateAchievements(player, games || []);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Fehler beim Laden des Profils');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAchievements = (player: PlayerStats, games: any[]) => {
    const achievementsList: Achievement[] = [
      {
        id: 'first_game',
        name: 'Erste Schritte',
        description: 'Spielen Sie Ihr erstes Spiel',
        icon: '🎮',
        unlocked: player.games_played > 0,
        unlockedDate: player.created_at,
      },
      {
        id: 'score_100',
        name: 'Anfänger',
        description: 'Erreichen Sie 100 Punkte',
        icon: '⭐',
        unlocked: player.best_score >= 100,
        progress: Math.min((player.best_score / 100) * 100, 100),
      },
      {
        id: 'score_500',
        name: 'Fortgeschrittener',
        description: 'Erreichen Sie 500 Punkte',
        icon: '🌟',
        unlocked: player.best_score >= 500,
        progress: Math.min((player.best_score / 500) * 100, 100),
      },
      {
        id: 'score_1000',
        name: 'Meister',
        description: 'Erreichen Sie 1000 Punkte',
        icon: '👑',
        unlocked: player.best_score >= 1000,
        progress: Math.min((player.best_score / 1000) * 100, 100),
      },
      {
        id: 'games_10',
        name: 'Fleißig',
        description: 'Spielen Sie 10 Spiele',
        icon: '🔥',
        unlocked: player.games_played >= 10,
        progress: Math.min((player.games_played / 10) * 100, 100),
      },
      {
        id: 'games_50',
        name: 'Süchtig',
        description: 'Spielen Sie 50 Spiele',
        icon: '💪',
        unlocked: player.games_played >= 50,
        progress: Math.min((player.games_played / 50) * 100, 100),
      },
      {
        id: 'perfect_game',
        name: 'Perfekt',
        description: 'Spielen Sie ein fehlerfreies Spiel',
        icon: '✨',
        unlocked: games.some((g) => g.errors === 0),
      },
      {
        id: 'level_3',
        name: 'Schwierigkeitsmeister',
        description: 'Spielen Sie Level 3',
        icon: '🎯',
        unlocked: games.some((g) => g.level === 3),
      },
    ];

    setAchievements(achievementsList);
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

  if (!playerStats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8 flex items-center justify-center">
        <Card className="border-4 border-[#2E3192] p-8 text-center">
          <p className="text-[#2E3192] font-bold mb-4">Spieler nicht gefunden</p>
          <Button onClick={() => navigate('/')} className="bg-[#2E3192] text-white">
            Zur Startseite
          </Button>
        </Card>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;
  const averageScore = playerStats.games_played > 0 ? Math.round(playerStats.total_score / playerStats.games_played) : 0;

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
          <h1 className="arcade-title text-[#2E3192] text-4xl md:text-5xl">PROFIL</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        {/* Player Info Card */}
        <Card className="border-4 border-[#2E3192] shadow-lg mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-[#2E3192] to-[#1a1a5f] p-8 text-white">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FFD93D] to-[#FF9F1C] rounded-full flex items-center justify-center border-4 border-white">
                <Gamepad2 className="w-12 h-12 text-[#2E3192]" />
              </div>
              <div>
                <h2 className="arcade-title text-4xl mb-2">{playerStats.name}</h2>
                <p className="text-sm opacity-90">@{playerStats.username}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Best Score */}
              <div className="bg-gradient-to-br from-[#FFD93D] to-[#FF9F1C] rounded-xl p-4 border-3 border-[#2E3192]">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-[#2E3192]" />
                  <span className="text-xs font-bold text-[#2E3192] uppercase">Best Score</span>
                </div>
                <div className="arcade-score text-[#2E3192]">{playerStats.best_score}</div>
              </div>

              {/* Total Score */}
              <div className="bg-gradient-to-br from-[#6BCB77] to-[#5AB366] rounded-xl p-4 border-3 border-[#2E3192]">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-white" />
                  <span className="text-xs font-bold text-white uppercase">Total Score</span>
                </div>
                <div className="arcade-score text-white">{playerStats.total_score}</div>
              </div>

              {/* Games Played */}
              <div className="bg-gradient-to-br from-[#FF6B9D] to-[#E63946] rounded-xl p-4 border-3 border-[#2E3192]">
                <div className="flex items-center gap-2 mb-2">
                  <Gamepad2 className="w-5 h-5 text-white" />
                  <span className="text-xs font-bold text-white uppercase">Spiele</span>
                </div>
                <div className="arcade-score text-white">{playerStats.games_played}</div>
              </div>

              {/* Average Score */}
              <div className="bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] rounded-xl p-4 border-3 border-[#2E3192]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <span className="text-xs font-bold text-white uppercase">Ø Score</span>
                </div>
                <div className="arcade-score text-white">{averageScore}</div>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4" />
              <span>
                Mitglied seit{' '}
                {new Date(playerStats.created_at).toLocaleDateString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </Card>

        {/* Achievements Section */}
        <Card className="border-4 border-[#2E3192] shadow-lg mb-8">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-[#2E3192]" />
              <h3 className="arcade-title text-[#2E3192] text-2xl">
                ERFOLGSABZEICHEN ({unlockedAchievements}/{totalAchievements})
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-3 transition-all ${
                    achievement.unlocked
                      ? 'border-[#2E3192] bg-gradient-to-br from-[#FFD93D] to-[#FF9F1C] shadow-lg'
                      : 'border-gray-300 bg-gray-100 opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h4 className="font-bold text-sm text-[#2E3192] mb-1">{achievement.name}</h4>
                  <p className="text-xs text-gray-700 mb-2">{achievement.description}</p>
                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-[#2E3192] h-2 rounded-full transition-all"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  )}
                  {achievement.unlocked && achievement.unlockedDate && (
                    <p className="text-xs text-gray-600 mt-2">
                      {new Date(achievement.unlockedDate).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Games */}
        {recentGames.length > 0 && (
          <Card className="border-4 border-[#2E3192] shadow-lg mb-8">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Flame className="w-8 h-8 text-[#2E3192]" />
                <h3 className="arcade-title text-[#2E3192] text-2xl">LETZTE SPIELE</h3>
              </div>

              <div className="space-y-3">
                {recentGames.map((game, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#FFF8E7] rounded-lg border-2 border-[#2E3192]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-[#2E3192]">#{index + 1}</div>
                      <div>
                        <p className="font-bold text-[#2E3192]">Level {game.level}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(game.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="arcade-score text-[#2E3192]">{game.score}</p>
                      <p className="text-sm text-gray-600">
                        {game.errors === 0 ? '✨ Fehlerfrei' : `${game.errors} Fehler`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Audio Settings */}
        <div className="mt-8 mb-8">
          <AudioSettingsPanel />
        </div>

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
