# Vokabel-Champion - Projekt-Struktur & wichtige Dateien

## 📁 Komplette Projekt-Struktur

```
vokabel-champion/
│
├── 📄 README.md                          ⭐ Projekt-Übersicht
├── 📄 QUICK_START.md                     ⭐ Schnellstart-Anleitung
├── 📄 LOCAL_STORAGE_GUIDE.md             ⭐ Lokale Speicherung
├── 📄 DEPLOYMENT_GUIDE.md                ⭐ Deployment & Export
├── 📄 OPTIMIZATION_SUMMARY.md            ⭐ Optimierungen
├── 📄 PROJECT_STRUCTURE.md               ⭐ Diese Datei
│
├── package.json                          ⭐⭐⭐ WICHTIG: Abhängigkeiten & Scripts
├── pnpm-lock.yaml                        Dependency Lock File
├── tsconfig.json                         TypeScript Konfiguration
├── vite.config.ts                        ⭐ Vite Build Konfiguration
├── components.json                       shadcn/ui Konfiguration
│
├── 📁 client/                            Frontend-Anwendung
│   ├── index.html                        ⭐⭐⭐ HTML Entry Point
│   ├── 📁 public/
│   │   ├── favicon.ico                   App Icon
│   │   ├── manifest.json                 ⭐ PWA Manifest
│   │   ├── sw.js                         ⭐ Service Worker
│   │   ├── robots.txt                    SEO
│   │   └── 📁 __manus__/                 Manus Debug Tools
│   │
│   └── 📁 src/
│       ├── main.tsx                      ⭐⭐⭐ React Entry Point
│       ├── App.tsx                       ⭐⭐⭐ Haupt-Routes & Layout
│       ├── index.css                     ⭐⭐⭐ Design-Tokens & Farben
│       │
│       ├── 📁 data/
│       │   └── vocabulary.json           ⭐⭐⭐ VOKABELN - BEARBEITEN SIE DIESE!
│       │
│       ├── 📁 pages/                     ⭐ Seiten-Komponenten
│       │   ├── AuthPage.tsx              Login/Registrierung
│       │   ├── MenuPage.tsx              Hauptmenü
│       │   ├── SelectionPage.tsx         Spieler-Auswahl
│       │   ├── GamePage.tsx              ⭐ Spiel-Seite
│       │   ├── ProfilePage.tsx           ⭐ Spieler-Profil
│       │   ├── LeaderboardPage.tsx       Rangliste
│       │   ├── CollectionSelectionPage.tsx  Collection-Auswahl
│       │   ├── AdminPage.tsx             ⭐ Admin-Panel
│       │   ├── NotFound.tsx              404 Seite
│       │   └── ...weitere Seiten
│       │
│       ├── 📁 components/                ⭐ Wiederverwendbare Komponenten
│       │   ├── 📁 game/
│       │   │   ├── Level1Game.tsx        Multiple Choice Level
│       │   │   ├── Level2Game.tsx        Hangman Level
│       │   │   ├── Level3Game.tsx        Free Typing Level
│       │   │   ├── GameHeader.tsx        Spiel-Header mit Logout
│       │   │   └── ...weitere Game-Komponenten
│       │   │
│       │   ├── 📁 admin/
│       │   │   ├── VocabularyTable.tsx   Vokabel-Tabelle
│       │   │   ├── ImportPreviewDialog.tsx  Import-Dialog
│       │   │   ├── TestGeneratorPanel.tsx   Test-Generator
│       │   │   ├── CollectionManagementPanel.tsx  Collection-Verwaltung
│       │   │   └── ...weitere Admin-Komponenten
│       │   │
│       │   ├── 📁 audio/
│       │   │   └── AudioSettingsPanel.tsx  ⭐ Audio-Einstellungen
│       │   │
│       │   ├── 📁 auth/
│       │   │   └── LoginTransition.tsx   Animierter Login-Übergang
│       │   │
│       │   ├── 📁 ui/                    shadcn/ui Komponenten
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── dialog.tsx
│       │   │   └── ...weitere UI-Komponenten
│       │   │
│       │   └── ...weitere Komponenten
│       │
│       ├── 📁 contexts/                  ⭐ React Contexts (State Management)
│       │   ├── PlayerContext.tsx         Spieler-Daten
│       │   ├── GameContext.tsx           ⭐ Spiel-Logik & Statistiken
│       │   ├── AdminContext.tsx          ⭐ Admin-Funktionen
│       │   ├── AudioSettingsContext.tsx  ⭐ Audio-Einstellungen
│       │   ├── OfflineContext.tsx        ⭐ Offline-Modus
│       │   ├── MultiplayerContext.tsx    Multiplayer-Logik
│       │   └── ThemeContext.tsx          Design-Theme
│       │
│       ├── 📁 lib/                       ⭐ Utility-Funktionen
│       │   ├── audioUtils.ts             ⭐⭐⭐ SOUND-EFFEKTE & TEXT-TO-SPEECH
│       │   ├── csvUtils.ts               CSV Import/Export
│       │   ├── supabase.ts               ⭐ Supabase Verbindung
│       │   ├── cacheUtils.ts             ⭐ Offline-Caching
│       │   ├── swUtils.ts                Service Worker
│       │   ├── vocabularyLoader.ts       Vokabel-Loader
│       │   ├── pdfTestGenerator.ts       PDF Test-Generator
│       │   └── ...weitere Utils
│       │
│       ├── 📁 hooks/                     Custom React Hooks
│       │   ├── useTextToSpeech.ts        Text-to-Speech Hook
│       │   ├── useVocabulary.ts          Vokabel-Hook
│       │   └── ...weitere Hooks
│       │
│       ├── const.ts                      Konstanten
│       └── types/                        TypeScript Typen
│
├── 📁 server/                            Backend Placeholder
│   └── index.ts                          (nicht verwendet)
│
├── 📁 shared/                            Gemeinsame Typen
│   └── const.ts                          Gemeinsame Konstanten
│
├── 📁 dist/                              🔴 Nicht bearbeiten!
│   └── public/                           Kompilierte App (zum Spielen)
│
├── 📁 node_modules/                      🔴 Nicht bearbeiten!
│   └── ...Abhängigkeiten
│
└── 📁 patches/                           Dependency Patches
    └── wouter@3.7.1.patch               Wouter Router Patch
```

