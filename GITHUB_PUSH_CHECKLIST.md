# 📋 GitHub Push Checklist für Vokabel-Champion

Führe diese Schritte AUS, BEVOR du auf GitHub pushst!

## ✅ Pre-Push Checklist

### 1. Code Quality

```bash
# TypeScript überprüfen
pnpm check

# Tests laufen
pnpm test

# Format prüfen
pnpm format
```

### 2. Environment Variablen

```bash
# .env.local NICHT committen!
# Prüfe: .gitignore enthält .env.local
cat .gitignore | grep "\.env"
```

**Output sollte sein:**
```
.env.local
.env*.local
```

### 3. Dependencies aufräumen

```bash
# Alte node_modules löschen (wenn lokal vorhanden)
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Nur notwendige Dependencies commiten:
git add package.json pnpm-lock.yaml
```

### 4. Git Repository vorbereiten

```bash
# Initialisiere Git (falls nicht schon geschehen)
git init
git add .
git commit -m "Initial commit: Vokabel-Champion Full-Stack App"

# Verbinde mit GitHub
git remote add origin https://github.com/benjaminmh19-prog/vokabel-champion_interaktiver-Vokabeltrainer.git
git branch -M main
git push -u origin main
```

### 5. Wichtige Dateien überprüfen

```bash
# Diese Dateien MÜSSEN existieren:
test -f .env.example && echo "✅ .env.example vorhanden" || echo "❌ .env.example fehlt"
test -f SETUP_GUIDE.md && echo "✅ SETUP_GUIDE.md vorhanden" || echo "❌ SETUP_GUIDE.md fehlt"
test -f migrations/001_initial_schema.sql && echo "✅ Migrations vorhanden" || echo "❌ Migrations fehlen"
test -f render.yaml && echo "✅ render.yaml vorhanden" || echo "❌ render.yaml fehlt"
```

## 🚫 NICHT commiten:

```
.env.local              # Lokale Secrets
.env.production.local
node_modules/           # Dependencies (pnpm-lock.yaml reicht)
dist/                   # Build Output
.DS_Store              # macOS
*.log                  # Logs
.vscode/settings.json  # Persönliche VS Code Settings
```

## 📝 Commit Message Template

```bash
git commit -m "feat: Add database migrations and setup guide

- Add PostgreSQL schema for all tables (users, players, collections, etc)
- Add environment variable documentation
- Add Supabase + Render.com deployment guide
- Update render.yaml for Supabase integration"
```

## 🔐 Secrets Management (WICHTIG!)

**NIEMALS diese Dateien committen:**
- `.env.local` (lokale Secrets)
- Passwords oder API Keys
- Private Keys

**STATT DESSEN:**
- Dokumentiere in `.env.example` WAS benötigt wird
- Setze Secrets via Render Dashboard oder Supabase Admin Panel
- Nutze `generateValue: true` in render.yaml für auto-generated Secrets

## ✨ Nach dem Push

### 1. Render.com mit GitHub verbinden

```bash
# 1. Gehe zu https://render.com
# 2. Klicke "New +" → "Web Service"
# 3. Wähle dein GitHub Repository
# 4. Render baut und deployed automatisch
```

### 2. Environment Variables in Render setzen

**Im Render Dashboard:**
- Klicke dein Service: `vokabel-champion`
- Gehe zu "Settings" → "Environment"
- Füge diese Variablen hinzu:
  - `DATABASE_URL` (von Supabase)
  - `JWT_SECRET` (oder lass auto-generate)
  - `OAUTH_SERVER_URL` (optional)
  - `OWNER_OPEN_ID` (optional)

## 🐛 Troubleshooting

### Problem: "Untracked files warning"
```bash
git add .
git status
# Sollte zeigen: everything commited
```

### Problem: "Large files"
```bash
# Prüfe auf zu große Dateien
git add --all
git ls-files --stage | sort -k 3 -n | tail -20
```

### Problem: Render Build fehlgeschlagen
```bash
# Lokal testen:
pnpm build
pnpm start

# Logs überprüfen:
# Render Dashboard → Logs
```

## 📚 Weitere Ressourcen

- **GitHub Docs:** https://docs.github.com
- **Render Deployment:** https://render.com/docs
- **Supabase Setup:** https://supabase.com/docs/guides/getting-started

---

**Nach dieser Checklist:** Deine App ist **Production-Ready** auf GitHub! 🚀
