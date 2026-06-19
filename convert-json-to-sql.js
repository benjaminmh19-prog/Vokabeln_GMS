const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const vocabJson = JSON.parse(fs.readFileSync('./client/src/data/vocabulary.json', 'utf-8'));

let sqlStatements = [];

for (const [unit, pages] of Object.entries(vocabJson)) {
  for (const [page, vocabs] of Object.entries(pages)) {
    for (const vocab of vocabs) {
      const id = uuidv4();
      const english = vocab.english.replace(/'/g, "\\'");
      const deutsch = vocab.deutsch.replace(/'/g, "\\'");
      
      const sql = `INSERT INTO admin_vocabulary (id, unit, page, english, deutsch, collection_id) VALUES ('${id}', '${unit}', '${page}', '${english}', '${deutsch}', 'collection-1');`;
      sqlStatements.push(sql);
    }
  }
}

// Write in batches
const batchSize = 100;
for (let i = 0; i < sqlStatements.length; i += batchSize) {
  const batch = sqlStatements.slice(i, i + batchSize);
  const filename = `batch_${Math.floor(i / batchSize)}.sql`;
  fs.writeFileSync(filename, batch.join('\n'));
  console.log(`Created ${filename} with ${batch.length} statements`);
}

console.log(`\n✅ Total: ${sqlStatements.length} SQL statements in ${Math.ceil(sqlStatements.length / batchSize)} batches`);