---

## ⭐ WICHTIGSTE DATEIEN ZUM BEARBEITEN

### 1️⃣ **Vokabeln hinzufügen/ändern**
**Datei:** `client/src/data/vocabulary.json`

```json
{
  "Unit 1": {
    "1": [
      { "english": "hello", "deutsch": "Hallo; Grüß" },
      { "english": "goodbye", "deutsch": "Auf Wiedersehen" }
    ],
    "2": [
      { "english": "thank you", "deutsch": "Danke; Vielen Dank" }
    ]
  },
  "Unit 2": {
    "1": [
      { "english": "water", "deutsch": "Wasser" }
    ]
  }
}
```

**Bearbeitungsschritte:**
1. Öffnen Sie die Datei in einem Text-Editor
2. Fügen Sie neue Vokabeln hinzu oder ändern Sie bestehende
3. Speichern Sie die Datei
4. Der Browser aktualisiert sich automatisch (wenn `npm run dev` läuft)

---

### 2️⃣ **Farben & Design ändern**
**Datei:** `client/src/index.css`

```css
:root {
  --primary: #FFE5A6;           /* Primärfarbe */
  --secondary: #6BCB77;         /* Sekundärfarbe */
  --accent: #FF6B6B;            /* Akzentfarbe */
  --background: #FFF8E7;        /* Hintergrund */
  --foreground: #2E3192;        /* Text */
  /* ... weitere Farben ... */
}
```

**Bearbeitungsschritte:**
1. Öffnen Sie die Datei
2. Ändern Sie die Farb-Werte (HEX-Codes)
3. Speichern Sie die Datei
4. Der Browser aktualisiert sich automatisch

---

### 3️⃣ **Sound-Effekte & Text-to-Speech**
**Datei:** `client/src/lib/audioUtils.ts`

```typescript
// Sound-Effekte:
export function playSoundEffect(type: 'correct' | 'incorrect' | 'levelComplete' | 'click'): void

// Text-to-Speech:
export function speakEnglishWord(word: string): void

// Einstellungen:
export function getAudioSettings(): AudioSettings
export function saveAudioSettings(settings: AudioSettings): void
```

