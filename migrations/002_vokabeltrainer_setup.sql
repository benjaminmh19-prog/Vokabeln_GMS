-- Vokabeltrainer Database Setup
-- Execute this script in Supabase SQL Editor

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0
);

-- Create game_results table
CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  direction TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  errors INTEGER DEFAULT 0,
  combo INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create error_words table
CREATE TABLE IF NOT EXISTS error_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  error_count INTEGER DEFAULT 1,
  last_error TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_vocabulary table
CREATE TABLE IF NOT EXISTS admin_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit TEXT NOT NULL,
  page TEXT NOT NULL,
  english TEXT NOT NULL,
  deutsch TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_game_results_player_id ON game_results(player_id);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at);
CREATE INDEX IF NOT EXISTS idx_error_words_player_id ON error_words(player_id);
CREATE INDEX IF NOT EXISTS idx_admin_vocabulary_unit_page ON admin_vocabulary(unit, page);

-- Enable Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (allow all for now)
CREATE POLICY "Allow public read" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON players FOR UPDATE USING (true);

CREATE POLICY "Allow public read" ON game_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON game_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read" ON error_words FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON error_words FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON error_words FOR UPDATE USING (true);

CREATE POLICY "Allow public read" ON admin_vocabulary FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON admin_vocabulary FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON admin_vocabulary FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON admin_vocabulary FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON admin_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON admin_settings FOR UPDATE USING (true);

-- Insert default vocabulary
INSERT INTO admin_vocabulary (unit, page, english, deutsch) VALUES
('Unit 1', '1', 'hello', 'Hallo'),
('Unit 1', '1', 'goodbye', 'Auf Wiedersehen'),
('Unit 1', '2', 'thank you', 'Danke'),
('Unit 1', '2', 'please', 'Bitte'),
('Unit 2', '1', 'apple', 'Apfel'),
('Unit 2', '1', 'banana', 'Banane'),
('Unit 2', '2', 'water', 'Wasser'),
('Unit 2', '2', 'bread', 'Brot'),
('Unit 3', '1', 'cat', 'Katze'),
('Unit 3', '1', 'dog', 'Hund'),
('Unit 3', '2', 'bird', 'Vogel'),
('Unit 3', '2', 'fish', 'Fisch')
ON CONFLICT DO NOTHING;

-- Confirm setup
SELECT 'Database setup completed successfully!' as status;
