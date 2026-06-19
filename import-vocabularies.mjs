import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const DATA_DIR = path.resolve(process.cwd(), "server/data");
// Load environment variables
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Parse DATABASE_URL
const url = new URL(dbUrl);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  port: url.port || 3306,
  ssl: true,
};

// Load vocabulary data
const vocabPath = path.join(__dirname, 'client/src/data/vocabulary.json');
const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));

// Convert vocabulary data to flat array
const vocabularies = [];
let id = 0;

Object.entries(vocabData).forEach(([unit, pages]) => {
  Object.entries(pages).forEach(([page, words]) => {
    words.forEach((word) => {
      vocabularies.push({
        id: `vocab_${unit}_${page}_${id}`,
        unit,
        page,
        english: word.english,
        deutsch: word.deutsch,
      });
      id++;
    });
  });
});

console.log(`Found ${vocabularies.length} vocabularies to import`);

// Import to database
async function importVocabularies() {
  const connection = await mysql.createConnection(config);

  try {
    // Clear existing data
    await connection.query('DELETE FROM admin_vocabulary');

    // Insert vocabularies in batches
    const batchSize = 100;
    for (let i = 0; i < vocabularies.length; i += batchSize) {
      const batch = vocabularies.slice(i, i + batchSize);
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?)').join(',');
      const values = batch.flatMap(v => [v.id, v.unit, v.page, v.english, v.deutsch]);

      await connection.query(
        `INSERT INTO admin_vocabulary (id, unit, page, english, deutsch) VALUES ${placeholders}`,
        values
      );

      console.log(`Imported ${Math.min(i + batchSize, vocabularies.length)}/${vocabularies.length}`);
    }

    console.log('✓ All vocabularies imported successfully!');
  } catch (error) {
    console.error('Error importing vocabularies:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

importVocabularies().catch(err => {
  console.error(err);
  process.exit(1);
});
