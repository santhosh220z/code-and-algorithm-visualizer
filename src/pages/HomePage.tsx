import { Link } from 'react-router-dom';
import { categories, getAlgorithmsByCategory } from '../core/registry';
import { Badge } from '../components/ui/Badge';

const ICONS: Record<string, string> = {
  bars: 'M4 20V10m5 10V4m5 16v-7m5 7V8',
  magnifier: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  network: 'M12 3v6m0 6v6m-9-9h6m6 0h6M5.6 5.6l4.2 4.2m4.4 4.4 4.2 4.2m0-12.8l-4.2 4.2m-4.4 4.4-4.2 4.2',
  grid: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z',
  tree: 'M12 3v5m0 0l-6 4v6m6-10l6 4v6M6 18h.01M18 18h.01',
  table: 'M3 5h18M3 10h18M3 15h18M3 20h18M9 5v15M15 5v15',
  recurse: 'M7 4h10v4a5 5 0 0 1-5 5 5 5 0 0 0-5 5v2M17 20H7v-4a5 5 0 0 1 5-5 5 5 0 0 0 5-5V4',
};

const starterSteps = [
  { to: '/algo/sorting/bubble-sort', number: '01', title: 'Compare values', text: 'Watch sorting decisions move through one array.' },
  { to: '/algo/graph/graph-bfs', number: '02', title: 'Explore a graph', text: 'Follow a frontier from the starting node.' },
  { to: '/code', number: '03', title: 'Run your own code', text: 'Trace variables, calls, loops, and output.' },
];

export function HomePage() {
  return (
    <div className="min-h-full w-full max-w-full overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <section className="surface-card canvas-grid overflow-hidden">
        <div className="grid min-w-0 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:p-9">
          <div className="min-w-0 max-w-2xl self-center">
            <Badge tone="accent">Interactive learning canvas</Badge>
            <h1 id="page-heading" tabIndex={-1} className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-5xl">
              See every decision change the picture.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)]">
              Learn algorithms by connecting the visualization, pseudocode, variables, and playback timeline in one focused workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/algo/sorting/bubble-sort" className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-accent-border)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-ink)] transition-colors hover:bg-[var(--color-accent-hover)]">
                Start learning
              </Link>
              <Link to="/code" className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent-border)]">
                Open code lab
              </Link>
            </div>
          </div>

          <div className="min-w-0 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-panel)] sm:p-5">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-dim)]">Start here</p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--color-text)]">A three-step learning path</h2>
              </div>
              <span className="font-mono text-xs text-[var(--color-text-dim)]">3 studios</span>
            </div>
            <ol className="mt-5 space-y-3">
              {starterSteps.map((step) => (
                <li key={step.to}>
                  <Link to={step.to} className="group flex items-start gap-3 rounded-[var(--radius-control)] border border-transparent p-3 transition-colors hover:border-[var(--color-border)] hover:bg-[var(--color-surface-2)]">
                    <span className="font-mono text-xs font-semibold text-[var(--color-accent-hover)]">{step.number}</span>
                    <span>
                      <span className="block text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent-hover)]">{step.title}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-[var(--color-text-muted)]">{step.text}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="learning-paths-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-dim)]">Browse the curriculum</p>
            <h2 id="learning-paths-heading" className="mt-1 text-2xl font-semibold text-[var(--color-text)]">Learning paths</h2>
          </div>
          <p className="hidden text-sm text-[var(--color-text-muted)] sm:block">Choose a concept, then learn at your own pace.</p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Link to="/code" className="surface-card group p-5 transition-colors hover:border-[var(--color-accent-border)] sm:col-span-2 xl:col-span-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)]">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-text)]">Code Visualizer</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">Paste or write mini-Python and inspect every statement, variable, loop, recursive call, and printed line.</p>
                </div>
              </div>
              <Badge tone="accent" className="self-start sm:self-auto">Open lab</Badge>
            </div>
          </Link>

          {categories.map((category) => {
            const algorithms = getAlgorithmsByCategory(category.id);
            const ready = algorithms.length > 0;
            const content = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)]">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={ICONS[category.icon] ?? ICONS.bars} />
                    </svg>
                  </span>
                  <Badge>{ready ? `${algorithms.length} lessons` : 'Soon'}</Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold text-[var(--color-text)]">{category.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{category.description}</p>
              </>
            );

            return ready ? (
              <Link key={category.id} to={`/algo/${category.id}`} className="surface-card group p-5 transition-colors hover:border-[var(--color-accent-border)]">
                {content}
              </Link>
            ) : (
              <div key={category.id} className="surface-card p-5 opacity-55">{content}</div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
