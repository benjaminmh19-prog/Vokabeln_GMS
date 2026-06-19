import React, { useMemo, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Input } from '@/components/ui/input';
import { Volume2 } from 'lucide-react';

export default function Level2Game() {
  const { gameState, submitAnswer } = useGame();
  const { speak } = useTextToSpeech();
  const [inputValue, setInputValue] = useState('');
  const currentWord = gameState.currentWord;

  const isEnglishToGerman = (gameState.currentDirection || gameState.direction) === 'en-de';
  const question = isEnglishToGerman ? currentWord?.english : currentWord?.deutsch;
  const correctAnswer = isEnglishToGerman ? currentWord?.deutsch : currentWord?.english;
  const questionLanguage = isEnglishToGerman ? 'en-US' : 'de-DE';

  const partialWord = useMemo(() => {
    if (!correctAnswer) return '';
    const letters = correctAnswer.split('');
    const visibleCount = Math.max(1, Math.ceil(letters.length * 0.4));
    const visibleIndices = new Set();

    visibleIndices.add(0);
    visibleIndices.add(letters.length - 1);

    while (visibleIndices.size < visibleCount) {
      visibleIndices.add(Math.floor(Math.random() * letters.length));
    }

    return letters
      .map((letter, i) => {
        if (letter === ' ') return ' '; // Keep spaces as spaces
        return visibleIndices.has(i) ? letter : '_';
      })
      .join('');
  }, [correctAnswer]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() && !gameState.answered) {
      submitAnswer(inputValue);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-block bg-[#FF6B9D] text-white px-6 py-2 rounded-full font-bold border-2 border-[#2E3192]">
          LEVEL 2 - FILL THE BLANKS
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#FF6B9D] to-[#E63946] rounded-xl p-8 border-3 border-[#2E3192] text-center">
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
        <div className="text-sm font-bold text-[#2E3192] uppercase tracking-wider mb-4">Fill in the blanks:</div>
        <div className="arcade-score text-[#2E3192] font-mono tracking-widest">
          {partialWord}
        </div>
        <div className="text-xs text-gray-600 mt-4 font-semibold">
          {correctAnswer?.replace(/ /g, '').length} letters • {Math.ceil(((correctAnswer?.replace(/ /g, '') || '').length) * 0.4)} visible
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
            Press Enter to submit
          </div>
        )}
      </div>
    </div>
  );
}
