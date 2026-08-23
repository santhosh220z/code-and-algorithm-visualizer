import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { categories, getAlgorithmsByCategory } from '../../core/registry';

export function Sidebar() {
  const [open, setOpen] = useState<Record<string, boolean>>({ sorting: true });
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] flex flex-col">
      <NavLink
        to="/"
        className="flex items-center gap-2.5 px-4 h-14 border-b border-[var(--color-border)] shrink-0 hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-200"
      >
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--color-accent)] text-white font-bold text-sm">A</span>
        <span className="font-semibold text-[15px] text-white">AlgoViz</span>
      </NavLink>

      <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1" aria-label="Algorithm categories">
        {categories.map((cat) => {
          const algos = getAlgorithmsByCategory(cat.id);
          if (algos.length === 0) {
            return (
              <div
                key={cat.id}
                title="Scheduled for a later milestone"
                className="flex items-center justify-between px-2.5 py-2 rounded-lg opacity-45 cursor-not-allowed select-none"
              >
                <span className="text-[12.5px] font-medium text-[var(--color-text-muted)]">{cat.name}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wide bg-[#20222f] border border-[var(--color-border)] text-[#4a4d5a]">
                  Soon
                </span>
              </div>
            );
          }

          const isOpen = open[cat.id] ?? false;
          return (
            <div key={cat.id}>
              <button
                onClick={() => toggle(cat.id)}
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors duration-200 group ${
                  isOpen ? 'bg-[rgba(255,255,255,0.04)]' : 'hover:bg-[rgba(255,255,255,0.03)]'
                }`}
              >
                <span
                  className={`text-[10.5px] font-semibold uppercase tracking-wider transition-colors duration-200 ${
                    isOpen ? 'text-[var(--color-accent-hover)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'
                  }`}
                >
                  {cat.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[9.5px] font-mono text-[#4a4d5a]">{algos.length}</span>
                  <svg
                    viewBox="0 0 24 24"
                    width={13}
                    height={13}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-[#4a4d5a] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ transitionTimingFunction: 'var(--ease-smooth)' }}
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>

              {/* Smooth height via the 0fr → 1fr grid trick */}
              <div
                className="grid transition-[grid-template-rows] duration-300"
                style={{
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transitionTimingFunction: 'var(--ease-smooth)',
                }}
              >
                <div className="overflow-hidden min-h-0">
                  <div className="space-y-0.5 pt-0.5 pb-1 pl-1">
                    {algos.map((algo, idx) => (
                      <NavLink
                        key={algo.id}
                        to={`/algo/${cat.id}/${algo.id}`}
                        className={({ isActive }) =>
                          `block px-2.5 py-1.5 rounded-lg text-[13px] transition-colors duration-200 ${
                            isOpen ? 'anim-item-in' : ''
                          } ${isActive
                            ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)] font-medium'
                            : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white'
                          }`
                        }
                        style={{ animationDelay: `${idx * 35}ms` }}
                      >
                        {algo.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
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