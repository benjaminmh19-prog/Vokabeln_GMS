/**
 * Ersetzt die Vokabeln (und Beispielsätze) einer Sammlung durch die Excel-Listen "Komplett Lernjahr 1/2".
 *
 * Ablauf pro Liste:
 *   1. Excel-Datei lesen und prüfen (Abbruch bei Fehlern)
 *   2. Sammlung finden (über das Lernjahr oder --collection1 / --collection2)
 *   3. Bestehende Vokabeln und Sätze der Sammlung als JSON-Datei sichern
 *   4. In EINER Transaktion: alte Sätze und Vokabeln löschen, neue einfügen
 *      (bei einem Fehler bleibt alles wie vorher)
 *
 * Trockenlauf (Standard, schreibt nichts):
 *   npx tsx scripts/import-lernjahr.ts --lj1 Lernjahr_1.xlsx --lj2 Lernjahr_2.xlsx
 * Wirklich schreiben:
 *   npx tsx scripts/import-lernjahr.ts --lj1 Lernjahr_1.xlsx --lj2 Lernjahr_2.xlsx --apply
 *
 * Optionen:
 *   --lj1 <datei>          Liste für Lernjahr 1 (optional)
 *   --lj2 <datei>          Liste für Lernjahr 2 (optional)
 *   --collection1 <id>     Sammlung für Lernjahr 1, falls es nicht genau eine mit learning_year = 1 gibt
 *   --collection2 <id>     Sammlung für Lernjahr 2, entsprechend
 *   --backup-dir <ordner>  Ort der Sicherungsdateien (Standard: ./backup)
 *   --neu <datei>          weitere Liste (z. B. Lernjahr 3); legt die Sammlung an, falls es sie noch nicht gibt
 *   --jahr <n>             Lernjahr der --neu-Liste (z. B. 3)
 *   --name <text>          Name der neuen Sammlung (z. B. "Englisch Klasse 7"), nur beim Anlegen nötig
 *   --format <1|2>         Spaltenaufbau der --neu-Liste wie Lernjahr 1 oder 2 (Standard: 2)
 *   --apply                wirklich in die Datenbank schreiben
 *
 * Benötigt DATABASE_URL (wie der Server).
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { readXlsxRows } from '../shared/xlsxReader';
import { parseLernjahr1, parseLernjahr2, type ImportVocab, type ParsedList } from '../shared/lernjahrImport';

interface Args {
  lj1?: string;
  lj2?: string;
  collection1?: string;
  collection2?: string;
  backupDir: string;
  apply: boolean;
  neu?: string;
  jahr?: number;
  name?: string;
  format: 1 | 2;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { backupDir: 'backup', apply: false, format: 2 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const next = () => {
      const v = argv[++i];
      if (!v || v.startsWith('--')) throw new Error(`Option ${k} braucht einen Wert.`);
      return v;
    };
    if (k === '--lj1') a.lj1 = next();
    else if (k === '--lj2') a.lj2 = next();
    else if (k === '--collection1') a.collection1 = next();
    else if (k === '--collection2') a.collection2 = next();
    else if (k === '--backup-dir') a.backupDir = next();
    else if (k === '--neu') a.neu = next();
    else if (k === '--jahr') a.jahr = parseInt(next(), 10);
    else if (k === '--name') a.name = next();
    else if (k === '--format') a.format = next() === '1' ? 1 : 2;
    else if (k === '--apply') a.apply = true;
    else throw new Error(`Unbekannte Option: ${k}`);
  }
  return a;
}

interface Job {
  year: number;
  file: string;
  parsed: ParsedList;
  collectionId: string;
  collectionName: string;
  /** true: Sammlung gibt es noch nicht und wird beim Import angelegt */
  create?: boolean;
}

async function findCollection(client: pg.Client, year: number, explicitId?: string): Promise<{ id: string; name: string }> {
  const { rows } = await client.query<{ id: string; name: string; learning_year: number }>(
    'SELECT id, name, learning_year FROM collections ORDER BY learning_year, name',
  );
  if (explicitId) {
    const hit = rows.find((r) => r.id === explicitId);
    if (!hit) throw new Error(`Sammlung "${explicitId}" nicht gefunden. Vorhanden: ${rows.map((r) => `${r.id} (${r.name})`).join(', ') || 'keine'}`);
    return hit;
  }
  const hits = rows.filter((r) => r.learning_year === year);
  if (hits.length === 1) return hits[0];
  const list = rows.map((r) => `${r.id} = ${r.name} (Lernjahr ${r.learning_year})`).join('\n  ') || 'keine';
  throw new Error(
    `${hits.length === 0 ? 'Keine' : 'Mehrere'} Sammlung mit Lernjahr ${year} gefunden. Bitte --collection${year} <id> angeben.\nVorhandene Sammlungen:\n  ${list}`,
  );
}

