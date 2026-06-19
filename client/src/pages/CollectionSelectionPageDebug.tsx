import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function CollectionSelectionPageDebug() {
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Test direct tRPC query
  const vocabQuery = trpc.admin_vocabulary.list.useQuery();
  const collectionsQuery = trpc.admin_collections.list.useQuery();

  useEffect(() => {
    let info = '';
    
    info += `\n=== Collections Query ===\n`;
    info += `Loading: ${collectionsQuery.isLoading}\n`;
    info += `Error: ${collectionsQuery.error?.message || 'None'}\n`;
    info += `Data length: ${collectionsQuery.data?.length || 0}\n`;
    if (collectionsQuery.data && collectionsQuery.data.length > 0) {
      info += `First collection: ${JSON.stringify(collectionsQuery.data[0], null, 2)}\n`;
    }

    info += `\n=== Vocabulary Query ===\n`;
    info += `Loading: ${vocabQuery.isLoading}\n`;
    info += `Error: ${vocabQuery.error?.message || 'None'}\n`;
    info += `Data length: ${vocabQuery.data?.length || 0}\n`;
    if (vocabQuery.data && vocabQuery.data.length > 0) {
      info += `First vocab: ${JSON.stringify(vocabQuery.data[0], null, 2)}\n`;
      
      // Count by collection
      const byCollection: Record<string, number> = {};
      vocabQuery.data.forEach(v => {
        const collId = v.collection_id || 'unknown';
        byCollection[collId] = (byCollection[collId] || 0) + 1;
      });
      info += `\nVocab by collection:\n${JSON.stringify(byCollection, null, 2)}\n`;
    }

    setDebugInfo(info);
  }, [vocabQuery.data, vocabQuery.isLoading, vocabQuery.error, collectionsQuery.data, collectionsQuery.isLoading, collectionsQuery.error]);

  return (
    <div className="p-8 bg-yellow-50">
      <h1 className="text-2xl font-bold mb-4">Debug: Collection & Vocabulary Loading</h1>
      <pre className="bg-white p-4 border-2 border-blue-900 rounded text-sm overflow-auto max-h-96">
        {debugInfo}
      </pre>
      <button 
        onClick={() => {
          vocabQuery.refetch();
          collectionsQuery.refetch();
        }}
        className="mt-4 px-4 py-2 bg-blue-900 text-white rounded"
      >
        Refresh Data
      </button>
    </div>
  );
}
