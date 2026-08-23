import { Link, useParams } from 'react-router-dom';
import { CATEGORY_NAMES } from '../core/registry';
import { getAlgorithmsByCategory } from '../core/registry';

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const algorithms = category ? getAlgorithmsByCategory(category) : [];
  const name = category && category in CATEGORY_NAMES ? CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES] : category;

  if (algorithms.length === 0) {
    return (
      <div className="p-8">
        <Link to="/" className="text-[13px] text-[var(--color-text-muted)] hover:text-white">← Home</Link>
        <h1 className="mt-4 text-2xl font-bold text-white capitalize">{name ?? 'Unknown'}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)] italic">No algorithms here yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-white tracking-tight">{name}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Pick an algorithm to open it in the visualizer.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {algorithms.map((algo) => (
          <Link
            key={algo.id}
            to={`/algo/${category}/${algo.id}`}
            className="group p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-[14.5px] text-white group-hover:text-[var(--color-accent-hover)] transition-colors">
                {algo.name}
              </h3>
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-[#4a4d5a] group-hover:text-[var(--color-accent)] shrink-0 transition-colors">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
            <p className="mt-1 text-[12.5px] text-[var(--color-text-muted)] leading-snug line-clamp-2">{algo.description}</p>
            <div className="mt-2.5 flex gap-2 font-mono text-[10px] text-[var(--color-text-muted)]">
              <span className="px-1.5 py-0.5 rounded bg-[#20222f]">{algo.complexity.time}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#20222f]">{algo.complexity.space}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}