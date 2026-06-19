import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Trophy, Play, Settings, Zap, BookOpen, User, Users, Lock, Library, Flame, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function MenuPage() {
  const { highScores } = useGame();
  const { currentPlayer } = usePlayer();
  const [, navigate] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const topScore = highScores[0];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      localStorage.removeItem('currentPlayerId');
      localStorage.removeItem('currentPlayerName');
      localStorage.removeItem('currentPlayerUsername');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Admin keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  if (!currentPlayer || !currentPlayer.id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="arcade-title text-[#2E3192] text-4xl mb-8">VOKABEL CHAMPION</div>
          <div className="space-y-4">
            <div>
              <p className="text-[#2E3192] font-bold mb-3">Neuer Spieler?</p>
              <Button
                onClick={() => navigate('/auth')}
                className="w-full bg-gradient-to-r from-[#6BCB77] to-[#4CAF50] hover:from-[#5AB366] hover:to-[#45a049] text-white font-bold px-8 py-4 rounded-lg text-lg border-2 border-[#2E3192] transform hover:scale-105 active:scale-95 transition-all"
              >
                <User className="w-6 h-6 mr-2" />
                REGISTRIEREN
              </Button>
            </div>
            <div>
              <p className="text-[#2E3192] font-bold mb-3">Bereits registriert?</p>
              <Button
                onClick={() => navigate('/auth')}
                className="w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold px-8 py-4 rounded-lg text-lg border-2 border-[#2E3192] transform hover:scale-105 active:scale-95 transition-all"
              >
                <Lock className="w-6 h-6 mr-2" />
                ANMELDEN
              </Button>
            </div>
            <div className="pt-4 border-t-2 border-[#2E3192]">
              <p className="text-[#2E3192] font-bold mb-3">Oder wähle einen Spieler:</p>
              <Button
                onClick={() => navigate('/players')}
                className="w-full bg-[#2E3192] hover:bg-[#1a1a5f] text-white font-bold px-8 py-4 rounded-lg text-lg border-2 border-[#FFD93D] transform hover:scale-105 active:scale-95 transition-all"
              >
                <User className="w-6 h-6 mr-2" />
                SPIELER AUSWÄHLEN
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-[#2E3192] rounded-t-3xl p-8 text-center border-4 border-[#FFD93D] shadow-2xl">
          <div className="arcade-title text-[#FFD93D] text-4xl mb-2 tracking-widest">VOKABEL</div>
          <div className="arcade-title text-[#FF6B9D] text-3xl tracking-widest">CHAMPION</div>
          <div className="text-[#6BCB77] text-lg mt-4 font-semibold">Master Your English Vocabulary</div>
        </div>

        <div className="bg-white border-4 border-[#FFD93D] border-t-0 p-8 shadow-2xl">
          <div className="mb-8 p-6 bg-gradient-to-r from-[#FFD93D] to-[#FF9F1C] rounded-xl border-3 border-[#2E3192]">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-[#2E3192]" />
              <span className="arcade-title text-[#2E3192]">WELCOME, {currentPlayer.name.toUpperCase()}</span>
            </div>
            {topScore ? (
              <>
                <div className="arcade-score text-center text-[#2E3192]">{topScore.score}</div>
                <div className="text-center text-sm text-[#2E3192] mt-2">Level {topScore.level} • Combo: {topScore.combo}</div>
              </>
            ) : (
              <div className="text-center text-sm text-[#2E3192] mt-2">Start playing to earn points!</div>
            )}
          </div>

          <div className="space-y-3">
            <Button onClick={() => navigate('/collections')} className="w-full h-16 bg-gradient-to-r from-[#FF6B9D] to-[#FF9F1C] hover:from-[#E63946] hover:to-[#FF6B9D] text-white text-lg font-bold rounded-xl border-3 border-[#2E3192] shadow-lg transform hover:scale-105 transition-all active:scale-95">
              <Play className="w-6 h-6 mr-2" />
              SPIEL STARTEN
            </Button>
            <Button onClick={() => navigate('/challenges')} className="w-full h-12 bg-gradient-to-r from-[#FFD93D] to-[#FF9F1C] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#2E3192] text-base font-bold rounded-xl border-3 border-[#2E3192] shadow-lg transform hover:scale-105 transition-all active:scale-95">
              <Zap className="w-5 h-5 mr-2" />
              CHALLENGES
            </Button>
            <Button onClick={() => navigate('/daily-challenges')} className="w-full h-12 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] hover:from-[#D62828] hover:to-[#E63946] text-white text-base font-bold rounded-xl border-3 border-[#2E3192] shadow-lg transform hover:scale-105 transition-all active:scale-95">
              <Flame className="w-5 h-5 mr-2" />
              TÄGLICHE HERAUSFORDERUNGEN
            </Button>
            <Button onClick={() => navigate('/learning-plan')} className="w-full h-12 bg-gradient-to-r from-[#6BCB77] to-[#4CAF50] hover:from-[#5AB366] hover:to-[#45a049] text-white text-base font-bold rounded-xl border-3 border-[#2E3192] shadow-lg transform hover:scale-105 transition-all active:scale-95">
              <BookOpen className="w-5 h-5 mr-2" />
              LEARNING PLAN
            </Button>
            <Button onClick={() => navigate('/multiplayer')} className="w-full h-12 bg-gradient-to-r from-[#9B59B6] to-[#8E44AD] hover:from-[#8E44AD] hover:to-[#7D3C98] text-white text-base font-bold rounded-xl border-3 border-[#2E3192] shadow-lg transform hover:scale-105 transition-all active:scale-95">
              <Users className="w-5 h-5 mr-2" />
              MULTIPLAYER
            </Button>
            <Button onClick={handleLogout} className="w-full h-12 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] hover:from-[#D62828] hover:to-[#E63946] text-white text-base font-bold rounded-xl border-3 border-[#2E3192] shadow-lg transform hover:scale-105 transition-all active:scale-95">
              <LogOut className="w-5 h-5 mr-2" />
              ABMELDEN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
