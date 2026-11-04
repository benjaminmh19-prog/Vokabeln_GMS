import { useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { useSentences } from '@/hooks/useSentences';
import { loadMiniGameSession, MINI_GAME_TITLES } from '@/lib/miniGameSession';
import LetterScramble from '@/components/minigames/LetterScramble';
import SentenceBuilder from '@/components/minigames/SentenceBuilder';
import MemoryGame from '@/components/minigames/MemoryGame';

/**
 * Seite für Buchstabensalat, Sätze bilden und Wörter-Memory.
 * Die Auswahl (Vokabeln, Spielart) kommt aus der Sammlungsauswahl über die sessionStorage.
 */
export default function MiniGamePage() {
  const [, navigate] = useLocation();
  const { currentPlayer } = usePlayer();
  const session = useMemo(() => loadMiniGameSession(), []);
  const { sentences, isLoading: sentencesLoading, error: sentencesError } = useSentences();

  useEffect(() => {
    if (!currentPlayer) navigate('/auth');
    else if (!session) navigate('/collections');
  }, [currentPlayer, session, navigate]);

  if (!session) return null;

  const exit = () => navigate('/collections');
  const needsSentences = session.type === 'sentences';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button
            onClick={exit}
            className="bg-[#2E3192] hover:bg-[#1a1a4d] text-[#FFD93D] border-2 border-[#FFD93D] rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            Auswahl
          </Button>
          <h1 className="arcade-title text-[#2E3192] text-2xl md:text-3xl text-right">{MINI_GAME_TITLES[session.type]}</h1>
        </div>
        <p className="mb-4 text-sm font-semibold text-[#2E3192]/80">{session.label}</p>

        <div className="bg-white border-4 border-[#2E3192] rounded-2xl p-4 md:p-6 shadow-2xl">
          {needsSentences && sentencesLoading ? (
            <p className="text-center font-semibold text-[#2E3192]">Sätze werden geladen...</p>
          ) : needsSentences && sentencesError ? (
            <p className="text-center font-semibold text-[#E63946]">Die Sätze konnten nicht geladen werden. Bitte später noch einmal versuchen.</p>
          ) : session.type === 'scramble' ? (
            <LetterScramble vocab={session.vocab} onExit={exit} />
          ) : session.type === 'memory' ? (
            <MemoryGame vocab={session.vocab} onExit={exit} />
          ) : (
            <SentenceBuilder vocab={session.vocab} sentences={sentences} onExit={exit} />
          )}
        </div>
      </div>
    </div>
  );
}
