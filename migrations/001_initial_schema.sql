-- ============================================================================
-- VOKABEL-CHAMPION DATABASE MIGRATIONS
-- Führe diese Befehle in deiner Supabase PostgreSQL Datenbank aus
-- SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql/new
-- ============================================================================

-- 1. ENUMS erstellen
CREATE TYPE role AS ENUM ('user', 'admin');
CREATE TYPE status AS ENUM ('waiting', 'in_progress', 'completed');

-- 2. USERS TABLE (OAuth/Manus)
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role role DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  lastSignedIn TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_openId ON public.users(openId);

-- 3. PLAYERS TABLE (Spieler mit Scores)
CREATE TABLE IF NOT EXISTS public.players (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT,
  total_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_players_username ON public.players(username);

-- 4. COLLECTIONS TABLE (Vokabelsammlungen)
CREATE TABLE IF NOT EXISTS public.collections (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  learning_year INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_collections_learning_year ON public.collections(learning_year);

-- 5. ADMIN_VOCABULARY TABLE (Vokabeln)
CREATE TABLE IF NOT EXISTS public.admin_vocabulary (
  id VARCHAR(36) PRIMARY KEY,
  collection_id VARCHAR(36) NOT NULL,
  unit VARCHAR(255) NOT NULL,
  page VARCHAR(255) NOT NULL,
  english TEXT NOT NULL,
  deutsch TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_vocabulary_collection_id ON public.admin_vocabulary(collection_id);
CREATE INDEX idx_admin_vocabulary_unit ON public.admin_vocabulary(unit);

-- 6. MULTIPLAYER_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.multiplayer_sessions (
  id VARCHAR(36) PRIMARY KEY,
  host_id VARCHAR(36) NOT NULL,
  session_code VARCHAR(8) NOT NULL UNIQUE,
  collection_id VARCHAR(36) NOT NULL,
  units TEXT NOT NULL,
  pages TEXT NOT NULL,
  level INTEGER NOT NULL,
  direction VARCHAR(10) NOT NULL,
  status status DEFAULT 'waiting' NOT NULL,
  max_players INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (host_id) REFERENCES public.players(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE
);

CREATE INDEX idx_multiplayer_sessions_code ON public.multiplayer_sessions(session_code);
CREATE INDEX idx_multiplayer_sessions_status ON public.multiplayer_sessions(status);

-- 7. SESSION_PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.session_participants (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  player_id VARCHAR(36) NOT NULL,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (session_id) REFERENCES public.multiplayer_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE
);

CREATE INDEX idx_session_participants_session_id ON public.session_participants(session_id);
CREATE INDEX idx_session_participants_player_id ON public.session_participants(player_id);

-- ============================================================================
-- SAMPLE DATA (Optional - entfernen falls nicht benötigt)
-- ============================================================================

-- Example Collections
INSERT INTO public.collections (id, name, learning_year, description)
VALUES 
  ('col-001', 'Englisch Klasse 5', 1, 'Englisch Vokabeln für 5. Klasse'),
  ('col-002', 'Englisch Klasse 6', 2, 'Englisch Vokabeln für 6. Klasse')
ON CONFLICT DO NOTHING;

-- Example Vocabulary
INSERT INTO public.admin_vocabulary (id, collection_id, unit, page, english, deutsch)
VALUES 
  ('vocab-001', 'col-001', 'Unit 1', '10', 'hello', 'hallo'),
  ('vocab-002', 'col-001', 'Unit 1', '10', 'goodbye', 'auf wiedersehen'),
  ('vocab-003', 'col-001', 'Unit 1', '11', 'please', 'bitte'),
  ('vocab-004', 'col-001', 'Unit 1', '11', 'thank you', 'danke')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS (Optional für RLS)
-- Uncomment falls Sicherheit wichtig ist
-- ============================================================================
/*
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
*/

-- ============================================================================
-- VERIFY (Kontroll-Query - sollte alle Tabellen zeigen)
-- ============================================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
