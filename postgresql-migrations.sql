-- PostgreSQL Migration für Vokabel-Champion
-- Führe diese Befehle nacheinander in pgAdmin aus

-- Tabelle: players
CREATE TABLE "players" (
	"id" varchar(36) NOT NULL,
	"username" varchar(255) NOT NULL,
	"name" text,
	"password_hash" text,
	"total_score" integer DEFAULT 0,
	"games_played" integer DEFAULT 0,
	"best_score" integer DEFAULT 0,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "players_id" PRIMARY KEY("id"),
	CONSTRAINT "players_username_unique" UNIQUE("username")
);

-- Tabelle: users
CREATE TABLE "users" (
	"id" SERIAL PRIMARY KEY,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" varchar(64) DEFAULT 'user',
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NOT NULL DEFAULT now(),
	"lastSignedIn" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);

-- Tabelle: admin_vocabulary
CREATE TABLE "admin_vocabulary" (
	"id" varchar(36) NOT NULL,
	"unit" varchar(255) NOT NULL,
	"page" varchar(255) NOT NULL,
	"english" text NOT NULL,
	"deutsch" text NOT NULL,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "admin_vocabulary_id" PRIMARY KEY("id")
);

-- Tabelle: collections
CREATE TABLE "collections" (
	"id" varchar(36) NOT NULL,
	"admin_vocabulary_id" varchar(36) NOT NULL,
	"user_id" integer NOT NULL,
	"is_favorite" boolean DEFAULT false,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "collections_id" PRIMARY KEY("id"),
	CONSTRAINT "collections_user_id_fk" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE cascade
);

-- Tabelle: multiplayer_sessions
CREATE TABLE "multiplayer_sessions" (
	"id" varchar(36) NOT NULL,
	"session_code" varchar(10) NOT NULL,
	"created_by" varchar(36) NOT NULL,
	"status" varchar(64) DEFAULT 'active',
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "multiplayer_sessions_id" PRIMARY KEY("id"),
	CONSTRAINT "multiplayer_sessions_session_code_unique" UNIQUE("session_code")
);

-- Tabelle: session_participants
CREATE TABLE "session_participants" (
	"id" varchar(36) NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"player_id" varchar(36) NOT NULL,
	"score" integer DEFAULT 0,
	"joined_at" timestamp NOT NULL DEFAULT now(),
	CONSTRAINT "session_participants_id" PRIMARY KEY("id"),
	CONSTRAINT "session_participants_session_id_fk" FOREIGN KEY("session_id") REFERENCES "multiplayer_sessions"("id") ON DELETE cascade
);

-- Migrations-Tabelle (für Drizzle)
CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
	"id" SERIAL PRIMARY KEY,
	"hash" text NOT NULL,
	"created_at" timestamp NOT NULL DEFAULT now()
);

-- Migrations aufzeichnen
INSERT INTO "__drizzle_migrations" ("hash") VALUES ('0000_clammy_shaman');
INSERT INTO "__drizzle_migrations" ("hash") VALUES ('0001_hesitant_major_mapleleaf');
INSERT INTO "__drizzle_migrations" ("hash") VALUES ('0002_aromatic_sharon_carter');
INSERT INTO "__drizzle_migrations" ("hash") VALUES ('0003_odd_iceman');
