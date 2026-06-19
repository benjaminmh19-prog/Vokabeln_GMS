import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AdminCollection } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CollectionManagementTableProps {
  data: AdminCollection[];
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (id: string, data: Partial<AdminCollection>) => Promise<boolean>;
  onCreate: (data: AdminCollection) => Promise<{ success: boolean; id?: string; message: string }>;
  onDataChange?: (data: AdminCollection[]) => void;
}

export default function CollectionManagementTable({
  data,
  onDelete,
  onUpdate,
  onCreate,
  onDataChange,
}: CollectionManagementTableProps) {
  const [localData, setLocalData] = useState<AdminCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<AdminCollection | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<AdminCollection | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState<AdminCollection>({
    name: '',
    year: '1',
    description: '',
  });

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleDeleteClick = (collection: AdminCollection) => {
    setCollectionToDelete(collection);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!collectionToDelete) return;

    setIsLoading(true);
    try {
      const success = await onDelete(collectionToDelete.id || '');
      if (success) {
        const newData = localData.filter((item) => item.id !== collectionToDelete.id);
        setLocalData(newData);
        onDataChange?.(newData);
        toast.success(`Sammlung "${collectionToDelete.name}" gelöscht`);
      } else {
        toast.error('Fehler beim Löschen der Sammlung');
      }
    } finally {
      setIsLoading(false);
      setDeleteConfirmOpen(false);
      setCollectionToDelete(null);
    }
  };

  const handleEditClick = (collection: AdminCollection) => {
    setEditingCollection({ ...collection });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCollection || !editingCollection.id) return;

    setIsLoading(true);
    try {
      const success = await onUpdate(editingCollection.id, editingCollection);
      if (success) {
        const newData = localData.map((item) =>
          item.id === editingCollection.id ? editingCollection : item
        );
        setLocalData(newData);
        onDataChange?.(newData);
        toast.success('Sammlung aktualisiert');
        setEditDialogOpen(false);
      } else {
        toast.error('Fehler beim Aktualisieren der Sammlung');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) {
      toast.error('Name ist erforderlich');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onCreate(newCollection);
      if (result.success) {
        const createdCollection: AdminCollection = {
          ...newCollection,
          id: result.id,
        };
        const newData = [...localData, createdCollection];
        setLocalData(newData);
        onDataChange?.(newData);
        toast.success('Sammlung erstellt');
        setCreateDialogOpen(false);
        setNewCollection({ name: '', year: '1', description: '' });
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            disabled={isLoading}
            className="bg-[#2E3192] hover:bg-[#1a1d5c] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Neue Sammlung
          </Button>
        </div>

        {localData.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            Keine Sammlungen vorhanden
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-[#2E3192] rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#2E3192] text-white">
                  <th className="px-4 py-3 text-left font-bold">Name</th>
                  <th className="px-4 py-3 text-center font-bold">Lernjahr</th>
                  <th className="px-4 py-3 text-left font-bold">Beschreibung</th>
                  <th className="px-4 py-3 text-center font-bold">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {localData.map((collection) => (
                  <tr key={collection.id} className="border-b border-gray-300 hover:bg-[#FFF8E7]">
                    <td className="px-4 py-3 font-semibold text-[#2E3192]">{collection.name}</td>
                    <td className="px-4 py-3 text-center">{collection.year}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{collection.description || '-'}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleEditClick(collection)}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-blue-100 text-blue-600 transition-colors disabled:opacity-50"
                        title="Bearbeiten"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(collection)}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
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
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border-2 border-[#2E3192]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#2E3192]">Sammlung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du die Sammlung "{collectionToDelete?.name}" wirklich löschen? Alle Vokabeln in dieser Sammlung werden ebenfalls gelöscht und können nicht wiederhergestellt werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-2 border-[#2E3192] text-[#2E3192]">
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {isLoading ? 'Wird gelöscht...' : 'Löschen'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="border-2 border-[#2E3192]">
          <DialogHeader>
            <DialogTitle className="text-[#2E3192]">Sammlung bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite die Details dieser Sammlung
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2E3192] mb-1">
                Name
              </label>
              <input
                type="text"
                value={editingCollection?.name || ''}
                onChange={(e) =>
                  setEditingCollection((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                className="w-full px-3 py-2 border-2 border-[#2E3192] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2E3192] mb-1">
                Lernjahr
              </label>
              <select
                value={editingCollection?.year || '1'}
                onChange={(e) =>
                  setEditingCollection((prev) =>
                    prev ? { ...prev, year: e.target.value } : null
                  )
                }
                className="w-full px-3 py-2 border-2 border-[#2E3192] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
              >
                {[1, 2, 3, 4, 5, 6].map((year) => (
                  <option key={year} value={year}>
                    Lernjahr {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2E3192] mb-1">
                Beschreibung (optional)
              </label>
              <textarea
                value={editingCollection?.description || ''}
                onChange={(e) =>
                  setEditingCollection((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
                rows={3}
                className="w-full px-3 py-2 border-2 border-[#2E3192] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setEditDialogOpen(false)}
                disabled={isLoading}
                variant="outline"
                className="border-2 border-[#2E3192] text-[#2E3192]"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="bg-[#2E3192] hover:bg-[#1a1d5c] text-white"
              >
                {isLoading ? 'Wird gespeichert...' : 'Speichern'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="border-2 border-[#2E3192]">
          <DialogHeader>
            <DialogTitle className="text-[#2E3192]">Neue Sammlung erstellen</DialogTitle>
            <DialogDescription>
              Erstelle eine neue Vokabel-Sammlung
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2E3192] mb-1">
                Name
              </label>
              <input
                type="text"
                value={newCollection.name}
                onChange={(e) =>
                  setNewCollection((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="z.B. Unit 1-5"
                className="w-full px-3 py-2 border-2 border-[#2E3192] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2E3192] mb-1">
                Lernjahr
              </label>
              <select
                value={newCollection.year}
                onChange={(e) =>
                  setNewCollection((prev) => ({ ...prev, year: e.target.value }))
                }
                className="w-full px-3 py-2 border-2 border-[#2E3192] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
              >
                {[1, 2, 3, 4, 5, 6].map((year) => (
                  <option key={year} value={year}>
                    Lernjahr {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2E3192] mb-1">
                Beschreibung (optional)
              </label>
              <textarea
                value={newCollection.description || ''}
                onChange={(e) =>
                  setNewCollection((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Beschreibe diese Sammlung..."
                rows={3}
                className="w-full px-3 py-2 border-2 border-[#2E3192] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setCreateDialogOpen(false)}
                disabled={isLoading}
                variant="outline"
                className="border-2 border-[#2E3192] text-[#2E3192]"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleCreateCollection}
                disabled={isLoading}
                className="bg-[#2E3192] hover:bg-[#1a1d5c] text-white"
              >
                {isLoading ? 'Wird erstellt...' : 'Erstellen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
