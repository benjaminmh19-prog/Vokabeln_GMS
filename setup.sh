#!/bin/bash

# ============================================================================
# VOKABEL-CHAMPION - AUTOMATED SETUP SCRIPT
# ============================================================================
# Dieses Skript richtet alles automatisch ein:
# 1. .env.local erstellen mit DATABASE_URL
# 2. JWT_SECRET generieren
# 3. npm install ausführen
# 4. npm run dev starten
# ============================================================================

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       VOKABEL-CHAMPION - AUTOMATED SETUP                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# SCHRITT 1: .env.local erstellen
# ============================================================================

echo "📝 Schritt 1: Erstelle .env.local..."

DATABASE_URL="postgresql://postgres.xcqsphntnkrssqltltzu:Bernamin09!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"

# Generiere JWT_SECRET
JWT_SECRET=$(openssl rand -hex 32)

echo "✅ JWT_SECRET generiert: ${JWT_SECRET:0:16}..."

# Erstelle .env.local
cat > .env.local << EOF
# ============================================================================
# VOKABEL-CHAMPION - ENVIRONMENT VARIABLES
# Auto-generiert durch setup.sh
# ============================================================================

# DATABASE (Supabase PostgreSQL)
DATABASE_URL=$DATABASE_URL

# AUTHENTICATION
JWT_SECRET=$JWT_SECRET

# OAuth Configuration
OAUTH_SERVER_URL=https://auth.manus.im
OWNER_OPEN_ID=admin

# App Configuration
VITE_APP_ID=vokabel-champion-prod

# Node Environment
NODE_ENV=production

# Optional: API Keys
BUILT_IN_FORGE_API_URL=https://api.example.com
BUILT_IN_FORGE_API_KEY=your_api_key_here
EOF

echo "✅ .env.local erstellt!"
echo "   DATABASE_URL: $DATABASE_URL"
echo "   JWT_SECRET: ${JWT_SECRET:0:16}..."
echo ""

# ============================================================================
# SCHRITT 2: npm dependencies installieren
# ============================================================================

echo "📦 Schritt 2: Installiere Dependencies (npm install)..."
echo "   ⏳ Das dauert ein paar Minuten, bitte warten..."
echo ""

npm install

echo ""
echo "✅ Dependencies installiert!"
echo ""

# ============================================================================
# SCHRITT 3: Development Server starten
# ============================================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🚀 SETUP FERTIG! Dev Server wird gestartet...               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Öffne deinen Browser:"
echo "   👉 http://localhost:3000"
echo ""
echo "📝 Log anschauen im Terminal:"
echo "   - Ctrl+C zum Stoppen"
echo "   - npm run dev um wieder zu starten"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

npm run dev
