import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { exportVocabularyToPDF, exportVocabularyToCSV, VocabularyItem, CollectionInfo } from '@/lib/pdfExport';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vocabulary: VocabularyItem[];
  collections: CollectionInfo[];
}

export default function ExportDialog({
  open,
  onOpenChange,
  vocabulary,
  collections,
}: ExportDialogProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const year = selectedYear === 'all' ? undefined : selectedYear;
      await exportVocabularyToPDF(vocabulary, collections, year);
      toast.success('PDF erfolgreich exportiert');
      onOpenChange(false);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Fehler beim PDF-Export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const year = selectedYear === 'all' ? undefined : selectedYear;
      await exportVocabularyToCSV(vocabulary, collections, year);
      toast.success('CSV erfolgreich exportiert');
      onOpenChange(false);
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Fehler beim CSV-Export');
    } finally {
      setIsExporting(false);
    }
  };

  const getVocabCount = () => {
    if (selectedYear === 'all') {
      return vocabulary.length;
    }
    const collectionIds = collections
      .filter(c => c.learning_year === selectedYear)
      .map(c => c.id);
    return vocabulary.filter(v => collectionIds.includes(v.collection_id || '')).length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-[#2E3192]">
        <DialogHeader>
          <DialogTitle className="text-[#2E3192]">Vokabeln exportieren</DialogTitle>
          <DialogDescription>
            Wähle ein Lernjahr und das Exportformat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Learning Year Selection */}
          <div>
            <label className="block text-sm font-medium text-[#2E3192] mb-3">
              Lernjahr wählen
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 border-[#2E3192] rounded-lg cursor-pointer hover:bg-[#FFF8E7]">
                <input
                  type="radio"
                  name="year"
                  value="all"
                  checked={selectedYear === 'all'}
                  onChange={(e) => setSelectedYear('all')}
                  className="w-4 h-4"
                />
                <span className="text-[#2E3192] font-medium">Alle Vokabeln ({vocabulary.length})</span>
              </label>

              {[1, 2, 3, 4, 5, 6].map((year) => {
                const count = collections
                  .filter(c => c.learning_year === year)
                  .reduce((sum, c) => {
                    return sum + vocabulary.filter(v => v.collection_id === c.id).length;
                  }, 0);

                return (
                  <label
                    key={year}
                    className="flex items-center gap-3 p-3 border-2 border-[#2E3192] rounded-lg cursor-pointer hover:bg-[#FFF8E7]"
                  >
                    <input
                      type="radio"
                      name="year"
                      value={year}
                      checked={selectedYear === year}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-4 h-4"
                    />
                    <span className="text-[#2E3192] font-medium">
                      Lernjahr {year} ({count} Vokabeln)
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Export Format Selection */}
          <div>
            <label className="block text-sm font-medium text-[#2E3192] mb-3">
              Exportformat wählen
            </label>
            <p className="text-sm text-gray-600 mb-4">
              {getVocabCount()} Vokabeln werden exportiert
            </p>
            <div className="grid grid-cols-2 gap-4">
              {/* PDF Export */}
              <Button
                onClick={handleExportPDF}
                disabled={isExporting || getVocabCount() === 0}
                className="bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-red-700 rounded-lg py-6 flex flex-col items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-6 h-6" />
                <span>PDF</span>
              </Button>

              {/* CSV Export */}
              <Button
                onClick={handleExportCSV}
                disabled={isExporting || getVocabCount() === 0}
                className="bg-green-600 hover:bg-green-700 text-white font-bold border-2 border-green-700 rounded-lg py-6 flex flex-col items-center justify-center gap-2 transition-all"
              >
                <Download className="w-6 h-6" />
                <span>CSV</span>
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
              variant="outline"
              className="border-2 border-[#2E3192] text-[#2E3192]"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
