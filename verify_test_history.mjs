import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usggiiignsmimkplidfv.supabase.co';
const supabaseKey = 'sb_publishable_xBhx3E644ygD-drRJtKzwA_imyvzVZR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const { data, error, count } = await supabase
    .from('test_history')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log('✓ test_history table exists!');
  console.log(`✓ Total records: ${count}`);
  return true;
}

verify();
