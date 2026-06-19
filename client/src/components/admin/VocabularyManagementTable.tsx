import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit2, Trash } from 'lucide-react';

export interface Vocabulary {
  id: string;
  unit: string;
  page: string;
  english: string;
  deutsch: string;
  collection_id?: string;
}

interface VocabularyManagementTableProps {
  vocabularies: Vocabulary[];
  onEdit: (vocab: Vocabulary) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBatchDelete?: (ids: string[]) => Promise<void>;
}

export function VocabularyManagementTable({ 
  vocabularies, 
  onEdit, 
  onDelete,
  onBatchDelete
}: VocabularyManagementTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Vocabulary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  // Filter vocabularies based on search
  const filteredVocabularies = useMemo(() => {
    if (!searchTerm) return vocabularies;
    const term = searchTerm.toLowerCase();
    return vocabularies.filter(v => 
      v.unit.toLowerCase().includes(term) ||
      v.page.toLowerCase().includes(term) ||
      v.english.toLowerCase().includes(term) ||
      v.deutsch.toLowerCase().includes(term)
    );
  }, [vocabularies, searchTerm]);

  const handleEditClick = (vocab: Vocabulary) => {
    setEditingId(vocab.id);
    setEditFormData({ ...vocab });
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;
    setIsLoading(true);
    try {
      await onEdit(editFormData);
      setEditingId(null);
      setEditFormData(null);
    } catch (error) {
      console.error('Error saving vocabulary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredVocabularies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredVocabularies.map(v => v.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0 || !onBatchDelete) return;
    setIsLoading(true);
    try {
      await onBatchDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowBatchDeleteConfirm(false);
    } catch (error) {
      console.error('Error batch deleting vocabularies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const editingVocab = editFormData ? vocabularies.find(v => v.id === editingId) : null;
  const deletingVocab = deleteId ? vocabularies.find(v => v.id === deleteId) : null;
  const allSelected = selectedIds.size === filteredVocabularies.length && filteredVocabularies.length > 0;

  return (
    <>
      {/* Search Bar and Batch Actions */}
      <div className="mb-6 space-y-4">
        <Input
          placeholder="Nach Unit, Seite, English oder Deutsch suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredVocabularies.length} von {vocabularies.length} Vokabeln
            {selectedIds.size > 0 && ` • ${selectedIds.size} ausgewählt`}
          </p>
          {selectedIds.size > 0 && onBatchDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBatchDeleteConfirm(true)}
              disabled={isLoading}
              className="gap-2"
            >
              <Trash className="w-4 h-4" />
              {selectedIds.size} löschen
            </Button>
          )}
        </div>
      </div>

      {/* Vocabulary Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="px-4 py-3 text-left w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  className="border-white"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Unit</th>
              <th className="px-4 py-3 text-left font-semibold">Seite</th>
              <th className="px-4 py-3 text-left font-semibold">English</th>
              <th className="px-4 py-3 text-left font-semibold">Deutsch</th>
              <th className="px-4 py-3 text-center font-semibold">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredVocabularies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  {searchTerm ? 'Keine Vokabeln gefunden' : 'Keine Vokabeln vorhanden'}
                </td>
              </tr>
            ) : (
              filteredVocabularies.map((vocab, index) => (
                <tr 
                  key={vocab.id} 
                  className={`border-t border-gray-300 ${
                    index % 2 === 0 ? 'bg-yellow-50' : 'bg-white'
                  } ${selectedIds.has(vocab.id) ? 'bg-blue-100' : ''} hover:bg-yellow-100 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(vocab.id)}
                      onCheckedChange={() => handleToggleSelect(vocab.id)}
                    />
                  </td>
                  <td className="px-4 py-3">{vocab.unit}</td>
                  <td className="px-4 py-3">{vocab.page}</td>
                  <td className="px-4 py-3">{vocab.english}</td>
                  <td className="px-4 py-3">{vocab.deutsch}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(vocab)}
                        className="text-blue-600 hover:bg-blue-50"
                        disabled={isLoading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(vocab.id)}
                        className="text-red-600 hover:bg-red-50"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => {
        if (!open) {
          setEditingId(null);
          setEditFormData(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vokabel bearbeiten</DialogTitle>
            <DialogDescription>Ändern Sie die Vokabel-Informationen</DialogDescription>
          </DialogHeader>
          {editFormData && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <Input
                  value={editFormData.unit}
                  onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                  placeholder="z.B. Unit 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Seite</label>
                <Input
                  value={editFormData.page}
                  onChange={(e) => setEditFormData({ ...editFormData, page: e.target.value })}
                  placeholder="z.B. 12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">English</label>
                <Input
                  value={editFormData.english}
                  onChange={(e) => setEditFormData({ ...editFormData, english: e.target.value })}
                  placeholder="English word"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deutsch</label>
                <Input
                  value={editFormData.deutsch}
                  onChange={(e) => setEditFormData({ ...editFormData, deutsch: e.target.value })}
                  placeholder="Deutsches Wort"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setEditFormData(null);
                  }}
                  disabled={isLoading}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? 'Speichern...' : 'Speichern'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => {
        if (!open) setDeleteId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vokabel löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diese Vokabel löschen möchten?
              {deletingVocab && (
                <>
                  <br />
                  <strong>{deletingVocab.english}</strong> - <strong>{deletingVocab.deutsch}</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Löschen...' : 'Löschen'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Delete Confirmation Dialog */}
      <AlertDialog open={showBatchDeleteConfirm} onOpenChange={setShowBatchDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mehrere Vokabeln löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie {selectedIds.size} Vokabel(n) löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Löschen...' : 'Alle löschen'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
