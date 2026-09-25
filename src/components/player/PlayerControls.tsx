import { useEffect } from 'react';
import { usePlayerStore } from '../../core/player';

const SPEEDS = [0.5, 1, 2, 4, 8];

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export function PlayerControls() {
  const steps = usePlayerStore((s) => s.steps);
  const cursor = usePlayerStore((s) => s.cursor);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const speed = usePlayerStore((s) => s.speed);
  const stepForward = usePlayerStore((s) => s.stepForward);
  const stepBackward = usePlayerStore((s) => s.stepBackward);
  const jumpToStart = usePlayerStore((s) => s.jumpToStart);
  const jumpToEnd = usePlayerStore((s) => s.jumpToEnd);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const setSpeed = usePlayerStore((s) => s.setSpeed);
  const setCursor = usePlayerStore((s) => s.setCursor);

  // Playback loop: advance while playing, stop at the end.
  useEffect(() => {
    if (!isPlaying) return;
    if (cursor >= steps.length - 1) {
      usePlayerStore.setState({ isPlaying: false });
      return;
    }
    const delay = Math.max(16, 700 / speed);
    const t = window.setTimeout(() => {
      if (usePlayerStore.getState().isPlaying) stepForward();
    }, delay);
    return () => window.clearTimeout(t);
  }, [isPlaying, cursor, steps.length, speed, stepForward]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        target?.isContentEditable
      ) {
        return;
      }
      const activationTarget = target?.closest('button, a, summary, input, textarea, select, [role="button"]');
      const directionalTarget = target?.closest('input, textarea, select, [role="slider"], [role="tab"]');
      if (e.key === ' ' && activationTarget) return;
      if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key) && directionalTarget) return;
      if (e.key === ' ' && e.repeat) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        case 'Home':
          e.preventDefault();
          jumpToStart();
          break;
        case 'End':
          e.preventDefault();
          jumpToEnd();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, stepForward, stepBackward, jumpToStart, jumpToEnd]);

  const btn =
    'flex items-center justify-center w-11 h-11 rounded-[var(--radius-control)] bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-4)] hover:border-[var(--color-border-strong)] hover:-translate-y-px active:scale-90 transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none';

  return (
    <div className="shrink-0 flex flex-col gap-2 px-4 py-3 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border)]">
      {/* Transport */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button className={btn} onClick={jumpToStart} disabled={!steps.length} title="Jump to start (Home)" aria-label="Jump to start">
          <Icon path="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </button>
        <button className={btn} onClick={stepBackward} disabled={!steps.length || cursor === 0} title="Step back (←)" aria-label="Step backward">
          <Icon path="M15 6v12l-9-6z" />
        </button>
        <button
          className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:bg-[var(--color-accent-hover)] hover:scale-105 active:scale-95 transition-all duration-150 shadow-[0_0_16px_var(--color-accent-ring)] disabled:opacity-40 disabled:pointer-events-none"
          onClick={togglePlay}
          disabled={!steps.length}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
              <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button className={btn} onClick={stepForward} disabled={!steps.length || cursor >= steps.length - 1} title="Step forward (→)" aria-label="Step forward">
          <Icon path="M9 6v12l9-6z" />
        </button>
        <button className={btn} onClick={jumpToEnd} disabled={!steps.length} title="Jump to end (End)" aria-label="Jump to end">
          <Icon path="M16 6h2v12h-2zM6 6l8.5 6L6 18z" />
        </button>

        {/* Speed selector */}
        <div className="flex items-center overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-border)] sm:ml-3" role="group" aria-label="Playback speed">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              aria-pressed={speed === s}
              className={`h-11 min-w-11 px-2 text-[11px] font-mono transition-colors border-r border-[var(--color-border)] last:border-r-0 ${
                speed === s
                  ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-semibold'
                  : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-4)]'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Scrubber */}
      {steps.length > 0 && (
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={cursor}
          onChange={(e) => setCursor(Number(e.target.value))}
          className="h-11 w-full cursor-pointer accent-[var(--color-accent)]"
          aria-label="Scrub through steps"
          aria-valuemin={0}
          aria-valuemax={steps.length - 1}
          aria-valuenow={cursor}
          aria-valuetext={`Step ${cursor + 1} of ${steps.length}`}
        />
      )}
    </div>
  );
}