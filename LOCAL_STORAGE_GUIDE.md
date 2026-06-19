# Vokabel-Champion - Lokale Speicherung & Bearbeitung

## 📁 Was Sie lokal speichern müssen

### Option 1: Nur zum Spielen (empfohlen für Spieler)
**Speichern Sie:** `dist/public/` Ordner als ZIP

```bash
# Im Terminal:
cd /home/ubuntu/vokabel-champion
zip -r vokabel-champion-spielen.zip dist/public/
```

**Größe:** ~2-3 MB
**Verwendung:** Spielen Sie offline, keine Bearbeitung möglich

---

### Option 2: Zum Spielen & Bearbeiten (empfohlen für Lehrer/Admin)
**Speichern Sie:** Den **gesamten Projekt-Ordner** `/home/ubuntu/vokabel-champion/`

```bash
# Im Terminal:
cd /home/ubuntu
zip -r vokabel-champion-vollständig.zip vokabel-champion/
```

**Größe:** ~200-300 MB (mit node_modules)
**Verwendung:** Spielen + Vokabeln bearbeiten/importieren

---

## 🎮 Lokal spielen (ohne Bearbeitung)

### Schritt 1: ZIP herunterladen
- Laden Sie `vokabel-champion-spielen.zip` herunter
- Entpacken Sie die Datei (z.B. in `C:\Spiele\vokabel-champion`)

### Schritt 2: Server starten

**Windows (PowerShell):**
```powershell
cd C:\Spiele\vokabel-champion\dist\public
python -m http.server 8000
```

**Mac/Linux:**
```bash
cd ~/Spiele/vokabel-champion/dist/public
python3 -m http.server 8000
```

### Schritt 3: Im Browser spielen
Öffnen Sie: **http://localhost:8000**

---

## ✏️ Lokal spielen & bearbeiten

### Schritt 1: Vollständiges Projekt herunterladen
- Laden Sie `vokabel-champion-vollständig.zip` herunter
- Entpacken Sie die Datei (z.B. in `C:\Projekte\vokabel-champion`)

### Schritt 2: Abhängigkeiten installieren

**Windows (PowerShell):**
```powershell
cd C:\Projekte\vokabel-champion
npm install
# oder
pnpm install
```

**Mac/Linux:**
```bash
cd ~/Projekte/vokabel-champion
npm install
# oder
pnpm install
```

### Schritt 3: Entwicklungs-Server starten

```bash
npm run dev
# oder
pnpm dev
```

Die App öffnet sich automatisch auf: **http://localhost:5173**

### Schritt 4: Vokabeln bearbeiten
- Öffnen Sie die Datei: `client/src/data/vocabulary.json`
- Bearbeiten Sie die Vokabeln
- Speichern Sie die Datei (Strg+S)
- Der Browser aktualisiert sich automatisch

---

## 📤 Projekt wieder hochladen zu Manus

### Wenn Sie Änderungen gemacht haben:

1. **Öffnen Sie einen neuen Chat mit mir**
2. **Sagen Sie mir, was Sie geändert haben**
3. **Laden Sie die geänderten Dateien hoch:**
   - Nur `vocabulary.json` wenn Sie Vokabeln geändert haben
   - Den ganzen `client/` Ordner wenn Sie Code geändert haben
   - Den ganzen Projekt-Ordner für große Änderungen

4. **Ich werde die Änderungen einspielen und testen**
5. **Sie erhalten einen neuen funktionierenden Checkpoint**

---

## 📂 Wichtige Dateien zum Bearbeiten

### Vokabeln bearbeiten
**Datei:** `client/src/data/vocabulary.json`

```json
{
  "Unit 1": {
    "1": [
      { "english": "hello", "deutsch": "Hallo; Grüß" },
      { "english": "goodbye", "deutsch": "Auf Wiedersehen" }
    ]
  }
}
```

### Design/Farben ändern
**Datei:** `client/src/index.css`

```css
:root {
  --primary: #FFE5A6;
  --secondary: #6BCB77;
  /* ... weitere Farben ... */
}
```

