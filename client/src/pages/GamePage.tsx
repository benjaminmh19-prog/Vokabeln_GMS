import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useLocation } from 'wouter';
import { useAudioSettings } from '@/contexts/AudioSettingsContext';
import Level1Game from '@/components/game/Level1Game';
import Level2Game from '@/components/game/Level2Game';
import Level3Game from '@/components/game/Level3Game';
import GameHeader from '@/components/game/GameHeader';
import { Clock, AlertCircle, Square } from 'lucide-react';
import { playSoundEffect, speakEnglishWord, initializeAudioContext, preloadVoices } from '@/lib/audioUtils';

export default function GamePage() {
  const { gameState, submitAnswer, nextWord, endGame } = useGame();
  const [, navigate] = useLocation();
  const [shake, setShake] = useState(false);
  const [comboAnimation, setComboAnimation] = useState(false);

  useEffect(() => {
    if (gameState.isCorrect === false) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isCorrect]);

  // Combo animation trigger
  useEffect(() => {
    if (gameState.isCorrect && gameState.combo > 1 && gameState.combo % 5 === 0) {
      setComboAnimation(true);
      const timer = setTimeout(() => setComboAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.combo, gameState.isCorrect]);

  // Play sound effects on answer
  useEffect(() => {
    if (gameState.answered) {
      if (gameState.isCorrect) {
        playSoundEffect('correct');
      } else {
        playSoundEffect('incorrect');
      }
    }
  }, [gameState.answered, gameState.isCorrect]);

  // Initialize audio context and preload voices on mount
  useEffect(() => {
    const handleFirstInteraction = () => {
      initializeAudioContext();
      preloadVoices();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Speak English word when it changes (with user gesture requirement for iOS)
  useEffect(() => {
    if (gameState.currentWord && gameState.direction === 'de-en') {
      // Only speak if we're translating FROM German TO English
      initializeAudioContext();
      speakEnglishWord(gameState.currentWord.english);
    }
  }, [gameState.currentWord, gameState.direction]);

  // Auto-advance to next word after feedback delay
  useEffect(() => {
    if (gameState.answered) {
      const delay = gameState.isCorrect ? 1200 : 2000;
      const timer = setTimeout(() => {
        nextWord();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gameState.answered, gameState.isCorrect, nextWord]);

  if (!gameState.currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] flex items-center justify-center">
        <div className="text-center">
          <div className="arcade-title text-[#2E3192] text-3xl mb-4">LOADING...</div>
        </div>
      </div>
    );
  }

  const getLevelComponent = () => {
    if (gameState.level === 'challenge') return <Level1Game />;
    if (gameState.level === 1) return <Level1Game />;
    if (gameState.level === 2) return <Level2Game />;
    if (gameState.level === 3) return <Level3Game />;
    return <Level1Game />;
  };
  const levelComponent = getLevelComponent();

  const handleStop = () => {
    endGame();
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <GameHeader />
        
        <div className={`transition-all duration-300 ${shake ? 'animate-pulse' : ''}`}>
          <div className="bg-white border-4 border-[#2E3192] rounded-2xl p-8 shadow-2xl mt-6">
            {gameState.timeRemaining <= 10 && (
              <div className="mb-6 p-4 bg-[#E63946] text-white rounded-lg border-2 border-[#2E3192] flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span className="font-bold">Time running out! {gameState.timeRemaining}s left</span>
              </div>
            )}
            {gameState.errors > 0 && gameState.errors >= gameState.maxErrors - 2 && (
              <div className="mb-6 p-4 bg-[#FF9F1C] text-[#2E3192] rounded-lg border-2 border-[#2E3192] flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold">{gameState.maxErrors - gameState.errors} mistake{gameState.maxErrors - gameState.errors !== 1 ? 's' : ''} remaining!</span>
              </div>
            )}
            {levelComponent}
            
            {gameState.answered && (
              <div className="mt-8 space-y-4">
                <div className={`w-full p-4 rounded-lg border-3 border-[#2E3192] text-center font-bold text-lg ${
                  gameState.isCorrect
                    ? 'bg-[#6BCB77] text-white animate-bounce'
                    : 'bg-[#E63946] text-white'
                }`}>
                  {gameState.isCorrect ? '✓ CORRECT!' : '✗ WRONG!'}
                </div>
                {!gameState.isCorrect && (
                  <div className="p-4 bg-[#F0E5D8] rounded-lg border-2 border-[#2E3192] text-center">
                    <div className="text-sm font-bold text-[#2E3192] mb-2">Correct answer:</div>
                    <div className="text-lg font-bold text-[#6BCB77]">
                      {(gameState.currentDirection || gameState.direction) === 'en-de' ? gameState.currentWord?.deutsch : gameState.currentWord?.english}
                    </div>
                  </div>
                )}
                <div className="text-center text-sm text-gray-600 font-semibold animate-pulse">
                  Next question in 1 second...
                </div>
              </div>
            )}

            {/* Combo Animation */}
            {comboAnimation && (
              <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
                <div className="animate-bounce text-6xl font-bold text-[#FFD93D] drop-shadow-lg">
                  🔥 COMBO x{gameState.combo}! 🔥
                </div>
              </div>
            )}
          </div>
        </div>

        {!gameState.isGameActive && gameState.answered && (
          <div className="mt-6 p-6 bg-[#E63946] text-white rounded-xl border-4 border-[#2E3192] text-center">
            <div className="arcade-title text-2xl mb-2">GAME OVER!</div>
            <div className="text-lg font-semibold mb-4">{gameState.timeRemaining <= 0 ? 'Time is up!' : 'Too many mistakes!'}</div>
            <button onClick={() => { endGame(); navigate('/results'); }} className="px-6 py-3 bg-white text-[#E63946] font-bold rounded-lg hover:bg-gray-100 transform hover:scale-105 active:scale-95 transition-all">View Results</button>
          </div>
        )}

        {/* Stop Button at Bottom */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleStop}
            className="px-6 py-3 bg-[#E63946] hover:bg-[#FF6B9D] text-white font-bold rounded-lg border-2 border-[#2E3192] flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
            title="Stop the current game and view results"
          >
            <Square className="w-5 h-5" />
            STOP GAME
          </button>
        </div>
      </div>
    </div>
  );
}
