import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { prepareScramble, shuffled, shuffledDifferent, type ScrambleWord } from '@shared/sentences';
import type { MiniGameVocab } from '@/lib/miniGameSession';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { MiniHud, PromptCard, ResultCard, actionBtn, primaryBtn } from './MiniGameParts';

const ROUND = 10;
const POINTS = 10;
const POINTS_WITH_HINT = 5;

interface Tile {
  id: number;
  ch: string;
}

function buildRound(vocab: MiniGameVocab[]): ScrambleWord[] {
  const seen = new Set<string>();
  const words: ScrambleWord[] = [];
  for (const v of shuffled(vocab)) {
    const w = prepareScramble(v.english, v.deutsch, v.id);
    if (!w) continue;
    const key = w.full.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    words.push(w);
    if (words.length >= ROUND) break;
  }
  return words;
}

function makeTiles(word: ScrambleWord): Tile[] {
  const letters = word.cells.filter((c) => c.kind === 'letter').map((c, id) => ({ id, ch: c.ch }));
  return shuffledDifferent(letters, (a, b) => a.map((t) => t.ch).join('') === b.map((t) => t.ch).join(''));
}

export default function LetterScramble({ vocab, onExit }: { vocab: MiniGameVocab[]; onExit: () => void }) {
  const { speak } = useTextToSpeech();
  const [words, setWords] = useState<ScrambleWord[]>(() => buildRound(vocab));
  const [idx, setIdx] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>(() => (words[0] ? makeTiles(words[0]) : []));
  const [slots, setSlots] = useState<(number | null)[]>(() => words[0]?.cells.filter((c) => c.kind === 'letter').map(() => null) ?? []);
  const [locked, setLocked] = useState<boolean[]>(() => words[0]?.cells.filter((c) => c.kind === 'letter').map(() => false) ?? []);
  const [hinted, setHinted] = useState(false);
  const [status, setStatus] = useState<'play' | 'ok' | 'bad'>('play');
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);

  const word = words[idx];
  const target = useMemo(() => (word ? word.cells.filter((c) => c.kind === 'letter').map((c) => c.ch) : []), [word]);
  const used = useMemo(() => new Set(slots.filter((s): s is number => s !== null)), [slots]);
  const tileById = useCallback((id: number) => tiles.find((t) => t.id === id), [tiles]);

  const startWord = useCallback((w: ScrambleWord) => {
    const n = w.cells.filter((c) => c.kind === 'letter').length;
    setTiles(makeTiles(w));
    setSlots(Array(n).fill(null));
    setLocked(Array(n).fill(false));
    setHinted(false);
    setStatus('play');
  }, []);

  // Zu früh abgeschlossene Prüfung ("bad") nach kurzer Zeit zurücksetzen
  useEffect(() => {
    if (status !== 'bad') return;
    const t = setTimeout(() => setStatus('play'), 1000);
    return () => clearTimeout(t);
  }, [status]);

  const check = useCallback(
    (nextSlots: (number | null)[], wasHinted: boolean) => {
      if (!word || nextSlots.some((s) => s === null)) return;
      const guess = nextSlots.map((id) => tileById(id as number)?.ch ?? '').join('');
      if (guess.toLowerCase() === target.join('').toLowerCase()) {
        setStatus('ok');
        setScore((s) => s + (wasHinted ? POINTS_WITH_HINT : POINTS));
        speak(word.full, 'en-US');
      } else {
        setStatus('bad');
        setMistakes((m) => m + 1);
      }
    },
    [word, target, tileById, speak],
  );

  const place = useCallback(
    (tileId: number) => {
      if (status === 'ok') return;
      const i = slots.findIndex((s) => s === null);
      if (i < 0) return;
      const next = [...slots];
      next[i] = tileId;
      setSlots(next);
      setStatus('play');
      check(next, hinted);
    },
    [slots, status, check, hinted],
  );

  const removeAt = useCallback(
    (i: number) => {
      if (status === 'ok' || locked[i] || slots[i] === null) return;
      const next = [...slots];
      next[i] = null;
      setSlots(next);
      setStatus('play');
    },
    [slots, locked, status],
  );

  const back = useCallback(() => {
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i] !== null && !locked[i]) {
        removeAt(i);
        return;
      }
    }
  }, [slots, locked, removeAt]);

  const hint = () => {
    if (status === 'ok') return;
    for (let i = 0; i < target.length; i++) {
      if (locked[i]) continue;
      const cur = slots[i] !== null ? tileById(slots[i] as number) : undefined;
      if (cur && cur.ch === target[i]) continue;
      const next = [...slots];
      let tile = tiles.find((t) => t.ch === target[i] && !used.has(t.id));
      if (!tile) {
        // Passender Buchstabe liegt an anderer, nicht gesperrter Stelle
        const j = slots.findIndex((id, k) => id !== null && k !== i && !locked[k] && tileById(id)?.ch === target[i]);
        if (j < 0) return;
        tile = tileById(slots[j] as number);
        next[j] = null;
      }
      if (!tile) return;
      next[i] = tile.id;
      const nextLocked = [...locked];
      nextLocked[i] = true;
      setSlots(next);
      setLocked(nextLocked);
      setHinted(true);
      setStatus('play');
      check(next, true);
      return;
    }
  };

  const next = useCallback(() => {
    if (idx < words.length - 1) {
      const n = idx + 1;
      setIdx(n);
      startWord(words[n]);
    } else {
      setFinished(true);
    }
  }, [idx, words, startWord]);

  // Tastatur: Buchstaben tippen, Rücktaste, Enter für "Weiter"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished || e.ctrlKey || e.metaKey || e.altKey) return;
      if (status === 'ok') {
        if (e.key === 'Enter') next();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        back();
        return;
      }
      if (e.key.length === 1 && /\S/.test(e.key)) {
        const tile = tiles.find((t) => !used.has(t.id) && t.ch.toLowerCase() === e.key.toLowerCase());
        if (tile) place(tile.id);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [finished, status, tiles, used, place, back, next]);

  const restart = () => {
    const w = buildRound(vocab);
    setWords(w);
    setIdx(0);
    setScore(0);
    setMistakes(0);
    setFinished(false);
    if (w[0]) startWord(w[0]);
  };

  if (!word) {
    return <p className="text-center font-semibold text-[#2E3192]">Für diese Auswahl gibt es keine Wörter, die sich buchstabieren lassen.</p>;
  }
  if (finished) {
    return (
      <ResultCard
        title="Geschafft"
        big={`${score} / ${words.length * POINTS}`}
        text={mistakes === 0 ? 'Alles ohne Fehler.' : `${mistakes} Fehlversuch${mistakes === 1 ? '' : 'e'}. Ohne Tipps gibt es mehr Punkte.`}
        onAgain={restart}
        onExit={onExit}
      />
    );
  }

  let letterPos = -1;
  return (
    <div>
      <MiniHud index={idx} total={words.length} score={score} mistakes={mistakes} />
      <PromptCard caption={word.prefix ? 'Schreibe das englische Verb' : 'Schreibe das englische Wort'}>{word.german}</PromptCard>

      <div className="mt-4 bg-[#F0E5D8] border-4 border-[#2E3192] rounded-xl p-4 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#2E3192]">Deine Antwort</div>
        <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[56px]">
          {word.prefix && (
            <span
              className="h-12 px-2 grid place-items-center rounded-lg border-[3px] border-dashed border-[#2E3192]/40 font-mono font-bold text-xl text-[#2E3192]/60 mr-1"
              aria-label="to, schon vorgegeben"
            >
              {word.prefix}
            </span>
          )}
          {word.cells.map((cell, ci) => {
            if (cell.kind === 'fixed') {
              return cell.ch === ' ' ? (
                <span key={ci} className="w-4" />
              ) : (
                <span key={ci} className="font-mono font-bold text-xl text-[#2E3192]">
                  {cell.ch}
                </span>
              );
            }
            letterPos += 1;
            const i = letterPos;
            const tile = slots[i] !== null ? tileById(slots[i] as number) : undefined;
            const tone =
              status === 'ok'
                ? 'bg-[#D8F3E0] border-[#1F9D4C] text-[#1F9D4C]'
                : status === 'bad' && tile
                  ? 'bg-[#FFE1E4] border-[#E63946] text-[#E63946] animate-pulse'
                  : locked[i]
                    ? 'bg-[#FFD93D] border-[#2E3192] text-[#2E3192]'
                    : tile
                      ? 'bg-white border-[#2E3192] text-[#2E3192]'
                      : 'bg-white/70 border-dashed border-[#2E3192] text-[#2E3192]';
            return (
              <button
                key={ci}
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Buchstabe ${i + 1}${tile ? `: ${tile.ch}` : ': leer'}`}
                className={`w-10 h-12 rounded-lg border-[3px] font-mono font-bold text-xl ${tone}`}
              >
                {tile?.ch ?? ''}
              </button>
            );
          })}
        </div>
        <div className="min-h-[24px] text-center font-bold" aria-live="polite">
          {status === 'ok' && <span className="text-[#1F9D4C]">Richtig: {word.full}</span>}
          {status === 'bad' && <span className="text-[#E63946]">Fast. Tippe auf einen Buchstaben, um ihn zu tauschen.</span>}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#2E3192]">Buchstaben</div>
        <div className="flex flex-wrap justify-center gap-2 min-h-[56px]">
          {tiles.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={used.has(t.id) || status === 'ok'}
              onClick={() => place(t.id)}
              aria-label={`Buchstabe ${t.ch}`}
              className="min-w-11 h-12 px-2 rounded-lg border-[3px] border-[#2E3192] bg-[#FFD93D] text-[#2E3192] font-mono font-bold text-xl shadow-[0_4px_0_#2E3192] active:translate-y-[3px] active:shadow-[0_1px_0_#2E3192] disabled:invisible transition-all"
            >
              {t.ch}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {status === 'ok' ? (
          <button type="button" className={primaryBtn} onClick={next}>
            {idx < words.length - 1 ? 'Weiter' : 'Ergebnis'}
          </button>
        ) : (
          <>
            <button type="button" className={actionBtn} onClick={back}>
              ⌫ Zurück
            </button>
            <button type="button" className={actionBtn} onClick={() => setTiles((t) => shuffled(t))}>
              Mischen
            </button>
            <button type="button" className={actionBtn} onClick={hint}>
              Tipp (−{POINTS - POINTS_WITH_HINT})
            </button>
          </>
        )}
      </div>
      {status !== 'ok' && (
        <p className="mt-3 text-center text-sm text-[#2E3192]/80">
          {word.prefix ? 'Das (to) ist schon vorgegeben. ' : ''}Tippe die Buchstaben der Reihe nach an. Am Computer kannst du auch tippen.
        </p>
      )}
    </div>
  );
}
