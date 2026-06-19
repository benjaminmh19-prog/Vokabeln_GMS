# 🎯 VOKABEL-CHAMPION - Complete Setup & Deployment Guide

> Full-Stack Web App mit Supabase PostgreSQL + Render.com Deployment

---

## 📋 Inhaltsverzeichnis

1. [Lokale Entwicklung](#lokale-entwicklung)
2. [Supabase Setup](#supabase-setup)
3. [Render.com Deployment](#rendercom-deployment)
4. [Datenbank-Management](#datenbank-management)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Lokale Entwicklung

### Voraussetzungen
- **Node.js** 18+ oder 20+
- **pnpm** (oder npm/yarn)
- **Git**
- **Supabase Account** (kostenlos unter https://supabase.com)

### 1. Projekt klonen & Dependencies installiern

```bash
git clone https://github.com/benjaminmh19-prog/vokabel-champion_interaktiver-Vokabeltrainer.git
cd vokabel-champion_interaktiver-Vokabeltrainer

pnpm install
# oder: npm install
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env.local
```

Öffne `.env.local` und fülle alle Variablen aus (siehe nächster Abschnitt).

### 3. Development Server starten

```bash
pnpm dev
# Server läuft auf: http://localhost:3000
```

---

## 🛠️ Supabase Setup

### Schritt 1: Neues Projekt erstellen

1. Gehe zu https://app.supabase.com
2. Klicke "New Project"
3. Wähle einen Namen (z.B. `vokabel-champion-prod`)
4. Wähle Region: **Frankfurt (eu-central-1)**
5. Setze ein starkes Password für `postgres` User
6. Warte auf Projekt-Erstellung (~2 Minuten)

### Schritt 2: Datenbank-Migrationen ausführen

1. Gehe zu: **SQL Editor** (linkes Menü)
2. Klicke **"New Query"**
3. Kopiere kompletten Inhalt von: `migrations/001_initial_schema.sql`
4. Paste in SQL Editor
5. Klicke **"Run"** (oder Ctrl+Enter)
6. ✅ Alle Tabellen sollten erstellt sein

**Verifizierung:**
- Gehe zu **Table Editor** (linkes Menü)
- Du solltest sehen:
  - `users`
  - `players`
  - `collections`
  - `admin_vocabulary`
  - `multiplayer_sessions`
  - `session_participants`

### Schritt 3: Connection String kopieren

1. Gehe zu: **Settings → Database**
2. Unter "Connection string" → **"URI"**
3. Wähle **"PostgreSQL Pooler"** (wichtig für serverless!)
4. Kopiere die URL (sieht so aus):

```
postgresql://postgres.YOUR_PROJECT_ID:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

5. Setze in `.env.local`:
```env
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_ID:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

> **⚠️ Wichtig:** Nutze **Pooler** URL (Port 6543), NICHT die direkte Verbindung!

### Schritt 4: Vokabeln importieren

Falls du Vokabeln als CSV hast:

```bash
# Optionsweise CSV hochladen über Supabase Admin Panel
# oder direkt SQL INSERT verwenden
```

Beispiel (Admin Panel):
1. Gehe zu **Table Editor → admin_vocabulary**
2. Klicke **"Insert"**
3. Paste Vokabeln Daten

---

## 🌐 Render.com Deployment

### Schritt 1: GitHub Repository verbinden

1. Pushe dein Projekt zu GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/vokabel-champion.git
git branch -M main
git push -u origin main
```

2. Gehe zu https://render.com
3. Klicke **"New +"** → **"Web Service"**
4. Wähle **"Connect a repository"** → **GitHub**
5. Autorisiere Render für dein GitHub Account
6. Wähle dein Repository: `vokabel-champion`

### Schritt 2: Service konfigurieren

**Basic Settings:**
- **Name:** `vokabel-champion` (oder ähnlich)
- **Environment:** `Node`
- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start`
- **Instance Type:** `Free` (oder `Starter` für bessere Performance)

### Schritt 3: Environment Variables setzen

Unter **"Environment":**

```env
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_ID:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_change_this
OAUTH_SERVER_URL=https://your-oauth-server.com
OWNER_OPEN_ID=your_owner_open_id
VITE_APP_ID=vokabel-champion-prod
NODE_ENV=production
BUILT_IN_FORGE_API_URL=https://api.example.com
BUILT_IN_FORGE_API_KEY=your_api_key_here
```

### Schritt 4: Deploy!

1. Klicke **"Create Web Service"**
2. Render startet automatisch den Build (~5-10 Minuten)
3. Nach erfolgreicher Deployment findest du deine URL unter "Domains"
4. ✅ Öffne die URL → deine App läuft!

**Deployment anschauen:**
```bash
# Live Log verfolgen
# Im Render Dashboard → Logs
```

---

## 📊 Datenbank-Management

### Vokabeln hinzufügen (via Supabase)

**Option 1: Im SQL Editor**

```sql
INSERT INTO public.admin_vocabulary (id, collection_id, unit, page, english, deutsch)
VALUES 
  (gen_random_uuid()::text, 'col-001', 'Unit 2', '20', 'apple', 'Apfel'),
  (gen_random_uuid()::text, 'col-001', 'Unit 2', '20', 'banana', 'Banane');
```

**Option 2: Im Table Editor (grafisch)**
1. Gehe zu **Table Editor → admin_vocabulary**
2. Klicke **"Insert row"**
3. Fülle Felder aus

### Backup erstellen

```bash
# PostgreSQL Backup runterladen (Terminal)
pg_dump postgresql://postgres.YOUR_PROJECT_ID:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres > backup.sql

# Oder via Supabase Dashboard:
# Settings → Backups → Download
```

### Datenbank Reset (Vorsicht!)

```sql
DROP TABLE IF EXISTS public.session_participants CASCADE;
DROP TABLE IF EXISTS public.multiplayer_sessions CASCADE;
DROP TABLE IF EXISTS public.admin_vocabulary CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TYPE IF EXISTS status CASCADE;
DROP TYPE IF EXISTS role CASCADE;
```

Dann: `migrations/001_initial_schema.sql` wieder ausführen.

---

## 🐛 Troubleshooting

### Problem: "DATABASE_URL is not set"

**Lösung:**
1. Prüfe `.env.local` existiert und nicht leer ist
2. Starte Dev Server neu: `pnpm dev`

```bash
# Oder direkt Environment Variable setzen:
export DATABASE_URL="postgresql://..."
pnpm dev
```

### Problem: "Connection refused" bei Supabase

**Prüfung:**
```bash
# Teste Verbindung
psql "postgresql://postgres.YOUR_PROJECT_ID:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"
# Sollte PostgreSQL Prompt zeigen
```

**Lösungen:**
- Prüfe: Verwendest du **Pooler URL** (Port 6543)?
- IP Whitelist prüfen: **Supabase → Settings → Network**
- Falls nötig: Alle IPs erlauben (0.0.0.0/0) für Development

### Problem: "tables don't exist"

**Lösung:**
1. Gehe zu Supabase **SQL Editor**
2. Führe `migrations/001_initial_schema.sql` aus
3. Verifiziere: **Table Editor** sollte alle Tabellen zeigen

### Problem: Render Build schlägt fehl

**Check:**
```bash
# Lokal testen:
pnpm build
pnpm start

# Logs überprüfen:
# Render Dashboard → Deployment → Logs
```

**Häufige Fehler:**
- ❌ "Cannot find module" → `pnpm install` fehlgeschlagen
- ❌ TypeScript Fehler → `pnpm check` vor Push ausführen
- ❌ DATABASE_URL Env Var fehlt → Im Render Dashboard setzen

---

## 📚 Weitere Ressourcen

- **Supabase Docs:** https://supabase.com/docs
- **Render Docs:** https://render.com/docs
- **tRPC Docs:** https://trpc.io
- **Drizzle ORM:** https://orm.drizzle.team

---

## ✅ Checklist für Production

- [ ] Alle Umgebungsvariablen sind gesetzt
- [ ] Datenbank-Migrationen sind ausgeführt
- [ ] JWT_SECRET ist ein starkes Secret (min. 32 Chars)
- [ ] DATABASE_URL verwendet Pooler (Port 6543)
- [ ] Supabase Backups sind konfiguriert
- [ ] Render Auto-Deploy ist aktiviert
- [ ] Alle Tests passen: `pnpm test`
- [ ] TypeScript Check passt: `pnpm check`

---

## 🤝 Support

Fragen? Issues? Erstelle einen Issue auf GitHub:
https://github.com/benjaminmh19-prog/vokabel-champion_interaktiver-Vokabeltrainer/issues

---

**Version:** 1.0.0 | **Zuletzt aktualisiert:** Juni 2026
