import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPlayer } from '@/contexts/AdminContext';
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

interface PlayerManagementTableProps {
  data: AdminPlayer[];
  onDelete: (id: string) => Promise<boolean>;
  onDataChange?: (data: AdminPlayer[]) => void;
}

export default function PlayerManagementTable({ data, onDelete, onDataChange }: PlayerManagementTableProps) {
  const [localData, setLocalData] = useState<AdminPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleDeleteClick = (id: string, name: string) => {
    setPlayerToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;

    setIsLoading(true);
    try {
      const success = await onDelete(playerToDelete.id);
      if (success) {
        const newData = localData.filter((item) => item.id !== playerToDelete.id);
        setLocalData(newData);
        onDataChange?.(newData);
        toast.success(`Spieler "${playerToDelete.name}" gelöscht`);
      } else {
        toast.error('Fehler beim Löschen des Spielers');
      }
    } finally {
      setIsLoading(false);
      setDeleteConfirmOpen(false);
      setPlayerToDelete(null);
    }
  };

  if (localData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Keine Spieler vorhanden
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto border-2 border-[#2E3192] rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#2E3192] text-white">
              <th className="px-4 py-3 text-left font-bold">Spieler</th>
              <th className="px-4 py-3 text-center font-bold">Spiele</th>
              <th className="px-4 py-3 text-center font-bold">Best Score</th>
              <th className="px-4 py-3 text-center font-bold">Total Score</th>
              <th className="px-4 py-3 text-left font-bold">Erstellt</th>
              <th className="px-4 py-3 text-center font-bold">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {localData.map((player) => (
              <tr key={player.id} className="border-b border-gray-300 hover:bg-[#FFF8E7]">
                <td className="px-4 py-3 font-semibold text-[#2E3192]">{player.name || player.username}</td>
                <td className="px-4 py-3 text-center">{player.games_played}</td>
                <td className="px-4 py-3 text-center font-bold text-orange-600">{player.best_score}</td>
                <td className="px-4 py-3 text-center font-bold text-green-600">{player.total_score}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {player.created_at ? new Date(player.created_at).toLocaleDateString('de-DE') : '-'}
                </td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => handleDeleteClick(player.id, player.name || player.username)}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                    title="Spieler löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border-2 border-[#2E3192]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#2E3192]">Spieler löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den Spieler "{playerToDelete?.name}" wirklich löschen? Alle seine Daten werden gelöscht und können nicht wiederhergestellt werden.
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
    </>
  );
}
