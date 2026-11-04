import { useCallback, useEffect, useRef, useState } from 'react';
import { buildMemoryPairs, shuffled } from '@shared/sentences';
import type { MiniGameVocab } from '@/lib/miniGameSession';
import { ResultCard } from './MiniGameParts';

const SIZES = [6, 8, 10] as const;
const MISMATCH_DELAY = 1000;

type CardState = 'down' | 'up' | 'done';

interface MemoryCard {
  id: string;
  pairKey: string;
  lang: 'en' | 'de';
  text: string;
  state: CardState;
}

function buildCards(vocab: MiniGameVocab[], pairs: number): MemoryCard[] {
  const chosen = buildMemoryPairs(vocab, pairs);
  const cards: MemoryCard[] = [];
  for (const p of chosen) {
    cards.push({ id: `${p.key}-en`, pairKey: p.key, lang: 'en', text: p.en, state: 'down' });
    cards.push({ id: `${p.key}-de`, pairKey: p.key, lang: 'de', text: p.de, state: 'down' });
  }
  return shuffled(cards);
}

export default function MemoryGame({ vocab, onExit }: { vocab: MiniGameVocab[]; onExit: () => void }) {
  const [pairCount, setPairCount] = useState<number>(8);
  const [cards, setCards] = useState<MemoryCard[]>(() => buildCards(vocab, 8));
  const [firstId, setFirstId] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = cards.length / 2;
  const found = cards.filter((c) => c.state === 'done').length / 2;
  const locked = wrongIds.length > 0;

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  useEffect(() => clearTimer, []);

  const start = useCallback(
    (pairs: number) => {
      clearTimer();
      setPairCount(pairs);
      setCards(buildCards(vocab, pairs));
      setFirstId(null);
      setWrongIds([]);
      setMoves(0);
      setMistakes(0);
      setFinished(false);
    },
    [vocab],
  );

  const flip = (card: MemoryCard) => {
    if (locked || card.state !== 'down') return;

    if (firstId === null) {
      setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, state: 'up' } : c)));
      setFirstId(card.id);
      return;
    }

    const first = cards.find((c) => c.id === firstId)!;
    setMoves((m) => m + 1);
    setFirstId(null);

    if (first.pairKey === card.pairKey && first.lang !== card.lang) {
      const next = cards.map((c) => (c.id === first.id || c.id === card.id ? { ...c, state: 'done' as const } : c));
      setCards(next);
      if (next.every((c) => c.state === 'done')) {
        timer.current = setTimeout(() => setFinished(true), 700);
      }
      return;
    }

    setMistakes((m) => m + 1);
    setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, state: 'up' } : c)));
    setWrongIds([first.id, card.id]);
    timer.current = setTimeout(() => {
      setCards((cs) => cs.map((c) => (c.id === first.id || c.id === card.id ? { ...c, state: 'down' } : c)));
      setWrongIds([]);
    }, MISMATCH_DELAY);
  };

  if (cards.length === 0) {
    return <p className="text-center font-semibold text-[#2E3192]">Für diese Auswahl gibt es zu wenige Wörter für ein Memory.</p>;
  }

  if (finished) {
    return (
      <ResultCard
        title="Alle Paare gefunden"
        big={`${moves} Züge`}
        text={mistakes === 0 ? 'Kein einziger Fehlversuch.' : `${mistakes} Fehlversuch${mistakes === 1 ? '' : 'e'}. Mit Merken geht es noch schneller.`}
        onAgain={() => start(pairCount)}
        onExit={onExit}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3 font-mono text-sm font-bold text-[#2E3192]">
        <span className="px-3 py-1 rounded-full bg-white border-2 border-[#2E3192]">
          Paare {found} / {total}
        </span>
        <span className="px-3 py-1 rounded-full bg-white border-2 border-[#2E3192]">Züge {moves}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E3192]">Paare</span>
        {SIZES.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={n === pairCount}
            onClick={() => start(n)}
            className={`px-4 py-1 rounded-full font-bold border-2 border-[#2E3192] ${
              n === pairCount ? 'bg-[#2E3192] text-[#FFFBF0]' : 'bg-white text-[#2E3192]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((c) => {
          const open = c.state !== 'down';
          const wrong = wrongIds.includes(c.id);
          const face =
            c.state === 'done'
              ? 'bg-[#D8F3E0] border-[#1F9D4C] text-[#1F9D4C]'
              : wrong
                ? 'bg-[#FFE1E4] border-[#E63946] text-[#E63946]'
                : c.lang === 'en'
                  ? 'bg-[#FFD93D] border-[#2E3192] text-[#2E3192]'
                  : 'bg-[#FFC2D8] border-[#2E3192] text-[#2E3192]';
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => flip(c)}
              aria-label={open ? `${c.lang === 'en' ? 'Englisch' : 'Deutsch'}: ${c.text}` : 'Karte, verdeckt'}
              className="relative aspect-[3/4] min-w-0 [perspective:600px]"
            >
              <span
                className={`absolute inset-0 transition-transform duration-300 motion-reduce:transition-none [transform-style:preserve-3d] ${
                  open ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                <span className="absolute inset-0 grid place-items-center rounded-xl border-[3px] border-[#2E3192] bg-[#2E3192] text-[#FFD93D] font-mono font-bold text-3xl shadow-[0_4px_0_#1a1a5f] [backface-visibility:hidden]">
                  ?
                </span>
                <span
                  className={`absolute inset-0 grid place-items-center overflow-hidden rounded-xl border-[3px] p-1 text-center font-semibold leading-tight text-[clamp(13px,3.6vw,17px)] [overflow-wrap:anywhere] [backface-visibility:hidden] [transform:rotateY(180deg)] ${face}`}
                >
                  <span className="absolute top-0.5 left-1.5 font-mono text-[9px] font-bold opacity-60">{c.lang === 'en' ? 'EN' : 'DE'}</span>
                  {c.text}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-sm text-[#2E3192]/80">Finde zu jedem englischen Wort (gelb) die deutsche Übersetzung (rosa).</p>
    </div>
  );
}
