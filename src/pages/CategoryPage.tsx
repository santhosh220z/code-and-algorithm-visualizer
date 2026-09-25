import { Link, useParams } from 'react-router-dom';
import { CATEGORY_NAMES, getAlgorithmsByCategory } from '../core/registry';
import { Badge } from '../components/ui/Badge';

interface NotFoundPageProps {
  title?: string;
  message?: string;
}

export function NotFoundPage({
  title = 'Page not found',
  message = 'The page or algorithm you requested does not exist.',
}: NotFoundPageProps) {
  return (
    <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
      <div className="surface-card w-full max-w-lg p-7 text-center sm:p-9">
        <Badge tone="danger">Error 404</Badge>
        <h1 className="mt-4 text-2xl font-semibold text-[var(--color-text)]">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{message}</p>
        <Link to="/" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-ink)] transition-colors hover:bg-[var(--color-accent-hover)]">
          Back to learning paths
        </Link>
      </div>
    </div>
  );
}

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const algorithms = category ? getAlgorithmsByCategory(category) : [];
  const validCategory = Boolean(category && Object.prototype.hasOwnProperty.call(CATEGORY_NAMES, category));
  const name = validCategory ? CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES] : category;

  if (!validCategory) {
    return <NotFoundPage title="Learning path not found" message="That algorithm category does not exist." />;
  }

  return (
    <div className="min-h-full w-full max-w-full overflow-x-hidden px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
          <Link to="/" className="rounded hover:text-[var(--color-accent-hover)]">Learning paths</Link>
          <span aria-hidden="true">/</span>
          <span>{name}</span>
        </nav>

        <header className="surface-card canvas-grid overflow-hidden p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-hover)]">Chapter</p>
              <h1 id="page-heading" tabIndex={-1} className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text)]">{name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">Choose a lesson and use the synchronized canvas to understand what changes at each step.</p>
            </div>
            <Badge className="self-start sm:self-auto">{algorithms.length} lesson{algorithms.length !== 1 ? 's' : ''}</Badge>
          </div>
        </header>

        {algorithms.length === 0 ? (
          <div className="surface-card mt-5 p-6 text-sm text-[var(--color-text-muted)]">This learning path is being prepared.</div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {algorithms.map((algorithm, index) => (
              <Link
                key={algorithm.id}
                to={`/algo/${category}/${algorithm.id}`}
                className="surface-card group flex min-h-48 flex-col p-5 transition-colors hover:border-[var(--color-accent-border)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-xs font-semibold text-[var(--color-text-dim)]">{String(index + 1).padStart(2, '0')}</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-dim)] transition-colors group-hover:text-[var(--color-accent-hover)]" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </div>
                <h2 className="mt-5 text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent-hover)]">{algorithm.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{algorithm.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge>Time {algorithm.complexity.time}</Badge>
                  <Badge>Space {algorithm.complexity.space}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
