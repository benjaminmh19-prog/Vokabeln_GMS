import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Trash2, ChevronUp, ChevronDown, FileDown } from 'lucide-react';
import { Vocabulary } from '@/types/game';
import { generateVocabularyTestPDF, getDefaultInstructions } from '@/lib/pdfTestGenerator';
import { toast } from 'sonner';

interface TestEditorDialogProps {
  isOpen: boolean;
  testTitle: string;
  testType: 'english-to-german' | 'german-to-english' | 'mixed';
  includeAnswerKey: boolean;
  vocabularyList: Vocabulary[];
  onClose: () => void;
  onDownload?: () => void;
}

export default function TestEditorDialog({
  isOpen,
  testTitle,
  testType,
  includeAnswerKey,
  vocabularyList,
  onClose,
  onDownload,
}: TestEditorDialogProps) {
  const [editableVocabulary, setEditableVocabulary] = useState<Vocabulary[]>(vocabularyList);
  const [isDownloading, setIsDownloading] = useState(false);
  const [customTitle, setCustomTitle] = useState(testTitle);
  const [headerText, setHeaderText] = useState('');

  // Update editable vocabulary when vocabularyList changes
  useEffect(() => {
    if (isOpen) {
      setEditableVocabulary(vocabularyList);
      setCustomTitle(testTitle);
      setHeaderText('');
    }
  }, [isOpen, vocabularyList, testTitle]);

  // Delete vocabulary item
  const handleDeleteVocab = (index: number) => {
    setEditableVocabulary((prev) => prev.filter((_, i) => i !== index));
    toast.success('Vokabel gelöscht');
  };

  // Move vocabulary up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setEditableVocabulary((prev) => {
      const newList = [...prev];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      return newList;
    });
  };

  // Move vocabulary down
  const handleMoveDown = (index: number) => {
    if (index === editableVocabulary.length - 1) return;
    setEditableVocabulary((prev) => {
      const newList = [...prev];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      return newList;
    });
  };

  // Edit vocabulary field
  const handleEditField = (index: number, field: keyof Vocabulary, value: string) => {
    setEditableVocabulary((prev) => {
      const newList = [...prev];
      newList[index] = { ...newList[index], [field]: value };
      return newList;
    });
  };

  // Download PDF with edited vocabulary
  const handleDownloadPDF = async () => {
    if (editableVocabulary.length === 0) {
      toast.error('Keine Vokabeln zum Herunterladen');
      return;
    }

    setIsDownloading(true);
    try {
      // Generate PDF with edited vocabulary (preserve order, don't shuffle)
      generateVocabularyTestPDF({
        title: customTitle || testTitle,
        instructions: getDefaultInstructions(testType),
        testType,
        includeAnswerKey,
        vocabularyList: editableVocabulary,
        preserveOrder: true, // Don't shuffle - use edited order
        header: headerText || undefined,
      });

      toast.success('PDF heruntergeladen!');
      onDownload?.();
      onClose();
    } catch (error) {
      toast.error('Fehler beim Herunterladen');
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2E3192]">
            📝 Vokabeltest bearbeiten
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Titel und Kopfzeile Einstellungen */}
          <div className="space-y-3 border-b-2 border-[#2E3192] pb-4">
            <div>
              <label className="block text-sm font-bold text-[#2E3192] mb-2">📄 Test-Titel (für PDF)</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="z.B. Vokabeltest Unit 1 - Seite 10"
                className="w-full px-3 py-2 border-2 border-[#2E3192] rounded-md bg-white text-[#2E3192] font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2E3192] mb-2">📋 Optionale Kopfzeile</label>
              <textarea
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="z.B. Klasse: 7B | Lehrer: Herr Müller | Datum: 11.06.2026"
                rows={2}
                className="w-full px-3 py-2 border-2 border-[#2E3192] rounded-md bg-white text-[#2E3192]"
              />
            </div>
          </div>

          {/* Test Info */}
          <div className="bg-[#FFF4E6] border-2 border-[#FF9F1C] rounded-lg p-4">
            <p className="font-bold text-[#2E3192]">Test: {customTitle || testTitle}</p>
            <p className="text-sm text-gray-700">
              Vokabeln: {editableVocabulary.length} | Richtung: {testType === 'english-to-german' ? 'EN→DE' : testType === 'german-to-english' ? 'DE→EN' : 'Gemischt'}
            </p>
            {headerText && <p className="text-xs text-gray-600 mt-2">Kopfzeile: {headerText}</p>}
          </div>

          {/* Vocabulary List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {editableVocabulary.map((vocab, index) => (
              <div
                key={index}
                className="bg-white border-2 border-[#2E3192] rounded-lg p-3 flex items-center gap-3"
              >
                {/* Index */}
                <div className="font-bold text-[#2E3192] min-w-[30px]">{index + 1}.</div>

                {/* Vocabulary Fields */}
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    value={vocab.english}
                    onChange={(e) => handleEditField(index, 'english', e.target.value)}
                    placeholder="English"
                    className="text-sm"
                  />
                  <Input
                    value={vocab.deutsch}
                    onChange={(e) => handleEditField(index, 'deutsch', e.target.value)}
                    placeholder="Deutsch"
                    className="text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <Button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="bg-[#4CAF50] hover:bg-[#45a049] text-white p-2 h-auto disabled:opacity-50"
                    title="Nach oben"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === editableVocabulary.length - 1}
                    className="bg-[#4CAF50] hover:bg-[#45a049] text-white p-2 h-auto disabled:opacity-50"
                    title="Nach unten"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteVocab(index)}
                    className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white p-2 h-auto"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {editableVocabulary.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Keine Vokabeln zum Bearbeiten
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold px-6 py-2"
          >
            ABBRECHEN
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading || editableVocabulary.length === 0}
            className="bg-[#FF9F1C] hover:bg-[#FF8C00] text-white font-bold px-6 py-2 flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            {isDownloading ? 'WIRD HERUNTERGELADEN...' : 'PDF HERUNTERLADEN'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
