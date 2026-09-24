import type { Step } from '../../core/types';

interface ConsolePanelProps {
  step: Step | null;
}

export function ConsolePanel({ step }: ConsolePanelProps) {
  const lines = step?.console ?? [];

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-3 pt-2.5 pb-1.5 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Console
        </h3>
        <span className="text-[10px] font-mono text-[#4a4d5a]">{lines.length} line{lines.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-3 py-2 font-mono text-[11.5px] leading-relaxed">
        {lines.length === 0 ? (
          <p className="text-[#4a4d5a] italic font-sans text-[11px]">No output yet.</p>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-[#4a4d5a] shrink-0 select-none">{i + 1}</span>
              <span className="text-white break-all">{line}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
