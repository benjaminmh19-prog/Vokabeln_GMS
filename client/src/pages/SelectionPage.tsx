import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useGame } from '@/contexts/GameContext';
import { useVocabulary } from '@/hooks/useVocabulary';
import { GameDirection, GameLevel, GameType, SelectedContent, Vocabulary } from '@/types/game';
import { ChevronLeft, Play, User, Trophy } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SelectionPage() {
  const { startGame } = useGame();
  const [, navigate] = useLocation();
  const { units, loading } = useVocabulary();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState<GameDirection>('en-de');
  const [level, setLevel] = useState<GameLevel>(1);
  const [gameType, setGameType] = useState<GameType>('vocabulary');

  const currentUnit = units.find((u) => u.name === selectedUnit);
  const selectedWords = useMemo(() => {
    if (!currentUnit || selectedPages.size === 0) return [];
    return Array.from(selectedPages).flatMap((page) => currentUnit.pages[page] || []);
  }, [currentUnit, selectedPages]);

  const handlePageToggle = (page: string) => {
    const newPages = new Set(selectedPages);
    if (newPages.has(page)) newPages.delete(page);
    else newPages.add(page);
    setSelectedPages(newPages);
  };

  const handleSelectAllPages = () => {
    if (!currentUnit) return;
    if (selectedPages.size === Object.keys(currentUnit.pages).length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(Object.keys(currentUnit.pages)));
    }
  };

  const handleStartGame = () => {
    if (!selectedUnit || selectedPages.size === 0) return;
    const selectedContent = {
      unitName: selectedUnit,
      pages: Array.from(selectedPages),
    };
    startGame(direction, level, gameType, selectedContent, selectedWords);
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={() => navigate('/')} className="bg-[#2E3192] hover:bg-[#1a1a4d] text-[#FFD93D] border-2 border-[#FFD93D] rounded-lg">
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>
          <h1 className="arcade-title text-[#2E3192] text-3xl">SELECT CONTENT</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/leaderboard')} className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF9500] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg px-4 py-2 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              RANKING
            </Button>
            <Button onClick={() => navigate('/profile')} className="bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg px-4 py-2 flex items-center gap-2">
              <User className="w-5 h-5" />
              PROFIL
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-[#2E3192] text-lg">Loading vocabulary...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-xl">
                <h2 className="arcade-title text-[#2E3192] mb-4">UNITS</h2>
                <div className="space-y-2">
                  {units.map((unit) => (
                    <button key={unit.name} onClick={() => { setSelectedUnit(unit.name); setSelectedPages(new Set()); }} className={`w-full p-3 rounded-lg font-bold border-2 transition-all transform hover:scale-105 active:scale-95 ${selectedUnit === unit.name ? 'bg-[#FF6B9D] text-white border-[#2E3192]' : 'bg-[#F0E5D8] text-[#2E3192] border-[#E0D5C8] hover:bg-[#FFE5B4]'}`}>
                      {unit.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="arcade-title text-[#2E3192]">PAGES</h2>
                  {currentUnit && (
                    <button onClick={handleSelectAllPages} className="text-xs bg-[#6BCB77] text-white px-2 py-1 rounded font-bold hover:bg-[#5AB366]">
                      {selectedPages.size === Object.keys(currentUnit.pages).length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {currentUnit ? (
                    Object.keys(currentUnit.pages).sort((a, b) => parseInt(a) - parseInt(b)).map((page) => (
                      <label key={page} className="flex items-center gap-3 p-2 rounded hover:bg-[#F0E5D8] cursor-pointer">
                        <Checkbox checked={selectedPages.has(page)} onCheckedChange={() => handlePageToggle(page)} />
                        <span className="text-[#2E3192] font-semibold">Page {page}</span>
                        <span className="text-xs text-gray-500 ml-auto">({currentUnit.pages[page].length})</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-8">Select a unit first</div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white border-4 border-[#2E3192] rounded-xl p-6 shadow-xl">
                <h2 className="arcade-title text-[#2E3192] mb-4">SETTINGS</h2>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-[#2E3192] mb-2">Direction</label>
                  <div className="space-y-2">
                    {(['en-de', 'de-en', 'random'] as const).map((dir) => (
                      <button key={dir} onClick={() => setDirection(dir)} className={`w-full p-2 rounded-lg font-bold border-2 transition-all ${direction === dir ? 'bg-[#FFD93D] text-[#2E3192] border-[#2E3192]' : 'bg-[#F0E5D8] text-[#2E3192] border-[#E0D5C8]'}`}>
                        {dir === 'en-de' ? 'EN → DE' : dir === 'de-en' ? 'DE → EN' : '🎲 Random'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-[#2E3192] mb-2">Level</label>
                  <div className="space-y-2">
                    {([1, 2, 3, 'challenge'] as const).map((lv) => (
                      <button key={lv} onClick={() => setLevel(lv as any)} className={`w-full p-2 rounded-lg font-bold border-2 transition-all ${level === lv ? 'bg-[#FF6B9D] text-white border-[#2E3192]' : 'bg-[#F0E5D8] text-[#2E3192] border-[#E0D5C8]'}`}>
                        {typeof lv === 'number' ? `Level ${lv}` : '⚡ Challenge (20/3min)'}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <div className="flex-1 bg-white border-4 border-[#2E3192] rounded-xl p-4 shadow-xl">
            <div className="text-sm text-[#2E3192] font-semibold mb-1">Selected Words</div>
            <div className="arcade-score text-[#FF6B9D]">{selectedWords.length}</div>
          </div>
          <Button onClick={handleStartGame} disabled={selectedWords.length === 0} className="flex-1 h-16 bg-gradient-to-r from-[#6BCB77] to-[#FFD93D] hover:from-[#5AB366] hover:to-[#FFC700] text-[#2E3192] text-lg font-bold rounded-xl border-4 border-[#2E3192] shadow-lg transform hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            <Play className="w-6 h-6 mr-2" />
            START GAME
          </Button>
        </div>
      </div>
    </div>
  );
}
