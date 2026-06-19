import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appRouter } from './routers';
import { TRPCError } from '@trpc/server';

describe('Multiplayer Router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });
  });

  describe('createSession', () => {
    it('should create a multiplayer session with host', async () => {
      const result = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1', 'Unit 2'],
        pages: ['1', '2', '3'],
        level: 1,
        direction: 'en-de',
      });

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session?.host_id).toBe('player-1');
      expect(result.session?.collection_id).toBe('collection-1');
      expect(result.session?.level).toBe(1);
      expect(result.session?.direction).toBe('en-de');
      expect(result.session?.status).toBe('waiting');
      expect(result.session?.session_code).toBeDefined();
      expect(result.session?.session_code?.length).toBe(8);
    });

    it('should parse units and pages correctly', async () => {
      const result = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1', 'Unit 2'],
        pages: ['10', '11', '12'],
        level: 2,
        direction: 'de-en',
      });

      expect(result.session?.units).toEqual(['Unit 1', 'Unit 2']);
      expect(result.session?.pages).toEqual(['10', '11', '12']);
    });

    it('should set expiration to 30 minutes from now', async () => {
      const beforeTime = Date.now();
      const result = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1'],
        pages: ['1'],
        level: 1,
        direction: 'en-de',
      });
      const afterTime = Date.now();

      const expiresAt = new Date(result.session?.expires_at!).getTime();
      const expectedExpiration = 30 * 60 * 1000; // 30 minutes in ms

      expect(expiresAt - beforeTime).toBeGreaterThanOrEqual(expectedExpiration - 1000);
      expect(expiresAt - afterTime).toBeLessThanOrEqual(expectedExpiration + 1000);
    });
  });

  describe('joinSession', () => {
    it('should join an existing session by code', async () => {
      // Create session first
      const createResult = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1'],
        pages: ['1'],
        level: 1,
        direction: 'en-de',
      });

      const sessionCode = createResult.session?.session_code!;

      // Join session
      const joinResult = await caller.multiplayer.joinSession({
        sessionCode,
        playerId: 'player-2',
      });

      expect(joinResult.success).toBe(true);
      expect(joinResult.session).toBeDefined();
      expect(joinResult.session?.session_code).toBe(sessionCode);
    });

    it('should not allow joining non-existent session', async () => {
      await expect(
        caller.multiplayer.joinSession({
          sessionCode: 'INVALID',
          playerId: 'player-2',
        })
      ).rejects.toThrow('Session nicht gefunden');
    });

    it('should prevent duplicate joins', async () => {
      // Create session
      const createResult = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1'],
        pages: ['1'],
        level: 1,
        direction: 'en-de',
      });

      const sessionCode = createResult.session?.session_code!;

      // First join
      await caller.multiplayer.joinSession({
        sessionCode,
        playerId: 'player-2',
      });

      // Second join (should not error, just return success)
      const secondJoin = await caller.multiplayer.joinSession({
        sessionCode,
        playerId: 'player-2',
      });

      expect(secondJoin.success).toBe(true);
    });
  });

  describe('getSessionStatus', () => {
    it('should get session status with participants', async () => {
      // Create session
      const createResult = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1'],
        pages: ['1'],
        level: 1,
        direction: 'en-de',
      });

      const sessionId = createResult.session?.id!;

      // Get status
      const statusResult = await caller.multiplayer.getSessionStatus({
        sessionId,
      });

      expect(statusResult.success).toBe(true);
      expect(statusResult.session).toBeDefined();
      expect(statusResult.participants).toBeDefined();
      expect(statusResult.participants?.length).toBeGreaterThan(0);
      expect(statusResult.participants?.[0].player_id).toBe('player-1');
    });

    it('should return error for non-existent session', async () => {
      await expect(
        caller.multiplayer.getSessionStatus({
          sessionId: 'invalid-id',
        })
      ).rejects.toThrow('Session nicht gefunden');
    });

    it('should include multiple participants', async () => {
      // Create session
      const createResult = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1'],
        pages: ['1'],
        level: 1,
        direction: 'en-de',
      });

      const sessionId = createResult.session?.id!;
      const sessionCode = createResult.session?.session_code!;

      // Add second player
      await caller.multiplayer.joinSession({
        sessionCode,
        playerId: 'player-2',
      });

      // Get status
      const statusResult = await caller.multiplayer.getSessionStatus({
        sessionId,
      });

      expect(statusResult.participants?.length).toBe(2);
      const playerIds = statusResult.participants?.map(p => p.player_id);
      expect(playerIds).toContain('player-1');
      expect(playerIds).toContain('player-2');
    });
  });

  describe('updateSessionStatus', () => {
    it('should update session status to in_progress', async () => {
      // Create session
      const createResult = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1'],
        pages: ['1'],
        level: 1,
        direction: 'en-de',
      });

      const sessionId = createResult.session?.id!;

      // Update status
      const updateResult = await caller.multiplayer.updateSessionStatus({
        sessionId,
        status: 'in_progress',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.session?.status).toBe('in_progress');
    });

    it('should update session status to completed', async () => {
      // Create session
      const createResult = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1'],
        pages: ['1'],
        level: 1,
        direction: 'en-de',
      });

      const sessionId = createResult.session?.id!;

      // Update to completed
      const updateResult = await caller.multiplayer.updateSessionStatus({
        sessionId,
        status: 'completed',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.session?.status).toBe('completed');
    });
  });

  describe('updateParticipantScore', () => {
    it('should update participant score', async () => {
      // Create session
      const createResult = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1'],
        pages: ['1'],
        level: 1,
        direction: 'en-de',
      });

      // Get participant ID from status
      const sessionId = createResult.session?.id!;
      const statusResult = await caller.multiplayer.getSessionStatus({
        sessionId,
      });

      const participantId = statusResult.participants?.[0].id!;

      // Update score
      const updateResult = await caller.multiplayer.updateParticipantScore({
        participantId,
        score: 100,
        correctAnswers: 10,
        totalAnswers: 12,
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.participant?.score).toBe(100);
      expect(updateResult.participant?.correct_answers).toBe(10);
      expect(updateResult.participant?.total_answers).toBe(12);
    });

    it('should update multiple participants independently', async () => {
      // Create session
      const createResult = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1'],
        pages: ['1'],
        level: 1,
        direction: 'en-de',
      });

      const sessionId = createResult.session?.id!;
      const sessionCode = createResult.session?.session_code!;

      // Add second player
      await caller.multiplayer.joinSession({
        sessionCode,
        playerId: 'player-2',
      });

      // Get participants
      const statusResult = await caller.multiplayer.getSessionStatus({
        sessionId,
      });

      const participant1 = statusResult.participants?.[0];
      const participant2 = statusResult.participants?.[1];

      // Update scores
      await caller.multiplayer.updateParticipantScore({
        participantId: participant1?.id!,
        score: 100,
        correctAnswers: 10,
        totalAnswers: 12,
      });

      await caller.multiplayer.updateParticipantScore({
        participantId: participant2?.id!,
        score: 80,
        correctAnswers: 8,
        totalAnswers: 12,
      });

      // Verify scores
      const finalStatus = await caller.multiplayer.getSessionStatus({
        sessionId,
      });

      const updated1 = finalStatus.participants?.find(p => p.id === participant1?.id);
      const updated2 = finalStatus.participants?.find(p => p.id === participant2?.id);

      expect(updated1?.score).toBe(100);
      expect(updated2?.score).toBe(80);
    });
  });

  describe('Session lifecycle', () => {
    it('should complete full session lifecycle', async () => {
      // 1. Create session
      const createResult = await caller.multiplayer.createSession({
        hostId: 'player-1',
        collectionId: 'collection-1',
        units: ['Unit 1', 'Unit 2'],
        pages: ['1', '2'],
        level: 2,
        direction: 'de-en',
      });

      expect(createResult.success).toBe(true);
      const sessionId = createResult.session?.id!;
      const sessionCode = createResult.session?.session_code!;

      // 2. Join session
      const joinResult = await caller.multiplayer.joinSession({
        sessionCode,
        playerId: 'player-2',
      });

      expect(joinResult.success).toBe(true);

      // 3. Check status
      const statusResult = await caller.multiplayer.getSessionStatus({
        sessionId,
      });

      expect(statusResult.participants?.length).toBe(2);

      // 4. Start game
      const startResult = await caller.multiplayer.updateSessionStatus({
        sessionId,
        status: 'in_progress',
      });

      expect(startResult.session?.status).toBe('in_progress');

      // 5. Update scores
      const participant1 = statusResult.participants?.[0];
      await caller.multiplayer.updateParticipantScore({
        participantId: participant1?.id!,
        score: 150,
        correctAnswers: 15,
        totalAnswers: 20,
      });

      // 6. End game
      const endResult = await caller.multiplayer.updateSessionStatus({
        sessionId,
        status: 'completed',
      });

      expect(endResult.session?.status).toBe('completed');

      // 7. Verify final state
      const finalStatus = await caller.multiplayer.getSessionStatus({
        sessionId,
      });

      expect(finalStatus.session?.status).toBe('completed');
      expect(finalStatus.participants?.length).toBe(2);
      const updatedParticipant1 = finalStatus.participants?.find(p => p.id === participant1?.id);
      expect(updatedParticipant1?.score).toBe(150);
    });
  });
});
