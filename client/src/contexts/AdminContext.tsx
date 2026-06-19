
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { nanoid } from 'nanoid';

export interface AdminCollection {
  id?: string;
  name: string;
  description?: string;
  year: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminVocabulary {
  id: string;
  unit: string;
  page: string;
  english: string;
  deutsch: string;
}

export interface AdminPlayer {
  id: string;
  username: string;
  name?: string | null;
  created_at?: string | Date;
  total_score?: number | null;
  games_played?: number | null;
  best_score?: number | null;
}

export interface AdminContextType {
  isAdminLoggedIn: boolean;
  adminLogin: (password: string) => Promise<boolean>;
  adminLogout: () => void;
  getAllVocabulary: (collectionId?: string) => Promise<AdminVocabulary[]>;
  getAllPlayers: () => Promise<AdminPlayer[]>;
  updateVocabulary: (id: string, data: Partial<AdminVocabulary>) => Promise<boolean>;
  deleteVocabulary: (id: string) => Promise<boolean>;
  deletePlayer: (id: string) => Promise<boolean>;
  importVocabulary: (data: AdminVocabulary[], collectionId?: string) => Promise<{ success: boolean; message: string }>;
  exportVocabulary: () => Promise<AdminVocabulary[]>;
  createCollection: (collection: AdminCollection) => Promise<{ success: boolean; id?: string; message: string }>;
  getAllCollections: () => Promise<AdminCollection[]>;
  deleteCollection: (id: string) => Promise<boolean>;
  updateCollection: (id: string, data: Partial<AdminCollection>) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // tRPC hooks for vocabulary
  const vocabulariesQuery = trpc.admin_vocabulary.list.useQuery(undefined, {
    enabled: isAdminLoggedIn,
    staleTime: 1000 * 60 * 5,
  });
  
  const updateVocabMutation = trpc.admin_vocabulary.update.useMutation();
  const deleteVocabMutation = trpc.admin_vocabulary.delete.useMutation();

  // tRPC hooks for players
  const playersQuery = trpc.players.list.useQuery(undefined, {
    enabled: false,
  });
  
  const deletePlayerMutation = trpc.players.delete.useMutation();

  // tRPC hooks for collections
  const collectionsQuery = trpc.admin_collections.list.useQuery(undefined, {
    enabled: isAdminLoggedIn,
    staleTime: 1000 * 60 * 5,
  });
  
  const createCollectionMutation = trpc.admin_collections.create.useMutation();
  const updateCollectionMutation = trpc.admin_collections.update.useMutation();
  const deleteCollectionMutation = trpc.admin_collections.delete.useMutation();

  const adminLogin = useCallback(async (password: string): Promise<boolean> => {
    const isValid = password === 'admin123';
    if (isValid) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('adminLoggedIn', 'true');
    }
    return isValid;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('adminLoggedIn');
  }, []);

  const getAllVocabulary = useCallback(
    async (collectionId?: string): Promise<AdminVocabulary[]> => {
      try {
        if (!isAdminLoggedIn) {
          return [];
        }
        if (vocabulariesQuery.data) {
          return vocabulariesQuery.data;
        }
        const result = await vocabulariesQuery.refetch();
        return result.data || [];
      } catch (error) {
        console.error('Fetch vocabulary error:', error);
        return [];
      }
    },
    [isAdminLoggedIn, vocabulariesQuery]
  );

  const getAllPlayers = useCallback(
    async (): Promise<AdminPlayer[]> => {
      try {
        if (!isAdminLoggedIn) {
          return [];
        }
        const result = await playersQuery.refetch();
        return result.data || [];
      } catch (error) {
        console.error('Fetch players error:', error);
        return [];
      }
    },
    [isAdminLoggedIn, playersQuery]
  );

