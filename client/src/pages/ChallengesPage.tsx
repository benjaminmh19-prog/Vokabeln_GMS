import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Target, Zap } from 'lucide-react';

export default function ChallengesPage() {
  const { currentPlayer, challenges, allPlayers } = usePlayer();
  const [, navigate] = useLocation();

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] flex items-center justify-center">
        <div className="text-center">
          <div className="arcade-title text-[#2E3192] text-2xl">NO PLAYER SELECTED</div>
          <Button
            onClick={() => navigate('/players')}
            className="mt-6 bg-[#FF9F1C] hover:bg-[#FF8C00] text-white font-bold px-6 py-3 rounded-lg"
          >
            SELECT PLAYER
          </Button>
        </div>
      </div>
    );
  }

  // Get top scores across all players
  const allHighScores = allPlayers
    .flatMap((p) =>
      p.highScores.map((score) => ({
        playerName: p.name,
        ...score,
      }))
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const dailyChallenge = challenges.find((c) => c.type === 'daily');
  const weeklyChallenge = challenges.find((c) => c.type === 'weekly');

  const calculateProgress = (challenge: any) => {
    if (!challenge.playerScore) return 0;
    return Math.min(100, (challenge.playerScore / challenge.targetScore) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="arcade-title text-[#2E3192] text-3xl md:text-4xl">CHALLENGES</div>
            <p className="text-lg text-[#2E3192] font-semibold">Welcome, {currentPlayer.name}!</p>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            BACK
          </Button>
        </div>

        {/* Active Challenges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Daily Challenge */}
          {dailyChallenge && (
            <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-[#FFD93D]" />
                <h3 className="text-2xl font-bold text-[#2E3192]">Daily Challenge</h3>
              </div>

              <p className="text-gray-600 mb-4">{dailyChallenge.description}</p>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-[#2E3192]">Progress</span>
                  <span className="text-sm font-bold text-gray-600">
                    {dailyChallenge.playerScore || 0} / {dailyChallenge.targetScore}
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-4 border-2 border-[#2E3192]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dailyChallenge.completed ? 'bg-[#6BCB77]' : 'bg-[#FF9F1C]'
                    }`}
                    style={{ width: `${calculateProgress(dailyChallenge)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-600">
                  Reward: <span className="text-[#FFD93D]">+{dailyChallenge.reward} points</span>
                </div>
                {dailyChallenge.completed && (
                  <span className="bg-[#6BCB77] text-white px-3 py-1 rounded-full text-xs font-bold">
                    ✓ COMPLETED
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Weekly Challenge */}
          {weeklyChallenge && (
            <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-[#FFD93D]" />
                <h3 className="text-2xl font-bold text-[#2E3192]">Weekly Challenge</h3>
              </div>

              <p className="text-gray-600 mb-4">{weeklyChallenge.description}</p>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-[#2E3192]">Progress</span>
                  <span className="text-sm font-bold text-gray-600">
                    {weeklyChallenge.playerScore || 0} / {weeklyChallenge.targetScore}
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-4 border-2 border-[#2E3192]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      weeklyChallenge.completed ? 'bg-[#6BCB77]' : 'bg-[#FF9F1C]'
                    }`}
                    style={{ width: `${calculateProgress(weeklyChallenge)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-600">
                  Reward: <span className="text-[#FFD93D]">+{weeklyChallenge.reward} points</span>
                </div>
                {weeklyChallenge.completed && (
                  <span className="bg-[#6BCB77] text-white px-3 py-1 rounded-full text-xs font-bold">
                    ✓ COMPLETED
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-[#FFD93D]" />
            <h3 className="text-2xl font-bold text-[#2E3192]">Global Leaderboard</h3>
          </div>

          <div className="space-y-3">
            {allHighScores.map((score, index) => (
              <div
                key={`${score.playerName}-${index}`}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  score.playerName === currentPlayer.name
                    ? 'bg-[#FFD93D] border-[#2E3192]'
                    : 'bg-[#F0E5D8] border-[#2E3192]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#2E3192] text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-[#2E3192]">{score.playerName}</div>
                    <div className="text-xs text-gray-600">Level {score.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#2E3192]">{score.score} pts</div>
                  <div className="text-xs text-gray-600">Combo x{score.combo}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
