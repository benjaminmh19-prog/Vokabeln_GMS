import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const DATA_DIR = path.resolve(process.cwd(), "server/data");

// Initialize Supabase client
const supabaseUrl = 'https://usggiiignsmimkplidfv.supabase.co';
const supabaseKey = 'sb_publishable_xBhx3E644ygD-drRJtKzwA_imyvzVZR';

const supabase = createClient(supabaseUrl, supabaseKey);

// Load vocabulary from JSON
const vocabularyPath = path.join(__dirname, 'client/src/data/vocabulary.json');
const vocabularyData = JSON.parse(fs.readFileSync(vocabularyPath, 'utf-8'));

// Convert nested JSON structure to flat array
function loadVocabularyFromJSON() {
  const allVocabulary = [];
  let globalIndex = 0;

  Object.entries(vocabularyData).forEach(([unitName, pages]) => {
    Object.entries(pages).forEach(([pageNum, words]) => {
      words.forEach((word) => {
        allVocabulary.push({
          unit: unitName,
          page: pageNum,
          english: word.english,
          deutsch: word.deutsch,
        });
        globalIndex++;
      });
    });
  });

  return allVocabulary;
}

async function importVocabulary() {
  try {
    console.log('📚 Loading vocabulary from JSON...');
    const vocabulary = loadVocabularyFromJSON();
    console.log(`✅ Loaded ${vocabulary.length} vocabulary entries`);

    // Check existing vocabulary
    console.log('\n🔍 Checking existing vocabulary in database...');
    const { data: existingVocab, error: fetchError } = await supabase
      .from('admin_vocabulary')
      .select('id', { count: 'exact' });

    if (fetchError) {
      console.error('❌ Error fetching existing vocabulary:', fetchError);
      process.exit(1);
    }

    const existingCount = existingVocab?.length || 0;
    console.log(`📊 Found ${existingCount} existing entries in database`);

    if (existingCount > 0) {
      console.log('\n⚠️  Database already has vocabulary. Clearing old data...');
      const { error: deleteError } = await supabase
        .from('admin_vocabulary')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        console.error('❌ Error clearing old data:', deleteError);
        process.exit(1);
      }
      console.log('✅ Old data cleared');
    }

    // Import in batches to avoid overwhelming the API
    console.log('\n📤 Importing vocabulary to database...');
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < vocabulary.length; i += batchSize) {
      const batch = vocabulary.slice(i, i + batchSize);
      const { error, data } = await supabase
        .from('admin_vocabulary')
        .insert(batch);

      if (error) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        const progress = Math.min(i + batchSize, vocabulary.length);
        console.log(`✅ Progress: ${progress}/${vocabulary.length} entries imported`);
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n🎉 Import complete!');
    console.log(`✅ Successfully imported: ${successCount} entries`);
    if (errorCount > 0) {
      console.log(`❌ Failed to import: ${errorCount} entries`);
    }

    // Verify final count
    const { data: finalVocab, error: finalError } = await supabase
      .from('admin_vocabulary')
      .select('id', { count: 'exact' });

    if (!finalError) {
      console.log(`\n📊 Final database count: ${finalVocab?.length || 0} entries`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the import
importVocabulary();
