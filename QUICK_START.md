# Vokabel-Champion - Schnellstart-Anleitung

## 🎮 Spielen Sie Vokabel-Champion - Online oder Offline

Diese Anleitung zeigt Ihnen, wie Sie das Spiel in wenigen Minuten starten können.

---

## 🌐 Option 1: Online spielen (Empfohlen)

### Schritt 1: Öffnen Sie die Website
Gehen Sie zu: **https://vokabelgame-zybnmmvu.manus.space**

### Schritt 2: Registrieren oder Anmelden
- **Neu?** Klicken Sie auf **"REGISTRIEREN"** und erstellen Sie einen Account
- **Bereits registriert?** Klicken Sie auf **"ANMELDEN"**

### Schritt 3: Spieler auswählen oder erstellen
- Wählen Sie einen bestehenden Spieler oder erstellen Sie einen neuen
- Klicken Sie auf **"SPIELEN"**

### Schritt 4: Collection auswählen
- Wählen Sie eine Vokabel-Sammlung (z.B. "Englisch Lernjahr 1")
- Klicken Sie auf die Collection

### Schritt 5: Spielen!
- Wählen Sie Schwierigkeitsstufe (Level 1-3)
- Klicken Sie auf **"SPIELEN STARTEN"**
- Viel Spaß! 🎉

---

## 💾 Option 2: Lokal spielen (Offline)

### Schritt 1: Projekt exportieren
Öffnen Sie die Kommandozeile/Terminal und führen Sie aus:

```bash
cd /home/ubuntu/vokabel-champion
zip -r vokabel-champion-app.zip dist/public/
```

Die Datei `vokabel-champion-app.zip` wird erstellt (~1-2 MB).

### Schritt 2: ZIP-Datei speichern
- Speichern Sie `vokabel-champion-app.zip` auf Ihrem Computer
- Entpacken Sie die Datei in einen Ordner (z.B. `vokabel-champion`)

### Schritt 3: Lokalen Server starten

**Windows (PowerShell):**
```powershell
cd vokabel-champion/dist/public
python -m http.server 8000
```

**Mac/Linux:**
```bash
cd vokabel-champion/dist/public
python3 -m http.server 8000
```

**Alternative (mit Node.js):**
```bash
cd vokabel-champion/dist/public
npx http-server . -p 8000
```

### Schritt 4: Im Browser öffnen
Öffnen Sie: **http://localhost:8000**

### Schritt 5: Offline spielen
- Sie können jetzt offline spielen
- Alle Daten werden lokal gespeichert
- Wenn Sie online gehen, synchronisiert sich alles automatisch

---

## 📱 Option 3: Als App installieren (PWA)

### Desktop (Chrome/Edge)
1. Öffnen Sie die Website (online oder lokal)
2. Klicken Sie auf das **Install-Symbol** (oben rechts)
3. Bestätigen Sie die Installation
4. Die App wird auf Ihrem Desktop installiert

### Mobile (Android)
1. Öffnen Sie die Website im Chrome-Browser
2. Tippen Sie auf das **Menü** (drei Punkte)
3. Wählen Sie **"Zum Startbildschirm hinzufügen"**
4. Die App wird auf Ihrem Startbildschirm angeheftet

### iOS (iPhone/iPad)
1. Öffnen Sie die Website in Safari
2. Tippen Sie auf **Teilen**
3. Wählen Sie **"Zum Startbildschirm"**
4. Die App wird auf Ihrem Startbildschirm angeheftet

---

## 🎯 Erste Schritte im Spiel

### Registrierung
```
1. Geben Sie einen Benutzernamen ein
2. Geben Sie Ihr Passwort ein
3. Bestätigen Sie das Passwort
4. Klicken Sie "REGISTRIEREN"
```

### Spieler erstellen
```
1. Geben Sie einen Spielernamen ein
2. Wählen Sie eine Farbe (optional)
3. Klicken Sie "SPIELER ERSTELLEN"
```

### Spiel starten
```
1. Wählen Sie eine Collection
2. Wählen Sie ein Level (1-3)
3. Wählen Sie eine Unit/Kapitel
4. Klicken Sie "SPIELEN STARTEN"
```

---

## 🎮 Spielmodi

### Level 1: Multiple Choice
- Wählen Sie die richtige Übersetzung aus 4 Optionen
- Schnell und einfach
- Ideal für Anfänger

