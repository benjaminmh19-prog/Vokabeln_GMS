import React, { useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, TrendingUp, BookOpen } from 'lucide-react';

export default function LearningPlanPage() {
  const { currentPlayer, recommendations, generateRecommendations } = usePlayer();
  const [, navigate] = useLocation();

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-[#E63946] text-white';
      case 'medium':
        return 'bg-[#FF9F1C] text-white';
      case 'low':
        return 'bg-[#FFD93D] text-[#2E3192]';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'high_error_rate':
        return 'Many mistakes in this unit';
      case 'not_practiced':
        return 'Not practiced recently';
      case 'weak_performance':
        return 'Lower performance than other units';
      default:
        return 'Needs review';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="arcade-title text-[#2E3192] text-3xl md:text-4xl">LEARNING PLAN</div>
            <p className="text-lg text-[#2E3192] font-semibold">
              Personalized recommendations for {currentPlayer.name}
            </p>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            BACK
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-[#2E3192] mb-2">
              {currentPlayer.stats.gamesPlayed}
            </div>
            <div className="text-sm font-semibold text-gray-600">Games Played</div>
          </div>
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-[#2E3192] mb-2">
              {currentPlayer.stats.totalScore}
            </div>
            <div className="text-sm font-semibold text-gray-600">Total Score</div>
          </div>
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-[#2E3192] mb-2">
              {currentPlayer.erroredWords.length}
            </div>
            <div className="text-sm font-semibold text-gray-600">Words to Practice</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-[#FFD93D]" />
            <h3 className="text-2xl font-bold text-[#2E3192]">Recommended Focus Areas</h3>
          </div>

          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="border-2 border-[#2E3192] rounded-lg p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-[#2E3192] mb-1">{rec.unitName}</h4>
                      <p className="text-sm text-gray-600">{getReasonText(rec.reason)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#F0E5D8] p-3 rounded-lg">
                      <div className="text-xs text-gray-600 font-semibold">Error Rate</div>
                      <div className="text-2xl font-bold text-[#2E3192]">{rec.errorRate.toFixed(1)}</div>
                    </div>
                    <div className="bg-[#F0E5D8] p-3 rounded-lg">
                      <div className="text-xs text-gray-600 font-semibold">Suggested Level</div>
                      <div className="text-2xl font-bold text-[#2E3192]">{rec.suggestedLevel}</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/collections')}
                    className="w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-2"
                  >
                    PRACTICE THIS UNIT
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-[#FFD93D] mx-auto mb-4" />
              <p className="text-lg font-semibold text-[#2E3192] mb-4">
                No recommendations yet. Keep playing to get personalized suggestions!
              </p>
              <Button
                onClick={() => navigate('/collections')}
                className="bg-gradient-to-r from-[#6BCB77] to-[#4CAF50] hover:from-[#5AB366] hover:to-[#45a049] text-white font-bold px-6 py-3 rounded-lg"
              >
                START PLAYING
              </Button>
            </div>
          )}
        </div>

        {/* Words to Practice */}
        {currentPlayer.erroredWords.length > 0 && (
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-8 h-8 text-[#E63946]" />
              <h3 className="text-2xl font-bold text-[#2E3192]">Words to Practice</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentPlayer.erroredWords.slice(0, 10).map((word, index) => (
                <div key={index} className="bg-[#F0E5D8] border-2 border-[#2E3192] rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-[#2E3192]">{word.word}</div>
                      <div className="text-xs text-gray-600">
                        Last error: {new Date(word.lastError).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="bg-[#E63946] text-white px-3 py-1 rounded-full text-sm font-bold">
                      {word.errorCount}x
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
