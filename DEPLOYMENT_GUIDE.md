# Vokabel-Champion - Deployment & Export Guide

## Übersicht

Dieses Projekt ist eine **Hybrid-Lösung**: Es kann lokal gespeichert und gespielt werden, während es trotzdem mit Supabase verbunden bleibt (wenn Internet verfügbar ist).

---

## 1. Lokale Speicherung & Export

### Option A: Als ZIP-Datei exportieren

1. Navigieren Sie zum Projekt-Verzeichnis:
   ```bash
   cd /home/ubuntu/vokabel-champion
   ```

2. Erstellen Sie eine ZIP-Datei mit dem gesamten Projekt:
   ```bash
   zip -r vokabel-champion-standalone.zip dist/ client/public/ package.json
   ```

3. Die ZIP-Datei können Sie dann lokal speichern und später entpacken.

### Option B: Nur die Build-Dateien exportieren (empfohlen)

Das ist die kleinste Variante, die Sie lokal speichern können:

```bash
cd /home/ubuntu/vokabel-champion
zip -r vokabel-champion-app.zip dist/public/
```

Diese ZIP-Datei enthält nur die produktiven Dateien (~1-2 MB).

---

## 2. Lokal spielen (Offline-Modus)

### Schritt 1: ZIP-Datei entpacken
```bash
unzip vokabel-champion-app.zip
cd dist/public
```

### Schritt 2: Lokalen Server starten

**Option A: Mit Python 3**
```bash
python3 -m http.server 8000
```

**Option B: Mit Node.js (http-server)**
```bash
npm install -g http-server
http-server . -p 8000
```

**Option C: Mit PHP**
```bash
php -S localhost:8000
```

### Schritt 3: Im Browser öffnen
Öffnen Sie: `http://localhost:8000`

---

## 3. Supabase-Verbindung konfigurieren

Die Supabase-Verbindung ist bereits konfiguriert. Wenn Sie online sind, funktioniert alles automatisch:

- ✅ Spieler-Authentifizierung
- ✅ Datenbank-Synchronisation
- ✅ Leaderboards
- ✅ Admin-Panel
- ✅ Multi-Player

**Wenn Sie offline sind:**
- ✅ Lokale Spiele spielen
- ✅ Lokale Daten speichern (localStorage)
- ❌ Keine Datenbank-Synchronisation
- ❌ Keine Leaderboards
- ❌ Keine Multi-Player

---

## 4. Progressive Web App (PWA) Installation

Das Projekt ist PWA-ready. Sie können es als App installieren:

### Desktop (Chrome/Edge)
1. Öffnen Sie `http://localhost:8000`
2. Klicken Sie auf das **Install-Symbol** (oben rechts in der Adressleiste)
3. Bestätigen Sie die Installation

### Mobile (Android)
1. Öffnen Sie die App im Chrome-Browser
2. Tippen Sie auf das **Menü** (drei Punkte)
3. Wählen Sie **"Zum Startbildschirm hinzufügen"**

### iOS
1. Öffnen Sie die App in Safari
2. Tippen Sie auf **Teilen**
3. Wählen Sie **"Zum Startbildschirm"**

---

## 5. Offline-Funktionalität

Das Projekt verwendet einen **Service Worker** für Offline-Unterstützung:

- **Cache-Strategie**: Statische Assets werden gecacht
- **Offline-Fallback**: Wenn offline, werden gecachte Daten verwendet
- **Automatische Synchronisation**: Wenn wieder online, werden Daten synchronisiert

### Manuelles Löschen des Caches
```javascript
// In der Browser-Konsole
localStorage.clear();
caches.keys().then(names => names.forEach(name => caches.delete(name)));
```

---

## 6. Datensicherung & Backup

### Lokale Daten exportieren
```javascript
// In der Browser-Konsole
const data = {
  audioSettings: localStorage.getItem('audioSettings'),
  playerData: localStorage.getItem('player_data'),
  gameResults: localStorage.getItem('game_results'),
};
console.log(JSON.stringify(data, null, 2));
```

