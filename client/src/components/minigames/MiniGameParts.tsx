import { ReactNode } from 'react';

/** Fortschrittspunkte, Punkte und Fehler oben im Spiel. */
export function MiniHud({ index, total, score, mistakes }: { index: number; total: number; score: number; mistakes: number }) {
  const showDots = total <= 20;
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      {showDots ? (
        <div className="flex flex-wrap gap-1" aria-label={`Aufgabe ${Math.min(index + 1, total)} von ${total}`}>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full border-2 border-[#2E3192] ${
                i < index ? 'bg-[#6BCB77] border-[#6BCB77]' : i === index ? 'bg-[#FFD93D]' : 'bg-white'
              }`}
            />
          ))}
        </div>
      ) : (
        <span className="font-bold text-[#2E3192]">
          {Math.min(index + 1, total)} / {total}
        </span>
      )}
      <div className="flex gap-2 font-mono text-sm font-bold text-[#2E3192]">
        <span className="px-3 py-1 rounded-full bg-white border-2 border-[#2E3192]">★ {score}</span>
        <span className="px-3 py-1 rounded-full bg-white border-2 border-[#2E3192]">✕ {mistakes}</span>
      </div>
    </div>
  );
}

/** Rosa Aufgabenkarte mit Anweisung und deutschem Text. */
export function PromptCard({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="rounded-xl p-6 border-4 border-[#2E3192] text-center text-white bg-gradient-to-r from-[#FF6B9D] to-[#E63946]">
      <div className="text-xs font-bold uppercase tracking-wider mb-2">{caption}</div>
      <div className="font-mono font-bold text-2xl md:text-3xl text-balance">{children}</div>
    </div>
  );
}

export function ResultCard({
  title,
  big,
  text,
  onAgain,
  onExit,
}: {
  title: string;
  big: string;
  text: string;
  onAgain: () => void;
  onExit: () => void;
}) {
  return (
    <div className="bg-white border-4 border-[#2E3192] rounded-xl p-8 text-center space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-[#2E3192]">{title}</div>
      <div className="font-mono font-bold text-4xl text-[#FF6B9D]">{big}</div>
      <div className="text-[#2E3192] font-semibold">{text}</div>
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <button
          onClick={onAgain}
          className="px-6 py-3 rounded-lg font-bold text-white bg-[#FF6B9D] border-2 border-[#2E3192] hover:bg-[#E63946] active:scale-95 transition-all"
        >
          Nochmal spielen
        </button>
        <button
          onClick={onExit}
          className="px-6 py-3 rounded-lg font-bold text-[#2E3192] bg-[#F0E5D8] border-2 border-[#2E3192] hover:bg-[#FFD93D] active:scale-95 transition-all"
        >
          Zur Auswahl
        </button>
      </div>
    </div>
  );
}

export const actionBtn =
  'px-4 py-2 rounded-lg font-bold border-2 border-[#2E3192] bg-white text-[#2E3192] shadow-[0_3px_0_#2E3192] hover:bg-[#FFF4D6] active:translate-y-[2px] active:shadow-[0_1px_0_#2E3192] disabled:opacity-40 disabled:cursor-not-allowed transition-all';
export const primaryBtn =
  'px-4 py-2 rounded-lg font-bold border-2 border-[#2E3192] bg-[#FF6B9D] text-white shadow-[0_3px_0_#2E3192] hover:bg-[#E63946] active:translate-y-[2px] active:shadow-[0_1px_0_#2E3192] disabled:opacity-40 disabled:cursor-not-allowed transition-all';
