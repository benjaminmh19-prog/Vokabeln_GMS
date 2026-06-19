import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useGame } from '@/contexts/GameContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Trophy, Users, X, Copy, Check } from 'lucide-react';
import Level1Game from '@/components/game/Level1Game';
import Level2Game from '@/components/game/Level2Game';
import Level3Game from '@/components/game/Level3Game';
import { trpc } from '@/lib/trpc';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RouteParams {
  sessionId: string;
}

export default function MultiplayerGamePage() {
  const params = useParams<RouteParams>();
  const [, navigate] = useLocation();
  const { currentPlayer } = usePlayer();
  const { gameState, startGame, endGame } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [error, setError] = useState('');

  const sessionId = params?.sessionId || '';

  // Fetch session status
  const { data: sessionData, isLoading } = trpc.multiplayer.getSessionStatus.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

  // Update session status mutation
  const updateStatusMutation = trpc.multiplayer.updateSessionStatus.useMutation();

  useEffect(() => {
    if (!currentPlayer || !sessionId) {
      navigate('/multiplayer');
    }
  }, [currentPlayer, sessionId, navigate]);

  const handleStartGame = async () => {
    try {
      setError('');
      setGameStarted(true);

      // Update session status to in_progress
      await updateStatusMutation.mutateAsync({
        sessionId,
        status: 'in_progress',
      });

      // Get vocabulary from session
      const units = sessionData?.session?.units || ['Unit 1'];
      const pages = sessionData?.session?.pages || ['1'];
      const levelNum = sessionData?.session?.level || 1;
      const level = (levelNum === 2 ? 2 : levelNum === 3 ? 3 : 1) as any;
      const directionStr = sessionData?.session?.direction || 'en-de';
      const direction = (directionStr === 'de-en' ? 'de-en' : directionStr === 'gemischt' ? 'gemischt' : 'en-de') as any;

      // For now, start with default vocabulary
      // TODO: Load actual vocabulary based on collection/units/pages
      const mockVocabulary = [
        { english: 'Hello', deutsch: 'Hallo', id: '1' },
        { english: 'Goodbye', deutsch: 'Auf Wiedersehen', id: '2' },
        { english: 'Thank you', deutsch: 'Danke', id: '3' },
      ];

      startGame(direction, level, 'vocabulary', { unitName: 'Multiplayer', pages }, mockVocabulary);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Starten des Spiels');
      setGameStarted(false);
    }
  };

  const handleEndGame = async () => {
    try {
      endGame();

      // Update session status to completed
      await updateStatusMutation.mutateAsync({
        sessionId,
        status: 'completed',
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Beenden des Spiels');
    }
  };

  const handleCopySessionCode = () => {
    if (sessionData?.session?.session_code) {
      navigator.clipboard.writeText(sessionData.session.session_code);
      setCopiedCode(sessionData.session.session_code);
      setTimeout(() => setCopiedCode(''), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#2E3192]">Lädt Session...</p>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="arcade-title text-[#2E3192] text-4xl md:text-5xl mb-2 flex items-center justify-center gap-3">
              <Users className="w-10 h-10" />
              MULTIPLAYER GAME
            </div>
          </div>

          {error && (
            <Alert className="mb-8 border-2 border-red-500 bg-red-50">
              <AlertDescription className="text-red-600 font-semibold">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Session Code Display */}
          {sessionData?.session && (
            <div className="bg-white border-4 border-[#2E3192] rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-[#2E3192] mb-6">Session-Code</h2>
              <div className="bg-[#F0E5D8] p-6 rounded-lg border-2 border-[#2E3192] mb-4">
                <p className="text-sm text-gray-600 mb-2">Teile diesen Code mit deinen Freunden:</p>
                <div className="flex items-center gap-4">
                  <p className="font-mono text-3xl font-bold text-[#2E3192] tracking-widest">
                    {sessionData.session.session_code}
                  </p>
                  <button
                    onClick={handleCopySessionCode}
                    className="p-3 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    {copiedCode === sessionData.session.session_code ? (
                      <Check className="w-6 h-6 text-green-500" />
                    ) : (
                      <Copy className="w-6 h-6 text-[#2E3192]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Players in Session */}
          {sessionData?.participants && sessionData.participants.length > 0 && (
            <div className="bg-white border-4 border-[#2E3192] rounded-xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-[#2E3192] mb-6">
                Spieler ({sessionData.participants.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {sessionData.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-[#F0E5D8] p-4 rounded-lg border-2 border-[#2E3192]"
                  >
                    <p className="font-bold text-[#2E3192]">Spieler {participant.player_id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">Bereit zum Spielen</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleStartGame}
                disabled={updateStatusMutation.isPending}
                className="w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-4 text-lg transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateStatusMutation.isPending ? 'WIRD GESTARTET...' : 'SPIEL STARTEN'}
              </Button>
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={() => navigate('/multiplayer')}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold border-2 border-[#2E3192] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all"
            >
              ZURÜCK
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with session code and score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Left: Session Code */}
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-2 uppercase">SESSION-CODE</p>
              <p className="font-mono text-2xl font-bold text-[#2E3192] tracking-widest">
                {sessionData?.session?.session_code}
              </p>
            </div>
          </div>

          {/* Center: Score */}
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">DEIN SCORE</p>
              <p className="arcade-title text-[#2E3192] text-4xl">{gameState.score}</p>
            </div>
          </div>

          {/* Right: Time */}
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">ZEIT</p>
              <p className="arcade-title text-[#2E3192] text-4xl">{gameState.timeRemaining}s</p>
            </div>
          </div>
        </div>

        {/* Game Content */}
        {gameState.currentWord && (
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-8 shadow-lg">
            {gameState.level === 1 && <Level1Game />}
            {gameState.level === 2 && <Level2Game />}
            {gameState.level === 3 && <Level3Game />}
          </div>
        )}

        {/* Stop Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleEndGame}
            className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-[#2E3192] rounded-lg px-8 py-3 flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
            SPIEL BEENDEN
          </Button>
        </div>
      </div>
    </div>
  );
}
