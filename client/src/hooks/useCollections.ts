import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  learning_year: number;
  created_at?: string;
  updated_at?: string;
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query collections using public tRPC endpoint
  const collectionsQuery = trpc.admin_collections.list.useQuery();

  useEffect(() => {
    if (collectionsQuery.isLoading) {
      setIsLoading(true);
    } else if (collectionsQuery.error) {
      setError('Fehler beim Laden der Sammlungen');
      setIsLoading(false);
    } else if (collectionsQuery.data) {
      // Transform DB data to Collection interface
      const transformed = collectionsQuery.data.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description || undefined,
        learning_year: c.learning_year,
        created_at: c.created_at?.toISOString(),
        updated_at: c.updated_at?.toISOString(),
      }));
      setCollections(transformed);
      setError(null);
      setIsLoading(false);
    }
  }, [collectionsQuery.isLoading, collectionsQuery.error, collectionsQuery.data]);

  return {
    collections,
    isLoading,
    error,
    refetch: collectionsQuery.refetch,
  };
}
