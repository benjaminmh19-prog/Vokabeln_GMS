import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createPlayer, getPlayerByUsername, deletePlayer, getAllPlayers, getAllVocabulary, getVocabularyById, createVocabulary, updateVocabulary, deleteVocabulary, getAllCollections, getCollectionById, createCollection, updateCollection, deleteCollection, createMultiplayerSession, getMultiplayerSessionById, getMultiplayerSessionByCode, updateMultiplayerSession, addSessionParticipant, getSessionParticipants, updateSessionParticipant } from "./db";
import { z } from "zod";
import { nanoid } from "nanoid";
import bcryptjs from "bcryptjs";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input }) => {
        const player = await getPlayerByUsername(input.username);
        if (!player) {
          throw new Error("Spieler nicht gefunden");
        }

        const passwordMatch = await bcryptjs.compare(input.password, player.password_hash || "");
        if (!passwordMatch) {
          throw new Error("Passwort ist falsch");
        }

        return {
          id: player.id,
          username: player.username,
          name: player.name,
        };
      }),
    register: publicProcedure
      .input(
        z.object({
          username: z.string().min(3).max(20),
          password: z.string().min(6),
          name: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const existingPlayer = await getPlayerByUsername(input.username);
        if (existingPlayer) {
          throw new Error("Dieser Benutzername existiert bereits");
        }

        const hashedPassword = await bcryptjs.hash(input.password, 10);
        const playerId = nanoid();

        const newPlayer = await createPlayer({
          id: playerId,
          username: input.username.toLowerCase(),
          name: input.name,
          password_hash: hashedPassword,
        });

        return {
          id: newPlayer?.id,
          username: newPlayer?.username,
          name: newPlayer?.name,
        };
      }),
  }),

  players: router({
    list: publicProcedure.query(async () => {
      return await getAllPlayers();
    }),
    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          console.log('[tRPC] Deleting player:', input.id);
          const result = await deletePlayer(input.id);
          console.log('[tRPC] Player deleted successfully:', input.id);
          return { success: true };
        } catch (error) {
          console.error('[tRPC] Error deleting player:', error);
          throw new Error(`Fehler beim Loeschen des Spielers: ${error}`);
        }
      }),
  }),

  admin_vocabulary: router({
    list: publicProcedure.query(async () => {
      return await getAllVocabulary();
    }),
    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await getVocabularyById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        id: z.string(),
        unit: z.string(),
        page: z.string(),
        english: z.string(),
        deutsch: z.string(),
        collection_id: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const vocab = await createVocabulary({
            ...input,
            collection_id: input.collection_id || 'collection-1',
          });
          return { success: true, data: vocab };
        } catch (error) {
          throw new Error(`Fehler beim Erstellen der Vokabel: ${error}`);
        }
      }),
    update: publicProcedure
      .input(z.object({
        id: z.string(),
        unit: z.string().optional(),
        page: z.string().optional(),
        english: z.string().optional(),
        deutsch: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { id, ...updates } = input;
          const vocab = await updateVocabulary(id, updates);
          return { success: true, data: vocab };
        } catch (error) {
          throw new Error(`Fehler beim Aktualisieren der Vokabel: ${error}`);
        }
      }),
    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await deleteVocabulary(input.id);
          return { success: true };
        } catch (error) {
          throw new Error(`Fehler beim Loeschen der Vokabel: ${error}`);
        }
      }),
  }),

  admin_collections: router({
    list: publicProcedure.query(async () => {
      return await getAllCollections();
    }),
    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await getCollectionById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        id: z.string(),
        name: z.string(),
        learning_year: z.number(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const collection = await createCollection({
            id: input.id,
            name: input.name,
            learning_year: input.learning_year,
            description: input.description,
          });
          return { success: true, data: collection };
        } catch (error) {
          throw new Error(`Fehler beim Erstellen der Sammlung: ${error}`);
        }
      }),
    update: publicProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        learning_year: z.number().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { id, ...updates } = input;
          const collection = await updateCollection(id, updates);
          return { success: true, data: collection };
        } catch (error) {
          throw new Error(`Fehler beim Aktualisieren der Sammlung: ${error}`);
        }
      }),
    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await deleteCollection(input.id);
          return { success: true };
        } catch (error) {
          throw new Error(`Fehler beim Loeschen der Sammlung: ${error}`);
        }
      }),
  }),

  multiplayer: router({
    createSession: publicProcedure
      .input(z.object({
        hostId: z.string(),
        collectionId: z.string(),
        units: z.array(z.string()),
        pages: z.array(z.string()),
        level: z.number(),
        direction: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const sessionId = nanoid();
          const sessionCode = nanoid(8).toUpperCase();
          const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

          const session = await createMultiplayerSession({
            id: sessionId,
            host_id: input.hostId,
            session_code: sessionCode,
            collection_id: input.collectionId,
            units: JSON.stringify(input.units),
            pages: JSON.stringify(input.pages),
            level: input.level,
            direction: input.direction,
            status: 'waiting',
            max_players: 4,
            created_at: new Date(),
            expires_at: expiresAt,
            updated_at: new Date(),
          });

          if (session) {
            await addSessionParticipant({
              id: nanoid(),
              session_id: session.id,
              player_id: input.hostId,
              score: 0,
              correct_answers: 0,
              total_answers: 0,
              joined_at: new Date(),
            });
          }

          return {
            success: true,
            session: {
              ...session,
              units: input.units,
              pages: input.pages,
            },
          };
        } catch (error) {
          console.error('[tRPC] Error creating session:', error);
          throw new Error(`Fehler beim Erstellen der Session: ${error}`);
        }
      }),

    joinSession: publicProcedure
      .input(z.object({
        sessionCode: z.string(),
        playerId: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const session = await getMultiplayerSessionByCode(input.sessionCode);
          if (!session) {
            throw new Error('Session nicht gefunden');
          }

          if (session.status !== 'waiting') {
            throw new Error('Session ist nicht mehr verfügbar');
          }

          const participants = await getSessionParticipants(session.id);
          const alreadyJoined = participants.some(p => p.player_id === input.playerId);
          if (alreadyJoined) {
            return { success: true, session };
          }

          await addSessionParticipant({
            id: nanoid(),
            session_id: session.id,
            player_id: input.playerId,
            score: 0,
            correct_answers: 0,
            total_answers: 0,
            joined_at: new Date(),
          });

          return {
            success: true,
            session: {
              ...session,
              units: JSON.parse(session.units),
              pages: JSON.parse(session.pages),
            },
          };
        } catch (error) {
          console.error('[tRPC] Error joining session:', error);
          throw new Error(`Fehler beim Beitreten zur Session: ${error}`);
        }
      }),

    // Suche in routers.ts die Multiplayer-Procedure 'getSessionStatus'
    getSessionStatus: publicProcedure
       .input(z.object({ sessionId: z.string() }))
       .query(async ({ input }) => {
    try {
      const session = await getMultiplayerSessionById(input.sessionId);
      if (!session) throw new Error('Session nicht gefunden');

      const participants = await getSessionParticipants(session.id);

      return {
        success: true,
        session: {
          ...session,
          // Diese Änderung verhindert, dass JSON.parse auf Daten angewendet wird, die keine Strings sind
          units: typeof session.units === 'string' ? JSON.parse(session.units) : session.units,
          pages: typeof session.pages === 'string' ? JSON.parse(session.pages) : session.pages,
        },
        participants,
      };
    } catch (error) {
      throw new Error(`Fehler: ${error}`);
    }
  }),

    updateSessionStatus: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        status: z.enum(['waiting', 'in_progress', 'completed']),
      }))
      .mutation(async ({ input }) => {
        try {
          const session = await updateMultiplayerSession(input.sessionId, {
            status: input.status,
            updated_at: new Date(),
          });

          return { success: true, session };
        } catch (error) {
          console.error('[tRPC] Error updating session status:', error);
          throw new Error(`Fehler beim Aktualisieren der Session: ${error}`);
        }
      }),

    updateParticipantScore: publicProcedure
      .input(z.object({
        participantId: z.string(),
        score: z.number(),
        correctAnswers: z.number(),
        totalAnswers: z.number(),
      }))
      .mutation(async ({ input }) => {
        try {
          const participant = await updateSessionParticipant(input.participantId, {
            score: input.score,
            correct_answers: input.correctAnswers,
            total_answers: input.totalAnswers,
          });

          return { success: true, participant };
        } catch (error) {
          console.error('[tRPC] Error updating participant score:', error);
          throw new Error(`Fehler beim Aktualisieren des Scores: ${error}`);
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
