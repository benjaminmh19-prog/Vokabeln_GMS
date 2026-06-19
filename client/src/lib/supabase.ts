import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://usggiiignsmimkplidfv.supabase.co'
const supabaseAnonKey = 'sb_publishable_xBhx3E644ygD-drRJtKzwA_imyvzVZR'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Player {
  id: string
  name: string
  created_at: string
  updated_at: string
  total_score: number
  games_played: number
  best_score: number
}

export interface GameResult {
  id: string
  player_id: string
  score: number
  level: number
  direction: string
  unit_id: string
  errors: number
  combo: number
  time_taken: number
  created_at: string
}

export interface ErrorWord {
  id: string
  player_id: string
  word: string
  error_count: number
  last_error: string
}
