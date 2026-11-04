-- Beispielsätze zu Vokabeln für "Sätze bilden" und den Satz-Vokabeltest.
-- Im Supabase SQL-Editor ausführen. Danach Sätze mit scripts/import-sentences.ts importieren.
CREATE TABLE IF NOT EXISTS vocab_sentences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vocabulary_id TEXT NOT NULL,
  sentence_en TEXT NOT NULL,
  sentence_de TEXT NOT NULL,
  -- weitere richtige englische Fassungen (z. B. andere Wortstellung), optional
  alt_en TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ein Satz pro Vokabel nur einmal; erlaubt gefahrloses erneutes Importieren
CREATE UNIQUE INDEX IF NOT EXISTS uq_vocab_sentences_vocab_sentence
  ON vocab_sentences (vocabulary_id, sentence_en);
CREATE INDEX IF NOT EXISTS idx_vocab_sentences_vocab ON vocab_sentences (vocabulary_id);

-- Lesen für alle (die App liest über den Server), Schreiben nur mit Datenbank-Zugang
ALTER TABLE vocab_sentences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read vocab_sentences" ON vocab_sentences;
CREATE POLICY "Allow read vocab_sentences" ON vocab_sentences
  FOR SELECT USING (true);
