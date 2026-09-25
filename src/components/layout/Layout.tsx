import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AlgorithmLoader } from '../../pages/AlgorithmLoader';
import { NotFoundPage } from '../../pages/CategoryPage';
import { Sidebar } from '../sidebar/Sidebar';
import { CodePanel } from '../panels/CodePanel';
import { VarsPanel } from '../panels/VarsPanel';
import { AlgorithmControls } from '../player/AlgorithmControls';
import { EditorToolbar } from '../player/EditorToolbar';
import { VisualizationCanvas } from '../viz/VisualizationCanvas';
import { useCurrentStep, usePlayerStore } from '../../core/player';
import { CATEGORY_NAMES, getAlgorithm, supportsRegeneration } from '../../core/registry';
import { parseLoops } from '../../core/loopScopes';
import type { AlgorithmCategory } from '../../core/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LearningStudio } from './LearningStudio';

export function Layout() {
  const location = useLocation();
  const algorithm = usePlayerStore((state) => state.algorithm);
  const storeInput = usePlayerStore((state) => state.input);
  const steps = usePlayerStore((state) => state.steps);
  const cursor = usePlayerStore((state) => state.cursor);
  const currentStep = useCurrentStep();
  const [guideState, setGuideState] = useState({ open: false, path: location.pathname });

  const routeMatch = location.pathname.match(/^\/algo\/([^/]+)\/([^/]+)$/);
  const onAlgorithmRoute = routeMatch !== null;
  const currentCategory = routeMatch?.[1] as AlgorithmCategory | undefined;
  const routeAlgorithm = routeMatch ? getAlgorithm(routeMatch[2]) : undefined;
  const validAlgorithmRoute = Boolean(
    routeAlgorithm && currentCategory && routeAlgorithm.category === currentCategory
  );
  const activeAlgorithm =
    validAlgorithmRoute && algorithm?.id === routeAlgorithm?.id ? algorithm : null;
  const input =
    algorithm?.id === activeAlgorithm?.id ? storeInput : activeAlgorithm?.defaultInput ?? {};
  const canRegenerate = activeAlgorithm ? supportsRegeneration(activeAlgorithm) : false;
  const loops = useMemo(
    () => (activeAlgorithm ? parseLoops(activeAlgorithm.pseudocode) : []),
    [activeAlgorithm]
  );

  useEffect(() => {
    const categoryTitle = currentCategory ? CATEGORY_NAMES[currentCategory] : null;
    document.title = activeAlgorithm
      ? `${activeAlgorithm.name} · AlgoViz`
      : location.pathname === '/code'
        ? 'Code Visualizer · AlgoViz'
        : categoryTitle && location.pathname === `/algo/${currentCategory}`
          ? `${categoryTitle} · AlgoViz`
          : 'AlgoViz · Algorithm Visualizer';

    if (location.pathname === '/code') return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById('route-focus') ?? document.getElementById('main-content');
      target?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeAlgorithm, currentCategory, location.pathname]);

  const guideOpen = guideState.open && guideState.path === location.pathname;

  const hasSetup =
    Boolean(activeAlgorithm) &&
    (currentCategory === 'graph' ||
      currentCategory === 'grid' ||
      activeAlgorithm?.id === 'ds-stack' ||
      activeAlgorithm?.id === 'ds-queue' ||
      activeAlgorithm?.id === 'ds-bst' ||
      Array.isArray(input.array) ||
      typeof input.target === 'number' ||
      typeof input.n === 'number' ||
      typeof input.capacity === 'number' ||
      typeof input.a === 'string' ||
      typeof input.b === 'string');

  const setupContent = !activeAlgorithm ? null : currentCategory === 'graph' || currentCategory === 'grid' ? (
    <div className="h-full overflow-auto">
      <EditorToolbar category={currentCategory} />
    </div>
  ) : (
    <div className="h-full overflow-auto p-3">
      <AlgorithmControls algorithm={activeAlgorithm} input={input} />
    </div>
  );

  const algorithmHeader = activeAlgorithm ? (
    <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-3 sm:px-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          {currentCategory && (
            <nav aria-label="Breadcrumb" className="mb-1 flex items-center gap-1 text-[11px] text-[var(--color-text-dim)]">
              <Link to={`/algo/${currentCategory}`} className="rounded hover:text-[var(--color-accent-hover)]">
                {CATEGORY_NAMES[currentCategory]}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="truncate">{activeAlgorithm.name}</span>
            </nav>
          )}
          <h1 id="page-heading" tabIndex={-1} className="truncate text-base font-semibold text-[var(--color-text)]">
            {activeAlgorithm.name}
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <Badge>Time {activeAlgorithm.complexity.time}</Badge>
            <Badge>Space {activeAlgorithm.complexity.space}</Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setGuideState({ open: !guideOpen, path: location.pathname })}
            aria-expanded={guideOpen}
          >
            Guide
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (canRegenerate) usePlayerStore.getState().regenerate();
              else usePlayerStore.getState().setAlgorithm(activeAlgorithm, activeAlgorithm.defaultInput);
            }}
            disabled={!steps.length}
          >
            <span className="sm:hidden">{canRegenerate ? 'New' : 'Reset'}</span>
            <span className="hidden sm:inline">{canRegenerate ? 'New data' : 'Reset demo'}</span>
          </Button>
        </div>
      </div>
      {guideOpen && (
        <div className="mt-3 grid gap-3 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-sm leading-relaxed text-[var(--color-text-muted)] md:grid-cols-2">
          <p>{activeAlgorithm.description}</p>
          <p className="text-[var(--color-text-dim)]">Use Play to advance automatically, or step through one operation at a time. The legend explains each visual state and the inspector stays synchronized with the canvas.</p>
        </div>
      )}
    </header>
  ) : null;

  return (
    <div className="flex h-dvh bg-[var(--color-bg)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-[var(--radius-control)] focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--color-accent-ink)]"
      >
        Skip to main content
      </a>
      <Sidebar />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex h-full min-w-0 max-w-full flex-1 flex-col overflow-x-hidden pt-[var(--topbar-height)] xl:ml-[var(--navigation-width)] xl:pt-0"
      >
        <span id="route-focus" tabIndex={-1} className="sr-only" />
        <AlgorithmLoader />

        {!onAlgorithmRoute ? (
          <div className={`min-h-0 flex-1 overflow-x-hidden ${location.pathname === '/code' ? '' : 'scrollbar-thin overflow-y-auto'}`}>
            <Outlet />
          </div>
        ) : !validAlgorithmRoute ? (
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
            <NotFoundPage
              title="Algorithm not found"
              message="This algorithm does not exist or does not belong to the selected category."
            />
          </div>
        ) : (
          <LearningStudio
            header={algorithmHeader}
            canvas={<VisualizationCanvas step={currentStep} />}
            inspectorLabel="Code, state, and setup"
            inspectorTabs={[
              {
                id: 'code',
                label: 'Code',
                content: activeAlgorithm ? (
                  <CodePanel
                    pseudocode={activeAlgorithm.pseudocode}
                    currentStep={currentStep}
                    steps={steps}
                    cursor={cursor}
                    loops={loops}
                  />
                ) : null,
              },
              {
                id: 'state',
                label: 'State',
                content: (
                  <div className="h-full overflow-auto bg-[var(--color-bg-elevated)]">
                    <VarsPanel step={currentStep} />
                  </div>
                ),
              },
              ...(hasSetup
                ? [{ id: 'setup', label: 'Setup', content: setupContent }]
                : []),
            ]}
          />
        )}
      </main>
    </div>
  );
}
