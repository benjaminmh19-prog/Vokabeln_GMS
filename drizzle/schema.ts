import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

// 1. Enums VOR den Tabellen definieren
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["waiting", "in_progress", "completed"]);

/**
 * Core user table
 */
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(), // PostgreSQL-Standard für Auto-Increment
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(), // Enum hier zuweisen
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Players table
 */
export const players = pgTable("players", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  name: text("name"),
  password_hash: text("password_hash"),
  total_score: integer("total_score").default(0),
  games_played: integer("games_played").default(0),
  best_score: integer("best_score").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * Collections table
 */
export const collections = pgTable("collections", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  learning_year: integer("learning_year").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

/**
 * Admin vocabulary table
 */
export const admin_vocabulary = pgTable("admin_vocabulary", {
  id: varchar("id", { length: 36 }).primaryKey(),
  collection_id: varchar("collection_id", { length: 36 }).notNull(),
  unit: varchar("unit", { length: 255 }).notNull(),
  page: varchar("page", { length: 255 }).notNull(),
  english: text("english").notNull(),
  deutsch: text("deutsch").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type AdminVocabulary = typeof admin_vocabulary.$inferSelect;
export type InsertAdminVocabulary = typeof admin_vocabulary.$inferInsert;

/**
 * Multiplayer game sessions
 */
export const multiplayer_sessions = pgTable("multiplayer_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  host_id: varchar("host_id", { length: 36 }).notNull(),
  session_code: varchar("session_code", { length: 8 }).notNull().unique(),
  collection_id: varchar("collection_id", { length: 36 }).notNull(),
  units: text("units").notNull(),
  pages: text("pages").notNull(),
  level: integer("level").notNull(),
  direction: varchar("direction", { length: 10 }).notNull(),
  status: statusEnum("status").default("waiting").notNull(), // Enum hier zuweisen
  max_players: integer("max_players").default(4),
  created_at: timestamp("created_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at").notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type MultiplayerSession = typeof multiplayer_sessions.$inferSelect;
export type InsertMultiplayerSession = typeof multiplayer_sessions.$inferInsert;

/**
 * Multiplayer session participants
 */
export const session_participants = pgTable("session_participants", {
  id: varchar("id", { length: 36 }).primaryKey(),
  session_id: varchar("session_id", { length: 36 }).notNull(),
  player_id: varchar("player_id", { length: 36 }).notNull(),
  score: integer("score").default(0),
  correct_answers: integer("correct_answers").default(0),
  total_answers: integer("total_answers").default(0),
  joined_at: timestamp("joined_at").defaultNow().notNull(),
});

export type SessionParticipant = typeof session_participants.$inferSelect;
export type InsertSessionParticipant = typeof session_participants.$inferInsert;
