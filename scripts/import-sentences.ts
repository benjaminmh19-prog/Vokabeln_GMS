/**
 * Importiert Beispielsätze aus Markdown-Tabellen (oder mehreren Dateien) in die Tabelle vocab_sentences.
 *
 * Trockenlauf (Standard, schreibt nichts):
 *   npx tsx scripts/import-sentences.ts teil1.md teil2.md --collection <COLLECTION_ID>
 * Wirklich schreiben:
 *   npx tsx scripts/import-sentences.ts teil1.md teil2.md --collection <COLLECTION_ID> --apply
 *
 * Optionen:
 *   --collection <id>      Sammlung (Lernjahr), zu der die Vokabeln gehören (Pflicht)
 *   --attach-ambiguous     Sätze auch dann an alle Kandidaten hängen, wenn die Vokabel
 *                          mehrere Bedeutungen hat (Standard: nur melden)
 *   --apply                in die Datenbank schreiben
 *
 * Benötigt die Umgebungsvariable DATABASE_URL (wie der Server).
 * Erneutes Importieren ist gefahrlos: gleiche Sätze werden aktualisiert, nicht doppelt angelegt.
 */
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { matchSentencesToVocab, parseSentenceMarkdown, type SentenceRow, type VocabRef } from '../shared/sentences';

function parseArgs(argv: string[]) {
  const files: string[] = [];
  let collection = '';
  let apply = false;
  let attachAmbiguous = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--collection') collection = argv[++i] ?? '';
    else if (a === '--apply') apply = true;
    else if (a === '--attach-ambiguous') attachAmbiguous = true;
    else if (a.startsWith('--')) throw new Error(`Unbekannte Option: ${a}`);
    else files.push(a);
  }
  return { files, collection, apply, attachAmbiguous };
}

async function main() {
  const { files, collection, apply, attachAmbiguous } = parseArgs(process.argv.slice(2));
  if (files.length === 0 || !collection) {
    console.error('Aufruf: npx tsx scripts/import-sentences.ts <datei.md> [...] --collection <ID> [--apply] [--attach-ambiguous]');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL ist nicht gesetzt.');
    process.exit(1);
  }

  const rows: SentenceRow[] = files.flatMap((f) => parseSentenceMarkdown(fs.readFileSync(f, 'utf8')));
  console.log(`${rows.length} Sätze aus ${files.length} Datei(en) gelesen.`);

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const { rows: vocab } = await client.query<VocabRef>(
      'SELECT id, english, deutsch, unit, collection_id FROM admin_vocabulary WHERE collection_id = $1',
      [collection],
    );
    if (vocab.length === 0) {
      console.error(`Keine Vokabeln in Sammlung "${collection}" gefunden. Stimmt die ID?`);
      process.exit(1);
    }
    console.log(`${vocab.length} Vokabeln in der Sammlung.`);

    const result = matchSentencesToVocab(rows, vocab);
    const toInsert: { vocabId: string; row: SentenceRow }[] = [];
    for (const m of result.matched) for (const v of m.vocabs) toInsert.push({ vocabId: v.id, row: m.row });
    if (attachAmbiguous) {
      for (const a of result.ambiguous) for (const v of a.candidates) toInsert.push({ vocabId: v.id, row: a.row });
    }

    console.log(`\nZugeordnet:  ${result.matched.length} Sätze (${toInsert.length} Einträge in vocab_sentences)`);
    console.log(`Mehrdeutig:  ${result.ambiguous.length}${attachAmbiguous ? ' (werden angehängt)' : ' (werden übersprungen, mit --attach-ambiguous anhängen)'}`);
    for (const a of result.ambiguous) {
      console.log(`  - "${a.row.word}": ${a.candidates.map((c) => `${c.english} = ${c.deutsch}`).join('  |  ')}`);
    }
    console.log(`Nicht gefunden: ${result.unmatched.length}`);
    for (const u of result.unmatched) console.log(`  - "${u.word}"`);

    if (!apply) {
      console.log('\nTrockenlauf, es wurde nichts geschrieben. Mit --apply importieren.');
      return;
    }

    await client.query('BEGIN');
    for (const { vocabId, row } of toInsert) {
      await client.query(
        `INSERT INTO vocab_sentences (id, vocabulary_id, sentence_en, sentence_de)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (vocabulary_id, sentence_en) DO UPDATE SET sentence_de = EXCLUDED.sentence_de`,
        [randomUUID(), vocabId, row.en, row.de],
      );
    }
    await client.query('COMMIT');
    console.log(`\n${toInsert.length} Einträge geschrieben.`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
