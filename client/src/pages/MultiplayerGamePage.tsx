import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { useVocabularyByCollection } from '@/hooks/useVocabularyByCollection';
import { playSoundEffect } from '@/lib/audioUtils';

interface RouteParams {
  sessionId: string;
}

export default function MultiplayerGamePage() {
  const params = useParams<RouteParams>();
  const [, navigate] = useLocation();
  const { currentPlayer, allPlayers } = usePlayer();
  const { gameState, startGame, endGame, nextWord } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [error, setError] = useState('');

  const sessionId = params?.sessionId || '';
  const pollInterval = gameStarted ? 3000 : 2000;

  const { data: sessionData, isLoading } = trpc.multiplayer.getSessionStatus.useQuery(
    { sessionId },
    { enabled: !!sessionId, refetchInterval: pollInterval }
  );

  const { getVocabularyByPage } = useVocabularyByCollection(sessionData?.session?.collection_id);

  const updateStatusMutation = trpc.multiplayer.updateSessionStatus.useMutation();
  const updateScoreMutation = trpc.multiplayer.updateParticipantScore.useMutation();
  const autoStartAttempted = useRef(false);

  const isHost = sessionData?.session?.host_id === currentPlayer?.id;
  const myParticipant = sessionData?.participants?.find(
    (p) => p.player_id === currentPlayer?.id
  );

  const getPlayerName = useCallback(
    (playerId: string) => {
      const player = allPlayers.find((p) => p.id === playerId);
      if (player?.name) return player.name;
      const saved = localStorage.getItem('vokabel_players');
      if (saved) {
        try {
          const players = JSON.parse(saved);
          const found = players.find((p: { id: string; name: string }) => p.id === playerId);
          if (found?.name) return found.name;
        } catch { /* ignore */ }
      }
      return `Spieler ${playerId.slice(0, 6)}`;
    },
    [allPlayers]
  );

  const buildVocabulary = useCallback(() => {
    const units = sessionData?.session?.units || ['Unit 1'];
    const pages = sessionData?.session?.pages || ['1'];

    const parseUnit = (value: string): number => {
      const match = value.match(/\d+/);
      return match ? parseInt(match[0], 10) : NaN;
    };

    const allVocab: { id: string; english: string; deutsch: string }[] = [];
    for (const unitStr of units) {
      const unitNum = parseUnit(unitStr);
      for (const pageStr of pages) {
        const pageNum = parseInt(pageStr, 10);
        if (!isNaN(unitNum) && !isNaN(pageNum)) {
          const pageVocab = getVocabularyByPage(unitNum, pageNum);
          allVocab.push(
            ...pageVocab.map((v) => ({
              id: v.id,
              english: v.english,
              deutsch: v.deutsch,
            }))
          );
        }
      }
    }

    return allVocab.length > 0
      ? allVocab
      : [
          { english: 'Hello', deutsch: 'Hallo', id: '1' },
          { english: 'Goodbye', deutsch: 'Auf Wiedersehen', id: '2' },
          { english: 'Thank you', deutsch: 'Danke', id: '3' },
        ];
  }, [sessionData?.session?.units, sessionData?.session?.pages, getVocabularyByPage]);

  const launchGame = useCallback(() => {
    const pages = sessionData?.session?.pages || ['1'];
    const levelNum = sessionData?.session?.level || 1;
    const level = (levelNum === 2 ? 2 : levelNum === 3 ? 3 : 1) as 1 | 2 | 3;
    const directionStr = sessionData?.session?.direction || 'en-de';
    const direction = (
      directionStr === 'de-en' ? 'de-en' : directionStr === 'gemischt' ? 'gemischt' : 'en-de'
    ) as 'en-de' | 'de-en' | 'gemischt';

    startGame(direction, level, 'vocabulary', { unitName: 'Multiplayer', pages }, buildVocabulary());
  }, [sessionData?.session, buildVocabulary, startGame]);

  useEffect(() => {
    if (!currentPlayer || !sessionId) {
      navigate('/multiplayer');
    }
  }, [currentPlayer, sessionId, navigate]);

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

  // Play sound effects on answer
  useEffect(() => {
    if (gameState.answered) {
      playSoundEffect(gameState.isCorrect ? 'correct' : 'incorrect');
    }
  }, [gameState.answered, gameState.isCorrect]);

  // Auto-start for non-host when host starts the game
  useEffect(() => {
    if (
      gameStarted ||
      autoStartAttempted.current ||
      sessionData?.session?.status !== 'in_progress'
    ) {
      return;
    }
    autoStartAttempted.current = true;
    setGameStarted(true);
    launchGame();
  }, [gameStarted, sessionData?.session?.status, launchGame]);

  // Sync score to server after each answer
  useEffect(() => {
    if (!gameStarted || !gameState.answered || !myParticipant?.id) return;

    const correctAnswers = gameState.wordsCompleted || 0;
    const totalAnswers = gameState.currentWordIndex + 1;

    updateScoreMutation.mutate({
      participantId: myParticipant.id,
      score: gameState.score,
      correctAnswers,
      totalAnswers,
    });
  }, [
    gameStarted,
    gameState.answered,
    gameState.score,
    gameState.wordsCompleted,
    gameState.currentWordIndex,
    myParticipant?.id,
  ]);

  // Final score sync when game ends
  useEffect(() => {
    if (!gameStarted || gameState.mode !== 'results' || !myParticipant?.id) return;

    updateScoreMutation.mutate({
      participantId: myParticipant.id,
      score: gameState.score,
      correctAnswers: gameState.wordsCompleted || 0,
      totalAnswers: gameState.currentWordIndex + 1,
    });
  }, [gameStarted, gameState.mode, gameState.score, gameState.wordsCompleted, gameState.currentWordIndex, myParticipant?.id]);

  // Mark session completed when host finishes
  useEffect(() => {
    if (gameStarted && gameState.mode === 'results' && isHost) {
      updateStatusMutation.mutate({ sessionId, status: 'completed' });
    }
  }, [gameStarted, gameState.mode, isHost, sessionId]);

  const handleStartGame = async () => {
    if (!isHost) return;
    try {
      setError('');
      setGameStarted(true);
      autoStartAttempted.current = true;

      await updateStatusMutation.mutateAsync({
        sessionId,
        status: 'in_progress',
      });

      launchGame();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Starten des Spiels');
      setGameStarted(false);
      autoStartAttempted.current = false;
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
                    <p className="font-bold text-[#2E3192]">
                      {getPlayerName(participant.player_id)}
                      {participant.player_id === sessionData.session?.host_id && (
                        <span className="ml-2 text-xs bg-[#FFD93D] px-2 py-0.5 rounded-full">HOST</span>
                      )}
                      {participant.player_id === currentPlayer?.id && (
                        <span className="ml-2 text-xs bg-[#6BCB77] text-white px-2 py-0.5 rounded-full">DU</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Bereit zum Spielen</p>
                  </div>
                ))}
              </div>

              {isHost ? (
                <Button
                  onClick={handleStartGame}
                  disabled={updateStatusMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-4 text-lg transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateStatusMutation.isPending ? 'WIRD GESTARTET...' : 'SPIEL STARTEN'}
                </Button>
              ) : (
                <div className="text-center p-6 bg-[#F0E5D8] rounded-lg border-2 border-[#2E3192]">
                  <p className="font-bold text-[#2E3192] text-lg">Warte auf den Host...</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Das Spiel startet automatisch, sobald der Host auf „Spiel starten" klickt.
                  </p>
                </div>
              )}
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

  const sortedParticipants = [...(sessionData?.participants || [])].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  );

  const Leaderboard = () => (
    <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg mb-8">
      <h3 className="text-lg font-bold text-[#2E3192] mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-[#FFD93D]" />
        LIVE-RANGLISTE
      </h3>
      <div className="space-y-2">
        {sortedParticipants.map((participant, index) => (
          <div
            key={participant.id}
            className={`flex items-center justify-between p-3 rounded-lg border-2 ${
              participant.player_id === currentPlayer?.id
                ? 'border-[#6BCB77] bg-green-50'
                : 'border-[#2E3192] bg-[#F0E5D8]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`font-bold text-lg w-6 ${
                index === 0 ? 'text-[#FFD93D]' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-[#CD7F32]' : 'text-gray-500'
              }`}>
                {index + 1}.
              </span>
              <span className="font-bold text-[#2E3192]">
                {getPlayerName(participant.player_id)}
                {participant.player_id === sessionData?.session?.host_id && (
                  <span className="ml-1 text-xs text-gray-500">(Host)</span>
                )}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-[#2E3192] text-lg">{participant.score ?? 0}</span>
              <span className="text-xs text-gray-500 ml-2">
                ({participant.correct_answers ?? 0}/{participant.total_answers ?? 0})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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

        <Leaderboard />

        {/* Game Over */}
        {gameState.mode === 'results' && (
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-8 shadow-lg text-center mb-8">
            <Trophy className="w-16 h-16 mx-auto text-[#FFD93D] mb-4" />
            <h2 className="arcade-title text-[#2E3192] text-3xl mb-4">SPIEL BEENDET!</h2>
            <p className="text-xl font-bold text-[#2E3192] mb-2">Dein Score: {gameState.score}</p>
            <p className="text-gray-600 mb-6">Max Combo: {gameState.maxCombo}</p>
            {sortedParticipants.length > 0 && (
              <div className="mb-6">
                <p className="font-bold text-[#2E3192] mb-2">
                  {sortedParticipants[0]?.player_id === currentPlayer?.id
                    ? '🏆 Du hast gewonnen!'
                    : `🏆 Gewinner: ${getPlayerName(sortedParticipants[0].player_id)}`}
                </p>
              </div>
            )}
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg px-8 py-3"
            >
              ZURÜCK ZUM MENÜ
            </Button>
          </div>
        )}

        {/* Game Content */}
        {gameState.currentWord && gameState.mode !== 'results' && (
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-8 shadow-lg">
            {gameState.level === 1 && <Level1Game />}
            {gameState.level === 2 && <Level2Game />}
            {gameState.level === 3 && <Level3Game />}

            {gameState.answered && (
              <div className="mt-8 space-y-4">
                <div className={`w-full p-4 rounded-lg border-3 border-[#2E3192] text-center font-bold text-lg ${
                  gameState.isCorrect
                    ? 'bg-[#6BCB77] text-white animate-bounce'
                    : 'bg-[#E63946] text-white'
                }`}>
                  {gameState.isCorrect ? '✓ RICHTIG!' : '✗ FALSCH!'}
                </div>
                {!gameState.isCorrect && (
                  <div className="p-4 bg-[#F0E5D8] rounded-lg border-2 border-[#2E3192] text-center">
                    <div className="text-sm font-bold text-[#2E3192] mb-2">Richtige Antwort:</div>
                    <div className="text-lg font-bold text-[#6BCB77]">
                      {(gameState.currentDirection || gameState.direction) === 'en-de'
                        ? gameState.currentWord?.deutsch
                        : gameState.currentWord?.english}
                    </div>
                  </div>
                )}
              </div>
            )}
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
