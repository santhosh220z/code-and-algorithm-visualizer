import type { Step } from '../../core/types';

interface NarrationBarProps {
  step: Step | null;
  cursor: number;
  total: number;
}

export function NarrationBar({ step, cursor, total }: NarrationBarProps) {
  return (
    <div className="shrink-0 h-14 px-4 py-2 bg-[#191b24] border-t border-[var(--color-border)] flex items-center gap-4">
      <span
        className={`shrink-0 px-2 py-0.5 rounded-md text-[11px] font-mono ${
          step ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)]' : 'bg-[#20222f] text-[#4a4d5a]'
        }`}
      >
        {total > 0 ? `${cursor + 1}/${total}` : '0/0'}
      </span>
      <p
        key={cursor}
        className="anim-step-in flex-1 text-[13px] leading-snug text-[var(--color-text)] truncate"
        title={step?.description ?? ''}
      >
        {step?.description ?? 'Select an algorithm from the sidebar and press Play.'}
      </p>
    </div>
  );
}