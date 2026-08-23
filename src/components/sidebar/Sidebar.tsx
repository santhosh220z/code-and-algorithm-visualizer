import { NavLink } from 'react-router-dom';
import { categories, getAlgorithmsByCategory } from '../../core/registry';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] flex flex-col">
      <NavLink to="/" className="flex items-center gap-2.5 px-4 h-14 border-b border-[var(--color-border)] shrink-0 hover:bg-[rgba(255,255,255,0.03)] transition-colors">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--color-accent)] text-white font-bold text-sm">A</span>
        <span className="font-semibold text-[15px] text-white">AlgoViz</span>
      </NavLink>

      <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-3" aria-label="Algorithm categories">
        {categories.map((cat) => {
          const algos = getAlgorithmsByCategory(cat.id);
          if (algos.length === 0) {
            return (
              <div key={cat.id} className="px-2.5 py-1 opacity-40" title="Coming in a later milestone">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{cat.name}</div>
                <div className="text-[10px] text-[#4a4d5a] italic mt-0.5">{cat.description}</div>
              </div>
            );
          }
          return (
            <div key={cat.id}>
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-2.5 mb-1">
                {cat.name}
              </div>
              <div className="space-y-0.5">
                {algos.map((algo) => (
                  <NavLink
                    key={algo.id}
                    to={`/algo/${cat.id}/${algo.id}`}
                    className={({ isActive }) =>
                      `block px-2.5 py-1.5 rounded-lg text-[13px] transition-colors ${
                        isActive
                          ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)] font-medium'
                          : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white'
                      }`
                    }
                  >
                    {algo.name}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 px-3 py-2.5 border-t border-[var(--color-border)] text-[9.5px] leading-relaxed text-[#4a4d5a] font-mono">
        SPACE play/pause · ←/→ step<br />HOME/END jump
      </div>
    </aside>
  );
}