  const updateVocabulary = useCallback(
    async (id: string, data: Partial<AdminVocabulary>): Promise<boolean> => {
      try {
        if (!isAdminLoggedIn) return false;
        const result = await updateVocabMutation.mutateAsync({ id, ...data });
        if (result.success) {
          await vocabulariesQuery.refetch();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Update vocabulary error:', error);
        return false;
      }
    },
    [isAdminLoggedIn, updateVocabMutation, vocabulariesQuery]
  );

  const deleteVocabulary = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        if (!isAdminLoggedIn) return false;
        const result = await deleteVocabMutation.mutateAsync({ id });
        if (result.success) {
          await vocabulariesQuery.refetch();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Delete vocabulary error:', error);
        return false;
      }
    },
    [isAdminLoggedIn, deleteVocabMutation, vocabulariesQuery]
  );

  const deletePlayer = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        if (!isAdminLoggedIn) return false;
        const result = await deletePlayerMutation.mutateAsync({ id });
        if (result.success) {
          await playersQuery.refetch();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Delete player error:', error);
        return false;
      }
    },
    [isAdminLoggedIn, deletePlayerMutation, playersQuery]
  );

  const createVocabMutation = trpc.admin_vocabulary.create.useMutation();

  const importVocabulary = useCallback(
    async (data: AdminVocabulary[], collectionId?: string): Promise<{ success: boolean; message: string }> => {
      try {
        if (!isAdminLoggedIn) {
          return { success: false, message: 'Nicht angemeldet' };
        }
        for (const vocab of data) {
          await createVocabMutation.mutateAsync({
            id: vocab.id || nanoid(),
            unit: vocab.unit,
            page: vocab.page,
            english: vocab.english,
            deutsch: vocab.deutsch,
            collection_id: collectionId || 'collection-1',
          });
        }
        await vocabulariesQuery.refetch();
        return { success: true, message: `${data.length} Vokabeln importiert` };
      } catch (error) {
        console.error('Import vocabulary error:', error);
        return { success: false, message: `Fehler: ${error}` };
      }
    },
    [isAdminLoggedIn, vocabulariesQuery, createVocabMutation]
  );

  const exportVocabulary = useCallback(
    async (): Promise<AdminVocabulary[]> => {
      try {
        if (!isAdminLoggedIn) {
          return [];
        }
        if (vocabulariesQuery.data) {
          return vocabulariesQuery.data;
        }
        const result = await vocabulariesQuery.refetch();
        return result.data || [];
      } catch (error) {
        console.error('Export vocabulary error:', error);
        return [];
      }
    },
    [isAdminLoggedIn, vocabulariesQuery]
  );

  const createCollection = useCallback(
    async (collection: AdminCollection): Promise<{ success: boolean; id?: string; message: string }> => {
      try {
        if (!isAdminLoggedIn) {
          return { success: false, message: 'Nicht angemeldet' };
        }
        const id = collection.id || nanoid();
        const result = await createCollectionMutation.mutateAsync({
          id,
          name: collection.name,
          learning_year: parseInt(collection.year),
          description: collection.description,
        });
        if (result.success) {
          await collectionsQuery.refetch();
          return { success: true, id, message: 'Sammlung erstellt' };
        }
        return { success: false, message: 'Fehler beim Erstellen' };
      } catch (error) {
        console.error('Create collection error:', error);
        return { success: false, message: `Fehler: ${error}` };
      }
    },
    [isAdminLoggedIn, createCollectionMutation, collectionsQuery]
  );

  const getAllCollections = useCallback(
    async (): Promise<AdminCollection[]> => {
      try {
        if (!isAdminLoggedIn) {
          return [];
        }
        if (collectionsQuery.data) {
          return collectionsQuery.data.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description || undefined,
            year: c.learning_year.toString(),
            created_at: c.created_at?.toISOString(),
            updated_at: c.updated_at?.toISOString(),
          }));
        }
        const result = await collectionsQuery.refetch();
        return (result.data || []).map(c => ({
          id: c.id,
          name: c.name,
          description: c.description || undefined,
          year: c.learning_year.toString(),
          created_at: c.created_at?.toISOString(),
          updated_at: c.updated_at?.toISOString(),
        }));
      } catch (error) {
        console.error('Fetch collections error:', error);
        return [];
      }
    },
    [isAdminLoggedIn, collectionsQuery]
  );

  const deleteCollection = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        if (!isAdminLoggedIn) return false;
        const result = await deleteCollectionMutation.mutateAsync({ id });
        if (result.success) {
          await collectionsQuery.refetch();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Delete collection error:', error);
        return false;
      }
    },
    [isAdminLoggedIn, deleteCollectionMutation, collectionsQuery]
  );

  const updateCollection = useCallback(
    async (id: string, data: Partial<AdminCollection>): Promise<boolean> => {
      try {
        if (!isAdminLoggedIn) return false;
        const result = await updateCollectionMutation.mutateAsync({
          id,
          name: data.name,
          learning_year: data.year ? parseInt(data.year) : undefined,
          description: data.description,
        });
        if (result.success) {
          await collectionsQuery.refetch();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Update collection error:', error);
        return false;
      }
    },
    [isAdminLoggedIn, updateCollectionMutation, collectionsQuery]
  );

  // Check if admin was logged in on mount
  useEffect(() => {
    const wasLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (wasLoggedIn) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const value: AdminContextType = {
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    getAllVocabulary,
    getAllPlayers,
    updateVocabulary,
    deleteVocabulary,
    deletePlayer,
    importVocabulary,
    exportVocabulary,
    createCollection,
    getAllCollections,
    deleteCollection,
    updateCollection,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
