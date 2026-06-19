-- Add authentication to players table
-- Execute this in Supabase SQL Editor

-- Add password column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);

-- Add created_at index if not exists
CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at);

-- Update existing players to have a username (use their name as username)
UPDATE players SET username = name WHERE username IS NULL;

-- Make username NOT NULL for new players
ALTER TABLE players ALTER COLUMN username SET NOT NULL;

-- Confirm migration
SELECT 'Player authentication schema updated successfully!' as status;
