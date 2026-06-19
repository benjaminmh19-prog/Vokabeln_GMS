import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Flame, Clock, AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function GameHeader() {
  const { gameState } = useGame();
  const [, navigate] = useLocation();
  const currentPlayerName = localStorage.getItem('currentPlayerName');

  const handleLogout = () => {
    localStorage.removeItem('currentPlayerId');
    localStorage.removeItem('currentPlayerName');
    localStorage.removeItem('currentPlayerUsername');
    navigate('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timePercentage = (gameState.timeRemaining / gameState.totalTime) * 100;
  const isLowTime = gameState.timeRemaining <= 10;
  const isChallengeMode = gameState.level === 'challenge';

  return (
    <div className="bg-white border-4 border-[#2E3192] rounded-2xl p-6 shadow-2xl">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-[#FFD93D] to-[#FF9F1C] rounded-xl p-4 border-3 border-[#2E3192]">
          <div className="text-xs font-bold text-[#2E3192] uppercase tracking-wider mb-1">Score</div>
          <div className="arcade-score text-[#2E3192]">{gameState.score}</div>
        </div>

        <div className="bg-gradient-to-br from-[#FF6B9D] to-[#E63946] rounded-xl p-4 border-3 border-[#2E3192] relative overflow-hidden">
          <div className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1">
            <Flame className="w-4 h-4" />
            Combo
          </div>
          <div className="arcade-score text-white">{gameState.combo}</div>
          {gameState.combo > 0 && (
            <div className="absolute top-1 right-1 text-xs bg-white text-[#FF6B9D] px-2 py-1 rounded font-bold">
              x{(1 + gameState.combo * 0.1).toFixed(1)}
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-[#F0E5D8] rounded-xl p-4 border-3 border-[#2E3192]">
          <div className="text-xs font-bold text-[#2E3192] uppercase tracking-wider mb-2">
            {isChallengeMode ? 'Challenge Progress' : 'Progress'}
          </div>
          <div className="w-full bg-[#E0D5C8] rounded-full h-6 border-2 border-[#2E3192] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6BCB77] to-[#FFD93D] transition-all duration-300 flex items-center justify-center"
              style={{
                width: isChallengeMode
                  ? `${((gameState.wordsCompleted || 0) / (gameState.targetWords || 20)) * 100}%`
                  : `${((gameState.currentWordIndex + 1) / gameState.words.length) * 100}%`,
              }}
            >
              {gameState.words.length > 0 && (
                <span className="text-xs font-bold text-[#2E3192]">
                  {isChallengeMode
                    ? `${gameState.wordsCompleted || 0}/${gameState.targetWords || 20}`
                    : `${gameState.currentWordIndex + 1}/${gameState.words.length}`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-4 border-3 border-[#2E3192] ${
          isLowTime
            ? 'bg-gradient-to-br from-[#E63946] to-[#FF6B9D] animate-pulse'
            : 'bg-gradient-to-br from-[#6BCB77] to-[#5AB366]'
        }`}>
          <div className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Time
          </div>
          <div className="arcade-score text-white">{formatTime(gameState.timeRemaining)}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2 flex-1">
          {!isChallengeMode && (
            <>
              <AlertTriangle className="w-5 h-5 text-[#E63946]" />
              <span className="font-bold text-[#2E3192]">Errors:</span>
              <div className="flex gap-1">
                {[...Array(gameState.maxErrors)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full border-2 border-[#2E3192] flex items-center justify-center text-xs font-bold ${
                      i < gameState.errors
                        ? 'bg-[#E63946] text-white'
                        : 'bg-[#F0E5D8] text-[#2E3192]'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <span className="ml-auto text-sm font-semibold text-[#2E3192]">
                {gameState.maxErrors - gameState.errors} left
              </span>
            </>
          )}
          {isChallengeMode && (
            <div className="w-full text-center">
              <span className="font-bold text-[#2E3192]">
                Complete {gameState.targetWords || 20} words before time runs out!
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentPlayerName && (
            <span className="text-sm font-bold text-[#2E3192] hidden sm:inline">
              {currentPlayerName}
            </span>
          )}
          <Button
            onClick={handleLogout}
            className="bg-[#E63946] hover:bg-[#c1121f] text-white font-bold border-2 border-[#2E3192] rounded-lg px-3 py-2 flex items-center gap-1"
            size="sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
