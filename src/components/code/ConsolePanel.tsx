import { useEffect, useRef } from 'react';
import type { Step } from '../../core/types';
import { usePlayerStore } from '../../core/player';

interface ConsolePanelProps {
  step: Step | null;
}

export function ConsolePanel({ step }: ConsolePanelProps) {
  const lines = step?.console ?? [];
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedToBottom = useRef(true);

  useEffect(() => {
    if (pinnedToBottom.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines.length]);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-3 pt-2.5 pb-1.5 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Console
        </h3>
        <span className="text-[10px] font-mono text-[var(--color-text-dim)]">{lines.length} line{lines.length !== 1 ? 's' : ''}</span>
      </div>
      <div
        ref={scrollRef}
        role="log"
        aria-live="off"
        aria-label="Program output"
        onScroll={(event) => {
          const element = event.currentTarget;
          pinnedToBottom.current = element.scrollTop + element.clientHeight >= element.scrollHeight - 24;
        }}
        className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed"
      >
        {lines.length === 0 ? (
          <p className="text-[var(--color-text-dim)] italic font-sans text-[11px]">No output yet.</p>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-[var(--color-text-dim)] shrink-0 select-none">{i + 1}</span>
              <span className="text-[var(--color-text)] break-all">{line}</span>
            </div>
          ))
        )}
      </div>
      <p className="sr-only" aria-live={isPlaying ? 'off' : 'polite'} aria-atomic="true">
        {lines.length > 0 ? `New output: ${lines[lines.length - 1]}` : ''}
      </p>
    </div>
  );
}
