import React, { useState } from 'react';
import { AdminVocabulary } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface VocabularyTableProps {
  data: AdminVocabulary[];
  onUpdate: (id: string, data: Partial<AdminVocabulary>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onDataChange?: (data: AdminVocabulary[]) => void;
}

export default function VocabularyTable({
  data,
  onUpdate,
  onDelete,
  onDataChange,
}: VocabularyTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<AdminVocabulary>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [localData, setLocalData] = useState(data);

  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  const isJsonVocab = (id?: string) => id?.startsWith('json_') ?? false;

  const startEdit = (item: AdminVocabulary) => {
    setEditingId(item.id || null);
    setEditingData({
      unit: item.unit,
      page: item.page,
      english: item.english,
      deutsch: item.deutsch,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const saveEdit = async (id: string) => {
    if (!editingData.unit?.trim() || !editingData.page?.trim() || 
        !editingData.english?.trim() || !editingData.deutsch?.trim()) {
      toast.error('Alle Felder sind erforderlich');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onUpdate(id, editingData);
      if (success) {
        // Update local data
        const newData = localData.map((item) =>
          item.id === id ? { ...item, ...editingData } : item
        );
        setLocalData(newData);
        onDataChange?.(newData);
        setEditingId(null);
        setEditingData({});
        toast.success('Vokabel aktualisiert');
      } else {
        toast.error('Fehler beim Aktualisieren');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchtest du diese Vokabel wirklich löschen?')) return;

    setIsLoading(true);
    try {
      const success = await onDelete(id);
      if (success) {
        const newData = localData.filter((item) => item.id !== id);
        setLocalData(newData);
        onDataChange?.(newData);
        toast.success('Vokabel gelöscht');
      } else {
        toast.error('Fehler beim Löschen');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (localData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Keine Vokabeln vorhanden
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-2 border-[#2E3192] rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#2E3192] text-white">
            <th className="px-4 py-3 text-left font-bold">Unit</th>
            <th className="px-4 py-3 text-left font-bold">Page</th>
            <th className="px-4 py-3 text-left font-bold">English</th>
            <th className="px-4 py-3 text-left font-bold">Deutsch</th>
            <th className="px-4 py-3 text-center font-bold">Quelle</th>
            <th className="px-4 py-3 text-center font-bold">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {localData.map((item) => {
            const isJson = isJsonVocab(item.id);
            return (
              <tr 
                key={item.id} 
                className={`border-b border-gray-300 ${
                  isJson ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-[#FFF8E7]'
                }`}
              >
                {editingId === item.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editingData.unit || ''}
                        onChange={(e) =>
                          setEditingData({ ...editingData, unit: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        disabled={isLoading}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editingData.page || ''}
                        onChange={(e) =>
                          setEditingData({ ...editingData, page: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        disabled={isLoading}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editingData.english || ''}
                        onChange={(e) =>
                          setEditingData({ ...editingData, english: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        disabled={isLoading}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editingData.deutsch || ''}
                        onChange={(e) =>
                          setEditingData({ ...editingData, deutsch: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        disabled={isLoading}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">—</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => saveEdit(item.id!)}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-green-100 text-green-600 transition-colors disabled:opacity-50"
                        title="Speichern"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
                        title="Abbrechen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3">{item.page}</td>
                    <td className="px-4 py-3">{item.english}</td>
                    <td className="px-4 py-3">{item.deutsch}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        isJson
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isJson ? 'Lokal' : 'Datenbank'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => {
                          if (isJson) {
                            toast.error('Lokale Vokabeln können nicht bearbeitet werden');
                          } else {
                            startEdit(item);
                          }
                        }}
                        disabled={isLoading || isJson}
                        className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-blue-100 text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isJson ? 'Lokale Vokabeln sind schreibgeschützt' : 'Bearbeiten'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (isJson) {
                            toast.error('Lokale Vokabeln können nicht gelöscht werden');
                          } else {
                            handleDelete(item.id!);
                          }
                        }}
                        disabled={isLoading || isJson}
                        className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isJson ? 'Lokale Vokabeln sind schreibgeschützt' : 'Löschen'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
