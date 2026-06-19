# 🚀 VOKABEL-CHAMPION - Production Ready

> Interactive Vocabulary Trainer | Full-Stack Web App
> 
> **Vite + React + Node.js + tRPC + Drizzle ORM + Supabase PostgreSQL**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)](https://www.postgresql.org/)
[![Hosted on Render](https://img.shields.io/badge/Hosted%20on-Render-blue)](https://render.com)

---

## 📊 Features

✅ **Spieler-Management** - Benutzer, Login, Scores  
✅ **Vokabel-Trainer** - Level 1-3 mit mehreren Schwierigkeitsgraden  
✅ **Admin-Dashboard** - Vokabeln verwalten, Tests generieren  
✅ **Multiplayer-Modus** - Live-Spiele mit anderen Spielern  
✅ **Datenbank-Migrations** - PostgreSQL + Drizzle ORM  
✅ **Production Deploy** - Render.com + Supabase  

---

## 🚀 Quick Start (5 Minuten)

### 1️⃣ Projekt klonen

```bash
git clone https://github.com/benjaminmh19-prog/vokabel-champion_interaktiver-Vokabeltrainer.git
cd vokabel-champion_interaktiver-Vokabeltrainer
pnpm install
```

### 2️⃣ Supabase Datenbank erstellen

1. Gehe zu: https://supabase.com (kostenlos!)
2. Erstelle neues Projekt ("New Project")
3. Warte auf Erstellung (~2 Min)
4. Gehe zu **SQL Editor** → **New Query**
5. Kopiere & Paste: [`migrations/001_initial_schema.sql`](./migrations/001_initial_schema.sql)
6. Klicke **Run** (oder Ctrl+Enter)

### 3️⃣ Environment Variables

```bash
cp .env.example .env.local
```

Öffne `.env.local` und fülle aus:

```env
# Von Supabase kopieren (Settings → Database → URI):
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_ID:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres

# Beliebiger Secret (z.B. 32 random chars):
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_change_this
```

### 4️⃣ Dev Server starten

```bash
pnpm dev
# Öffne: http://localhost:3000
```

**Fertig!** 🎉 Die App läuft lokal!

---

## 📚 Vollständige Guides

| Guide | Beschreibung |
|-------|-------------|
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Komplettes Setup, Supabase + Render |
| **[GITHUB_PUSH_CHECKLIST.md](./GITHUB_PUSH_CHECKLIST.md)** | Vor GitHub Push ausführen |
| **[.env.example](./.env.example)** | Alle Environment Variables |
| **[render.yaml](./render.yaml)** | Render.com Deployment Config |

---

## 🛠️ Technologie-Stack

### Frontend
- **React 19** - UI Framework
- **Vite 7** - Build Tool
- **TailwindCSS** - Styling
- **React Router (Wouter)** - Navigation
- **React Query** - Data Fetching

### Backend
- **Node.js + Express** - Server
- **tRPC** - Type-Safe API
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database

### Infrastructure
- **Supabase** - PostgreSQL Hosting
- **Render.com** - Web App Hosting
- **GitHub** - Version Control

---

## 📋 Project Structure

```
vokabel-champion/
├── client/              # React Frontend
│   ├── src/
│   │   ├── pages/      # Pages (GamePage, AdminPage, etc)
│   │   ├── components/ # UI Components
│   │   ├── hooks/      # React Hooks
│   │   ├── contexts/   # Context API
│   │   └── lib/        # Utilities
│   └── index.html
│
├── server/              # Node.js Backend
│   ├── _core/          # Core services
│   ├── adminRoutes.ts  # Admin API endpoints
│   ├── routers.ts      # tRPC routers
│   └── db.ts           # Database client
│
├── drizzle/             # Drizzle ORM
│   ├── schema.ts       # Database schema
│   ├── relations.ts    # Table relations
│   └── migrations/     # Migration files
│
├── migrations/          # SQL Migrations
│   └── 001_initial_schema.sql
│
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript Config
├── vite.config.ts       # Vite Config
├── .env.example         # Environment Variables Template
├── render.yaml          # Render Deployment
└── SETUP_GUIDE.md       # Setup Instructions
```

---

## 🔧 Häufige Befehle

```bash
# Development
pnpm dev              # Starte Dev Server (hot reload)
pnpm build            # Build für Production
pnpm start            # Starte Production Server

# Testing & Quality
pnpm test             # Run Tests
pnpm check            # TypeScript Check
pnpm format           # Format mit Prettier

# Database
pnpm db:push          # Generate & run migrations (lokal mit drizzle-kit)
```

---

## 🌐 Deployment auf Render.com

### Schritt 1: GitHub Push
```bash
git add .
git commit -m "Initial commit: Vokabel-Champion App"
git push -u origin main
```

### Schritt 2: Render.com Connect
1. Gehe zu: https://render.com/deploy
2. Klicke: **Connect GitHub Repository**
3. Wähle: `vokabel-champion_interaktiver-Vokabeltrainer`
4. Render auto-deployed!

### Schritt 3: Environment Variables setzen
Im Render Dashboard (nach Deploy):
- **Settings** → **Environment**
- Füge hinzu: `DATABASE_URL`, `JWT_SECRET`, etc.
- Service startet automatisch neu

**Fertig!** Deine App läuft auf `https://vokabel-champion.onrender.com` 🚀

---

## 🐛 Troubleshooting

| Problem | Lösung |
|---------|--------|
| `DATABASE_URL is required` | Prüfe `.env.local` ist richtig gesetzt |
| `tables don't exist` | Führe SQL Migrations aus (Supabase SQL Editor) |
| `Connection refused` | Verwendest du Pooler URL (Port 6543)? |
| Render Build schlägt fehl | Sieh Logs: Render Dashboard → Logs |

Siehe **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** für ausführliches Troubleshooting!

---

## 📊 Database Schema

### Core Tables
- **users** - OAuth/Manus Users
- **players** - Game Players
- **collections** - Vocabulary Collections
- **admin_vocabulary** - Vocabulary Items
- **multiplayer_sessions** - Live Game Sessions
- **session_participants** - Game Participants

Siehe: [`migrations/001_initial_schema.sql`](./migrations/001_initial_schema.sql)

---

## 🔐 Security

✅ JWT-based Authentication  
✅ Password Hashing (bcryptjs)  
✅ Environment Variable Secrets  
✅ PostgreSQL with Row-Level Security (optional)  

**Wichtig:**
- Nutze starke JWT_SECRET (min. 32 Chars)
- Committe NIEMALS `.env.local`
- Setze Secrets via Render/Supabase Dashboard

---

## 📝 Dokumentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Komplette Installationsanleitung
- **[GITHUB_PUSH_CHECKLIST.md](./GITHUB_PUSH_CHECKLIST.md)** - Pre-Push Checklist
- **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** - Admin Features erklärt
- **[ADMIN_ANLEITUNG.md](./ADMIN_ANLEITUNG.md)** - Admin Anleitung (Deutsch)

---

## 🤝 Contributing

1. Fork das Repo
2. Erstelle einen Feature-Branch: `git checkout -b feature/amazing-feature`
3. Commit deine Änderungen: `git commit -m 'feat: Add amazing feature'`
4. Push zum Branch: `git push origin feature/amazing-feature`
5. Öffne einen Pull Request

---

## 📄 License

Dieses Projekt ist lizenziert unter der **MIT License** - siehe [LICENSE](./LICENSE) Datei für Details.

---

## 👤 Author

**Benjamin Mahmoud** - [GitHub](https://github.com/benjaminmh19-prog)

---

## 📞 Support

Hast du Fragen oder Probleme?

- 📖 Siehe **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**
- 🐛 Erstelle einen [GitHub Issue](https://github.com/benjaminmh19-prog/vokabel-champion_interaktiver-Vokabeltrainer/issues)
- 💬 Diskussionen: [GitHub Discussions](https://github.com/benjaminmh19-prog/vokabel-champion_interaktiver-Vokabeltrainer/discussions)

---

## 🎯 Roadmap

- [ ] API Dokumentation (OpenAPI/Swagger)
- [ ] E2E Tests (Cypress/Playwright)
- [ ] Analytics Dashboard
- [ ] Mobile App (React Native)
- [ ] i18n Translations
- [ ] Advanced AI Features

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Zuletzt aktualisiert:** Juni 2026

---

### Quick Links

🏠 [Projekt Homepage](https://github.com/benjaminmh19-prog/vokabel-champion_interaktiver-Vokabeltrainer)  
📖 [Setup Guide](./SETUP_GUIDE.md)  
🚀 [Render Deployment](https://render.com)  
🗄️ [Supabase Database](https://supabase.com)  
📝 [tRPC Documentation](https://trpc.io)  

---

Made with ❤️ for language learning
