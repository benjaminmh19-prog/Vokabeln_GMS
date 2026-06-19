import { createClient } from '@supabase/supabase-js';
import vocabularyData from './client/src/data/vocabulary.json' assert { type: 'json' };

const supabaseUrl = 'https://usggiiignsmimkplidfv.supabase.co';
const supabaseKey = 'sb_publishable_xBhx3E644ygD-drRJtKzwA_imyvzVZR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFlow() {
  console.log('=== TESTING VOCABULARY LOADING ===\n');

  // 1. Load from JSON
  console.log('1. Loading from vocabulary.json...');
  let jsonCount = 0;
  Object.entries(vocabularyData).forEach(([unitName, pages]) => {
    Object.entries(pages).forEach(([pageNum, words]) => {
      jsonCount += words.length;
    });
  });
  console.log(`   ✓ Loaded ${jsonCount} items from JSON\n`);

  // 2. Load from Supabase
  console.log('2. Loading from Supabase admin_vocabulary...');
  const { data: supabaseVocab, error: vocabError } = await supabase
    .from('admin_vocabulary')
    .select('*');

  if (vocabError) {
    console.error('   ❌ Error:', vocabError.message);
    return;
  }

  console.log(`   ✓ Loaded ${supabaseVocab?.length || 0} items from Supabase\n`);

  // 3. Check players table
  console.log('3. Checking players table...');
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('*', { count: 'exact' });

  if (playersError) {
    console.error('   ❌ Error:', playersError.message);
    return;
  }

  console.log(`   ✓ Players table exists (${players?.length || 0} players)\n`);

  // 4. Summary
  console.log('=== SUMMARY ===');
  console.log(`Total vocabulary available: ${jsonCount + (supabaseVocab?.length || 0)}`);
  console.log(`✓ All systems ready for test generation!`);
}

testFlow();
