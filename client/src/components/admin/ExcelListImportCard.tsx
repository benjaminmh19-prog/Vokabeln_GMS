import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';

interface Props {
  /** Wird nach einem erfolgreichen Import aufgerufen (Listen neu laden). */
  onImported?: () => void | Promise<void>;
}

type Format = 1 | 2;

interface Summary {
  vocabCount: number;
  sentenceCount: number;
  sentencesPerVocab: number;
  units: { unit: string; count: number }[];
  collection: { id: string; name: string; isNew: boolean; oldVocabCount: number; oldSentenceCount: number };
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
    reader.readAsDataURL(file);
  });
}

function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Admin: Excel-Liste (Vokabeln mit mehreren Beispielsätzen) als Sammlung einspielen.
 * Schritt 1 prüft die Datei (schreibt nichts), Schritt 2 importiert.
 */
export default function ExcelListImportCard({ onImported }: Props) {
  const utils = trpc.useUtils();
  const mutation = trpc.admin_import.list.useMutation();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [year, setYear] = useState('3');
  const [name, setName] = useState('Englisch Klasse 7');
  const [format, setFormat] = useState<Format>(2);
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setErrors([]);
    setSummary(null);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    reset();
    if (!/\.xlsx$/i.test(file.name)) {
      toast.error('Bitte eine Excel-Datei (.xlsx) wählen.');
      e.target.value = '';
      return;
    }
    setFileBase64(await readAsBase64(file));
    setFileName(file.name);
  };

  const run = async (apply: boolean) => {
    const yearNum = parseInt(year, 10);
    if (!fileBase64) return toast.error('Bitte zuerst eine Excel-Datei wählen.');
    if (!yearNum || yearNum < 1) return toast.error('Bitte ein Lernjahr eintragen, z. B. 3.');
    const adminPassword = (() => {
      try {
        return sessionStorage.getItem('adminPw') ?? '';
      } catch {
        return '';
      }
    })();
    if (!adminPassword) return toast.error('Bitte im Admin-Bereich einmal ab- und wieder anmelden.');

    setBusy(true);
    try {
      const res = await mutation.mutateAsync({ adminPassword, fileBase64, format, year: yearNum, name: name.trim() || undefined, apply });
      setErrors(res.errors);
      setSummary((res.summary as Summary | undefined) ?? null);
      if (!res.ok) {
        toast.error('Die Liste enthält Fehler. Es wurde nichts verändert.');
        return;
      }
      if (apply && res.applied) {
        if (res.backup) {
          downloadJson(`sicherung-${res.backup.collection}-${new Date().toISOString().slice(0, 10)}.json`, res.backup);
        }
        toast.success(`Importiert: ${res.summary?.vocabCount} Vokabeln, ${res.summary?.sentenceCount} Sätze.`);
        await utils.invalidate();
        await onImported?.();
        setSummary(null);
        setFileBase64('');
        setFileName('');
        if (fileInput.current) fileInput.current.value = '';
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-4 border-[#2E3192] shadow-lg mb-8">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <FileSpreadsheet className="w-6 h-6 text-[#2E3192]" />
          <h2 className="text-2xl font-bold text-[#2E3192]">EXCEL-LISTE MIT SÄTZEN</h2>
        </div>
        <p className="text-gray-700 mb-4 text-sm">
          Spalten: Unit | Seite | Englisch | Deutsch | danach je Satz Englisch und Deutsch (mindestens 3, auch 4 Sätze). Die Satzanzahl wird
          erkannt. Gibt es zum Lernjahr schon eine Sammlung, werden deren Vokabeln und Sätze <b>ersetzt</b>, sonst wird sie angelegt.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="font-bold text-[#2E3192]">Lernjahr</Label>
            <Input type="number" min="1" value={year} onChange={(e) => { setYear(e.target.value); reset(); }} className="mt-2" />
          </div>
          <div className="md:col-span-2">
            <Label className="font-bold text-[#2E3192]">Name der Sammlung (nur beim Anlegen)</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label className="font-bold text-[#2E3192]">Spaltenaufbau</Label>
            <select
              value={format}
              onChange={(e) => { setFormat(Number(e.target.value) as Format); reset(); }}
              className="mt-2 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value={2}>Unit | Seite | Englisch | Deutsch | Sätze</option>
              <option value={1}>Seite | Englisch | Deutsch | Sätze (Units als eigene Zeilen)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileInput} type="file" accept=".xlsx" onChange={onFile} disabled={busy} className="text-sm" aria-label="Excel-Datei wählen" />
          <Button
            onClick={() => run(false)}
            disabled={busy || !fileBase64}
            className="bg-gradient-to-r from-[#FF9F1C] to-[#FFD93D] text-[#2E3192] font-bold border-2 border-[#2E3192] rounded-lg"
          >
            {busy ? 'BITTE WARTEN…' : '1. DATEI PRÜFEN'}
          </Button>
          {summary && errors.length === 0 && (
            <Button onClick={() => run(true)} disabled={busy} className="bg-[#2E3192] hover:bg-[#1a1a5f] text-white font-bold border-2 border-[#FFD93D] rounded-lg">
              2. JETZT IMPORTIEREN
            </Button>
          )}
        </div>
        {fileName && <p className="text-xs text-gray-600 mt-2">Gewählt: {fileName}</p>}

        {errors.length > 0 && (
          <div className="mt-4 rounded-lg border-2 border-red-400 bg-red-50 p-4 text-sm text-red-800">
            <b>Bitte korrigieren (es wurde nichts verändert):</b>
            <ul className="list-disc ml-5 mt-1">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        {summary && errors.length === 0 && (
          <div className="mt-4 rounded-lg border-2 border-[#2E3192] bg-[#FFF3E0] p-4 text-sm text-[#2E3192]">
            <p>
              <b>{summary.collection.isNew ? 'Neue Sammlung' : 'Sammlung wird ersetzt'}:</b> „{summary.collection.name}“
            </p>
            {!summary.collection.isNew && (
              <p className="text-red-700">
                Vorher: {summary.collection.oldVocabCount} Vokabeln, {summary.collection.oldSentenceCount} Sätze. Diese werden gelöscht
                (eine Sicherung wird automatisch heruntergeladen).
              </p>
            )}
            <p>
              Nachher: <b>{summary.vocabCount}</b> Vokabeln, <b>{summary.sentenceCount}</b> Sätze ({summary.sentencesPerVocab} pro Vokabel)
            </p>
            <p className="mt-1">{summary.units.map((u) => `${u.unit}: ${u.count}`).join(' · ')}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
