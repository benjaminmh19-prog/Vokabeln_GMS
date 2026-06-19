import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAdmin, AdminVocabulary, AdminPlayer, AdminCollection } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Upload,
  Download,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Users,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  BarChart3,
} from 'lucide-react';
import {
  parseCSV,
  toCSV,
  downloadCSV,
  readFileAsText,
  validateCSVData,
} from '@/lib/csvUtils';
import ImportPreviewDialog from '@/components/admin/ImportPreviewDialog';
import VocabularyTable from '@/components/admin/VocabularyTable';
import PlayerManagementTable from '@/components/admin/PlayerManagementTable';
import CollectionManagementTable from '@/components/admin/CollectionManagementTable';
import ExportDialog from '@/components/admin/ExportDialog';
import ImportProgressDialog from '@/components/admin/ImportProgressDialog';
import { VocabularyManagementTable } from '@/components/admin/VocabularyManagementTable';
import TestGeneratorPanel from '@/components/admin/TestGeneratorPanel';
import TestHistoryPanel from '@/components/admin/TestHistoryPanel';
import TeacherDashboard from '@/components/admin/TeacherDashboard';
import { getAllVocabularyCombined } from '@/lib/vocabularyLoader';

export default function AdminPage() {
  const [, navigate] = useLocation();
  const { isAdminLoggedIn, adminLogin, adminLogout, importVocabulary, exportVocabulary, getAllVocabulary, updateVocabulary, deleteVocabulary, getAllPlayers, deletePlayer, getAllCollections, createCollection, deleteCollection, updateCollection } = useAdmin();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [vocabulary, setVocabulary] = useState<AdminVocabulary[]>([]);
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showTestGenerator, setShowTestGenerator] = useState(false);
  const [showTestHistory, setShowTestHistory] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<AdminVocabulary[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showVocabularyManagement, setShowVocabularyManagement] = useState(false);
  const [showImportProgress, setShowImportProgress] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, errors: [] as string[] });
  const [isImporting, setIsImporting] = useState(false);
  const [importCancelled, setImportCancelled] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAdminLoggedIn) {
      // Allow login page to show
    }
  }, [isAdminLoggedIn]);

  // Load vocabulary when logged in
  useEffect(() => {
    if (isAdminLoggedIn && (showVocabulary || showVocabularyManagement)) {
      loadVocabulary();
    }
  }, [isAdminLoggedIn, showVocabulary, showVocabularyManagement]);

  // Load players when logged in
  useEffect(() => {
    if (isAdminLoggedIn && showPlayers) {
      loadPlayers();
    }
  }, [isAdminLoggedIn, showPlayers]);

  // Load collections when logged in
  useEffect(() => {
    if (isAdminLoggedIn && showCollections) {
      loadCollections();
    }
  }, [isAdminLoggedIn, showCollections]);

  // Load collections when test generator is opened
  useEffect(() => {
    if (isAdminLoggedIn && showTestGenerator && collections.length === 0) {
      loadCollections();
    }
  }, [isAdminLoggedIn, showTestGenerator]);

  // Load vocabulary when test generator is opened
  useEffect(() => {
    if (isAdminLoggedIn && showTestGenerator && vocabulary.length === 0) {
      loadVocabulary();
    }
  }, [isAdminLoggedIn, showTestGenerator]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await adminLogin(password);
    if (success) {
      setPassword('');
      toast.success('Admin erfolgreich angemeldet');
    } else {
      toast.error('Falsches Passwort');
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/');
    toast.success('Admin abgemeldet');
  };

  const loadVocabulary = async () => {
    setIsLoading(true);
    try {
      const data = await getAllVocabulary();
      setVocabulary(data);
    } catch (error) {
      toast.error('Fehler beim Laden der Vokabeln');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllPlayers();
      setPlayers(data);
    } catch (error) {
      toast.error('Fehler beim Laden der Spieler');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCollections();
      setCollections(data);
    } catch (error) {
      toast.error('Fehler beim Laden der Sammlungen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVocabularyEdit = async (vocab: AdminVocabulary) => {
    try {
      const success = await updateVocabulary(vocab.id, vocab);
      if (success) {
        toast.success('Vokabel aktualisiert');
        await loadVocabulary();
      } else {
        toast.error('Fehler beim Aktualisieren der Vokabel');
      }
    } catch (error) {
      toast.error('Fehler beim Aktualisieren der Vokabel');
    }
  };

  const handleVocabularyDelete = async (id: string) => {
    try {
      const success = await deleteVocabulary(id);
      if (success) {
        toast.success('Vokabel gelöscht');
        await loadVocabulary();
      } else {
        toast.error('Fehler beim Löschen der Vokabel');
      }
    } catch (error) {
      toast.error('Fehler beim Löschen der Vokabel');
    }
  };

  const handleBatchDeleteVocabulary = async (ids: string[]) => {
    try {
      let successCount = 0;
      for (const id of ids) {
        const success = await deleteVocabulary(id);
        if (success) successCount++;
      }
      if (successCount === ids.length) {
        toast.success(`${successCount} Vokabeln gelöscht`);
        await loadVocabulary();
      } else {
        toast.warning(`${successCount} von ${ids.length} Vokabeln gelöscht`);
        await loadVocabulary();
      }
    } catch (error) {
      toast.error('Fehler beim Löschen der Vokabeln');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const content = await readFileAsText(file);
      const parsedData = parseCSV(content);

      // Validate data
      const { valid, errors } = validateCSVData(parsedData);
      if (!valid) {
        toast.error(`Validierungsfehler:\n${errors.join('\n')}`);
        setIsLoading(false);
        return;
      }

      // Show preview dialog
      setPreviewData(parsedData);
      setShowPreview(true);
    } catch (error) {
      toast.error(`Fehler beim Hochladen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleConfirmImport = async (data: AdminVocabulary[], learningYear?: number) => {
    setIsLoading(true);
    try {
      let collectionId: string | undefined;
      if (learningYear) {
        const collection = collections.find(c => parseInt(c.year) === learningYear);
        if (collection) {
          collectionId = collection.id;
        }
      }
      const result = await importVocabulary(data, collectionId);
      if (result.success) {
        toast.success(result.message);
        setShowPreview(false);
        setPreviewData([]);
        await loadVocabulary();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const data = await exportVocabulary();
      if (data.length === 0) {
        toast.error('Keine Vokabeln zum Exportieren');
        setIsLoading(false);
        return;
      }

      // Process CSV asynchronously to avoid UI freeze
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      const csv = toCSV(data);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(csv, `vocabulary_${timestamp}.csv`);
      toast.success(`${data.length} Vokabeln erfolgreich exportiert`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Fehler beim Exportieren');
    } finally {
      setIsLoading(false);
    }
  };

  // Login view
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md border-4 border-[#2E3192] shadow-lg">
          <div className="p-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Lock className="w-8 h-8 text-[#2E3192]" />
              <h1 className="arcade-title text-[#2E3192] text-3xl">ADMIN LOGIN</h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#2E3192] mb-2">
                  Admin Passwort
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Passwort eingeben"
                    className="border-2 border-[#2E3192] rounded-lg py-2 px-4"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3192]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-3 transform hover:scale-105 active:scale-95 transition-all"
              >
                ANMELDEN
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                onClick={() => navigate('/')}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold border-2 border-[#2E3192] rounded-lg px-6 py-2 transform hover:scale-105 active:scale-95 transition-all"
              >
                ZURÜCK
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Admin panel view
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD93D] via-[#FFF8E7] to-[#FFE5B4] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="arcade-title text-[#2E3192] text-4xl md:text-5xl">ADMIN PANEL</h1>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-[#2E3192] rounded-lg px-6 py-3 flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
          >
            <LogOut className="w-5 h-5" />
            ABMELDEN
          </Button>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Import Card */}
          <Card className="border-4 border-[#2E3192] shadow-lg">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-6 h-6 text-[#2E3192]" />
                <h2 className="text-2xl font-bold text-[#2E3192]">IMPORTIEREN</h2>
              </div>

              <p className="text-gray-700 mb-6 text-sm">
                CSV-Datei hochladen mit Spalten: Unit, Page, English, Deutsch
              </p>

              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  id="csv-upload"
                  aria-label="CSV-Datei hochladen"
                />
                <label
                  htmlFor="csv-upload"
                  className="block bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-3 px-4 text-center cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
                >
                  {isLoading ? 'WIRD HOCHGELADEN...' : 'CSV DATEI WÄHLEN'}
                </label>
              </div>
            </div>
          </Card>

          {/* Export Card */}
          <Card className="border-4 border-[#2E3192] shadow-lg">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Download className="w-6 h-6 text-[#2E3192]" />
                <h2 className="text-2xl font-bold text-[#2E3192]">EXPORTIEREN</h2>
              </div>

              <p className="text-gray-700 mb-6 text-sm">
                Alle Vokabeln als CSV-Datei herunterladen
              </p>

              <Button
                onClick={() => setShowExportDialog(true)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] hover:from-[#FF8C00] hover:to-[#FFC700] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg py-3 transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? 'WIRD EXPORTIERT...' : 'EXPORTIEREN'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Management Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Button
            onClick={() => setShowVocabulary(!showVocabulary)}
            className="bg-[#2E3192] hover:bg-[#1a1a5f] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {showVocabulary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            {showVocabulary ? 'VOKABELN AUSBLENDEN' : 'VOKABELN ANZEIGEN'}
          </Button>

          <Button
            onClick={() => setShowPlayers(!showPlayers)}
            className="bg-[#2E3192] hover:bg-[#1a1a5f] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            {showPlayers ? 'SPIELER AUSBLENDEN' : 'SPIELER VERWALTEN'}
          </Button>

          <Button
            onClick={() => setShowVocabularyManagement(!showVocabularyManagement)}
            className="bg-[#2E3192] hover:bg-[#1a1a5f] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {showVocabularyManagement ? 'VOKABELN AUSBLENDEN' : 'VOKABELN VERWALTEN'}
          </Button>

          <Button
            onClick={() => setShowCollections(!showCollections)}
            className="bg-[#2E3192] hover:bg-[#1a1a5f] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {showCollections ? 'SAMMLUNGEN AUSBLENDEN' : 'SAMMLUNGEN VERWALTEN'}
          </Button>

          <Button
            onClick={() => setShowTestGenerator(!showTestGenerator)}
            className="bg-[#2E3192] hover:bg-[#1a1a5f] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {showTestGenerator ? 'TEST AUSBLENDEN' : 'TEST GENERATOR'}
          </Button>

          <Button
            onClick={() => setShowTestHistory(!showTestHistory)}
            className="bg-[#2E3192] hover:bg-[#1a1a5f] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <CalendarIcon className="w-5 h-5" />
            {showTestHistory ? 'VERLAUF AUSBLENDEN' : 'TEST-VERLAUF'}
          </Button>

          <Button
            onClick={() => setShowDashboard(!showDashboard)}
            className="bg-[#2E3192] hover:bg-[#1a1a5f] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            {showDashboard ? 'DASHBOARD AUSBLENDEN' : 'DASHBOARD'}
          </Button>

          <Button
            onClick={() => setShowHelp(!showHelp)}
            className="bg-[#2E3192] hover:bg-[#1a1a5f] text-white font-bold border-2 border-[#FFD93D] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-5 h-5" />
            {showHelp ? 'HILFE AUSBLENDEN' : 'HILFE ANZEIGEN'}
          </Button>
        </div>

        {/* Vocabulary List */}
        {showVocabulary && (
          <Card className="border-4 border-[#2E3192] shadow-lg overflow-hidden mb-8">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-[#2E3192] mb-6">
                VOKABELN ({vocabulary.length})
              </h2>

              <VocabularyTable
                data={vocabulary}
                onUpdate={updateVocabulary}
                onDelete={deleteVocabulary}
                onDataChange={setVocabulary}
              />
            </div>
          </Card>
        )}

        {/* Player Management */}
        {showPlayers && (
          <Card className="border-4 border-[#2E3192] shadow-lg overflow-hidden mb-8">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-[#2E3192] mb-6">
                SPIELER VERWALTEN ({players.length})
              </h2>

              <PlayerManagementTable
                data={players}
                onDelete={deletePlayer}
                onDataChange={setPlayers}
              />
            </div>
          </Card>
        )}

        {/* Vocabulary Management */}
        {showVocabularyManagement && (
          <Card className="border-4 border-[#2E3192] shadow-lg overflow-hidden mb-8">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-[#2E3192] mb-6">
                VOKABELN VERWALTEN ({vocabulary.length})
              </h2>

              <VocabularyManagementTable
                vocabularies={vocabulary}
                onEdit={handleVocabularyEdit}
                onDelete={handleVocabularyDelete}
                onBatchDelete={handleBatchDeleteVocabulary}
              />
            </div>
          </Card>
        )}

        {/* Collections Management */}
        {showCollections && (
          <Card className="border-4 border-[#2E3192] shadow-lg overflow-hidden mb-8">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-[#2E3192] mb-6">
                SAMMLUNGEN VERWALTEN ({collections.length})
              </h2>

              <CollectionManagementTable
                data={collections}
                onDelete={deleteCollection}
                onUpdate={updateCollection}
                onCreate={createCollection}
                onDataChange={setCollections}
              />
            </div>
          </Card>
        )}

        {/* Test Generator */}
        {showTestGenerator && (
          <Card className="border-4 border-[#2E3192] shadow-lg overflow-hidden mb-8">
            <div className="p-8">
              <TestGeneratorPanel vocabularyList={vocabulary} collections={collections} />
            </div>
          </Card>
        )}

        {/* Test History */}
        {showTestHistory && (
          <Card className="border-4 border-[#2E3192] shadow-lg overflow-hidden mb-8">
            <div className="p-8">
              <TestHistoryPanel />
            </div>
          </Card>
        )}

        {/* Help Section */}
        {showHelp && (
          <Card className="border-4 border-[#2E3192] shadow-lg mb-8">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-[#2E3192] mb-6">HILFE & ANLEITUNG</h2>

              <div className="space-y-6 text-sm text-gray-700">
                <div>
                  <h3 className="font-bold text-[#2E3192] mb-2">📋 Vokabelliste einfügen</h3>
                  <p>
                    1. Erstelle eine CSV-Datei mit Spalten: Unit, Page, English, Deutsch<br/>
                    2. Klicke auf "CSV DATEI WÄHLEN"<br/>
                    3. Überprüfe die Vorschau und bearbeite ggf. Einträge<br/>
                    4. Klicke auf "IMPORTIEREN" zum Speichern
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-[#2E3192] mb-2">✏️ Vokabeln bearbeiten</h3>
                  <p>
                    1. Klicke auf "VOKABELN ANZEIGEN"<br/>
                    2. Klicke auf das Bearbeiten-Icon (Stift) in einer Zeile<br/>
                    3. Ändere die Felder nach Bedarf<br/>
                    4. Klicke auf das Speichern-Icon (Haken) zum Speichern
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-[#2E3192] mb-2">🗑️ Spieler löschen</h3>
                  <p>
                    ⚠️ <strong>WARNUNG:</strong> Diese Aktion ist nicht rückgängig zu machen!<br/>
                    1. Klicke auf "SPIELER VERWALTEN"<br/>
                    2. Klicke auf das Löschen-Icon (Papierkorb) neben dem Spieler<br/>
                    3. Bestätige die Löschung<br/>
                    Der Spieler und alle seine Daten werden gelöscht.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-[#2E3192] mb-2">📥 CSV-Format Beispiel</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`Unit,Page,English,Deutsch
Unit 1,1,hello,Hallo
Unit 1,1,goodbye,Auf Wiedersehen
Unit 1,2,thank you,Danke
Unit 2,1,apple,Apfel`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-bold text-[#2E3192] mb-2">🔐 Passwort ändern</h3>
                  <p>
                    Öffne die Browser-Konsole (F12) und führe aus:<br/>
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      localStorage.setItem('adminPassword', 'dein-neues-passwort')
                    </code>
                  </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="font-bold text-blue-900 mb-2">💡 Tipps:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Erstelle regelmäßig Backups (exportiere Vokabeln)</li>
                    <li>Überprüfe die Import-Vorschau vor dem Speichern</li>
                    <li>Nutze die Spieler-Statistiken zur Überwachung</li>
                    <li>Deutsche Übersetzungen sollten nur ein Wort sein</li>
                  </ul>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Vollständige Anleitung: Siehe ADMIN_ANLEITUNG.md
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold border-2 border-[#2E3192] rounded-lg px-8 py-3 transform hover:scale-105 active:scale-95 transition-all"
          >
            ZURÜCK ZUR STARTSEITE
          </Button>
        </div>
      </div>

      {/* Import Preview Dialog */}
      <ImportPreviewDialog
        isOpen={showPreview}
        data={previewData}
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setShowPreview(false);
          setPreviewData([]);
        }}
        isLoading={isLoading}
        collections={collections.map(c => ({
          id: c.id || '',
          name: c.name,
          learning_year: parseInt(c.year),
        }))}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        vocabulary={vocabulary}
        collections={collections.map(c => ({
          id: c.id || '',
          name: c.name,
          learning_year: parseInt(c.year),
          description: c.description,
        }))}
      />
      <ImportProgressDialog
        isOpen={showImportProgress}
        totalItems={importProgress.total}
        currentItem={importProgress.current}
        isProcessing={isImporting}
        errors={importProgress.errors}
        onCancel={() => {
          setImportCancelled(true);
          setShowImportProgress(false);
        }}
        onComplete={() => {
          setShowImportProgress(false);
          setImportProgress({ current: 0, total: 0, errors: [] });
        }}
      />
    </div>
  );
}
