import { useEffect, useRef } from 'react';
import type { PseudocodeLine, Step } from '../../core/types';

interface LoopScope {
  label: string;
  startLine: number;
  endLine: number;
  depth: number;
}

interface CodePanelProps {
  pseudocode: PseudocodeLine[];
  currentStep: Step | null;
  steps: Step[];
  cursor: number;
  loops: LoopScope[];
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length <= 8) return `[${value.join(', ')}]`;
    return `[${value.slice(0, 8).join(', ')}…] (${value.length})`;
  }
  return String(value);
}

export function CodePanel({ pseudocode, currentStep, steps, cursor, loops }: CodePanelProps) {
  const activeLine = currentStep?.line ?? -1;
  const containerRef = useRef<HTMLDivElement>(null);

  // Hit counts per line for all steps up to cursor
  const hitCounts = new Map<number, number>();
  for (let i = 0; i <= cursor; i++) {
    const line = steps[i].line;
    if (line !== undefined) {
      hitCounts.set(line, (hitCounts.get(line) ?? 0) + 1);
    }
  }

  // Lines executed before the current step (trail)
  const executedLines = new Set<number>();
  for (let i = 0; i < cursor; i++) {
    const line = steps[i].line;
    if (line !== undefined) executedLines.add(line);
  }

  // Active loop info
  const activeLoop = currentStep?.loops?.[currentStep.loops.length - 1];

  // Auto-scroll to keep the active line visible
  useEffect(() => {
    if (activeLine < 0 || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-line="${activeLine}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeLine]);

  const loopIterationFor = (label: string): number | null => {
    if (!activeLoop || activeLoop.label !== label) return null;
    return activeLoop.iteration;
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#14151c]">
      <div className="px-4 pt-3 pb-2 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Pseudocode
        </h3>
        {activeLoop && (
          <span className="text-[10px] font-mono text-[var(--color-accent)]">
            {activeLoop.label} · iter {activeLoop.iteration}
          </span>
        )}
      </div>

      <div ref={containerRef} className="relative flex-1 overflow-y-auto scrollbar-thin py-2">
        {/* Loop rails layer */}
        <div className="absolute left-6 top-2 bottom-2 w-1 pointer-events-none">
          {loops.map((rail) => {
            const iter = loopIterationFor(rail.label);
            return (
              <div
                key={rail.label}
                className={`absolute w-[3px] rounded-full ${
                  iter !== null ? 'bg-[var(--color-accent)] shadow-[0_0_6px_var(--color-accent)]' : 'bg-[var(--color-border)]'
                }`}
                style={{
                  top: `${(rail.startLine + 1) * 26}px`,
                  height: `${(rail.endLine - rail.startLine + 1) * 26}px`,
                  opacity: iter !== null ? 1 : 0.5,
                  transition: 'top 260ms cubic-bezier(0.4,0,0.2,1), height 260ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease, background-color 200ms ease',
                }}
              />
            );
          })}
        </div>

        {pseudocode.map((line, index) => {
          const isActive = index === activeLine;
          const wasExecuted = executedLines.has(index);
          const hits = hitCounts.get(index) ?? 0;

          return (
            <div
              key={index}
              data-line={index}
              className={`relative flex items-center min-h-[26px] pr-3 transition-colors duration-100 ${
                isActive ? 'bg-[var(--color-accent-bg)]' : ''
              }`}
              style={{ paddingLeft: `${16 + line.indent * 18}px` }}
            >
              {/* Active-line accent bar */}
              {isActive && (
                <span className="absolute left-2 top-0 bottom-0 w-[3px] rounded-full bg-[var(--color-accent)] shadow-[0_0_6px_var(--color-accent)]" />
              )}

              {/* Line number */}
              <span
                className={`w-7 shrink-0 text-right font-mono text-[10px] select-none mr-2 ${
                  isActive ? 'text-[var(--color-accent)] font-semibold' : 'text-[#4a4d5a]'
                }`}
              >
                {index + 1}
              </span>

              {/* Gutter: arrow / execution dot */}
              <span className="w-4 shrink-0 text-center">
                {isActive ? (
                  <svg viewBox="0 0 12 12" width={10} height={10} className="inline-block">
                    <path d="M3 1 L9 6 L3 11 Z" fill="#c084fc" />
                  </svg>
                ) : wasExecuted ? (
                  <span className="block w-1 h-1 mx-auto rounded-full bg-[var(--color-trail)]" />
                ) : null}
              </span>

              {/* Code text */}
              <span
                className={`flex-1 font-mono text-[12.5px] leading-[26px] truncate ${
                  isActive ? 'text-white font-medium' : wasExecuted ? 'text-[#b8bcc8]' : 'text-[var(--color-text-muted)]'
                }`}
              >
                {line.text}
              </span>

              {/* Hit counter badge */}
              {hits > 0 && (
                <span
                  key={`${index}-${hits}`}
                  className={`anim-badge-pop ml-2 px-1.5 py-0 rounded-full text-[9px] font-mono shrink-0 ${
                    isActive
                      ? 'bg-[var(--color-accent)] text-white font-bold'
                      : 'bg-[#262838] text-[var(--color-text-muted)]'
                  }`}
                  title={`Executed ${hits}×`}
                >
                  ×{hits}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Inline variable chips on active line */}
      {currentStep?.vars && Object.keys(currentStep.vars).length > 0 && (
        <div className="border-t border-[var(--color-border)] px-4 py-2 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-wide text-[#4a4d5a] mr-1">live</span>
            {Object.entries(currentStep.vars).map(([key, value]) => (
              <span
                key={key}
                className="px-2 py-0.5 rounded-md text-[10.5px] font-mono bg-[#20222f] border border-[var(--color-border)] text-[var(--color-active)]"
              >
                {key}
                <span className="text-[#4a4d5a]"> = </span>
                <span className="text-white">{formatValue(value)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Call stack (recursion) */}
      {currentStep?.stack && currentStep.stack.length > 0 && (
        <div className="border-t border-[var(--color-border)] px-4 py-2 max-h-32 overflow-y-auto scrollbar-thin shrink-0">
          <div className="flex gap-1.5 flex-wrap">
            {[...currentStep.stack].reverse().map((frame, idx) => (
              <span
                key={`${frame.fn}-${idx}`}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                  idx === 0
                    ? 'bg-[var(--color-accent-bg)] border-[var(--color-accent-border,#5b21b6)] text-[var(--color-accent-hover)]'
                    : 'bg-[#20222f] border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >
                {frame.fn}({Object.entries(frame.args).map(([k, v]) => `${k}=${v}`).join(', ')})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}