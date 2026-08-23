import { Link } from 'react-router-dom';
import { categories, getAlgorithmsByCategory } from '../core/registry';

const ICONS: Record<string, string> = {
  bars: 'M4 20V10m5 10V4m5 16v-7m5 7V8',
  magnifier: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  network: 'M12 3v6m0 6v6m-9-9h6m6 0h6M5.6 5.6l4.2 4.2m4.4 4.4l4.2 4.2m0-12.8l-4.2 4.2m-4.4 4.4l-4.2 4.2',
  grid: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z',
  tree: 'M12 3v5m0 0l-6 4v6m6-10l6 4v6M6 18h.01M18 18h.01',
  table: 'M3 5h18M3 10h18M3 15h18M3 20h18M9 5v15M15 5v15',
};

export function HomePage() {
  return (
    <div className="min-h-full">
      <section className="px-6 pt-14 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          See algorithms <span className="text-[var(--color-accent-hover)]">think</span>.
        </h1>
        <p className="mt-4 text-[var(--color-text-muted)] max-w-xl mx-auto text-[15px] leading-relaxed">
          Step through executions with synchronized pseudocode highlighting, live variables,
          per-line hit counters, and plain-language narration.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const algos = getAlgorithmsByCategory(cat.id);
          const ready = algos.length > 0;
          const inner = (
            <>
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent-hover)]">
                <path d={ICONS[cat.icon] ?? ICONS.bars} />
              </svg>
              <h3 className="mt-3 font-semibold text-[15px] text-white">{cat.name}</h3>
              <p className="mt-1 text-[12.5px] text-[var(--color-text-muted)] leading-snug">{cat.description}</p>
              {ready ? (
                <p className="mt-3 text-[11px] font-mono text-[#5a5e6e]">{algos.length} algorithm{algos.length !== 1 ? 's' : ''}</p>
              ) : (
                <span className="mt-3 inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#20222f] text-[#4a4d5a]">soon</span>
              )}
            </>
          );
          return ready ? (
            <Link
              key={cat.id}
              to={`/algo/${cat.id}`}
              className="group p-5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
            >
              {inner}
            </Link>
          ) : (
            <div key={cat.id} className="p-5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] opacity-50">
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}