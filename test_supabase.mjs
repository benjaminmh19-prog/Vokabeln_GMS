import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://usggiiignsmimkplidfv.supabase.co'
const supabaseAnonKey = 'sb_publishable_xBhx3E644ygD-drRJtKzwA_imyvzVZR'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

try {
  const { data, error } = await supabase
    .from('players')
    .select('count', { count: 'exact', head: true })

  if (error) {
    console.log('Connection test - Table does not exist yet (expected)')
    console.log('Error:', error.message)
  } else {
    console.log('✓ Connection successful!')
  }
} catch (err) {
  console.error('Connection failed:', err.message)
}
