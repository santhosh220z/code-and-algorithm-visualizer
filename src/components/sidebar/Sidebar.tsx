import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { categories, getAlgorithmsByCategory } from '../../core/registry';
import { Sheet } from '../ui/Sheet';
import { ModeToggle } from '../ui/ModeToggle';

interface SidebarContentProps {
  closed: Record<string, boolean>;
  setClosed: Dispatch<SetStateAction<Record<string, boolean>>>;
  onNavigate?: () => void;
  showBrand?: boolean;
}

function SidebarContent({
  closed,
  setClosed,
  onNavigate,
  showBrand = true,
}: SidebarContentProps) {
  return (
    <>
      {showBrand && (
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex min-h-16 items-center gap-3 border-b border-[var(--color-border)] px-4 transition-colors duration-200 hover:bg-[var(--color-surface-2)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent)] text-sm font-bold text-[var(--color-accent-ink)]">A</span>
          <span>
            <span className="block text-[15px] font-semibold text-[var(--color-text)]">AlgoViz</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-dim)]">Learning canvas</span>
          </span>
        </NavLink>
      )}

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3" aria-label="Learning paths">
        <NavLink
          to="/code"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 transition-colors duration-200 ${
              isActive
                ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
            }`
          }
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
          </svg>
          <span className="text-sm font-medium">Code Visualizer</span>
        </NavLink>

        <div className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-dim)]">
          Learning paths
        </div>

        {categories.map((category) => {
          const algorithms = getAlgorithmsByCategory(category.id);
          if (algorithms.length === 0) {
            return (
              <div
                key={category.id}
                className="flex min-h-11 select-none items-center justify-between rounded-[var(--radius-control)] px-3 py-2 opacity-55"
              >
                <span className="min-w-0 flex-1 text-left text-sm font-medium text-[var(--color-text-muted)]">{category.name}</span>
                <span className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-3)] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wide text-[var(--color-text-dim)]">
                  Soon
                </span>
              </div>
            );
          }

          const isOpen = !closed[category.id];
          const panelId = `category-${category.id}-algorithms`;

          return (
            <div key={category.id}>
              <button
                type="button"
                onClick={() =>
                  setClosed((current) => ({ ...current, [category.id]: isOpen }))
                }
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={`group flex min-h-11 w-full items-center justify-between rounded-[var(--radius-control)] px-3 py-2 transition-colors duration-200 ${
                  isOpen ? 'bg-[var(--color-surface-2)]' : 'hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <span
                  className={`min-w-0 flex-1 text-left text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] transition-colors duration-200 ${
                    isOpen
                      ? 'text-[var(--color-accent-hover)]'
                      : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'
                  }`}
                >
                  {category.name}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="font-mono text-[10px] text-[var(--color-text-dim)]">{algorithms.length}</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-[var(--color-text-dim)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ transitionTimingFunction: 'var(--ease-smooth)' }}
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div id={panelId} className="space-y-1 pb-1 pl-1 pt-1">
                  {algorithms.map((algorithm, index) => (
                    <NavLink
                      key={algorithm.id}
                      to={`/algo/${category.id}/${algorithm.id}`}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `anim-item-in block min-h-11 rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors duration-200 ${
                          isActive
                            ? 'bg-[var(--color-accent-bg)] font-medium text-[var(--color-accent-hover)]'
                            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
                        }`
                      }
                      style={{ animationDelay: `${Math.min(index * 35, 175)}ms` }}
                    >
                      {algorithm.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--color-border)] p-3">
        <ModeToggle />
        <p className="font-mono text-[10px] leading-tight text-[var(--color-text-dim)]">
          <kbd className="rounded border border-[var(--color-border)] px-1">Space</kbd> play/pause
          <br />
          <kbd className="rounded border border-[var(--color-border)] px-1">←</kbd>/
          <kbd className="rounded border border-[var(--color-border)] px-1">→</kbd> step
        </p>
      </div>
    </>
  );
}

export function Sidebar() {
  const location = useLocation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const routeCategory = location.pathname.match(/^\/algo\/([^/]+)/)?.[1];
  const [desktop, setDesktop] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(min-width: 1280px)').matches
  );
  const [navigationState, setNavigationState] = useState(() => ({
    routeCategory,
    closed: Object.fromEntries(
      categories.map((category) => [category.id, category.id !== 'sorting'])
    ) as Record<string, boolean>,
  }));
  const closed =
    navigationState.routeCategory === routeCategory
      ? navigationState.closed
      : {
          ...navigationState.closed,
          ...(routeCategory ? { [routeCategory]: false } : {}),
        };
  const setClosed: Dispatch<SetStateAction<Record<string, boolean>>> = (update) => {
    setNavigationState((current) => {
      const base =
        current.routeCategory === routeCategory
          ? current.closed
          : {
              ...current.closed,
              ...(routeCategory ? { [routeCategory]: false } : {}),
            };
      return {
        routeCategory,
        closed: typeof update === 'function' ? update(base) : update,
      };
    });
  };
  const [drawer, setDrawer] = useState({ open: false, path: location.pathname });
  const mobileOpen = !desktop && drawer.open && drawer.path === location.pathname;

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const onChange = (event: MediaQueryListEvent) => {
      setDesktop(event.matches);
      if (event.matches) setDrawer((current) => ({ ...current, open: false }));
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const closeDrawer = () => {
    setDrawer({ open: false, path: location.pathname });
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--navigation-width)] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-elevated)] xl:flex">
        <SidebarContent closed={closed} setClosed={setClosed} />
      </aside>

      <header className="fixed inset-x-0 top-0 z-50 flex h-[var(--topbar-height)] w-screen max-w-[100vw] items-center justify-between gap-3 overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 xl:hidden">
        <NavLink to="/" className="flex min-h-11 items-center gap-2.5 rounded-[var(--radius-control)] px-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent)] text-sm font-bold text-[var(--color-accent-ink)]">A</span>
          <span className="hidden text-[15px] font-semibold text-[var(--color-text)] sm:inline">AlgoViz</span>
        </NavLink>
        <div className="flex shrink-0 items-center gap-2">
          <ModeToggle />
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setDrawer({ open: true, path: location.pathname })}
            aria-expanded={mobileOpen}
            aria-label="Open navigation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-4)]"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <Sheet
        open={mobileOpen}
        onClose={closeDrawer}
        label="Learning paths"
        placement="left"
        bodyClassName="p-0"
      >
        <div className="flex h-full min-h-0 flex-col">
          <SidebarContent
            closed={closed}
            setClosed={setClosed}
            onNavigate={closeDrawer}
          />
        </div>
      </Sheet>
    </>
  );
}