### Daten importieren
```javascript
// In der Browser-Konsole
const data = { /* Ihre Daten */ };
Object.entries(data).forEach(([key, value]) => {
  localStorage.setItem(key, value);
});
```

---

## 7. Umgebungsvariablen konfigurieren

Falls Sie die Supabase-Verbindung ändern möchten:

1. Bearbeiten Sie `.env` im Projekt-Root:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Bauen Sie das Projekt neu:
   ```bash
   pnpm build
   ```

3. Exportieren Sie die neuen `dist/public/` Dateien

---

## 8. Performance-Tipps

### Schnellerer Start
- Verwenden Sie **Chrome/Edge** (bessere PWA-Unterstützung)
- Installieren Sie die App als PWA (schneller als Browser-Tab)
- Löschen Sie den Browser-Cache regelmäßig

### Bessere Offline-Erfahrung
- Spielen Sie regelmäßig online, damit Daten synchronisiert werden
- Verwenden Sie den Offline-Modus nur für kurze Zeit
- Überprüfen Sie die Internetverbindung vor wichtigen Aktionen

---

## 9. Troubleshooting

### Problem: App lädt nicht
**Lösung:**
1. Löschen Sie den Cache: `Strg+Shift+Entf` (Chrome)
2. Starten Sie den lokalen Server neu
3. Öffnen Sie die App in einem neuen Fenster

### Problem: Daten werden nicht synchronisiert
**Lösung:**
1. Überprüfen Sie die Internetverbindung
2. Öffnen Sie die Browser-Konsole (F12)
3. Suchen Sie nach Fehlern
4. Melden Sie den Fehler mit Screenshots

### Problem: Service Worker funktioniert nicht
**Lösung:**
1. Öffnen Sie `chrome://serviceworker-internals/`
2. Suchen Sie nach "vokabel-champion"
3. Klicken Sie auf "Unregister"
4. Laden Sie die Seite neu

---

## 10. Häufig gestellte Fragen

**F: Kann ich das Spiel komplett offline spielen?**
A: Ja! Sie können offline spielen, aber Leaderboards und Multi-Player funktionieren nicht.

**F: Wie viel Speicherplatz braucht das Projekt?**
A: Die ZIP-Datei ist ca. 1-2 MB. Nach Installation braucht es ca. 50-100 MB (inkl. Cache).

**F: Kann ich meine Daten zwischen Geräten synchronisieren?**
A: Ja, wenn Sie online sind und sich anmelden. Supabase synchronisiert automatisch.

**F: Ist meine Datenbank sicher?**
A: Ja, Supabase verwendet Verschlüsselung und Row-Level Security (RLS).

**F: Kann ich die App auf mehreren Geräten nutzen?**
A: Ja! Installieren Sie die PWA auf mehreren Geräten und melden Sie sich an.

---

## 11. Support & Debugging

Wenn etwas nicht funktioniert:

1. **Öffnen Sie die Browser-Konsole** (F12)
2. **Suchen Sie nach Fehlern** (rote Text)
3. **Kopieren Sie den Fehler** und melden Sie ihn
4. **Überprüfen Sie die Netzwerk-Anfragen** (Network-Tab)

### Logs überprüfen
```javascript
// In der Browser-Konsole
console.log('Offline Status:', navigator.onLine);
console.log('Service Worker:', navigator.serviceWorker.controller);
console.log('Audio Settings:', localStorage.getItem('audioSettings'));
```

---

## 12. Updates & Wartung

### Neue Version installieren
1. Laden Sie die neue ZIP-Datei herunter
2. Entpacken Sie sie in einen neuen Ordner
3. Starten Sie den lokalen Server
4. Der Service Worker wird automatisch aktualisiert

### Cache leeren nach Update
```bash
# Löschen Sie den alten Ordner
rm -rf dist/public

# Entpacken Sie die neue ZIP
unzip vokabel-champion-app.zip
```

---

**Viel Spaß mit Vokabel-Champion! 🎮**
