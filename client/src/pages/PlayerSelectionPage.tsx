import React, { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Play } from 'lucide-react';

export default function PlayerSelectionPage() {
  const { allPlayers, currentPlayer, createPlayer, selectPlayer } = usePlayer();
  const [, navigate] = useLocation();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false);

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      createPlayer(newPlayerName.trim());
      setNewPlayerName('');
      setShowNewPlayerForm(false);
    }
  };

  const handleSelectAndContinue = (name: string) => {
    selectPlayer(name);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="arcade-title text-[#2E3192] text-4xl md:text-5xl mb-2">
            PLAYER SELECTION
          </div>
          <div className="text-lg text-[#2E3192] font-semibold">
            Choose your player or create a new one
          </div>
        </div>

        {/* Existing Players */}
        {allPlayers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#2E3192] mb-6">Your Players</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPlayers.map((player) => (
                <div
                  key={player.name}
                  className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#2E3192]">{player.name}</h3>
                      <p className="text-sm text-gray-600">
                        Joined {new Date(player.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                    {currentPlayer?.name === player.name && (
                      <span className="bg-[#6BCB77] text-white px-3 py-1 rounded-full text-xs font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="bg-[#F0E5D8] p-3 rounded-lg">
                      <div className="text-xs text-gray-600">Games Played</div>
                      <div className="font-bold text-[#2E3192]">{player.stats.gamesPlayed}</div>
                    </div>
                    <div className="bg-[#F0E5D8] p-3 rounded-lg">
                      <div className="text-xs text-gray-600">Best Score</div>
                      <div className="font-bold text-[#2E3192]">{player.stats.bestScore}</div>
                    </div>
                    <div className="bg-[#F0E5D8] p-3 rounded-lg">
                      <div className="text-xs text-gray-600">Best Level</div>
                      <div className="font-bold text-[#2E3192]">Level {player.stats.bestLevel}</div>
                    </div>
                    <div className="bg-[#F0E5D8] p-3 rounded-lg">
                      <div className="text-xs text-gray-600">Max Combo</div>
                      <div className="font-bold text-[#2E3192]">x{player.stats.maxCombo}</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSelectAndContinue(player.name)}
                    className="w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-3 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play className="w-5 h-5" />
                    PLAY AS {player.name.toUpperCase()}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Player Form */}
        <div className="bg-white border-4 border-[#2E3192] rounded-xl p-8 shadow-lg">
          {!showNewPlayerForm ? (
            <Button
              onClick={() => setShowNewPlayerForm(true)}
              className="w-full bg-gradient-to-r from-[#6BCB77] to-[#4CAF50] hover:from-[#5AB366] hover:to-[#45a049] text-white font-bold border-2 border-[#2E3192] rounded-lg py-4 flex items-center justify-center gap-2 text-lg transform hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6" />
              CREATE NEW PLAYER
            </Button>
          ) : (
            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2E3192] mb-2">
                  Player Name
                </label>
                <Input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Enter your name..."
                  className="p-4 text-lg border-3 border-[#2E3192] rounded-lg font-bold w-full"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={!newPlayerName.trim()}
                  className="flex-1 bg-[#6BCB77] hover:bg-[#5AB366] text-white font-bold border-2 border-[#2E3192] rounded-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 transition-all"
                >
                  CREATE
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowNewPlayerForm(false);
                    setNewPlayerName('');
                  }}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold border-2 border-[#2E3192] rounded-lg py-3 transform hover:scale-105 active:scale-95 transition-all"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
