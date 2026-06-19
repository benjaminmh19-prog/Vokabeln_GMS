import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, BookOpen } from 'lucide-react';
import { AdminCollection, useAdmin } from '@/contexts/AdminContext';

export default function CollectionManagementPanel() {
  const { createCollection, getAllCollections, deleteCollection, updateCollection } = useAdmin();
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    year: '',
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCollections();
      setCollections(data);
    } catch (error) {
      toast.error('Fehler beim Laden der Collections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.year.trim()) {
      toast.error('Name und Lernjahr sind erforderlich');
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        const success = await updateCollection(editingId, {
          name: formData.name,
          description: formData.description,
          year: formData.year,
        });

        if (success) {
          toast.success('Collection aktualisiert');
          setEditingId(null);
          setFormData({ name: '', description: '', year: '' });
          setShowForm(false);
          loadCollections();
        } else {
          toast.error('Fehler beim Aktualisieren');
        }
      } else {
        const result = await createCollection({
          name: formData.name,
          description: formData.description,
          year: formData.year,
        });

        if (result.success) {
          toast.success('Collection erstellt');
          setFormData({ name: '', description: '', year: '' });
          setShowForm(false);
          loadCollections();
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (collection: AdminCollection) => {
    setEditingId(collection.id || null);
    setFormData({
      name: collection.name,
      description: collection.description || '',
      year: collection.year,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchten Sie diese Collection wirklich löschen?')) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await deleteCollection(id);
      if (success) {
        toast.success('Collection gelöscht');
        loadCollections();
      } else {
        toast.error('Fehler beim Löschen');
      }
    } catch (error) {
      toast.error('Fehler beim Löschen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', year: '' });
  };

  return (
    <Card className="p-6 border-2 border-[#2E3192]">
      <h2 className="text-2xl font-bold text-[#2E3192] mb-6 flex items-center gap-2">
        <BookOpen className="w-6 h-6" />
        Vokabel-Collections
      </h2>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-[#FFF8E7] border-2 border-[#2E3192] rounded-lg p-6 mb-6">
          <h3 className="font-bold text-[#2E3192] mb-4">
            {editingId ? 'Collection bearbeiten' : 'Neue Collection erstellen'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label className="text-sm font-bold text-[#2E3192]">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Englisch Vokabeln"
                className="border-2 border-[#2E3192] rounded-lg mt-1"
              />
            </div>

            {/* Year */}
            <div>
              <Label className="text-sm font-bold text-[#2E3192]">Lernjahr</Label>
              <Input
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="z.B. Lernjahr 1"
                className="border-2 border-[#2E3192] rounded-lg mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-bold text-[#2E3192]">Beschreibung (optional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="z.B. Vokabeln für das erste Schuljahr"
                className="border-2 border-[#2E3192] rounded-lg mt-1"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-2"
              >
                {isLoading ? 'WIRD GESPEICHERT...' : editingId ? 'AKTUALISIEREN' : 'ERSTELLEN'}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold border-2 border-[#2E3192] rounded-lg py-2"
              >
                ABBRECHEN
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="mb-6 w-full bg-gradient-to-r from-[#6BCB77] to-[#5AB366] hover:from-[#5AB366] hover:to-[#4A9355] text-white font-bold border-2 border-[#2E3192] rounded-lg py-3"
        >
          <Plus className="w-5 h-5 mr-2" />
          NEUE COLLECTION
        </Button>
      )}

      {/* Collections List */}
      <div className="space-y-3">
        {isLoading && collections.length === 0 ? (
          <p className="text-center text-gray-500">Lädt...</p>
        ) : collections.length === 0 ? (
          <p className="text-center text-gray-500">Keine Collections vorhanden</p>
        ) : (
          collections.map((collection) => (
            <div
              key={collection.id}
              className="flex items-center justify-between bg-white border-2 border-[#2E3192] rounded-lg p-4"
            >
              <div className="flex-1">
                <h3 className="font-bold text-[#2E3192]">{collection.name}</h3>
                <p className="text-sm text-gray-600">{collection.year}</p>
                {collection.description && (
                  <p className="text-xs text-gray-500 mt-1">{collection.description}</p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  onClick={() => handleEdit(collection)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold border-2 border-[#2E3192] rounded-lg px-3 py-2 flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  BEARBEITEN
                </Button>
                <Button
                  onClick={() => collection.id && handleDelete(collection.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-[#2E3192] rounded-lg px-3 py-2 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  LÖSCHEN
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
