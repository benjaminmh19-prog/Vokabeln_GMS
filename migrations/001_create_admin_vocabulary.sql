-- Create admin_vocabulary table for storing imported vocabulary lists
CREATE TABLE IF NOT EXISTS admin_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit TEXT NOT NULL,
  page TEXT NOT NULL,
  english TEXT NOT NULL,
  deutsch TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_vocabulary_unit ON admin_vocabulary(unit);
CREATE INDEX IF NOT EXISTS idx_admin_vocabulary_page ON admin_vocabulary(unit, page);

-- Create admin_settings table for storing admin password hash and settings
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) for admin_vocabulary
ALTER TABLE admin_vocabulary ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read admin vocabulary
CREATE POLICY "Allow read admin_vocabulary" ON admin_vocabulary
  FOR SELECT USING (true);

-- Create policy to allow only admin to insert/update/delete
-- Note: This is a basic policy - in production, implement proper admin authentication
CREATE POLICY "Allow admin operations" ON admin_vocabulary
  FOR ALL USING (true);

-- Enable RLS for admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_settings
CREATE POLICY "Allow read admin_settings" ON admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow admin settings operations" ON admin_settings
  FOR ALL USING (true);
