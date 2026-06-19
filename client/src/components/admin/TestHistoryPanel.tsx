import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, Calendar, BookOpen, Copy, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TestRecord {
  id: string;
  test_title: string;
  unit: string;
  page: string | null;
  test_type: string;
  number_of_words: number;
  include_answer_key: boolean;
  created_at: string;
  created_by: string;
  collection?: string;
  units?: string;
  pages?: string;
}

export default function TestHistoryPanel() {
  const [testHistory, setTestHistory] = useState<TestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [searchTitle, setSearchTitle] = useState<string>('');

  // Load test history
  const loadTestHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Fehler beim Laden des Verlaufs');
        console.error(error);
        return;
      }

      setTestHistory(data || []);
    } catch (error) {
      toast.error('Fehler beim Laden des Verlaufs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load history on mount
  useEffect(() => {
    loadTestHistory();
  }, []);

  // Delete test record
  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Diesen Testeintrag wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('test_history').delete().eq('id', id);

      if (error) {
        toast.error('Fehler beim Löschen');
        return;
      }

      setTestHistory((prev) => prev.filter((record) => record.id !== id));
      toast.success('Eintrag gelöscht');
    } catch (error) {
      toast.error('Fehler beim Löschen');
      console.error(error);
    }
  };

  // Filter history
  const filteredHistory = testHistory.filter((record) => {
    const unitMatch = filterUnit === 'all' || record.unit === filterUnit;
    const titleMatch =
      searchTitle === '' || record.test_title.toLowerCase().includes(searchTitle.toLowerCase());
    return unitMatch && titleMatch;
  });

  // Get unique units
  const uniqueUnits = Array.from(new Set(testHistory.map((r) => r.unit))).sort();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get test type label
  const getTestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'english-to-german': 'EN → DE',
      'german-to-english': 'DE → EN',
      mixed: 'Gemischt',
    };
    return labels[type] || type;
  };

  return (
    <Card className="p-6 border-2 border-[#2E3192]">
      <h2 className="text-2xl font-bold text-[#2E3192] mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Test-Verlauf
      </h2>

      <div className="space-y-4 mb-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search by title */}
          <div>
            <Label className="text-sm font-bold text-[#2E3192]">Nach Titel suchen</Label>
            <Input
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="z.B. Vokabeltest Unit 1"
              className="border-2 border-[#2E3192] rounded-lg mt-1"
            />
          </div>

          {/* Filter by unit */}
          <div>
            <Label className="text-sm font-bold text-[#2E3192]">Nach Unit filtern</Label>
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="w-full border-2 border-[#2E3192] rounded-lg mt-1 px-3 py-2 font-bold text-[#2E3192]"
            >
              <option value="all">Alle Units</option>
              {uniqueUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Refresh button */}
        <Button
          onClick={loadTestHistory}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#2E3192] to-[#1a1a5c] hover:from-[#1a1a5c] hover:to-[#0d0d2d] text-white font-bold border-2 border-[#2E3192] rounded-lg py-2"
        >
          {isLoading ? 'WIRD GELADEN...' : 'VERLAUF AKTUALISIEREN'}
        </Button>
      </div>

      {/* History List */}
      <ScrollArea className="h-96 border-2 border-[#2E3192] rounded-lg p-4">
        {filteredHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-bold">Keine Tests im Verlauf</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((record) => (
              <div
                key={record.id}
                className="bg-gradient-to-r from-[#FFD93D] to-[#FFE5B4] border-2 border-[#2E3192] rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#2E3192] text-sm">{record.test_title}</h3>
                    <p className="text-xs text-gray-700 mt-1">
                      {record.collection && <><strong>Sammlung:</strong> {record.collection}<br /></>}
                      <strong>Unit{record.units && record.units.includes(',') ? 's' : ''}:</strong> {record.units || record.unit}
                      {(record.pages || record.page) && <><br /><strong>Seite{record.pages && record.pages.includes(',') ? 'n' : ''}:</strong> {record.pages || record.page}</> }
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteRecord(record.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="font-bold text-[#2E3192]">Typ:</span>{' '}
                    <span className="bg-white px-2 py-1 rounded font-bold text-[#2E3192]">
                      {getTestTypeLabel(record.test_type)}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[#2E3192]">Wörter:</span>{' '}
                    <span className="bg-white px-2 py-1 rounded font-bold text-[#2E3192]">
                      {record.number_of_words}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-[#2E3192]">Erstellt:</span>{' '}
                    <span className="text-gray-700">{formatDate(record.created_at)}</span>
                  </div>
                </div>

                {record.include_answer_key && (
                  <div className="bg-white px-2 py-1 rounded text-xs font-bold text-green-600 inline-block mb-2">
                    ✓ Mit Lösungsschlüssel
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="mt-4 p-4 bg-blue-50 border-2 border-[#2E3192] rounded-lg">
        <p className="text-xs text-gray-700">
          <strong>Gesamt Tests erstellt:</strong> {testHistory.length}
        </p>
        <p className="text-xs text-gray-700 mt-1">
          <strong>Heute:</strong>{' '}
          {
            testHistory.filter((r) => {
              const today = new Date().toDateString();
              return new Date(r.created_at).toDateString() === today;
            }).length
          }{' '}
          Tests
        </p>
      </div>
    </Card>
  );
}