### Spiellogik ändern
**Dateien:** `client/src/pages/GamePage.tsx`
**Dateien:** `client/src/components/game/Level*.tsx`

### Admin-Panel ändern
**Datei:** `client/src/pages/AdminPage.tsx`

---

## 🔄 Workflow: Lokal bearbeiten → Hochladen → Testen

### 1. Lokal bearbeiten
```bash
# Terminal öffnen
cd C:\Projekte\vokabel-champion
npm run dev

# Im Browser: http://localhost:5173
# Bearbeiten Sie die Dateien
# Browser aktualisiert sich automatisch
```

### 2. Testen
- Spielen Sie lokal und überprüfen Sie die Änderungen
- Öffnen Sie die Browser-Konsole (F12) und suchen Sie nach Fehlern

### 3. Hochladen
- Öffnen Sie einen neuen Chat mit mir
- Laden Sie die geänderten Dateien hoch
- Beschreiben Sie die Änderungen

### 4: Ich werde:
- Die Änderungen einspielen
- Das Projekt testen
- Einen neuen funktionierenden Checkpoint erstellen
- Ihnen den Link geben

---

## 💾 Backup-Strategie

### Regelmäßig sichern:
1. **Lokal:** Speichern Sie `vokabel-champion-vollständig.zip` regelmäßig
2. **Cloud:** Laden Sie die ZIP-Datei in die Cloud hoch (Google Drive, Dropbox, etc.)
3. **Manus:** Nutzen Sie die Checkpoints in Manus als Backup

### Wenn etwas schiefgeht:
- Laden Sie die letzte ZIP-Datei herunter
- Entpacken Sie sie
- Starten Sie den Server neu

---

## 🐛 Troubleshooting

### Problem: "npm: command not found"
**Lösung:** Installieren Sie Node.js von https://nodejs.org

### Problem: "Port 8000 ist bereits in Verwendung"
**Lösung:** Verwenden Sie einen anderen Port:
```bash
python -m http.server 9000
# Öffnen Sie: http://localhost:9000
```

### Problem: "Änderungen werden nicht angezeigt"
**Lösung:**
1. Leeren Sie den Browser-Cache (Strg+Shift+Entf)
2. Laden Sie die Seite neu (F5)
3. Starten Sie den Dev-Server neu (Strg+C, dann `npm run dev`)

### Problem: "Fehler beim Starten des Dev-Servers"
**Lösung:**
1. Löschen Sie `node_modules` Ordner
2. Löschen Sie `pnpm-lock.yaml` oder `package-lock.json`
3. Führen Sie `npm install` aus
4. Führen Sie `npm run dev` aus

---

## 📋 Checkliste: Lokal speichern

- [ ] Laden Sie `vokabel-champion-spielen.zip` herunter (zum Spielen)
- [ ] Laden Sie `vokabel-champion-vollständig.zip` herunter (zum Bearbeiten)
- [ ] Entpacken Sie beide ZIP-Dateien
- [ ] Speichern Sie die Ordner an einem sicheren Ort
- [ ] Testen Sie den lokalen Server (`python -m http.server 8000`)
- [ ] Spielen Sie das Spiel lokal
- [ ] Erstellen Sie ein Backup in der Cloud

---

## 🚀 Schnellstart: Lokal spielen

```bash
# 1. ZIP herunterladen und entpacken
# 2. Terminal öffnen
cd vokabel-champion/dist/public

# 3. Server starten
python -m http.server 8000

# 4. Im Browser öffnen
# http://localhost:8000

# 5. Spielen!
```

---

## 📞 Fragen?

Wenn Sie Fragen haben oder etwas nicht funktioniert:
1. Öffnen Sie einen neuen Chat mit mir
2. Beschreiben Sie das Problem
3. Laden Sie die relevanten Dateien hoch
4. Ich helfe Ihnen, das Problem zu beheben

---

**Viel Erfolg mit Vokabel-Champion! 🎉**