### Level 2: Hangman
- Erraten Sie das Wort Buchstabe für Buchstabe
- Mittlerer Schwierigkeitsgrad
- Trainiert Rechtschreibung

### Level 3: Free Typing
- Tippen Sie die Übersetzung selbst ein
- Schwierigster Modus
- Beste Trainingsmethode

---

## 📊 Profil & Statistiken

### Profil anschauen
1. Klicken Sie auf **"PROFIL"** im Menü
2. Sehen Sie Ihre Statistiken:
   - Best Score (Höchstpunkte)
   - Total Score (Gesamtpunkte)
   - Spiele gespielt
   - Erfolgsabzeichen

### Leaderboard anschauen
1. Klicken Sie auf **"RANKING"** im Menü
2. Sehen Sie die Top 50 Spieler
3. Vergleichen Sie Ihre Position

---

## 🔧 Einstellungen

### Audio-Einstellungen
1. Öffnen Sie Ihr **Profil**
2. Scrollen Sie zu **"Audio-Einstellungen"**
3. Passen Sie an:
   - Sound-Effekte (an/aus)
   - Lautstärke
   - Text-to-Speech (an/aus)

### Logout
1. Klicken Sie auf **"LOGOUT"** im Spiel-Header
2. Sie werden zur Startseite zurückgeleitet

---

## 🌍 Online vs. Offline

| Feature | Online | Offline |
|---------|--------|---------|
| Spielen | ✅ | ✅ |
| Statistiken speichern | ✅ | ✅ (lokal) |
| Leaderboard | ✅ | ❌ |
| Multi-Player | ✅ | ❌ |
| Admin-Panel | ✅ | ❌ |
| Datenbank-Sync | ✅ | ⏳ (wenn online) |

---

## ⚙️ Troubleshooting

### Problem: App lädt nicht
**Lösung:**
1. Leeren Sie den Browser-Cache (Strg+Shift+Entf)
2. Laden Sie die Seite neu (F5)
3. Versuchen Sie einen anderen Browser

### Problem: Offline-Modus funktioniert nicht
**Lösung:**
1. Öffnen Sie die Browser-Konsole (F12)
2. Suchen Sie nach Fehlern
3. Versuchen Sie, den Service Worker zu deaktivieren und neu zu laden

### Problem: Daten werden nicht synchronisiert
**Lösung:**
1. Überprüfen Sie Ihre Internetverbindung
2. Melden Sie sich ab und wieder an
3. Leeren Sie den Cache

### Problem: Audio funktioniert nicht
**Lösung:**
1. Überprüfen Sie die Audio-Einstellungen (Profil)
2. Überprüfen Sie die Lautstärke Ihres Geräts
3. Versuchen Sie einen anderen Browser

---

## 💡 Tipps & Tricks

### Schneller spielen
- Verwenden Sie die Tastatur statt der Maus
- Drücken Sie Enter zum Absenden
- Verwenden Sie die Pfeiltasten zur Navigation

### Bessere Ergebnisse
- Spielen Sie regelmäßig
- Versuchen Sie höhere Level
- Nutzen Sie Text-to-Speech zum Lernen der Aussprache

### Offline-Tipps
- Spielen Sie offline, um Daten zu sparen
- Synchronisieren Sie regelmäßig online
- Sichern Sie Ihre Daten regelmäßig

---

## 📞 Support

### Häufig gestellte Fragen

**F: Kann ich mein Passwort ändern?**
A: Ja, kontaktieren Sie den Administrator oder melden Sie sich ab und neu an.

**F: Kann ich mehrere Spieler haben?**
A: Ja, Sie können mehrere Spieler pro Account erstellen.

**F: Wie lange werden meine Daten gespeichert?**
A: Unbegrenzt, solange Sie den Account nicht löschen.

**F: Kann ich meine Daten exportieren?**
A: Ja, öffnen Sie die Browser-Konsole und führen Sie aus:
```javascript
console.log(localStorage);
```

---

## 🚀 Los geht's!

### Schnellstart (30 Sekunden)
1. Gehen Sie zu: https://vokabelgame-zybnmmvu.manus.space
2. Klicken Sie "REGISTRIEREN"
3. Erstellen Sie einen Spieler
4. Klicken Sie "SPIELEN STARTEN"
5. Viel Spaß! 🎉

---

**Viel Erfolg beim Lernen mit Vokabel-Champion! 🏆**

*Fragen? Öffnen Sie die Browser-Konsole (F12) und suchen Sie nach Fehlern, oder kontaktieren Sie den Support.*
