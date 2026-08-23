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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
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
    'flex items-center justify-center w-9 h-9 rounded-lg bg-[#20222f] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent)] hover:-translate-y-px active:scale-90 transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none';

  return (
    <div className="shrink-0 flex flex-col gap-2 px-4 py-3 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border)]">
      {/* Transport */}
      <div className="flex items-center justify-center gap-2">
        <button className={btn} onClick={jumpToStart} disabled={!steps.length} title="Jump to start (Home)" aria-label="Jump to start">
          <Icon path="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </button>
        <button className={btn} onClick={stepBackward} disabled={!steps.length || cursor === 0} title="Step back (←)" aria-label="Step backward">
          <Icon path="M15 6v12l-9-6z" />
        </button>
        <button
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] hover:scale-105 active:scale-95 transition-all duration-150 shadow-[0_0_14px_rgba(168,85,247,0.4)] disabled:opacity-40 disabled:pointer-events-none"
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
        <div className="ml-3 flex items-center rounded-lg overflow-hidden border border-[var(--color-border)]">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 h-9 text-[11px] font-mono transition-colors ${
                speed === s ? 'bg-[var(--color-accent)] text-white' : 'bg-[#20222f] text-[var(--color-text-muted)] hover:text-white'
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
          className="w-full accent-[var(--color-accent)] cursor-pointer"
          aria-label="Scrub through steps"
        />
      )}
    </div>
  );
}