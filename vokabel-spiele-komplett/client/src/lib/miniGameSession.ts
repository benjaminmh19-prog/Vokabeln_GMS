/**
 * Übergibt die Auswahl (Vokabeln, Spielart) von der Auswahlseite an die Mini-Spiele.
 * Liegt in der sessionStorage, damit ein Neuladen der Seite die Runde nicht verliert.
 */
export type MiniGameType = 'scramble' | 'sentences' | 'memory';

export interface MiniGameVocab {
  id?: string;
  english: string;
  deutsch: string;
}

export interface MiniGameSession {
  type: MiniGameType;
  label: string;
  vocab: MiniGameVocab[];
}

const KEY = 'vokabel-champion-minigame';

export function saveMiniGameSession(session: MiniGameSession): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* Speicher nicht verfügbar: Seite funktioniert trotzdem für diese Sitzung nicht neu ladbar */
  }
}

export function loadMiniGameSession(): MiniGameSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as MiniGameSession;
    if (!data || !Array.isArray(data.vocab) || !['scramble', 'sentences', 'memory'].includes(data.type)) return null;
    return data;
  } catch {
    return null;
  }
}

export const MINI_GAME_TITLES: Record<MiniGameType, string> = {
  scramble: 'Buchstabensalat',
  sentences: 'Sätze bilden',
  memory: 'Wörter-Memory',
};
