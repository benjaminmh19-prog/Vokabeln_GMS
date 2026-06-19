import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Input } from '@/components/ui/input';
import { Volume2 } from 'lucide-react';

export default function Level3Game() {
  const { gameState, submitAnswer } = useGame();
  const { speak } = useTextToSpeech();
  const [inputValue, setInputValue] = useState('');
  const currentWord = gameState.currentWord;

  const isEnglishToGerman = (gameState.currentDirection || gameState.direction) === 'en-de';
  const question = isEnglishToGerman ? currentWord?.english : currentWord?.deutsch;
  const correctAnswer = isEnglishToGerman ? currentWord?.deutsch : currentWord?.english;
  const questionLanguage = isEnglishToGerman ? 'en-US' : 'de-DE';

  // Get the first meaning (before ; or ,) for letter count display
  const firstMeaning = correctAnswer?.split(/[;,]/)[0].trim() || '';

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() && !gameState.answered) {
      submitAnswer(inputValue);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-block bg-[#E63946] text-white px-6 py-2 rounded-full font-bold border-2 border-[#2E3192]">
          LEVEL 3 - EXPERT MODE
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#E63946] to-[#FF6B9D] rounded-xl p-8 border-3 border-[#2E3192] text-center">
        <div className="text-sm font-bold text-white uppercase tracking-wider mb-2">
          {isEnglishToGerman ? 'Translate to German' : 'Translate to English'}
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="arcade-score text-white">{question}</div>
          <button
            onClick={() => speak(question || '', questionLanguage)}
            className="p-3 bg-white hover:bg-gray-100 text-[#E63946] rounded-lg border-2 border-white font-bold transform hover:scale-110 active:scale-95 transition-all"
            title="Click to hear pronunciation"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-[#F0E5D8] rounded-xl p-8 border-3 border-[#2E3192] text-center">
        <div className="text-sm font-bold text-[#2E3192] uppercase tracking-wider mb-4">Letter count:</div>
        <div className="flex justify-center gap-1 flex-wrap">
          {[...Array(firstMeaning.length || 0)].map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-[#2E3192] rounded flex items-center justify-center font-bold text-[#2E3192] text-xs md:text-sm"
            >
              _
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your answer and press Enter..."
          disabled={gameState.answered}
          autoFocus
          className="p-4 text-base md:text-lg border-3 border-[#2E3192] rounded-lg font-bold w-full"
        />
        {!gameState.answered && (
          <div className="text-center text-xs text-gray-600 font-semibold">
            Press Enter to submit ({firstMeaning.length} letters)
          </div>
        )}
      </div>
    </div>
  );
}
