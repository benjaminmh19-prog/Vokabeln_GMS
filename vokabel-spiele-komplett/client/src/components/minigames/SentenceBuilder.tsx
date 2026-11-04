import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  isSentenceCorrect,
  pickSentences,
  shuffledDifferent,
  tokenizeSentence,
  type SentenceItem,
} from '@shared/sentences';
import type { MiniGameVocab } from '@/lib/miniGameSession';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { MiniHud, PromptCard, ResultCard, actionBtn, primaryBtn } from './MiniGameParts';

const ROUND = 20;
const POINTS = 10;
const POINTS_RETRY = 5;
const DRAG_THRESHOLD = 7;

interface Tok {
  id: number;
  w: string;
}

interface GhostState {
  id: number;
  label: string;
  x: number;
  y: number;
  width: number;
  /** Einfügeposition in der Zeile, null wenn der Finger außerhalb der Zeile ist */
  over: number | null;
  caret: { left: number; top: number } | null;
}

function sameOrder(a: Tok[], b: Tok[]) {
  return a.map((t) => t.w).join(' ') === b.map((t) => t.w).join(' ');
}

export default function SentenceBuilder({
  vocab,
  sentences,
  onExit,
}: {
  vocab: MiniGameVocab[];
  sentences: SentenceItem[];
  onExit: () => void;
}) {
  const { speak } = useTextToSpeech();
  const allowedIds = useRef(new Set(vocab.map((v) => v.id).filter((id): id is string => !!id)));

  const [round, setRound] = useState<SentenceItem[]>(() => pickSentences(sentences, allowedIds.current, ROUND));
  const [idx, setIdx] = useState(0);
  const [bank, setBank] = useState<Tok[]>([]);
  const [line, setLine] = useState<Tok[]>([]);
  const [status, setStatus] = useState<'play' | 'ok' | 'bad'>('play');
  const [tries, setTries] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const [ghost, setGhost] = useState<GhostState | null>(null);

  const lineRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef(new Map<number, HTMLElement>());
  const dragRef = useRef<{ id: number; sx: number; sy: number; moving: boolean; pid: number; width: number; label: string } | null>(null);

  const current = round[idx];
  const parts = current ? tokenizeSentence(current.sentence_en) : { tokens: [], endMark: '' };

  const startSentence = useCallback((s: SentenceItem) => {
    const toks = tokenizeSentence(s.sentence_en).tokens.map((w, id) => ({ id, w }));
    setBank(shuffledDifferent(toks, sameOrder));
    setLine([]);
    setStatus('play');
    setTries(0);
  }, []);

  useEffect(() => {
    if (round[0]) startSentence(round[0]);
    // nur beim ersten Rendern
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Falsche Anordnung wird nach einer Weile wieder neutral dargestellt
  useEffect(() => {
    if (status !== 'bad') return;
    const t = setTimeout(() => setStatus('play'), 1500);
    return () => clearTimeout(t);
  }, [status]);

  const find = (id: number) => [...bank, ...line].find((t) => t.id === id);

  const moveTo = useCallback(
    (id: number, where: 'line' | 'bank', at?: number | null) => {
      const tok = [...bank, ...line].find((t) => t.id === id);
      if (!tok) return;
      const nb = bank.filter((t) => t.id !== id);
      const nl = line.filter((t) => t.id !== id);
      if (where === 'line') {
        const pos = at == null || at > nl.length ? nl.length : at;
        nl.splice(pos, 0, tok);
      } else {
        nb.push(tok);
      }
      setBank(nb);
      setLine(nl);
      setStatus('play');
    },
    [bank, line],
  );

  const insertIndex = (x: number, y: number, dragId: number): number => {
    const toks = line.filter((t) => t.id !== dragId);
    for (let i = 0; i < toks.length; i++) {
      const el = chipRefs.current.get(toks[i].id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (y < r.top) return i;
      if (y <= r.bottom && x < r.left + r.width / 2) return i;
    }
    return toks.length;
  };

  const caretFor = (index: number, dragId: number) => {
    const container = lineRef.current;
    if (!container) return null;
    const lr = container.getBoundingClientRect();
    const toks = line.filter((t) => t.id !== dragId);
    if (toks.length === 0) return { left: 14, top: 12 };
    if (index < toks.length) {
      const el = chipRefs.current.get(toks[index].id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left - lr.left - 9, top: r.top - lr.top - 3 };
    }
    const el = chipRefs.current.get(toks[toks.length - 1].id);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.right - lr.left + 3, top: r.top - lr.top - 3 };
  };

  const overLine = (x: number, y: number) => {
    const r = lineRef.current?.getBoundingClientRect();
    return !!r && x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>, tok: Tok) => {
    if (status === 'ok') return;
    e.preventDefault();
    dragRef.current = {
      id: tok.id,
      sx: e.clientX,
      sy: e.clientY,
      moving: false,
      pid: e.pointerId,
      width: e.currentTarget.offsetWidth,
      label: tok.w,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* nicht kritisch */
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pid) return;
    if (!d.moving && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > DRAG_THRESHOLD) d.moving = true;
    if (!d.moving) return;
    const inside = overLine(e.clientX, e.clientY);
    const over = inside ? insertIndex(e.clientX, e.clientY, d.id) : null;
    setGhost({
      id: d.id,
      label: d.label,
      x: e.clientX,
      y: e.clientY,
      width: d.width,
      over,
      caret: over === null ? null : caretFor(over, d.id),
    });
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pid) return;
    dragRef.current = null;
    setGhost(null);
    if (!d.moving) {
      // Antippen: Wort in die Zeile legen bzw. zurücknehmen
      moveTo(d.id, line.some((t) => t.id === d.id) ? 'bank' : 'line');
      return;
    }
    if (overLine(e.clientX, e.clientY)) moveTo(d.id, 'line', insertIndex(e.clientX, e.clientY, d.id));
    else moveTo(d.id, 'bank');
  };

  const onPointerCancel = () => {
    dragRef.current = null;
    setGhost(null);
  };

  const check = () => {
    if (!current || bank.length > 0) return;
    if (isSentenceCorrect(line.map((t) => t.w), current.sentence_en, current.alt_en ?? [])) {
      setStatus('ok');
      setScore((s) => s + (tries === 0 ? POINTS : POINTS_RETRY));
      speak(current.sentence_en, 'en-US');
    } else {
      setStatus('bad');
      setTries((t) => t + 1);
      setMistakes((m) => m + 1);
    }
  };

  const reset = () => {
    setBank((b) => shuffledDifferent([...b, ...line], sameOrder));
    setLine([]);
    setStatus('play');
  };

  const next = () => {
    if (idx < round.length - 1) {
      const n = idx + 1;
      setIdx(n);
      startSentence(round[n]);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    const r = pickSentences(sentences, allowedIds.current, ROUND);
    setRound(r);
    setIdx(0);
    setScore(0);
    setMistakes(0);
    setFinished(false);
    if (r[0]) startSentence(r[0]);
  };

  if (!current) {
    return (
      <p className="text-center font-semibold text-[#2E3192]">
        Für diese Auswahl gibt es noch keine Beispielsätze. Wähle andere Seiten oder trage zuerst Sätze ein.
      </p>
    );
  }
  if (finished) {
    return (
      <ResultCard
        title="Geschafft"
        big={`${score} / ${round.length * POINTS}`}
        text={mistakes === 0 ? 'Alle Sätze auf Anhieb richtig.' : `${mistakes} Fehlversuch${mistakes === 1 ? '' : 'e'}. Beim ersten Versuch gibt es volle Punkte.`}
        onAgain={restart}
        onExit={onExit}
      />
    );
  }

  const lineTone =
    status === 'ok'
      ? 'border-solid border-[#1F9D4C] bg-[#D8F3E0]'
      : status === 'bad'
        ? 'border-solid border-[#E63946] bg-[#FFE1E4]'
        : 'border-dashed border-[#2E3192] bg-white';

  const chip = (t: Tok, inLine: boolean) => (
    <span
      key={t.id}
      ref={(el) => {
        if (el) chipRefs.current.set(t.id, el);
        else chipRefs.current.delete(t.id);
      }}
      role="button"
      tabIndex={0}
      aria-label={`${t.w}, ${inLine ? 'in der Zeile' : 'bei den Wörtern'}`}
      onPointerDown={(e) => onPointerDown(e, t)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && status !== 'ok') {
          e.preventDefault();
          moveTo(t.id, inLine ? 'bank' : 'line');
        }
      }}
      className={`touch-none select-none h-11 inline-flex items-center px-3.5 rounded-lg border-[3px] border-[#2E3192] bg-white text-[#2E3192] font-semibold text-lg shadow-[0_4px_0_#2E3192] ${
        status === 'ok' ? 'cursor-default' : 'cursor-grab'
      } ${ghost?.id === t.id ? 'opacity-25' : ''}`}
    >
      {t.w}
    </span>
  );

  return (
    <div>
      <MiniHud index={idx} total={round.length} score={score} mistakes={mistakes} />
      <PromptCard caption="Bilde den englischen Satz">{current.sentence_de}</PromptCard>

      <div className="mt-4 bg-[#F0E5D8] border-4 border-[#2E3192] rounded-xl p-4 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#2E3192]">Dein Satz</div>
        <div className="flex items-end gap-1">
          <div
            ref={lineRef}
            className={`relative flex-1 flex flex-wrap gap-2 content-start min-h-[112px] p-3 rounded-xl border-[3px] ${lineTone} ${
              status === 'bad' ? 'animate-pulse' : ''
            }`}
          >
            {line.map((t) => chip(t, true))}
            {ghost?.caret && (
              <div className="absolute w-[5px] h-11 rounded bg-[#FF6B9D] pointer-events-none" style={{ left: ghost.caret.left, top: ghost.caret.top }} />
            )}
          </div>
          {parts.endMark && <span className="font-mono font-bold text-2xl text-[#2E3192] pb-2">{parts.endMark}</span>}
        </div>
        <div className="min-h-[24px] text-center font-bold" aria-live="polite">
          {status === 'ok' && <span className="text-[#1F9D4C]">Richtig!</span>}
          {status === 'bad' && <span className="text-[#E63946]">Noch nicht ganz. Zieh die Wörter in eine andere Reihenfolge.</span>}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#2E3192]">Wörter</div>
        <div className="flex flex-wrap justify-center gap-2 min-h-[52px] p-1">{bank.map((t) => chip(t, false))}</div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {status === 'ok' ? (
          <button type="button" className={primaryBtn} onClick={next}>
            {idx < round.length - 1 ? 'Weiter' : 'Ergebnis'}
          </button>
        ) : (
          <>
            <button type="button" className={actionBtn} onClick={reset}>
              Zurücksetzen
            </button>
            <button type="button" className={primaryBtn} onClick={check} disabled={bank.length > 0}>
              Prüfen
            </button>
          </>
        )}
      </div>
      <p className="mt-3 text-center text-sm text-[#2E3192]/80">
        {status === 'ok'
          ? `Lernwort-Satz: ${current.sentence_en}`
          : 'Zieh die Wörter in die Zeile oder tippe sie an. Tippen auf ein gesetztes Wort nimmt es zurück.'}
      </p>

      {ghost && (
        <span
          aria-hidden
          className="fixed z-50 pointer-events-none h-11 inline-flex items-center justify-center px-3.5 rounded-lg border-[3px] border-[#2E3192] bg-[#FFD93D] text-[#2E3192] font-semibold text-lg shadow-xl -rotate-3"
          style={{ left: ghost.x - ghost.width / 2, top: ghost.y - 22, width: ghost.width }}
        >
          {ghost.label}
        </span>
      )}
    </div>
  );
}
