import { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AlgorithmLoader } from '../../pages/AlgorithmLoader';
import { Sidebar } from '../sidebar/Sidebar';
import { PlayerControls } from '../player/PlayerControls';
import { CodePanel } from '../panels/CodePanel';
import { VarsPanel } from '../panels/VarsPanel';
import { NarrationBar } from '../panels/NarrationBar';
import { ArrayViz } from '../viz/ArrayViz';
import { usePlayerStore, useCurrentStep } from '../../core/player';
import type { LoopScope } from '../../core/types';

/** Derive loop scopes (for rails) from pseudocode indentation. */
function parseLoops(pseudocode: { text: string; indent: number; isLoopHeader?: boolean; loopLabel?: string }[]): LoopScope[] {
  const scopes: LoopScope[] = [];
  pseudocode.forEach((line, i) => {
    if (!line.isLoopHeader) return;
    let end = i;
    for (let j = i + 1; j < pseudocode.length; j++) {
      const next = pseudocode[j];
      if (next.text.trim() === '') continue;
      if (next.indent <= line.indent) break;
      end = j;
    }
    scopes.push({ label: line.loopLabel ?? `loop${i}`, startLine: i, endLine: end, depth: line.indent });
  });
  return scopes;
}

export function Layout() {
  const location = useLocation();
  const algorithm = usePlayerStore((s) => s.algorithm);
  const steps = usePlayerStore((s) => s.steps);
  const cursor = usePlayerStore((s) => s.cursor);
  const currentStep = useCurrentStep();

  const loops = useMemo(
    () => (algorithm ? parseLoops(algorithm.pseudocode) : []),
    [algorithm]
  );

  const onAlgorithmRoute = /\/algo\/[^/]+\/[^/]+$/.test(location.pathname);
  const hasArrayViz = currentStep?.viz.type === 'array';

  return (
    <div className="h-full flex bg-[var(--color-bg)]">
      <Sidebar />
      <main className="flex-1 min-w-0 ml-64 flex flex-col h-full">
        <AlgorithmLoader />

        {!onAlgorithmRoute ? (
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            <Outlet />
          </div>
        ) : (
          <>
            {/* Top bar */}
            <header className="shrink-0 flex items-center gap-3 px-4 py-2.5 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
              <span className="text-[13px] font-semibold text-white">{algorithm?.name ?? 'Loading…'}</span>
              {algorithm && (
                <div className="ml-auto hidden md:flex items-center gap-2 text-[10.5px] font-mono text-[var(--color-text-muted)]">
                  <span className="px-1.5 py-0.5 rounded bg-[#20222f]">time {algorithm.complexity.time}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#20222f]">space {algorithm.complexity.space}</span>
                  <button
                    onClick={() => usePlayerStore.getState().regenerate()}
                    disabled={!steps.length}
                    className="ml-2 px-3 py-1 rounded-md text-[11px] font-sans font-medium bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)] border border-[var(--color-accent-border,#5b21b6)] hover:bg-[rgba(168,85,247,0.28)] transition-colors disabled:opacity-30"
                  >
                    ⟲ New data
                  </button>
                </div>
              )}
            </header>

            {/* Studio */}
            <div className="flex-1 min-h-0 flex">
              {/* Left column */}
              <section className="flex-1 min-w-0 flex flex-col">
                <div className="flex-1 min-h-0 p-4 pb-1">
                  {hasArrayViz && currentStep?.viz.type === 'array' ? (
                    <ArrayViz
                      array={currentStep.viz.array}
                      highlights={currentStep.viz.highlights}
                      pointers={currentStep.viz.pointers}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-[#4a4d5a] italic">Press Play or → to step through the trace.</p>
                    </div>
                  )}
                </div>
                <NarrationBar step={currentStep} cursor={cursor} total={steps.length} />
                <PlayerControls />
              </section>

              {/* Right column */}
              <aside className="hidden xl:flex w-[420px] shrink-0 border-l border-[var(--color-border)] flex-col min-h-0">
                {algorithm ? (
                  <>
                    <div className="flex-1 min-h-0">
                      <CodePanel
                        pseudocode={algorithm.pseudocode}
                        currentStep={currentStep}
                        steps={steps}
                        cursor={cursor}
                        loops={loops}
                      />
                    </div>
                    <div className="h-40 shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden">
                      <VarsPanel step={currentStep} />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-[#4a4d5a] italic">No algorithm selected.</p>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}