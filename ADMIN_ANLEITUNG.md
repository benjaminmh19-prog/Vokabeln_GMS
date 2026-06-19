# Admin-Anleitung - Vokabel-Champion

## Inhaltsverzeichnis

1. [Admin-Panel Zugriff](#admin-panel-zugriff)
2. [Vokabellisten verwalten](#vokabellisten-verwalten)
3. [Spieler verwalten](#spieler-verwalten)
4. [Häufig gestellte Fragen](#häufig-gestellte-fragen)

---

## Admin-Panel Zugriff

### Anmeldung

Es gibt drei Wege, um zum Admin-Panel zu gelangen:

#### 1. Direkte URL
```
https://your-domain.com/admin
```

#### 2. Über das Menü
1. Gehe zur Startseite
2. Klicke auf den **ADMIN** Button am unteren Ende des Menüs

#### 3. Tastaturkürzel
Drücke **Ctrl+Shift+A** auf jeder Seite, um direkt zum Admin-Panel zu springen

### Passwort

**Standard-Passwort:** `admin123`

⚠️ **WICHTIG:** Ändere das Passwort sofort nach der ersten Anmeldung!

Um das Passwort zu ändern:
1. Öffne die Browser-Konsole (F12)
2. Führe folgenden Befehl aus:
   ```javascript
   localStorage.setItem('adminPassword', 'dein-neues-passwort');
   ```
3. Melde dich ab und wieder an

---

## Vokabellisten verwalten

### Neue Vokabelliste importieren

#### Schritt 1: CSV-Datei vorbereiten

Erstelle eine CSV-Datei mit folgender Struktur:

```csv
Unit,Page,English,Deutsch
Unit 1,1,hello,Hallo
Unit 1,1,goodbye,Auf Wiedersehen
Unit 1,2,thank you,Danke
Unit 2,1,apple,Apfel
Unit 2,1,banana,Banane
Unit 2,2,water,Wasser
```

**Erforderliche Spalten:**
- **Unit**: Einheitenname (z.B. "Unit 1", "Lektion 2")
- **Page**: Seitennummer (z.B. "1", "2", "3")
- **English**: Englisches Wort oder Phrase
- **Deutsch**: Deutsche Übersetzung (ein Wort bevorzugt)

**Tipps:**
- Verwende Kommas als Trennzeichen
- Keine leeren Zeilen
- Keine Sonderzeichen in Unit/Page
- Deutsche Übersetzungen sollten nur das erste Wort sein (vor Kommas)

#### Schritt 2: CSV hochladen

1. Melde dich im Admin-Panel an
2. Klicke auf **CSV DATEI WÄHLEN**
3. Wähle deine CSV-Datei aus

#### Schritt 3: Import-Vorschau überprüfen

Ein Dialog zeigt alle Einträge zum Überprüfen:

- **Bearbeiten**: Klicke auf ein Feld, um es zu ändern
- **Löschen**: Klicke auf das Papierkorb-Icon, um einen Eintrag zu entfernen
- **Importieren**: Klicke auf **IMPORTIEREN**, um alle Einträge zu speichern

#### Schritt 4: Bestätigung

Nach erfolgreichem Import siehst du eine Bestätigungsmeldung mit der Anzahl importierter Vokabeln.

### Vokabellisten exportieren

1. Melde dich im Admin-Panel an
2. Klicke auf **EXPORTIEREN**
3. Eine CSV-Datei wird heruntergeladen (Format: `vocabulary_YYYY-MM-DD.csv`)

### Vokabeln bearbeiten

#### Vokabeln anzeigen

1. Melde dich im Admin-Panel an
2. Klicke auf **VOKABELN ANZEIGEN**
3. Eine Tabelle mit allen Vokabeln wird angezeigt

#### Einzelne Vokabel bearbeiten

1. Klicke auf das **Bearbeiten-Icon** (Stift) in der Zeile
2. Ändere die gewünschten Felder:
   - Unit
   - Page
   - English
   - Deutsch
3. Klicke auf das **Speichern-Icon** (Haken) zum Speichern
4. Oder klicke auf das **Abbrechen-Icon** (X) zum Verwerfen

#### Vokabel löschen

1. Klicke auf das **Löschen-Icon** (Papierkorb) in der Zeile
2. Bestätige die Löschung
3. Die Vokabel wird sofort gelöscht

### CSV-Format Beispiele

#### Einfache Vokabeln
```csv
Unit,Page,English,Deutsch
Unit 1,1,hello,Hallo
Unit 1,1,goodbye,Auf Wiedersehen
```

#### Mit Sonderzeichen
```csv
Unit,Page,English,Deutsch
Unit 1,1,"good morning, how are you?",Guten Morgen
Unit 1,1,"thank you, very much",Danke
```

#### Mehrere Units
```csv
Unit,Page,English,Deutsch
Unit 1,1,apple,Apfel
Unit 1,2,banana,Banane
Unit 2,1,cat,Katze
Unit 2,1,dog,Hund
Unit 2,2,bird,Vogel
```

---

## Spieler verwalten

### Spieler anzeigen

1. Melde dich im Admin-Panel an
2. Klicke auf **SPIELER VERWALTEN**
3. Eine Tabelle mit allen Spielern wird angezeigt

**Spalten:**
- **Spieler**: Name des Spielers
- **Spiele**: Anzahl gespielter Spiele
- **Best Score**: Höchster erreichter Score
- **Total Score**: Gesamtpunkte
- **Erstellt**: Datum der Registrierung

### Spieler löschen

⚠️ **WARNUNG:** Diese Aktion ist nicht rückgängig zu machen!

1. Klicke auf das **Löschen-Icon** (Papierkorb) neben dem Spieler
2. Bestätige die Löschung mit "Ja"
3. Der Spieler und alle seine Daten werden gelöscht:
   - Spielerprofil
   - Alle Spielergebnisse
   - Alle Fehler-Wörter
   - Alle Statistiken

### Spieler-Statistiken

Jeder Spieler hat folgende Statistiken:

- **Spiele**: Wie viele Spiele der Spieler gespielt hat
- **Best Score**: Der höchste Score in einem einzelnen Spiel
- **Total Score**: Die Summe aller Scores
- **Erstellt**: Wann der Spieler registriert wurde

---

## Häufig gestellte Fragen

### F: Wie ändere ich das Admin-Passwort?

**A:** Öffne die Browser-Konsole (F12) und führe aus:
```javascript
localStorage.setItem('adminPassword', 'dein-neues-passwort');
```

### F: Kann ich gelöschte Vokabeln wiederherstellen?

**A:** Nein, gelöschte Vokabeln können nicht wiederhergestellt werden. Exportiere regelmäßig deine Vokabeln als Backup!

### F: Kann ich gelöschte Spieler wiederherstellen?

**A:** Nein, gelöschte Spieler und ihre Daten können nicht wiederhergestellt werden. Sei vorsichtig beim Löschen!

### F: Was passiert, wenn ich einen Spieler lösche?

**A:** Folgende Daten werden gelöscht:
- Das Spielerprofil
- Alle Spielergebnisse
- Alle Fehler-Wörter des Spielers
- Alle Statistiken

### F: Wie viele Vokabeln kann ich importieren?

**A:** Es gibt keine Obergrenze. Du kannst beliebig viele Vokabeln importieren. Empfohlen: Max. 1000 pro Import für beste Performance.

### F: Kann ich CSV-Daten vor dem Import bearbeiten?

**A:** Ja! Der Import-Vorschau-Dialog ermöglicht es dir:
- Einzelne Einträge zu bearbeiten
- Fehlerhafte Einträge zu löschen
- Neue Einträge hinzuzufügen (manuell in der Vorschau)

### F: Was ist das Format der exportierten CSV?

**A:** Die exportierte CSV hat das gleiche Format wie die Import-CSV:
```csv
Unit,Page,English,Deutsch
Unit 1,1,hello,Hallo
...
```

### F: Kann ich Vokabeln in Gruppen löschen?

**A:** Derzeit müssen Vokabeln einzeln gelöscht werden. Exportiere die Vokabeln, bearbeite die CSV-Datei und importiere sie neu.

### F: Wo werden die Daten gespeichert?

**A:** Alle Daten werden in Supabase (PostgreSQL) gespeichert:
- Vokabellisten: `admin_vocabulary` Tabelle
- Spieler: `players` Tabelle
- Spielergebnisse: `game_results` Tabelle
- Fehler-Wörter: `error_words` Tabelle

### F: Wie erstelle ich ein Backup?

**A:** Exportiere regelmäßig deine Vokabellisten:
1. Klicke auf **EXPORTIEREN**
2. Speichere die CSV-Datei an einem sicheren Ort
3. Wiederhole dies wöchentlich

### F: Kann ich mehrere Admin-Konten erstellen?

**A:** Derzeit gibt es nur ein Admin-Konto mit einem gemeinsamen Passwort. Für mehrere Admins müssen die Zugangsdaten geteilt werden.

---

## Sicherheit

### Passwort-Sicherheit

- Verwende ein starkes, eindeutiges Passwort
- Teile das Passwort nicht mit anderen
- Ändere das Passwort regelmäßig
- Verwende HTTPS in der Produktion

### Datensicherheit

- Erstelle regelmäßig Backups (exportiere Vokabeln)
- Lösche Spieler nur, wenn nötig
- Überprüfe Import-Vorschau vor dem Importieren
- Verwende sichere CSV-Dateien aus vertrauenswürdigen Quellen

### Best Practices

1. **Regelmäßige Backups**: Exportiere Vokabeln wöchentlich
2. **Vorsicht beim Löschen**: Bestätige Löschungen doppelt
3. **Passwort schützen**: Teile es nicht mit Schülern
4. **Regelmäßige Überprüfung**: Überprüfe Spieler-Statistiken regelmäßig
5. **Fehler-Tracking**: Nutze die Fehler-Statistiken zur Verbesserung

---

## Technische Informationen

### Supabase-Tabellen

#### admin_vocabulary
```sql
- id: UUID (Primärschlüssel)
- unit: TEXT
- page: TEXT
- english: TEXT
- deutsch: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### players
```sql
- id: UUID (Primärschlüssel)
- name: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- total_score: INTEGER
- games_played: INTEGER
- best_score: INTEGER
```

### API-Funktionen

Verfügbare Admin-Funktionen im Code:

```typescript
// Vokabeln
importVocabulary(data: AdminVocabulary[])
exportVocabulary()
getAllVocabulary()
updateVocabulary(id: string, data: Partial<AdminVocabulary>)
deleteVocabulary(id: string)

// Spieler
getAllPlayers()
deletePlayer(id: string)

// Authentifizierung
adminLogin(password: string)
adminLogout()
```

---

## Support & Kontakt

Bei Fragen oder Problemen:

1. Überprüfe diese Anleitung
2. Schau die Browser-Konsole auf Fehler (F12)
3. Überprüfe die Supabase-Verbindung
4. Kontaktiere den Entwickler

---

## Version

**Admin-System v2.0**
- Vokabel-Bearbeitung
- Import-Vorschau
- Spieler-Verwaltung
- Umfassende Dokumentation

Letzte Aktualisierung: Mai 2026
