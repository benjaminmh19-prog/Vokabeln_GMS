# Collections-System Setup

Dieses Dokument beschreibt, wie Sie die Collections-Tabelle in Supabase einrichten.

## Schritt 1: Supabase SQL Editor öffnen

1. Gehen Sie zu Ihrem Supabase-Projekt
2. Klicken Sie auf "SQL Editor" in der linken Seitenleiste
3. Klicken Sie auf "+ New Query"

## Schritt 2: SQL-Befehle ausführen

Kopieren Sie den folgenden SQL-Code und führen Sie ihn aus:

```sql
-- Erstelle die collections Tabelle
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  year VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Füge collection_id Spalte zur admin_vocabulary Tabelle hinzu
ALTER TABLE admin_vocabulary 
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE CASCADE;

-- Erstelle einen Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_admin_vocabulary_collection_id 
ON admin_vocabulary(collection_id);
```

## Schritt 3: RLS-Richtlinien (optional aber empfohlen)

Für bessere Sicherheit können Sie Row Level Security (RLS) aktivieren:

```sql
-- Aktiviere RLS für collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Erstelle eine Richtlinie, die allen Benutzern Lesezugriff ermöglicht
CREATE POLICY "Allow public read" ON collections
  FOR SELECT USING (true);

-- Aktiviere RLS für admin_vocabulary
ALTER TABLE admin_vocabulary ENABLE ROW LEVEL SECURITY;

-- Erstelle eine Richtlinie für admin_vocabulary
CREATE POLICY "Allow public read" ON admin_vocabulary
  FOR SELECT USING (true);
```

## Schritt 4: Überprüfung

Nach der Ausführung sollten Sie folgende Tabellen sehen:
- `collections` (neue Tabelle)
- `admin_vocabulary` (mit neuer `collection_id` Spalte)

## Verwendung

Die Collections sind jetzt einsatzbereit:

1. **Admin-Panel**: Gehen Sie zum Admin-Panel und erstellen Sie neue Collections
2. **Import**: Beim Import können Sie eine Collection auswählen
3. **Export**: Beim Export können Sie eine Collection auswählen
4. **Spieler**: Spieler können beim Start eine Collection auswählen

## Fehlerbehebung

Wenn Sie Fehler erhalten:
- Überprüfen Sie, dass die `admin_vocabulary` Tabelle existiert
- Überprüfen Sie, dass Sie Admin-Rechte haben
- Versuchen Sie, die Tabelle manuell zu löschen und neu zu erstellen