function summarize(list: ImportVocab[]): string {
  const units = new Map<string, number>();
  for (const v of list) units.set(v.unit, (units.get(v.unit) ?? 0) + 1);
  return Array.from(units, ([u, n]) => `    ${u}: ${n}`).join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.lj1 && !args.lj2 && !args.neu) {
    console.error('Aufruf: npx tsx scripts/import-lernjahr.ts --lj1 <datei.xlsx> [--lj2 <datei.xlsx>] [--neu <datei.xlsx> --jahr 3 --name "Englisch Klasse 7"] [--apply]');
    process.exit(1);
  }
  if (args.neu && (!args.jahr || args.jahr < 1)) {
    console.error('Zu --neu gehört --jahr <Zahl>, z. B. --jahr 3.');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL ist nicht gesetzt.');
    process.exit(1);
  }

  // 1. Dateien lesen und prüfen (noch ohne Datenbank)
  const parsedFiles: { year: number; file: string; parsed: ParsedList }[] = [];
  const inputs: [number, string | undefined, 1 | 2][] = [
    [1, args.lj1, 1],
    [2, args.lj2, 2],
    [args.jahr ?? 0, args.neu, args.format],
  ];
  for (const [year, file, format] of inputs) {
    if (!file) continue;
    const rows = readXlsxRows(fs.readFileSync(file));
    const parsed = format === 1 ? parseLernjahr1(rows) : parseLernjahr2(rows);
    console.log(`Lernjahr ${year}: ${parsed.vocab.length} Vokabeln aus ${file} gelesen.`);
    if (parsed.errors.length > 0) {
      console.error(`\nFehler in ${file}:`);
      parsed.errors.slice(0, 50).forEach((e) => console.error('  - ' + e));
      if (parsed.errors.length > 50) console.error(`  ... und ${parsed.errors.length - 50} weitere`);
      console.error('\nAbbruch, es wurde nichts verändert.');
      process.exit(1);
    }
    parsedFiles.push({ year, file, parsed });
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? undefined : { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    // 2. Sammlungen zuordnen
    const jobs: Job[] = [];
    for (const f of parsedFiles) {
      const isNeu = f.file === args.neu;
      if (isNeu && f.year !== 1 && f.year !== 2) {
        // weitere Liste: vorhandene Sammlung dieses Lernjahrs ersetzen, sonst neu anlegen
        const { rows } = await client.query<{ id: string; name: string }>(
          'SELECT id, name FROM collections WHERE learning_year = $1 ORDER BY name',
          [f.year],
        );
        if (rows.length > 1) {
          throw new Error(`Mehrere Sammlungen mit Lernjahr ${f.year} gefunden (${rows.map((r) => r.id).join(', ')}). Bitte eindeutig machen.`);
        }
        if (rows.length === 1) {
          jobs.push({ ...f, collectionId: rows[0].id, collectionName: rows[0].name });
        } else {
          if (!args.name) throw new Error(`Für Lernjahr ${f.year} gibt es noch keine Sammlung. Bitte --name "<Name der Sammlung>" angeben.`);
          const free = `col-${String(f.year).padStart(3, '0')}`;
          const taken = await client.query('SELECT 1 FROM collections WHERE id = $1', [free]);
          jobs.push({ ...f, collectionId: taken.rowCount ? randomUUID() : free, collectionName: args.name, create: true });
        }
        continue;
      }
      const c = await findCollection(client, f.year, f.year === 1 ? args.collection1 : args.collection2);
      jobs.push({ ...f, collectionId: c.id, collectionName: c.name });
    }
    const ids = jobs.map((j) => j.collectionId);
    if (new Set(ids).size !== ids.length) {
      throw new Error('Zwei Listen würden dieselbe Sammlung ersetzen. Bitte --collection1 und --collection2 angeben.');
    }

    // Übersicht
    for (const j of jobs) {
      const old = await client.query<{ v: string; s: string }>(
        `SELECT (SELECT COUNT(*) FROM admin_vocabulary WHERE collection_id = $1) AS v,
                (SELECT COUNT(*) FROM vocab_sentences WHERE vocabulary_id IN (SELECT id FROM admin_vocabulary WHERE collection_id = $1)) AS s`,
        [j.collectionId],
      );
      console.log(`\nLernjahr ${j.year} -> Sammlung "${j.collectionName}" (${j.collectionId})${j.create ? '  [wird NEU angelegt]' : ''}`);
      console.log(`  vorher: ${old.rows[0].v} Vokabeln, ${old.rows[0].s} Sätze  (werden gelöscht)`);
      console.log(`  nachher: ${j.parsed.vocab.length} Vokabeln, ${j.parsed.vocab.length * j.parsed.sentencesPerVocab} Sätze (${j.parsed.sentencesPerVocab} pro Vokabel)`);
      console.log(summarize(j.parsed.vocab));
    }

    if (!args.apply) {
      console.log('\nTrockenlauf, es wurde nichts geschrieben. Mit --apply importieren.');
      return;
    }

    // 3. Sicherung der bestehenden Daten
    fs.mkdirSync(args.backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    for (const j of jobs) {
      const vocab = await client.query('SELECT * FROM admin_vocabulary WHERE collection_id = $1', [j.collectionId]);
      const sentences = await client.query(
        'SELECT * FROM vocab_sentences WHERE vocabulary_id IN (SELECT id FROM admin_vocabulary WHERE collection_id = $1)',
        [j.collectionId],
      );
      const file = path.join(args.backupDir, `sammlung-${j.collectionId}-${stamp}.json`);
      fs.writeFileSync(file, JSON.stringify({ collection: j.collectionId, name: j.collectionName, vocabulary: vocab.rows, sentences: sentences.rows }, null, 1));
      console.log(`Sicherung: ${file} (${vocab.rowCount} Vokabeln, ${sentences.rowCount} Sätze)`);
    }

    // 4. Austausch in einer Transaktion
    await client.query('BEGIN');
    try {
      for (const j of jobs) {
        if (j.create) {
          await client.query('INSERT INTO collections (id, name, learning_year) VALUES ($1, $2, $3)', [j.collectionId, j.collectionName, j.year]);
        }
        await client.query(
          'DELETE FROM vocab_sentences WHERE vocabulary_id IN (SELECT id FROM admin_vocabulary WHERE collection_id = $1)',
          [j.collectionId],
        );
        await client.query('DELETE FROM admin_vocabulary WHERE collection_id = $1', [j.collectionId]);

        const vocabIds = j.parsed.vocab.map(() => randomUUID());
        const BATCH = 500;
        for (let i = 0; i < j.parsed.vocab.length; i += BATCH) {
          const part = j.parsed.vocab.slice(i, i + BATCH);
          await client.query(
            `INSERT INTO admin_vocabulary (id, collection_id, unit, page, english, deutsch)
             SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[])`,
            [
              vocabIds.slice(i, i + BATCH),
              part.map(() => j.collectionId),
              part.map((v) => v.unit),
              part.map((v) => v.page),
              part.map((v) => v.english),
              part.map((v) => v.deutsch),
            ],
          );
        }

        const sIds: string[] = [];
        const sVocab: string[] = [];
        const sEn: string[] = [];
        const sDe: string[] = [];
        j.parsed.vocab.forEach((v, idx) => {
          for (const s of v.sentences) {
            sIds.push(randomUUID());
            sVocab.push(vocabIds[idx]);
            sEn.push(s.en);
            sDe.push(s.de);
          }
        });
        for (let i = 0; i < sIds.length; i += BATCH) {
          await client.query(
            `INSERT INTO vocab_sentences (id, vocabulary_id, sentence_en, sentence_de)
             SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[])
             ON CONFLICT (vocabulary_id, sentence_en) DO NOTHING`,
            [sIds.slice(i, i + BATCH), sVocab.slice(i, i + BATCH), sEn.slice(i, i + BATCH), sDe.slice(i, i + BATCH)],
          );
        }
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }

    for (const j of jobs) {
      const n = await client.query<{ v: string; s: string }>(
        `SELECT (SELECT COUNT(*) FROM admin_vocabulary WHERE collection_id = $1) AS v,
                (SELECT COUNT(*) FROM vocab_sentences WHERE vocabulary_id IN (SELECT id FROM admin_vocabulary WHERE collection_id = $1)) AS s`,
        [j.collectionId],
      );
      console.log(`Fertig: Lernjahr ${j.year}: ${n.rows[0].v} Vokabeln, ${n.rows[0].s} Sätze in der Datenbank.`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
