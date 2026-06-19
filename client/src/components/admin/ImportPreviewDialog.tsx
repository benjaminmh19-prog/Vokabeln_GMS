import React, { useState } from 'react';
import { AdminVocabulary } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertCircle, Trash2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImportPreviewDialogProps {
  isOpen: boolean;
  data: AdminVocabulary[];
  onConfirm: (data: AdminVocabulary[], learningYear?: number) => void;
  onCancel: () => void;
  isLoading?: boolean;
  collections?: Array<{ id: string; name: string; learning_year: number }>;
}

export default function ImportPreviewDialog({
  isOpen,
  data,
  onConfirm,
  onCancel,
  isLoading = false,
  collections = [],
}: ImportPreviewDialogProps) {
  const [editingData, setEditingData] = useState<AdminVocabulary[]>(data);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<keyof AdminVocabulary | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Update editing data when dialog opens
  React.useEffect(() => {
    setEditingData(data);
    setEditingId(null);
    setEditingField(null);
  }, [isOpen, data]);

  const handleEdit = (index: number, field: keyof AdminVocabulary, value: string) => {
    const newData = [...editingData];
    newData[index] = { ...newData[index], [field]: value };
    setEditingData(newData);
  };

  const handleDelete = (index: number) => {
    const newData = editingData.filter((_, i) => i !== index);
    setEditingData(newData);
    toast.success('Eintrag gelöscht');
  };

  const handleConfirm = () => {
    if (editingData.length === 0) {
      toast.error('Mindestens ein Eintrag erforderlich');
      return;
    }

    // Validate all entries
    const errors: string[] = [];
    editingData.forEach((item, index) => {
      if (!item.unit?.trim()) errors.push(`Zeile ${index + 1}: Unit erforderlich`);
      if (!item.page?.trim()) errors.push(`Zeile ${index + 1}: Page erforderlich`);
      if (!item.english?.trim()) errors.push(`Zeile ${index + 1}: English erforderlich`);
      if (!item.deutsch?.trim()) errors.push(`Zeile ${index + 1}: Deutsch erforderlich`);
    });

    if (errors.length > 0) {
      toast.error(`Validierungsfehler:\n${errors.slice(0, 5).join('\n')}`);
      return;
    }

    onConfirm(editingData, selectedYear || undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2E3192]">
            IMPORT-VORSCHAU
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Learning Year Selection */}
          {collections.length > 0 && (
            <Card className="border-2 border-[#2E3192] p-4 bg-[#FFF8E7]">
              <label className="block text-sm font-medium text-[#2E3192] mb-3">
                Lernjahr für Import wählen
              </label>
              <select
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border-2 border-[#2E3192] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
              >
                <option value="">-- Kein Lernjahr (Standard) --</option>
                {[1, 2, 3, 4, 5, 6].map((year) => (
                  <option key={year} value={year}>
                    Lernjahr {year}
                  </option>
                ))}
              </select>
            </Card>
          )}

          {/* Summary */}
          <Card className="border-2 border-[#2E3192] p-4 bg-[#FFF8E7]">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-[#2E3192]" />
              <span className="font-bold text-[#2E3192]">
                {editingData.length} Einträge zum Importieren
              </span>
            </div>
            <p className="text-sm text-gray-700">
              Überprüfe die Daten unten. Du kannst Einträge bearbeiten oder löschen, bevor du sie importierst.
            </p>
          </Card>

          {/* Table */}
          <div className="overflow-x-auto border-2 border-[#2E3192] rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#2E3192] text-white">
                  <th className="px-4 py-3 text-left font-bold">Unit</th>
                  <th className="px-4 py-3 text-left font-bold">Page</th>
                  <th className="px-4 py-3 text-left font-bold">English</th>
                  <th className="px-4 py-3 text-left font-bold">Deutsch</th>
                  <th className="px-4 py-3 text-center font-bold">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {editingData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-300 hover:bg-[#FFF8E7]">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleEdit(index, 'unit', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.page}
                        onChange={(e) => handleEdit(index, 'page', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.english}
                        onChange={(e) => handleEdit(index, 'english', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.deutsch}
                        onChange={(e) => handleEdit(index, 'deutsch', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(index)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-100 text-red-600 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editingData.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              Keine Einträge vorhanden
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 justify-end mt-6">
          <Button
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold border-2 border-[#2E3192] rounded-lg px-6 py-2"
          >
            <X className="w-4 h-4 mr-2" />
            ABBRECHEN
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || editingData.length === 0}
            className="bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg px-6 py-2"
          >
            <Check className="w-4 h-4 mr-2" />
            {isLoading ? 'WIRD IMPORTIERT...' : 'IMPORTIEREN'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
