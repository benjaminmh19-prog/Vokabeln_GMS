# ⚡ Quick Reference - Vokabel-Champion

Schnelle Lösungen für die häufigsten Aufgaben.

---

## 🎯 Schnellstart (Copy-Paste)

### Setup lokal

```bash
git clone https://github.com/benjaminmh19-prog/vokabel-champion_interaktiver-Vokabeltrainer.git
cd vokabel-champion_interaktiver-Vokabeltrainer
pnpm install

# Environment vorbereiten
cp .env.example .env.local
# → Öffne .env.local und setze DATABASE_URL + JWT_SECRET

# Start
pnpm dev
```

### Deploy zu Render

```bash
# 1. GitHub
git add .
git commit -m "Setup: Production ready"
git push origin main

# 2. Render.com → New → Web Service → GitHub Connect
# 3. Im Dashboard: Settings → Environment
#    DATABASE_URL=postgresql://postgres.YOUR_ID:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
#    JWT_SECRET=(generate)

# Done! 🚀
```

---

## 🗄️ Supabase Datenbank

### Migrationen ausführen

**Im Supabase SQL Editor:**
```sql
-- Öffne: https://app.supabase.com/project/YOUR_PROJECT/sql/new
-- Kopiere von: migrations/001_initial_schema.sql
-- Paste & klicke "Run"
```

### Vokabeln hinzufügen

```sql
INSERT INTO public.admin_vocabulary (id, collection_id, unit, page, english, deutsch)
VALUES 
  (gen_random_uuid()::text, 'col-001', 'Unit 1', '10', 'hello', 'hallo'),
  (gen_random_uuid()::text, 'col-001', 'Unit 1', '10', 'goodbye', 'auf wiedersehen');
```

### Backup erstellen

```bash
# Im Terminal
pg_dump postgresql://postgres.YOUR_ID:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres > backup.sql

# Oder: Supabase Dashboard → Settings → Backups → Download
```

---

## 🚀 Render.com

### Logs ansehen

```
Render Dashboard → Services → vokabel-champion → Logs
```

### Env Vars ändern

```
Render Dashboard → Services → vokabel-champion → Settings → Environment
```

### Manuell deployen

```
Render Dashboard → Services → vokabel-champion → Manual Deploy
```

### Build fehlgeschlagen?

```bash
# Lokal testen
pnpm build
pnpm start

# Dann: 
# 1. Fix locally
# 2. git push
# 3. Render auto-redeploy
```

---

## 💾 Lokale Entwicklung

### Port ist besetzt?

```bash
# Finde Prozess
lsof -i :3000

# Kill Prozess
kill -9 <PID>

# Oder andere Port nutzen
PORT=3001 pnpm dev
```

### pnpm vs npm

```bash
# Falls pnpm Probleme macht:
npm install  # statt pnpm install
npm run dev  # statt pnpm dev
npm run build
```

### TypeScript Fehler?

```bash
# Überprüfe
pnpm check

# Fix
pnpm format
```

### Datenbank lokal testen

```bash
# Falls du PostgreSQL lokal hast:
psql postgresql://postgres:PASSWORD@localhost:5432/vokabel

# Oder remote Supabase:
psql postgresql://postgres.YOUR_ID:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

---

## 🔑 Environment Variables

### Wo sind sie?

| Umgebung | Datei | Wo |
|----------|-------|-----|
| Lokal Dev | `.env.local` | Repo-Root |
| Produktion | Dashboard | Render.com Settings |
| CI/CD | (nicht nötig) | - |

### Nötige Variablen

```env
DATABASE_URL=postgresql://...  # MUST
JWT_SECRET=xxxxxxxx...         # MUST (32+ chars)
NODE_ENV=production            # SHOULD
VITE_APP_ID=...               # SHOULD
```

### Optional

```env
OAUTH_SERVER_URL=https://...   # Optional
OWNER_OPEN_ID=...             # Optional
BUILT_IN_FORGE_API_URL=...    # Optional
BUILT_IN_FORGE_API_KEY=...    # Optional
```

---

## 📊 Testing

```bash
# Run alle Tests
pnpm test

# Watch Mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

---

## 🐛 Häufige Fehler & Fixes

| Fehler | Ursache | Fix |
|--------|--------|-----|
| `DATABASE_URL is required` | .env.local fehlt | `cp .env.example .env.local` |
| `tables don't exist` | Migrations nicht ausgeführt | Siehe "Migrationen" oben |
| `Connection refused` | Falscher Host/Port | Nutze Pooler URL (Port 6543) |
| `Cannot find module` | Dependencies fehlen | `pnpm install` |
| Build timeout | Große Dependencies | Render Plan upgraden |

---

## 📚 Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `.env.local` | Lokale Secrets (NICHT committen!) |
| `.env.example` | Template für .env.local |
| `migrations/001_initial_schema.sql` | Datenbank-Schema |
| `drizzle/schema.ts` | TypeScript Schema Definition |
| `SETUP_GUIDE.md` | Komplette Anleitung |
| `render.yaml` | Render Deployment Config |

---

## 🔗 Links

- **Supabase**: https://app.supabase.com
- **Render**: https://render.com
- **GitHub**: https://github.com/benjaminmh19-prog/vokabel-champion_interaktiver-Vokabeltrainer
- **Docs (vollständig)**: Siehe `SETUP_GUIDE.md`

---

## ⚡ Pro Tips

### Tip 1: Hot Reload
```bash
pnpm dev
# Automatischer Reload bei Code-Änderung
```

### Tip 2: Database Inspect
```bash
# Supabase Table Editor
# https://app.supabase.com/project/YOUR_PROJECT/editor
```

### Tip 3: Git Aliases
```bash
alias pss='git add . && git commit -m "fix: quick update" && git push'
```

### Tip 4: Auto-Deploy
```yaml
# render.yaml: autoDeploy: true
# Automatischer Deploy bei git push ✅
```

---

**Version:** 1.0.0 | **Updated:** Juni 2026
