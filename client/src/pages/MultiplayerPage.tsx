import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { usePlayer } from '@/contexts/PlayerContext';
import { useCollections } from '@/hooks/useCollections';
import { useVocabularyByCollection } from '@/hooks/useVocabularyByCollection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Copy, Check, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MultiplayerPage() {
  const [, navigate] = useLocation();
  const { currentPlayer } = usePlayer();
  const { collections } = useCollections();
  const [joinSessionCode, setJoinSessionCode] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // tRPC mutations
  const createSessionMutation = trpc.multiplayer.createSession.useMutation();
  const joinSessionMutation = trpc.multiplayer.joinSession.useMutation();

  if (!currentPlayer) {
    navigate('/players');
    return null;
  }

  const handleCreateSession = async () => {
    try {
      setError('');
      setIsCreating(true);

      // For now, create a session with default settings
      // In future, add collection/unit/page selection UI
      const collectionId: string = (collections[0]?.id) || 'collection-1';
      const hostId: string = currentPlayer.id || '';
      const result = await createSessionMutation.mutateAsync({
        hostId,
        collectionId,
        units: ['Unit 1'],
        pages: ['1'],
        level: 1,
        direction: 'en-de',
      });

      if (result.success && result.session) {
        // Navigate to game with session ID
        navigate(`/multiplayer-game/${result.session.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen der Session');
      setIsCreating(false);
    }
  };

  const handleJoinSession = async () => {
    try {
      setError('');
      setIsJoining(true);

      const result = await joinSessionMutation.mutateAsync({
        sessionCode: joinSessionCode.trim() as string,
        playerId: currentPlayer.id as string,
      });

      if (result.success && result.session) {
        navigate(`/multiplayer-game/${result.session.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Beitreten zur Session');
      setIsJoining(false);
    }
  };

  const handleCopySessionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="arcade-title text-[#2E3192] text-4xl md:text-5xl mb-2 flex items-center justify-center gap-3">
            <Users className="w-10 h-10" />
            MULTIPLAYER
          </div>
          <div className="text-lg text-[#2E3192] font-semibold">
            Spiele mit deinen Freunden!
          </div>
        </div>

        {error && (
          <Alert className="mb-8 border-2 border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600 font-semibold">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Session */}
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#2E3192] mb-6">Spiel hosten</h2>
            <p className="text-gray-600 mb-6">
              Erstelle eine neue Multiplayer-Session und lade deine Freunde ein.
            </p>
            <Button
              onClick={handleCreateSession}
              disabled={isCreating || createSessionMutation.isPending}
              className="w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-4 text-lg transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || createSessionMutation.isPending ? 'WIRD ERSTELLT...' : 'SESSION ERSTELLEN'}
            </Button>
          </div>

          {/* Join Session */}
          <div className="bg-white border-4 border-[#2E3192] rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#2E3192] mb-6">Spiel beitreten</h2>
            <p className="text-gray-600 mb-4">
              Gib den Session-Code ein, um einem Spiel beizutreten.
            </p>
            <div className="space-y-3">
              <Input
                type="text"
                value={joinSessionCode}
                onChange={(e) => setJoinSessionCode(e.target.value.toUpperCase())}
                placeholder="z.B. ABC12345"
                className="p-4 text-lg border-3 border-[#2E3192] rounded-lg font-bold w-full uppercase"
                maxLength={8}
              />
              <Button
                onClick={handleJoinSession}
                disabled={!joinSessionCode.trim() || isJoining || joinSessionMutation.isPending}
                className="w-full bg-gradient-to-r from-[#6BCB77] to-[#4CAF50] hover:from-[#5AB366] hover:to-[#45a049] text-white font-bold border-2 border-[#2E3192] rounded-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 transition-all"
              >
                {isJoining || joinSessionMutation.isPending ? 'WIRD BEIGETRETEN...' : 'BEITRETEN'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold border-2 border-[#2E3192] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all"
          >
            ZURÜCK ZUM MENÜ
          </Button>
        </div>
      </div>
    </div>
  );
}
