import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trophy, Target, Zap, Calendar } from 'lucide-react';

interface PlayerStats {
  id: string;
  username: string;
  name?: string;
  total_score: number;
  games_played: number;
  best_score: number;
  created_at: string;
  average_score: number;
  win_rate: number;
}

export default function PlayerProfilePage() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API or context
    // For now, we'll load from localStorage or session
    const playerData = sessionStorage.getItem('currentPlayer');
    if (playerData) {
      try {
        const player = JSON.parse(playerData);
        const avgScore = player.games_played > 0 ? Math.round(player.total_score / player.games_played) : 0;
        const winRate = player.games_played > 0 ? Math.round((player.best_score / player.total_score) * 100) : 0;
        
        setStats({
          ...player,
          average_score: avgScore,
          win_rate: winRate,
        });
      } catch (error) {
        console.error('Error loading player stats:', error);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8 flex items-center justify-center">
        <div className="text-[#2E3192] text-xl">Wird geladen...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/')}
            className="bg-[#2E3192] hover:bg-[#1a1d5c] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-6 py-2 flex items-center gap-2 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </Button>
          <Card className="border-4 border-[#2E3192] shadow-lg p-8 text-center">
            <p className="text-[#2E3192] text-lg">Keine Spielerdaten verfügbar</p>
          </Card>
        </div>
      </div>
    );
  }

  const createdDate = new Date(stats.created_at).toLocaleDateString('de-DE');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate('/')}
            className="bg-[#2E3192] hover:bg-[#1a1d5c] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-6 py-2 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </Button>
          <h1 className="arcade-title text-[#2E3192] text-3xl md:text-4xl">SPIELER PROFIL</h1>
          <div className="w-32" />
        </div>

        {/* Player Info Card */}
        <Card className="border-4 border-[#2E3192] shadow-lg mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-[#2E3192] to-[#1a1d5c] p-8 text-white">
            <h2 className="text-4xl font-bold mb-2">{stats.name || stats.username}</h2>
            <p className="text-lg opacity-90">@{stats.username}</p>
            <div className="flex items-center gap-2 mt-4 text-sm opacity-75">
              <Calendar className="w-4 h-4" />
              Beigetreten am {createdDate}
            </div>
          </div>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Score */}
          <Card className="border-4 border-[#2E3192] shadow-lg p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">GESAMT PUNKTE</p>
                <p className="text-5xl font-bold text-green-600">{stats.total_score.toLocaleString()}</p>
              </div>
              <Zap className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </Card>

          {/* Best Score */}
          <Card className="border-4 border-[#2E3192] shadow-lg p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">BEST SCORE</p>
                <p className="text-5xl font-bold text-orange-600">{stats.best_score.toLocaleString()}</p>
              </div>
              <Trophy className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </Card>

          {/* Games Played */}
          <Card className="border-4 border-[#2E3192] shadow-lg p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">SPIELE GESPIELT</p>
                <p className="text-5xl font-bold text-blue-600">{stats.games_played}</p>
              </div>
              <Target className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </Card>

          {/* Average Score */}
          <Card className="border-4 border-[#2E3192] shadow-lg p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">DURCHSCHNITT</p>
                <p className="text-5xl font-bold text-purple-600">{stats.average_score.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 text-purple-600 opacity-20 flex items-center justify-center">
                <span className="text-2xl">∅</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="border-4 border-[#2E3192] shadow-lg p-8">
          <h3 className="text-2xl font-bold text-[#2E3192] mb-6">LEISTUNGSÜBERSICHT</h3>
          
          <div className="space-y-6">
            {/* Games Played Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">Spiele gespielt</span>
                <span className="text-[#2E3192] font-bold">{stats.games_played}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border-2 border-[#2E3192]">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.games_played / 100) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Best Score Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">Best Score Ratio</span>
                <span className="text-[#2E3192] font-bold">{stats.win_rate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border-2 border-[#2E3192]">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-500"
                  style={{ width: `${stats.win_rate}%` }}
                />
              </div>
            </div>

            {/* Average Score Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">Durchschnittliche Punktzahl</span>
                <span className="text-[#2E3192] font-bold">{stats.average_score}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border-2 border-[#2E3192]">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.average_score / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-[#2E3192] hover:bg-[#1a1d5c] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all"
          >
            Zurück zur Startseite
          </Button>
        </div>
      </div>
    </div>
  );
}
