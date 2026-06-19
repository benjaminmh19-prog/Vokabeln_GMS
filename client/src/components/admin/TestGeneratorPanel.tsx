import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileDown, Filter, Shuffle, X, AlertCircle } from 'lucide-react';
import { Vocabulary } from '@/types/game';
import { AdminVocabulary } from '@/contexts/AdminContext';
import { generateVocabularyTestPDF, getDefaultInstructions } from '@/lib/pdfTestGenerator';
import { supabase } from '@/lib/supabase';
import TestEditorDialog from './TestEditorDialog';

interface TestGeneratorPanelProps {
  vocabularyList: Vocabulary[] | AdminVocabulary[];
  collections: Array<{ id?: string; name: string; year?: string; learning_year?: number }>;
}

export default function TestGeneratorPanel({ vocabularyList, collections = [] }: TestGeneratorPanelProps) {
  const [testTitle, setTestTitle] = useState('Vokabeltest');
  const [testType, setTestType] = useState<'english-to-german' | 'german-to-english' | 'mixed'>(
    'english-to-german'
  );
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>(() => {
    if (collections && collections.length > 0) {
      return collections[0].id || collections[0].name;
    }
    return '';
  });
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [numberOfWords, setNumberOfWords] = useState<string>('10');
  const [numberOfTests, setNumberOfTests] = useState<string>('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTestEditor, setShowTestEditor] = useState(false);
  const [draftVocabulary, setDraftVocabulary] = useState<Vocabulary[]>([]);

  // Initialize with first collection if available
  useEffect(() => {
    if (collections && collections.length > 0) {
      const firstCollectionId = collections[0].id || collections[0].name;
      if (!selectedCollection || selectedCollection === '') {
        setSelectedCollection(firstCollectionId);
      }
    }
  }, [collections]);

  // Convert AdminVocabulary to Vocabulary and filter by collection
  const convertedVocabulary = useMemo(() => {
    let filtered = vocabularyList.map((v: any) => ({
      id: v.id || '',
      unit: v.unit,
      page: v.page,
      english: v.english,
      deutsch: v.deutsch,
      level: v.level || 1,
      direction: v.direction || 'en-de',
      collection_id: v.collection_id,
    }));
    
    // Filter by collection (required)
    if (selectedCollection) {
      filtered = filtered.filter(v => v.collection_id === selectedCollection);
    }
    
    return filtered;
  }, [vocabularyList, selectedCollection]);

  // Reset units and pages when collection changes
  useEffect(() => {
    setSelectedUnits(new Set());
    setSelectedPages([]);
  }, [selectedCollection]);

  // Reset pages when units change
  useEffect(() => {
    setSelectedPages([]);
  }, [selectedUnits]);

  // Save test to history
  const saveTestToHistory = async (testCount: number) => {
    try {
      const pageString = selectedPages.length === 0 ? 'Alle Seiten' : `Seiten: ${selectedPages.join(', ')}`;
      const unitsString = selectedUnits.size === 0 ? 'Alle Units' : `Units: ${Array.from(selectedUnits).sort().join(', ')}`;
      const { error } = await supabase.from('test_history').insert({
        test_title: testTitle,
        unit: unitsString,
        page: pageString,
        test_type: testType,
        number_of_words: draftVocabulary.length,
        include_answer_key: includeAnswerKey,
        created_by: 'admin',
      });

      if (error) {
        console.error('Error saving test history:', error);
      }
    } catch (error) {
      console.error('Error saving test history:', error);
    }
  };

  // Get unique units from selected collection
  const units = useMemo(() => {
    const uniqueUnits = Array.from(
      new Set(convertedVocabulary.filter((v) => v.unit).map((v) => v.unit))
    ).sort();
    return uniqueUnits as string[];
  }, [convertedVocabulary]);

  // Get unique pages from selected units
  const pages = useMemo(() => {
    const filteredByUnits =
      selectedUnits.size === 0
        ? convertedVocabulary
        : convertedVocabulary.filter((v) => selectedUnits.has(v.unit || ''));
    const uniquePages = Array.from(
      new Set(filteredByUnits.filter((v) => v.page).map((v) => v.page))
    ).sort();
    return uniquePages as string[];
  }, [convertedVocabulary, selectedUnits]);

  // Toggle unit selection
  const toggleUnitSelection = (unit: string) => {
    setSelectedUnits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unit)) {
        newSet.delete(unit);
      } else {
        newSet.add(unit);
      }
      return newSet;
    });
  };

  // Toggle page selection
  const togglePageSelection = (page: string) => {
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    );
  };

  // Filter vocabulary based on selected collection, units and pages
  const filteredVocabulary = useMemo(() => {
    return convertedVocabulary.filter((vocab) => {
      const unitMatch =
        selectedUnits.size === 0 || selectedUnits.has(vocab.unit || '');
      const pageMatch =
        selectedPages.length === 0 || selectedPages.includes(vocab.page || '');
      return unitMatch && pageMatch;
    });
  }, [convertedVocabulary, selectedUnits, selectedPages]);

  // Shuffle array (Fisher-Yates algorithm)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate test PDF with random selection
  const handleGenerateTest = async () => {
    const numWords = parseInt(numberOfWords, 10);

    if (isNaN(numWords) || numWords <= 0) {
      toast.error('Bitte gib eine gültige Anzahl Wörter ein');
      return;
    }

    if (filteredVocabulary.length === 0) {
      toast.error('Keine Vokabeln in dieser Auswahl verfügbar');
      return;
    }

    if (numWords > filteredVocabulary.length) {
      toast.error(
        `Nur ${filteredVocabulary.length} Vokabeln verfügbar, aber ${numWords} angefordert`
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Shuffle and select random vocabulary
      const shuffled = shuffleArray(filteredVocabulary);
      const selected = shuffled.slice(0, numWords);

      // Open editor for test
      setDraftVocabulary(selected);
      setShowTestEditor(true);
    } catch (error) {
      toast.error('Fehler beim Erstellen der Tests');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle test editor download
  const handleTestEditorDownload = async () => {
    try {
      // Save to history
      await saveTestToHistory(1);

      toast.success(
        `Test mit ${draftVocabulary.length} Vokabeln erstellt!`
      );
    } catch (error) {
      console.error('Error saving test history:', error);
    }
  };

  // Get selected collection name for display
  const selectedCollectionName = collections.find(
    c => (c.id || c.name) === selectedCollection
  )?.name || 'Keine Sammlung ausgewählt';

  // Get selected units info for display
  const selectedUnitsInfo = selectedUnits.size === 0
    ? 'Alle Units'
    : `${Array.from(selectedUnits).sort().join(', ')}`;

  return (
    <>
      <div className="space-y-6">
        {/* Test Settings */}
        <div className="bg-[#FFF4E6] border-4 border-[#FF9F1C] rounded-lg p-6">
          <h3 className="text-xl font-bold text-[#2E3192] mb-4">📋 Test-Einstellungen</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-bold text-[#2E3192]">Test-Titel</Label>
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="z.B. Vokabeltest Unit 1"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="font-bold text-[#2E3192]">Test-Typ</Label>
              <Select value={testType} onValueChange={(value: any) => setTestType(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english-to-german">EN → DE</SelectItem>
                  <SelectItem value="german-to-english">DE → EN</SelectItem>
                  <SelectItem value="mixed">🎲 Gemischt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-bold text-[#2E3192]">Anzahl Wörter</Label>
              <Input
                type="number"
                value={numberOfWords}
                onChange={(e) => setNumberOfWords(e.target.value)}
                min="1"
                className="mt-2"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="font-bold text-[#2E3192]">Lösungsschlüssel</span>
              </label>
            </div>
          </div>
        </div>

        {/* Step 1: Collection Selection */}
        <div className="bg-[#E3F2FD] border-4 border-[#2E3192] rounded-lg p-6">
          <h3 className="text-xl font-bold text-[#2E3192] mb-4">📚 Schritt 1: Sammlung auswählen</h3>
          
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {collections.map((col) => (
                <SelectItem key={col.id || col.name} value={col.id || col.name}>
                  {col.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-sm text-gray-700 mt-2">
            Ausgewählte Sammlung: <strong>{selectedCollectionName}</strong>
          </p>
        </div>

        {/* Step 2: Unit Selection */}
        <div className="bg-[#F1F8E9] border-4 border-[#4CAF50] rounded-lg p-6">
          <h3 className="text-xl font-bold text-[#2E3192] mb-4">🎯 Schritt 2: Units auswählen ({selectedUnits.size} / {units.length})</h3>
          
          {units.length === 0 ? (
            <p className="text-gray-500">Keine Units in dieser Sammlung verfügbar</p>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setSelectedUnits(new Set(units))}
                  className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold px-4 py-2"
                >
                  ✓ Alle wählen
                </Button>
                <Button
                  onClick={() => setSelectedUnits(new Set())}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold px-4 py-2"
                >
                  ✗ Alle abwählen
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {units.map((unit) => (
                  <label
                    key={unit}
                    className="flex items-center gap-2 p-3 bg-white border-2 border-[#4CAF50] rounded-lg cursor-pointer hover:bg-[#F1F8E9] transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUnits.has(unit)}
                      onChange={() => toggleUnitSelection(unit)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4"
                    />
                    <span className="font-bold text-[#2E3192]">{unit}</span>
                  </label>
                ))}
              </div>

              <p className="text-sm text-gray-700 mt-3">
                Ausgewählte Units: <strong>{selectedUnitsInfo}</strong>
              </p>
            </>
          )}
        </div>

        {/* Step 3: Page Selection */}
        {selectedUnits.size > 0 && (
          <div className="bg-[#F3E5F5] border-4 border-[#9C27B0] rounded-lg p-6">
            <h3 className="text-xl font-bold text-[#2E3192] mb-4">📄 Schritt 3: Seiten auswählen ({selectedPages.length} / {pages.length})</h3>
            
            {pages.length === 0 ? (
              <p className="text-gray-500">Keine Seiten in diesen Units verfügbar</p>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={() => setSelectedPages(pages)}
                    className="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold px-4 py-2"
                  >
                    ✓ Alle wählen
                  </Button>
                  <Button
                    onClick={() => setSelectedPages([])}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold px-4 py-2"
                  >
                    ✗ Alle abwählen
                  </Button>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                  {pages.map((page) => (
                    <label
                      key={page}
                      className="flex items-center justify-center p-2 bg-white border-2 border-[#9C27B0] rounded-lg cursor-pointer hover:bg-[#F3E5F5] transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page)}
                        onChange={() => togglePageSelection(page)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4"
                      />
                      <span className="font-bold text-[#2E3192] ml-1">{page}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Vocabulary Info */}
        <div className="bg-[#FFF3E0] border-4 border-[#FF9F1C] rounded-lg p-6">
          <h3 className="text-xl font-bold text-[#2E3192] mb-2">📊 Verfügbare Vokabeln</h3>
          <p className="text-gray-700">
            <strong>Sammlung:</strong> {selectedCollectionName}<br/>
            <strong>Units:</strong> {selectedUnitsInfo}<br/>
            <strong>Seiten:</strong> {selectedPages.length === 0 ? 'Alle Seiten' : `${selectedPages.join(', ')}`}<br/>
            <strong>Vokabeln:</strong> {filteredVocabulary.length}
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateTest}
          disabled={isGenerating || filteredVocabulary.length === 0}
          className="w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-3 transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FileDown className="w-5 h-5" />
          {isGenerating ? 'WIRD VORBEREITET...' : 'TEST ERSTELLEN & BEARBEITEN'}
        </Button>
      </div>

      {/* Test Editor Dialog */}
      <TestEditorDialog
        isOpen={showTestEditor}
        testTitle={testTitle}
        testType={testType}
        includeAnswerKey={includeAnswerKey}
        vocabularyList={draftVocabulary}
        onClose={() => setShowTestEditor(false)}
        onDownload={handleTestEditorDownload}
      />
    </>
  );
}