**Bearbeitungsschritte:**
1. Öffnen Sie die Datei
2. Ändern Sie Frequenzen, Dauer oder Lautstärke
3. Speichern Sie die Datei
4. Der Browser aktualisiert sich automatisch

---

### 4️⃣ **Spiel-Logik ändern**
**Dateien:**
- `client/src/pages/GamePage.tsx` - Haupt-Spiel-Seite
- `client/src/components/game/Level1Game.tsx` - Multiple Choice
- `client/src/components/game/Level2Game.tsx` - Hangman
- `client/src/components/game/Level3Game.tsx` - Free Typing

**Bearbeitungsschritte:**
1. Öffnen Sie die entsprechende Datei
2. Ändern Sie die Logik
3. Speichern Sie die Datei
4. Der Browser aktualisiert sich automatisch

---

### 5️⃣ **Admin-Panel ändern**
**Datei:** `client/src/pages/AdminPage.tsx`

Hier können Sie:
- Import/Export-Funktionen anpassen
- Vokabel-Verwaltung ändern
- Test-Generator konfigurieren
- Spieler-Management anpassen

---

### 6️⃣ **Abhängigkeiten & Scripts**
**Datei:** `package.json`

```json
{
  "scripts": {
    "dev": "vite",                    // Entwicklungs-Server
    "build": "vite build",            // Projekt bauen
    "preview": "vite preview",        // Vorschau
    "lint": "eslint ."                // Code-Qualität prüfen
  },
  "dependencies": {
    "react": "^19.2.1",
    "react-dom": "^19.2.1",
    "@supabase/supabase-js": "^2.x",
    // ... weitere Abhängigkeiten
  }
}
```

---

### 7️⃣ **Spiel-Konfiguration**
**Datei:** `vite.config.ts`

Hier können Sie:
- Build-Optionen ändern
- Proxy-Einstellungen anpassen
- Environment-Variablen konfigurieren

---

## 🔴 DATEIEN NICHT BEARBEITEN

- `dist/` - Kompilierte App (wird automatisch generiert)
- `node_modules/` - Abhängigkeiten (wird automatisch installiert)
- `pnpm-lock.yaml` - Dependency Lock File
- `tsconfig.json` - TypeScript Konfiguration (nur wenn Sie wissen, was Sie tun)

---

## 🚀 Schnellstart: Lokal bearbeiten

```bash
# 1. Terminal öffnen
cd vokabel-champion

# 2. Abhängigkeiten installieren (nur beim ersten Mal)
npm install

# 3. Entwicklungs-Server starten
npm run dev

# 4. Im Browser öffnen
# http://localhost:5173

# 5. Dateien bearbeiten
# - client/src/data/vocabulary.json für Vokabeln
# - client/src/index.css für Farben
# - client/src/lib/audioUtils.ts für Sounds

# 6. Browser aktualisiert sich automatisch!
```

---

## 📋 Häufig bearbeitete Dateien

| Aufgabe | Datei | Zeile |
|---------|-------|-------|
| Vokabeln hinzufügen | `client/src/data/vocabulary.json` | 1-50 |
| Farben ändern | `client/src/index.css` | 1-100 |
| Sound-Effekte anpassen | `client/src/lib/audioUtils.ts` | 40-130 |
| Spiel-Regeln ändern | `client/src/components/game/Level*.tsx` | - |
| Admin-Funktionen | `client/src/pages/AdminPage.tsx` | - |
| Routes ändern | `client/src/App.tsx` | - |

---

## 🔗 Abhängigkeiten

**Wichtige NPM-Pakete:**
- `react` & `react-dom` - UI Framework
- `@supabase/supabase-js` - Datenbank
- `wouter` - Router
- `shadcn/ui` - UI-Komponenten
- `lucide-react` - Icons
- `sonner` - Toast-Benachrichtigungen
- `tailwindcss` - CSS Framework
- `vite` - Build Tool

---

## 📞 Fragen?

Wenn Sie eine Datei nicht finden oder nicht wissen, wie Sie etwas bearbeiten:

1. Öffnen Sie einen neuen Chat mit mir
2. Beschreiben Sie, was Sie ändern möchten
3. Ich helfe Ihnen, die richtige Datei zu finden und zu bearbeiten

---

**Viel Erfolg beim Bearbeiten! 🎉**
