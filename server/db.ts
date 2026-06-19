import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// --- User Queries ---
export async function upsertUser(user: typeof schema.users.$inferInsert): Promise<void> {
  const db = await getDb();
  if (!db || !user.openId) return;
  await db.insert(schema.users).values({ ...user, role: user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user') })
    .onConflictDoUpdate({ target: schema.users.openId, set: { name: user.name, email: user.email, lastSignedIn: new Date() } });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.users).where(eq(schema.users.openId, openId)).limit(1);
  return result[0];
}

// --- Player Queries ---
export async function getPlayerByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const cleanUsername = username.toLowerCase().trim();
  
  // Hier war der Fehler: schema.players statt players
  const result = await db.query.players.findFirst({
    where: eq(schema.players.username, cleanUsername),
  });
  
  return result;
}

export async function getPlayerById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.players).where(eq(schema.players.id, id)).limit(1);
  return result[0];
}

export async function createPlayer(player: typeof schema.players.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(schema.players).values(player);
  return await getPlayerById(player.id as string);
}

export async function updatePlayer(id: string, updates: Partial<typeof schema.players.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(schema.players).set(updates).where(eq(schema.players.id, id));
  return await getPlayerById(id);
}

export async function deletePlayer(id: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(schema.players).where(eq(schema.players.id, id));
  return true;
}

export async function getAllPlayers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.players);
}

// --- Vocabulary & Collections ---
export async function getAllVocabulary() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.admin_vocabulary);
}

export async function getVocabularyById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.admin_vocabulary).where(eq(schema.admin_vocabulary.id, id)).limit(1);
  return result[0];
}

export async function createVocabulary(vocab: typeof schema.admin_vocabulary.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(schema.admin_vocabulary).values(vocab);
  return await getVocabularyById(vocab.id as string);
}

export async function updateVocabulary(id: string, updates: Partial<typeof schema.admin_vocabulary.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(schema.admin_vocabulary).set(updates).where(eq(schema.admin_vocabulary.id, id));
  return await getVocabularyById(id);
}

export async function deleteVocabulary(id: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(schema.admin_vocabulary).where(eq(schema.admin_vocabulary.id, id));
  return true;
}

export async function getAllCollections() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.collections);
}

export async function getCollectionById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.collections).where(eq(schema.collections.id, id)).limit(1);
  return result[0];
}

export async function createCollection(collection: typeof schema.collections.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(schema.collections).values(collection);
  return await getCollectionById(collection.id as string);
}

export async function updateCollection(id: string, updates: Partial<typeof schema.collections.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(schema.collections).set(updates).where(eq(schema.collections.id, id));
  return await getCollectionById(id);
}

export async function deleteCollection(id: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(schema.admin_vocabulary).where(eq(schema.admin_vocabulary.collection_id, id));
  await db.delete(schema.collections).where(eq(schema.collections.id, id));
  return true;
}

// --- Multiplayer ---
export async function createMultiplayerSession(session: typeof schema.multiplayer_sessions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(schema.multiplayer_sessions).values(session);
  return await getMultiplayerSessionById(session.id as string);
}

export async function getMultiplayerSessionById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.multiplayer_sessions).where(eq(schema.multiplayer_sessions.id, id)).limit(1);
  return result[0];
}

export async function getMultiplayerSessionByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.multiplayer_sessions).where(eq(schema.multiplayer_sessions.session_code, code)).limit(1);
  return result[0];
}

export async function updateMultiplayerSession(id: string, updates: Partial<typeof schema.multiplayer_sessions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(schema.multiplayer_sessions).set(updates).where(eq(schema.multiplayer_sessions.id, id));
  return await getMultiplayerSessionById(id);
}

export async function addSessionParticipant(participant: typeof schema.session_participants.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(schema.session_participants).values(participant);
  return await getSessionParticipantById(participant.id as string);
}

export async function getSessionParticipantById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.session_participants).where(eq(schema.session_participants.id, id)).limit(1);
  return result[0];
}

export async function getSessionParticipants(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(schema.session_participants).where(eq(schema.session_participants.session_id, sessionId));
}

export async function updateSessionParticipant(id: string, updates: Partial<typeof schema.session_participants.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(schema.session_participants).set(updates).where(eq(schema.session_participants.id, id));
  return await getSessionParticipantById(id);
}
