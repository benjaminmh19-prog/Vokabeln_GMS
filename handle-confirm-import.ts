const handleConfirmImport = async (data: AdminVocabulary[], learningYear?: number) => {
  setIsLoading(true);
  setShowImportProgress(true);
  setImportProgress({ current: 0, total: data.length, errors: [] });
  setIsImporting(true);

  try {
    let collectionId: string | undefined;
    if (learningYear) {
      const collection = collections.find(c => parseInt(c.year) === learningYear);
      if (collection) {
        collectionId = collection.id;
      }
    }

    const batchSize = 50;
    const errors: string[] = [];
    let processedCount = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      try {
        const result = await importVocabulary(batch, collectionId);
        if (!result.success) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${result.message}`);
        }
        processedCount += batch.length;
      } catch (error) {
        errors.push(`Fehler bei Batch ${Math.floor(i / batchSize) + 1}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }

      setImportProgress(prev => ({
        ...prev,
        current: Math.min(processedCount, data.length),
        errors,
      }));
    }

    setIsImporting(false);
    if (errors.length === 0) {
      toast.success(`${data.length} Vokabeln erfolgreich importiert`);
      setShowPreview(false);
      setPreviewData([]);
      await loadVocabulary();
    } else {
      toast.error(`Import mit ${errors.length} Fehler(n) abgeschlossen`);
    }
  } catch (error) {
    setIsImporting(false);
    toast.error(`Fehler beim Import: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  } finally {
    setIsLoading(false);
  }
};
