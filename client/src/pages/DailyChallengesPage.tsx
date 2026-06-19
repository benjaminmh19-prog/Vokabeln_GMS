import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useDailyChallenges } from '@/contexts/DailyChallengesContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Zap, Target, Clock, Gift } from 'lucide-react';

export default function DailyChallengesPage() {
  const [, navigate] = useLocation();
  const { challenges, totalDailyReward, completedChallenges } = useDailyChallenges();
  const [animatedRewards, setAnimatedRewards] = useState<string[]>([]);

  useEffect(() => {
    // Animate completed challenges
    completedChallenges.forEach((id) => {
      setTimeout(() => {
        setAnimatedRewards((prev) => {
          if (!prev.includes(id)) {
            return [...prev, id];
          }
          return prev;
        });
      }, 100);
    });
  }, [completedChallenges]);

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'games':
        return <Trophy className="w-6 h-6" />;
      case 'streak':
        return <Zap className="w-6 h-6" />;
      case 'accuracy':
        return <Target className="w-6 h-6" />;
      case 'time':
        return <Clock className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate('/')}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold border-2 border-[#2E3192] rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            ZURÜCK
          </Button>
          <h1 className="arcade-title text-[#2E3192] text-4xl md:text-5xl">TÄGLICHE HERAUSFORDERUNGEN</h1>
          <div className="w-32" />
        </div>

        {/* Daily Reward Summary */}
        <Card className="border-4 border-[#2E3192] shadow-lg mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#2E3192] font-bold text-lg">Heutige Belohnungen</p>
                <p className="text-[#2E3192] text-sm opacity-90">
                  Verdiene XP durch das Abschließen von Herausforderungen
                </p>
              </div>
              <div className="text-center">
                <div className="arcade-title text-[#2E3192] text-5xl">{totalDailyReward}</div>
                <p className="text-[#2E3192] font-bold">XP</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge) => {
            const isCompleted = challenge.completed;
            const progressPercent = (challenge.progress / challenge.target) * 100;
            const isAnimated = animatedRewards.includes(challenge.id);

            return (
              <Card
                key={challenge.id}
                className={`border-4 border-[#2E3192] shadow-lg overflow-hidden transition-all duration-300 ${
                  isCompleted ? 'bg-gradient-to-br from-[#90EE90] to-[#98FB98]' : 'bg-white'
                } ${isAnimated ? 'scale-105' : 'scale-100'}`}
              >
                <div className="p-6">
                  {/* Challenge Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${isCompleted ? 'bg-[#FFD93D]' : 'bg-[#FFE5B4]'}`}>
                        {getChallengeIcon(challenge.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#2E3192] text-lg">{challenge.title}</h3>
                        <p className="text-[#2E3192] text-sm opacity-75">{challenge.description}</p>
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="text-center">
                        <div className="arcade-title text-[#FFD93D] text-2xl">✓</div>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#2E3192] font-bold text-sm">
                        {Math.round(challenge.progress)} / {challenge.target}
                      </span>
                      <span className="text-[#2E3192] font-bold text-sm">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress
                      value={progressPercent}
                      className="h-3 bg-[#FFE5B4] border-2 border-[#2E3192]"
                    />
                  </div>

                  {/* Reward */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-[#2E3192]">
                    <span className="text-[#2E3192] font-bold">Belohnung:</span>
                    <div className="flex items-center gap-2">
                      <span className="arcade-title text-[#FFD93D] text-2xl">{challenge.reward}</span>
                      <span className="text-[#2E3192] font-bold">XP</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Tips Section */}
        <Card className="border-4 border-[#2E3192] shadow-lg mt-8 overflow-hidden">
          <div className="bg-gradient-to-r from-[#E63946] to-[#FF6B6B] p-6">
            <h3 className="text-white font-bold text-lg mb-3">💡 Tipps</h3>
            <ul className="text-white text-sm space-y-2">
              <li>• Spiele regelmäßig, um alle täglichen Herausforderungen zu meistern</li>
              <li>• Deine Herausforderungen setzen sich täglich um Mitternacht zurück</li>
              <li>• Sammle XP, um neue Abzeichen und Erfolge freizuschalten</li>
              <li>• Jede abgeschlossene Herausforderung bringt dich näher zur Spitze der Rangliste</li>
            </ul>
          </div>
        </Card>

        {/* Back to Menu Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-[#2E3192] hover:bg-[#1a1a5c] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-8 py-3 text-lg"
          >
            ZUM MENÜ
          </Button>
        </div>
      </div>
    </div>
  );
}
