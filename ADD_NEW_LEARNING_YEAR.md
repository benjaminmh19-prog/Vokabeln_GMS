# 📚 Anleitung: Neues Lernjahr hinzufügen

Diese Anleitung erklärt, wie Sie ein neues Lernjahr (z.B. "Englisch Lernjahr 2") zu Vokabel-Champion hinzufügen.

---

## 🎯 Überblick der Struktur

Das Spiel verwendet ein **Collection-System**:

```
Spieler wählt Collection (Lernjahr)
         ↓
    Wählt Unit (Kapitel)
         ↓
    Wählt Level (Schwierigkeit)
         ↓
    Spielt Spiel
```

---

## 📋 Schritt 1: Collection in Supabase erstellen

### Option A: Über Supabase Dashboard (empfohlen)

1. Öffnen Sie Ihr **Supabase-Projekt**
2. Gehen Sie zu **SQL Editor**
3. Führen Sie diesen SQL-Befehl aus:

```sql
INSERT INTO collections (name, description, year, created_at)
VALUES (
  'Englisch Lernjahr 2',
  'Vokabeln für das zweite Englischlernj ahr',
  2,
  NOW()
);
```

4. Notieren Sie sich die **collection_id** (wird automatisch generiert)

### Option B: Über Admin-Panel (im Spiel)

1. Melden Sie sich als Admin an
2. Gehen Sie zum **Admin-Panel**
3. Klicken Sie auf **"Collections verwalten"**
4. Klicken Sie auf **"Neue Collection"**
5. Füllen Sie aus:
   - Name: `Englisch Lernjahr 2`
   - Beschreibung: `Vokabeln für das zweite Englischlernj ahr`
   - Jahr: `2`
6. Klicken Sie **"Speichern"**

---

## 📝 Schritt 2: Vokabeln importieren

### Option A: CSV-Import (empfohlen)

1. Bereiten Sie eine CSV-Datei vor mit diesem Format:

```csv
"Unit 1","12","school","die Schule"
"Unit 1","12","life","das Leben"
"Unit 1","13","tutor","der Klassenlehrer"
"Unit 2","14","book","das Buch"
```

**Format-Erklärung:**
- Spalte 1: Unit-Name (z.B. "Unit 1", "Unit 2")
- Spalte 2: Seite (z.B. "12", "13", "14")
- Spalte 3: Englisches Wort
- Spalte 4: Deutsche Übersetzung (mehrere Bedeutungen mit `;` oder `,` trennen)

**Beispiel mit mehreren Bedeutungen:**
```csv
"Unit 1","12","to go","gehen; fahren; laufen"
"Unit 1","12","year","die Klasse; die Jahrgangsstufe; das Jahr"
```

2. Melden Sie sich als Admin an
3. Gehen Sie zum **Admin-Panel**
4. Klicken Sie auf **"Vokabeln importieren"**
5. Wählen Sie die CSV-Datei aus
6. Wählen Sie die **Collection** aus (z.B. "Englisch Lernjahr 2")
7. Klicken Sie **"Importieren"**

### Option B: Manuell hinzufügen

1. Melden Sie sich als Admin an
2. Gehen Sie zum **Admin-Panel**
3. Klicken Sie auf **"Neue Vokabel"**
4. Füllen Sie aus:
   - Collection: `Englisch Lernjahr 2`
   - Unit: `Unit 1`
   - Seite: `12`
   - Englisch: `school`
   - Deutsch: `die Schule`
5. Klicken Sie **"Speichern"**
6. Wiederholen Sie für alle Vokabeln

---

## 🔄 Schritt 3: Vokabeln überprüfen

1. Melden Sie sich als Spieler an
2. Gehen Sie zu **"Vokabel-Sammlung"**
3. Wählen Sie **"Englisch Lernjahr 2"**
4. Überprüfen Sie, dass alle Units und Vokabeln angezeigt werden
5. Spielen Sie ein kurzes Testspiel, um zu überprüfen, dass alles funktioniert

---

## 📊 Datenbank-Struktur (für Entwickler)

### Collections-Tabelle

```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  year INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Vocabularies-Tabelle

```sql
CREATE TABLE vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  unit VARCHAR(50) NOT NULL,
  page VARCHAR(50) NOT NULL,
  english VARCHAR(255) NOT NULL,
  deutsch VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎮 Beispiel: Englisch Lernjahr 2 erstellen

### Schritt 1: Collection erstellen

```sql
INSERT INTO collections (name, description, year, created_at)
VALUES ('Englisch Lernjahr 2', 'Vokabeln für das zweite Englischlernj ahr', 2, NOW());
```

### Schritt 2: Vokabeln importieren

Erstellen Sie eine Datei `lernjahr2.csv`:

```csv
"Unit 1","20","friend","der Freund; die Freundin"
"Unit 1","20","family","die Familie"
"Unit 1","21","mother","die Mutter"
"Unit 1","21","father","der Vater"
"Unit 2","22","house","das Haus"
"Unit 2","22","room","das Zimmer"
"Unit 2","23","kitchen","die Küche"
"Unit 2","23","bedroom","das Schlafzimmer"
```

### Schritt 3: Im Admin-Panel importieren

1. Melden Sie sich als Admin an
2. Klicken Sie auf **"Vokabeln importieren"**
3. Wählen Sie `lernjahr2.csv`
4. Wählen Sie **"Englisch Lernjahr 2"**
5. Klicken Sie **"Importieren"**

---

## ✅ Checkliste

- [ ] Collection in Supabase erstellt
- [ ] Collection-Name: `Englisch Lernjahr 2`
- [ ] CSV-Datei mit Vokabeln vorbereitet
- [ ] Vokabeln importiert
- [ ] Als Spieler überprüft, dass Collection sichtbar ist
- [ ] Testspiel gespielt
- [ ] Alle Units und Seiten vorhanden

---

## 🆘 Häufige Probleme

### Problem: Collection wird nicht angezeigt

**Lösung:**
1. Überprüfen Sie, dass die Collection in der Supabase-Tabelle `collections` existiert
2. Laden Sie die Seite neu (F5)
3. Melden Sie sich ab und wieder an

### Problem: Vokabeln werden nicht importiert

**Lösung:**
1. Überprüfen Sie das CSV-Format (4 Spalten, gequotet)
2. Überprüfen Sie, dass die Collection ausgewählt ist
3. Überprüfen Sie die Fehlermeldung im Admin-Panel

### Problem: Vokabeln werden doppelt angezeigt

**Lösung:**
1. Überprüfen Sie, dass die Vokabeln nicht bereits in der Collection existieren
2. Löschen Sie die Duplikate im Admin-Panel
3. Importieren Sie erneut

---

## 📞 Support

Wenn Sie Probleme haben, überprüfen Sie:
1. **Supabase-Verbindung**: Ist Supabase erreichbar?
2. **CSV-Format**: Sind alle 4 Spalten vorhanden und gequotet?
3. **Collection-ID**: Wurde die Collection korrekt erstellt?
4. **Browser-Cache**: Löschen Sie den Cache (Ctrl+Shift+Del)

---

**Viel Erfolg beim Hinzufügen neuer Lernjahre! 🎉**
