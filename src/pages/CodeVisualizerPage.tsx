import { useMemo } from 'react';
import { useCodeRunnerStore } from '../core/codeRunner';
import { usePlayerStore, useCurrentStep } from '../core/player';
import { parseLoops } from '../components/layout/Layout';
import { CodeEditor } from '../components/code/CodeEditor';
import { ConsolePanel } from '../components/code/ConsolePanel';
import { CodePanel } from '../components/panels/CodePanel';
import { VarsPanel } from '../components/panels/VarsPanel';
import { NarrationBar } from '../components/panels/NarrationBar';
import { PlayerControls } from '../components/player/PlayerControls';
import { ArrayViz } from '../components/viz/ArrayViz';

export function CodeVisualizerPage() {
  const mode = useCodeRunnerStore((s) => s.mode);
  const source = useCodeRunnerStore((s) => s.source);
  const error = useCodeRunnerStore((s) => s.error);
  const setSource = useCodeRunnerStore((s) => s.setSource);
  const run = useCodeRunnerStore((s) => s.run);
  const backToEditor = useCodeRunnerStore((s) => s.backToEditor);

  if (mode === 'editor') {
    return (
      <div className="h-full min-h-0 flex flex-col">
        <header className="shrink-0 flex items-center gap-3 px-6 pt-6 pb-1">
          <h1 className="text-xl font-bold text-white">Code Visualizer</h1>
          <p className="text-[12.5px] text-[var(--color-text-muted)]">
            Write or paste code, then step through its execution.
          </p>
        </header>
        <CodeEditor source={source} error={error} onChange={setSource} onRun={() => run()} />
      </div>
    );
  }

  return <TraceStudio onEdit={backToEditor} />;
}

function TraceStudio({ onEdit }: { onEdit: () => void }) {
  const algorithm = usePlayerStore((s) => s.algorithm);
  const steps = usePlayerStore((s) => s.steps);
  const cursor = usePlayerStore((s) => s.cursor);
  const currentStep = useCurrentStep();

  const loops = useMemo(() => (algorithm ? parseLoops(algorithm.pseudocode) : []), [algorithm]);

  const vizType = currentStep?.viz.type;

  return (
    <div className="h-full min-h-0 flex flex-col">
      <header className="shrink-0 flex items-center gap-3 px-4 py-2.5 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
        <span className="text-[13px] font-semibold text-white">{algorithm?.name ?? 'Code Visualizer'}</span>
        <span className="text-[10.5px] font-mono text-[var(--color-text-muted)]">
          {steps.length} step{steps.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={onEdit}
          className="ml-auto px-3 py-1 rounded-md text-[11px] font-medium bg-[#20222f] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent)] transition-colors"
        >
          ← Edit code
        </button>
      </header>

      <div className="flex-1 min-h-0 flex">
        <section className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 p-4 pb-1">
            {vizType === 'array' && currentStep?.viz.type === 'array' ? (
              <ArrayViz
                array={currentStep.viz.array}
                highlights={currentStep.viz.highlights}
                pointers={currentStep.viz.pointers}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-[#4a4d5a] italic">
                  {steps.length > 0
                    ? 'Press Play or → to step through the execution.'
                    : 'Press Play to run your code.'}
                </p>
              </div>
            )}
          </div>
          <NarrationBar step={currentStep} cursor={cursor} total={steps.length} />
          <PlayerControls />
        </section>

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
              <div className="h-36 shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden">
                <VarsPanel step={currentStep} />
              </div>
              <div className="h-40 shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden">
                <ConsolePanel step={currentStep} />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-[#4a4d5a] italic">Nothing running.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
