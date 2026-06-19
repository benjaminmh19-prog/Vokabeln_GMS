import React, { useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Volume2 } from 'lucide-react';

export default function Level1Game() {
  const { gameState, submitAnswer } = useGame();
  const { speak } = useTextToSpeech();
  const currentWord = gameState.currentWord;

  // Use currentDirection (which is fixed per word in random mode)
  const isEnglishToGerman = (gameState.currentDirection || gameState.direction) === 'en-de';

  const options = useMemo(() => {
    if (!currentWord) return [];

    const correctAnswer = isEnglishToGerman ? currentWord.deutsch : currentWord.english;
    const allWords = gameState.words;

    const wrongAnswers = allWords
      .filter((w) => {
        const answer = isEnglishToGerman ? w.deutsch : w.english;
        return answer !== correctAnswer;
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => (isEnglishToGerman ? w.deutsch : w.english));

    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    return allOptions;
  }, [currentWord, isEnglishToGerman, gameState.words]);
  const question = isEnglishToGerman ? currentWord?.english : currentWord?.deutsch;
  const questionLanguage = isEnglishToGerman ? 'en-US' : 'de-DE';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-block bg-[#FF9F1C] text-white px-6 py-2 rounded-full font-bold border-2 border-[#2E3192]">
          LEVEL 1 - MULTIPLE CHOICE
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#FFD93D] to-[#FF9F1C] rounded-xl p-8 border-3 border-[#2E3192] text-center">
        <div className="text-sm font-bold text-[#2E3192] uppercase tracking-wider mb-2">
          {isEnglishToGerman ? 'Translate to German' : 'Translate to English'}
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="arcade-score text-[#2E3192]">{question}</div>
          <button
            onClick={() => speak(question || '', questionLanguage)}
            className="p-3 bg-white hover:bg-[#F0E5D8] text-[#2E3192] rounded-lg border-2 border-[#2E3192] font-bold transform hover:scale-110 active:scale-95 transition-all"
            title="Click to hear pronunciation"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => submitAnswer(option)}
            disabled={gameState.answered}
            className={`p-4 md:p-6 rounded-xl border-3 font-bold text-base md:text-lg transition-all transform hover:scale-105 active:scale-95 break-words whitespace-normal min-h-20 flex items-center justify-center text-center line-clamp-3 ${
              gameState.answered
                ? option === (isEnglishToGerman ? currentWord?.deutsch : currentWord?.english)
                  ? 'bg-[#6BCB77] text-white border-[#2E3192] scale-105'
                  : 'bg-[#E0D5C8] text-[#2E3192] border-[#2E3192] opacity-50'
                : 'bg-white text-[#2E3192] border-[#2E3192] hover:bg-[#F0E5D8]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {!gameState.answered && (
        <div className="text-center text-sm text-gray-600 font-semibold">
          Click the correct translation
        </div>
      )}
    </div>
  );
}
