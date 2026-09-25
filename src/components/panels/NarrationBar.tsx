import type { Step } from '../../core/types';
import { usePlayerStore } from '../../core/player';

interface NarrationBarProps {
  step: Step | null;
  cursor: number;
  total: number;
}

export function NarrationBar({ step, cursor, total }: NarrationBarProps) {
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  return (
    <div className="flex min-h-14 shrink-0 items-start gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2.5 sm:gap-4 sm:px-4">
      <span
        className={`shrink-0 px-2 py-0.5 rounded-[var(--radius-control)] text-[11px] font-mono tabular-nums ${
          step ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]' : 'bg-[var(--color-surface-3)] text-[var(--color-text-dim)]'
        }`}
      >
        {total > 0 ? `${cursor + 1}/${total}` : '0/0'}
      </span>
      <p
        key={cursor}
        className="anim-step-in max-h-20 flex-1 overflow-y-auto text-sm leading-relaxed text-[var(--color-text)]"
      >
        {step?.description ?? 'Select an algorithm from the sidebar and press Play.'}
      </p>
      <span className="sr-only" aria-live={isPlaying ? 'off' : 'polite'} aria-atomic="true">
        {step ? `Step ${cursor + 1} of ${total}. ${step.description}` : ''}
      </span>
    </div>
  );
}