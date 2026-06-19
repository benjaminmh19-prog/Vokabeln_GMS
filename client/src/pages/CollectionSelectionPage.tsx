import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen, ChevronRight, Home, Play } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useGame } from '@/contexts/GameContext';
import { useCollections } from '@/hooks/useCollections';
import { useVocabularyByCollection } from '@/hooks/useVocabularyByCollection';
// Types are defined inline since they're not exported from GameContext
type GameDirection = 'en-de' | 'de-en' | 'random';
type GameLevel = 1 | 2 | 3 | 'challenge';

interface AdminCollection {
  id?: string;
  name: string;
  description?: string;
  learning_year: number;
  created_at?: string;
  updated_at?: string;
}

type NavigationStep = 'collections' | 'units' | 'pages';

export default function CollectionSelectionPage() {
  const [, navigate] = useLocation();
  const { currentPlayer } = usePlayer();
  const { collections: loadedCollections, isLoading: collectionsLoading } = useCollections();
  const { startGame } = useGame();
  
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<AdminCollection | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<Set<number>>(new Set());
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState<NavigationStep>('collections');
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState<GameDirection>('en-de');
  const [level, setLevel] = useState<GameLevel>(1);

  // Load vocabulary for selected collection
  const { getUnits, getPagesByUnit, getVocabularyByPage } = useVocabularyByCollection(
    selectedCollection?.id
  );

  // Redirect if no current player (not logged in)
  useEffect(() => {
    if (!currentPlayer) {
      navigate('/auth');
    }
  }, [currentPlayer, navigate]);

  // Update collections when loaded
  useEffect(() => {
    if (loadedCollections.length > 0) {
      setCollections(loadedCollections);
    }
  }, [loadedCollections]);

  const handleSelectCollection = (collection: AdminCollection) => {
    setSelectedCollection(collection);
    setSelectedUnits(new Set());
    setSelectedPages(new Set());
    setCurrentStep('units');
    localStorage.setItem('selectedCollectionId', collection.id || '');
    localStorage.setItem('selectedCollectionName', collection.name);
    toast.success(`${collection.name} ausgewählt!`);
  };

  const handleToggleUnit = (unit: number) => {
    const newSelectedUnits = new Set(selectedUnits);
    if (newSelectedUnits.has(unit)) {
      newSelectedUnits.delete(unit);
    } else {
      newSelectedUnits.add(unit);
    }
    setSelectedUnits(newSelectedUnits);
  };

  const handleSelectAllUnits = () => {
    const units = getUnits();
    setSelectedUnits(new Set(units));
  };

  const handleDeselectAllUnits = () => {
    setSelectedUnits(new Set());
  };

  const handleUnitsConfirm = () => {
    if (selectedUnits.size === 0) {
      toast.error('Bitte wählen Sie mindestens eine Unit aus');
      return;
    }
    setCurrentStep('pages');
    setSelectedPages(new Set());
    localStorage.setItem('selectedUnits', JSON.stringify(Array.from(selectedUnits)));
    toast.success(`${selectedUnits.size} Unit${selectedUnits.size > 1 ? 's' : ''} ausgewählt!`);
  };

  const handleTogglePage = (page: number) => {
    const newSelectedPages = new Set(selectedPages);
    if (newSelectedPages.has(page)) {
      newSelectedPages.delete(page);
    } else {
      newSelectedPages.add(page);
    }
    setSelectedPages(newSelectedPages);
  };

  const handleSelectAllPages = () => {
    const allPages = new Set<number>();
    Array.from(selectedUnits).forEach(unit => {
      const pages = getPagesByUnit(unit);
      pages.forEach(p => allPages.add(p));
    });
    setSelectedPages(allPages);
  };

  const handleDeselectAllPages = () => {
    setSelectedPages(new Set());
  };

  const handleStartGame = () => {
    if (selectedPages.size === 0) {
      toast.error('Bitte wählen Sie mindestens eine Seite aus');
      return;
    }

    if (selectedUnits.size === 0) {
      toast.error('Bitte wählen Sie zuerst eine Unit aus');
      return;
    }

    setIsLoading(true);

    try {
      // Aggregate vocabulary from all selected units and pages
      const allPageVocab: any[] = [];
      const pageArray = Array.from(selectedPages).sort((a, b) => a - b);
      const unitsArray = Array.from(selectedUnits).sort((a, b) => a - b);

      for (const unit of unitsArray) {
        for (const page of pageArray) {
          const pageVocab = getVocabularyByPage(unit, page);
          allPageVocab.push(...pageVocab);
        }
      }

      if (allPageVocab.length === 0) {
        toast.error('Keine Vokabeln für die ausgewählten Units und Seiten verfügbar');
        setIsLoading(false);
        return;
      }

      // Transform to game type
      const gameVocab = allPageVocab.map(v => ({
        id: v.id,
        english: v.english,
        deutsch: v.deutsch,
        unit: v.unit.toString(),
        page: v.page.toString(),
      }));

      // Store selected units and pages in localStorage for progress tracking
      localStorage.setItem('selectedUnits', JSON.stringify(unitsArray));
      localStorage.setItem('selectedPages', JSON.stringify(pageArray));

      startGame(direction, level, 'vocabulary', {
        unitName: `Unit${unitsArray.length > 1 ? 's' : ''} ${unitsArray.join(', ')}`,
        pages: pageArray.map(p => p.toString()),
      }, gameVocab);

      navigate('/game');
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Fehler beim Starten des Spiels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'pages') {
      setCurrentStep('units');
      setSelectedPages(new Set());
    } else if (currentStep === 'units') {
      setCurrentStep('collections');
      setSelectedCollection(null);
      setSelectedUnits(new Set());
    } else {
      navigate('/');
    }
  };

  const renderCollections = () => {
    if (collectionsLoading) {
      return (
        <div className="text-center py-12">
          <div className="text-lg text-[#2E3192] font-semibold">Sammlungen werden geladen...</div>
        </div>
      );
    }

    if (collections.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-[#FFD93D] mb-4" />
          <div className="text-lg text-[#2E3192] font-semibold mb-2">Keine Sammlungen verfügbar</div>
          <div className="text-sm text-[#666]">
            Bitte kontaktieren Sie Ihren Lehrer, um Vokabel-Sammlungen zu erstellen
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {collections.map(collection => (
          <Card
            key={collection.id}
            className="p-6 border-2 border-[#2E3192] cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSelectCollection(collection)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#2E3192]">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-[#666] mt-1">{collection.description}</p>
                )}
                <p className="text-xs text-[#999] mt-2">Lernjahr: {collection.learning_year}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-[#FFD93D]" />
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderUnits = () => {
    if (!selectedCollection) return null;

    const units = getUnits();

    if (units.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-lg text-[#2E3192] font-semibold">
            Keine Units in dieser Sammlung verfügbar
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Select All / Deselect All Buttons */}
        <div className="mb-6 flex gap-2">
          <Button
            onClick={handleSelectAllUnits}
            className="bg-[#FFD93D] hover:bg-[#FFD700] text-[#2E3192] font-bold"
          >
            Alle wählen
          </Button>
          <Button
            onClick={handleDeselectAllUnits}
            variant="outline"
            className="border-2 border-[#FFD93D] text-[#FFD93D] hover:bg-[#FFD93D] hover:text-[#2E3192]"
          >
            Alle abwählen
          </Button>
          <div className="ml-auto text-sm text-[#2E3192] font-semibold pt-2">
            {selectedUnits.size} / {units.length} Units ausgewählt
          </div>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {units.map(unit => (
            <Card
              key={unit}
              className={`p-4 border-2 cursor-pointer transition-all ${
                selectedUnits.has(unit)
                  ? 'border-[#FFD93D] bg-[#FFFACD] shadow-lg'
                  : 'border-[#FFD93D] hover:shadow-lg'
              }`}
              onClick={() => handleToggleUnit(unit)}
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={selectedUnits.has(unit)}
                  onChange={() => handleToggleUnit(unit)}
                  className="mt-1"
                />
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-[#2E3192] mb-2">Unit {unit}</div>
                  <div className="text-xs text-[#666]">
                    {getPagesByUnit(unit).length} Seiten
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Confirm Button */}
        <Button
          onClick={handleUnitsConfirm}
          disabled={selectedUnits.size === 0}
          className="w-full bg-gradient-to-r from-[#2E3192] to-[#1a1a5c] hover:from-[#1a1a5c] hover:to-[#0d0d2d] text-white font-bold py-3 rounded-lg disabled:opacity-50"
        >
          WEITER ZU SEITEN ({selectedUnits.size} Unit{selectedUnits.size !== 1 ? 's' : ''} ausgewählt)
        </Button>
      </div>
    );
  };

  const renderPages = () => {
    if (selectedUnits.size === 0) return null;

    // Get all unique pages from selected units
    const allPages = new Set<number>();
    Array.from(selectedUnits).forEach(unit => {
      const pages = getPagesByUnit(unit);
      pages.forEach(p => allPages.add(p));
    });
    const pages = Array.from(allPages).sort((a, b) => a - b);

    if (pages.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-lg text-[#2E3192] font-semibold">
            Keine Seiten in diesen Units verfügbar
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Game Settings: Direction and Level */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Translation Direction */}
          <div>
            <label className="block text-sm font-bold text-[#2E3192] mb-2">Übersetzungsrichtung:</label>
            <div className="space-y-2">
              {(['en-de', 'de-en', 'random'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => setDirection(dir)}
                  className={`w-full p-2 rounded-lg font-bold border-2 transition-all ${
                    direction === dir
                      ? 'bg-[#FFD93D] text-[#2E3192] border-[#2E3192]'
                      : 'bg-[#F0E5D8] text-[#2E3192] border-[#E0D5C8]'
                  }`}
                >
                  {dir === 'en-de' ? 'EN → DE' : dir === 'de-en' ? 'DE → EN' : '🎲 Gemischt'}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-bold text-[#2E3192] mb-2">Level:</label>
            <div className="space-y-2">
              {([1, 2, 3, 'challenge'] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => setLevel(lv as any)}
                  className={`w-full p-2 rounded-lg font-bold border-2 transition-all ${
                    level === lv
                      ? 'bg-[#FF6B9D] text-white border-[#2E3192]'
                      : 'bg-[#F0E5D8] text-[#2E3192] border-[#E0D5C8]'
                  }`}
                >
                  {lv === 'challenge' ? '🏆 Challenge' : `Level ${lv}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info: Selected Units */}
        <div className="mb-4 p-3 bg-[#FFE5B4] border-2 border-[#FFD93D] rounded-lg">
          <p className="text-sm font-bold text-[#2E3192]">
            Ausgewählte Unit{selectedUnits.size > 1 ? 's' : ''}: {Array.from(selectedUnits).sort((a, b) => a - b).join(', ')}
          </p>
        </div>

        {/* Select All / Deselect All Buttons */}
        <div className="mb-6 flex gap-2">
          <Button
            onClick={handleSelectAllPages}
            className="bg-[#6BCB77] hover:bg-[#5ab366] text-white font-bold"
          >
            Alle wählen
          </Button>
          <Button
            onClick={handleDeselectAllPages}
            variant="outline"
            className="border-2 border-[#6BCB77] text-[#6BCB77] hover:bg-[#6BCB77] hover:text-white"
          >
            Alle abwählen
          </Button>
          <div className="ml-auto text-sm text-[#2E3192] font-semibold pt-2">
            {selectedPages.size} / {pages.length} Seiten ausgewählt
          </div>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {pages.map(page => (
            <Card
              key={page}
              className={`p-4 border-2 cursor-pointer transition-all ${
                selectedPages.has(page)
                  ? 'border-[#6BCB77] bg-[#E8F5E9] shadow-lg'
                  : 'border-[#6BCB77] hover:shadow-lg'
              }`}
              onClick={() => handleTogglePage(page)}
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={selectedPages.has(page)}
                  onChange={() => handleTogglePage(page)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="text-lg font-bold text-[#2E3192]">Seite {page}</div>
                  <div className="text-xs text-[#666]">
                    Vokabeln verfügbar
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Start Game Button */}
        <Button
          onClick={handleStartGame}
          disabled={selectedPages.size === 0 || isLoading}
          className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] hover:from-[#FF5252] hover:to-[#FF3838] text-white font-bold py-3 rounded-lg disabled:opacity-50"
        >
          {isLoading ? 'SPIEL WIRD GESTARTET...' : `SPIEL STARTEN (${selectedPages.size} Seite${selectedPages.size !== 1 ? 'n' : ''})`}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFE5A6] to-[#FFF9E6] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2E3192]">
            {currentStep === 'collections' && '📚 Sammlung auswählen'}
            {currentStep === 'units' && '📖 Unit auswählen'}
            {currentStep === 'pages' && '📄 Seiten auswählen'}
          </h1>
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-[#2E3192] hover:bg-[#FFD93D]"
          >
            <Home className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <Card className="p-6 md:p-8 border-2 border-[#2E3192] mb-6">
          {currentStep === 'collections' && renderCollections()}
          {currentStep === 'units' && renderUnits()}
          {currentStep === 'pages' && renderPages()}
        </Card>

        {/* Navigation Buttons */}
        {currentStep !== 'collections' && (
          <Button
            onClick={handleBack}
            variant="outline"
            className="w-full border-2 border-[#2E3192] text-[#2E3192] hover:bg-[#2E3192] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ZURÜCK
          </Button>
        )}
      </div>
    </div>
  );
}
