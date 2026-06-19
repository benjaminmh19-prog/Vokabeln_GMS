import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { useProgress } from '@/contexts/ProgressContext';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { useLocation } from 'wouter';

export default function ResultsPage() {
  const { gameState, resetGame, addHighScore, highScores, getErroredWords } = useGame();
  const { recordPageCompletion } = useProgress();
  const [, navigate] = useLocation();
  const erroredWords = getErroredWords();

  useEffect(() => {
    if (gameState.score > 0) {
      addHighScore({
        score: gameState.score,
        date: new Date().toLocaleDateString(),
        level: gameState.level,
        direction: gameState.direction,
        gameType: gameState.gameType,
        combo: gameState.maxCombo,
      });
      
      // Record progress for all completed pages (supports multi-page sessions)
      const selectedCollection = localStorage.getItem('selectedCollectionId');
      const selectedUnit = localStorage.getItem('selectedUnit');
      
      // Try to get multiple selected pages first (new multi-page feature)
      const selectedPagesStr = localStorage.getItem('selectedPages');
      const selectedPageStr = localStorage.getItem('selectedPage');
      
      if (selectedCollection && selectedUnit) {
        let pagesToRecord: number[] = [];
        
        if (selectedPagesStr) {
          // Multi-page session
          try {
            pagesToRecord = JSON.parse(selectedPagesStr);
          } catch (e) {
            console.error('Error parsing selectedPages:', e);
          }
        } else if (selectedPageStr) {
          // Single-page session (backward compatibility)
          pagesToRecord = [parseInt(selectedPageStr)];
        }
        
        // Record completion for each page
        pagesToRecord.forEach(page => {
          recordPageCompletion(
            selectedCollection,
            parseInt(selectedUnit),
            page,
            gameState.score
          );
        });
      }
      
      // Track word statistics
      const savedStats = localStorage.getItem('vokabel-champion-word-stats');
      const stats = savedStats ? JSON.parse(savedStats) : {};
      
      // Update stats based on game results (simplified - in production you'd track each word)
      localStorage.setItem('vokabel-champion-word-stats', JSON.stringify(stats));
    }
  }, [gameState.score, addHighScore, recordPageCompletion]);

  const isPassed = gameState.errors < gameState.maxErrors && gameState.timeRemaining > 0;
  const topScore = highScores[0];
  const isNewRecord = gameState.score === topScore?.score;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className={`rounded-3xl border-4 border-[#2E3192] shadow-2xl overflow-hidden ${isPassed ? 'bg-gradient-to-b from-[#6BCB77] to-[#5AB366]' : 'bg-gradient-to-b from-[#E63946] to-[#FF6B9D]'}`}>
          <div className="p-8 text-center text-white">
            <div className="arcade-title text-4xl mb-4">{isPassed ? 'LEVEL PASSED!' : 'LEVEL FAILED'}</div>
            {isNewRecord && <div className="inline-block bg-[#FFD93D] text-[#2E3192] px-4 py-2 rounded-full font-bold border-2 border-white mb-4">NEW RECORD!</div>}
          </div>
          <div className="bg-white px-8 py-8">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-[#FFD93D] to-[#FF9F1C] rounded-xl p-6 border-3 border-[#2E3192]">
                <div className="text-xs font-bold text-[#2E3192] uppercase tracking-wider mb-2">Final Score</div>
                <div className="arcade-score text-[#2E3192]">{gameState.score}</div>
              </div>
              <div className="bg-gradient-to-br from-[#FF6B9D] to-[#E63946] rounded-xl p-6 border-3 border-[#2E3192]">
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">Max Combo</div>
                <div className="arcade-score text-white">{gameState.maxCombo}</div>
              </div>
              <div className="bg-gradient-to-br from-[#6BCB77] to-[#5AB366] rounded-xl p-6 border-3 border-[#2E3192]">
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">Accuracy</div>
                <div className="arcade-score text-white">{gameState.words.length > 0 ? Math.round(((gameState.words.length - gameState.errors) / gameState.words.length) * 100) : 0}%</div>
              </div>
                  <div className="bg-[#F0E5D8] rounded-xl p-6 border-3 border-[#2E3192]">
                <div className="text-xs font-bold text-[#2E3192] uppercase tracking-wider mb-2">Words Done</div>
                <div className="arcade-score text-[#2E3192]">{gameState.currentWordIndex}/{gameState.words.length}</div>
              </div>
              <div className="bg-[#FFE5B4] rounded-xl p-6 border-3 border-[#2E3192]">
                <div className="text-xs font-bold text-[#E63946] uppercase tracking-wider mb-2">Difficulty</div>
                <div className="arcade-score text-[#E63946]">Level {gameState.level}</div>
              </div>
            </div>
            <div className="bg-[#F0E5D8] rounded-xl p-6 border-2 border-[#2E3192] mb-8">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-bold text-[#2E3192]">Level</div>
                  <div className="text-lg text-[#2E3192]">Level {gameState.level}</div>
                </div>
                <div>
                  <div className="font-bold text-[#2E3192]">Direction</div>
                  <div className="text-lg text-[#2E3192]">{gameState.direction === 'en-de' ? 'EN to DE' : 'DE to EN'}</div>
                </div>
                <div>
                  <div className="font-bold text-[#2E3192]">Errors</div>
                  <div className="text-lg text-[#2E3192]">{gameState.errors}/{gameState.maxErrors}</div>
                </div>
                <div>
                  <div className="font-bold text-[#2E3192]">Time Used</div>
                  <div className="text-lg text-[#2E3192]">{gameState.totalTime - gameState.timeRemaining}s</div>
                </div>
              </div>
            </div>
            {gameState.erroredWords && gameState.erroredWords.length > 0 && (
              <div className="bg-[#FFE5B4] border-3 border-[#E63946] rounded-xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">❌</span>
                  <h3 className="arcade-title text-[#E63946]">WORDS TO PRACTICE</h3>
                </div>
                <div className="space-y-2">
                  {gameState.erroredWords.slice(0, 5).map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white border-2 border-[#E63946]">
                      <span className="font-bold text-[#2E3192]">{error.word}</span>
                      <span className="bg-[#E63946] text-white px-3 py-1 rounded-full text-xs font-bold">{error.errorCount}x wrong</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {highScores.length > 0 && (
              <div className="bg-white border-3 border-[#2E3192] rounded-xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-[#FFD93D]" />
                  <h3 className="arcade-title text-[#2E3192]">TOP 5 SCORES</h3>
                </div>
                <div className="space-y-2">
                  {highScores.slice(0, 5).map((score, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border-2 ${score.score === gameState.score ? 'bg-[#FFD93D] border-[#2E3192]' : 'bg-[#F0E5D8] border-[#E0D5C8]'}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-[#2E3192] w-6">#{index + 1}</span>
                        <span className="font-bold text-[#2E3192]">{score.score}</span>
                      </div>
                      <span className="text-xs text-gray-600">Level {score.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button onClick={() => { resetGame(); navigate('/selection'); }} className="h-14 bg-[#6BCB77] hover:bg-[#5AB366] text-white font-bold text-lg rounded-xl border-3 border-[#2E3192] transform hover:scale-105 active:scale-95 transition-all">
            <RotateCcw className="w-5 h-5 mr-2" />
            RETRY
          </Button>
          <Button onClick={() => { resetGame(); navigate('/'); }} className="h-14 bg-[#FFD93D] hover:bg-[#FFC700] text-[#2E3192] font-bold text-lg rounded-xl border-3 border-[#2E3192] transform hover:scale-105 active:scale-95 transition-all">
            <Home className="w-5 h-5 mr-2" />
            HOME
          </Button>
        </div>
      </div>
    </div>
  );
}
