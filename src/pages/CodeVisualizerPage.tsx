import { useEffect, useMemo } from 'react';
import { useCodeRunnerStore, resolveCodeViewMode } from '../core/codeRunner';
import { useCurrentStep, usePlayerStore } from '../core/player';
import { parseLoops } from '../core/loopScopes';
import { CodeEditor, CodeEditorGuide } from '../components/code/CodeEditor';
import { ConsolePanel } from '../components/code/ConsolePanel';
import { CodePanel } from '../components/panels/CodePanel';
import { VarsPanel } from '../components/panels/VarsPanel';
import { VisualizationCanvas } from '../components/viz/VisualizationCanvas';
import { LearningStudio } from '../components/layout/LearningStudio';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function CodeVisualizerPage() {
  const mode = useCodeRunnerStore((state) => state.mode);
  const playerAlgorithmId = usePlayerStore((state) => state.algorithm?.id);
  const viewMode = resolveCodeViewMode(mode, playerAlgorithmId);
  const source = useCodeRunnerStore((state) => state.source);
  const error = useCodeRunnerStore((state) => state.error);
  const truncated = useCodeRunnerStore((state) => state.truncated);
  const setSource = useCodeRunnerStore((state) => state.setSource);
  const run = useCodeRunnerStore((state) => state.run);
  const backToEditor = useCodeRunnerStore((state) => state.backToEditor);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(viewMode === 'trace' ? 'code-trace-focus' : 'code-editor-focus');
      target?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [viewMode]);

  if (viewMode === 'editor') {
    return (
      <LearningStudio
        header={
          <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-4 sm:px-6">
            <span id="code-editor-focus" tabIndex={-1} className="sr-only" />
            <h1 id="code-editor-heading" tabIndex={-1} className="text-xl font-semibold text-[var(--color-text)]">Code Visualizer</h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Write or paste code, then step through its execution.</p>
          </header>
        }
        canvas={<CodeEditor source={source} error={error} onChange={setSource} onRun={() => run()} />}
        inspectorLabel="Code guide"
        inspectorTabs={[
          {
            id: 'starters',
            label: 'Starters',
            content: <CodeEditorGuide onSelect={setSource} view="starters" />,
          },
          {
            id: 'syntax',
            label: 'Syntax',
            content: <CodeEditorGuide onSelect={setSource} view="syntax" />,
          },
        ]}
        showNarration={false}
        showTransport={false}
      />
    );
  }

  return <TraceStudio onEdit={backToEditor} truncated={truncated} />;
}

function TraceStudio({ onEdit, truncated }: { onEdit: () => void; truncated: boolean }) {
  const algorithm = usePlayerStore((state) => state.algorithm);
  const steps = usePlayerStore((state) => state.steps);
  const cursor = usePlayerStore((state) => state.cursor);
  const currentStep = useCurrentStep();
  const loops = useMemo(() => (algorithm ? parseLoops(algorithm.pseudocode) : []), [algorithm]);
  const hasArray = currentStep?.viz.type === 'array';

  const header = (
    <header className="flex shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-3 sm:px-4">
      <span id="code-trace-focus" tabIndex={-1} className="sr-only" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-dim)]">Code trace</p>
        <h1 id="code-trace-heading" tabIndex={-1} className="truncate text-base font-semibold text-[var(--color-text)]">
          {algorithm?.name ?? 'Code Visualizer'}
        </h1>
      </div>
      <Badge>{steps.length} step{steps.length !== 1 ? 's' : ''}</Badge>
      <Button size="sm" variant="ghost" onClick={onEdit} className="ml-auto">Edit code</Button>
    </header>
  );

  const notice = truncated ? (
    <div role="status" className="flex shrink-0 items-start gap-2 border-b border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-3 py-2.5 text-sm text-[var(--color-warning)] sm:px-4">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0" aria-hidden="true">
        <path d="M12 9v4m0 4h.01M10.3 4.7 3.2 17.2A2 2 0 0 0 5 20h14a2 2 0 0 0 1.8-2.8L13.7 4.7a2 2 0 0 0-3.4 0Z" />
      </svg>
      <span><strong className="font-semibold">Partial trace:</strong> execution reached the 5,000-step safety limit. Reduce the loop or recursion depth for the complete run.</span>
    </div>
  ) : null;

  return (
    <LearningStudio
      header={header}
      notice={notice}
      canvas={
        <div className="flex h-full min-h-0 flex-col">
          {hasArray && (
            <div className="h-44 shrink-0 border-b border-[var(--color-border)] p-2">
              <VisualizationCanvas step={currentStep} compact />
            </div>
          )}
          <div className="min-h-0 flex-1">
            {algorithm ? (
              <CodePanel
                pseudocode={algorithm.pseudocode}
                currentStep={currentStep}
                steps={steps}
                cursor={cursor}
                loops={loops}
                title="Your code"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm italic text-[var(--color-text-dim)]">Press Play to run your code.</div>
            )}
          </div>
        </div>
      }
      inspectorLabel="State and console"
      inspectorTabs={[
        {
          id: 'state',
          label: 'State',
          content: (
            <div className="h-full overflow-auto bg-[var(--color-bg-elevated)]">
              <VarsPanel step={currentStep} />
            </div>
          ),
        },
        {
          id: 'console',
          label: 'Console',
          content: (
            <div className="h-full bg-[var(--color-bg-elevated)]">
              <ConsolePanel step={currentStep} />
            </div>
          ),
        },
      ]}
    />
  );
}
