import { useCallback, useEffect, useId, useState, type ReactNode } from 'react';
import { Sheet } from '../ui/Sheet';

export interface InspectorTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface ResponsiveInspectorProps {
  tabs: InspectorTab[];
  label?: string;
}

type InspectorLayout = 'desktop' | 'tablet' | 'mobile';

function getLayout(): InspectorLayout {
  if (typeof window === 'undefined') return 'mobile';
  if (window.matchMedia('(min-width: 1280px)').matches) return 'desktop';
  if (window.matchMedia('(min-width: 768px)').matches) return 'tablet';
  return 'mobile';
}

function useInspectorLayout(onDesktop: () => void): InspectorLayout {
  const [layout, setLayout] = useState<InspectorLayout>(getLayout);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const tablet = window.matchMedia('(min-width: 768px)');
    const update = () => {
      const next = getLayout();
      setLayout(next);
      if (next === 'desktop') onDesktop();
    };
    desktop.addEventListener('change', update);
    tablet.addEventListener('change', update);
    return () => {
      desktop.removeEventListener('change', update);
      tablet.removeEventListener('change', update);
    };
  }, [onDesktop]);

  return layout;
}

export function ResponsiveInspector({ tabs, label = 'Learning panel' }: ResponsiveInspectorProps) {
  const idPrefix = useId();
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const closeTransientPanels = useCallback(() => {
    setMobileOpen(false);
    setDockOpen(false);
  }, []);
  const layout = useInspectorLayout(closeTransientPanels);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  const tabList = (instance: string) => (
    <div role="tablist" aria-label={label} className="flex shrink-0 gap-1 border-b border-[var(--color-border)] p-2">
      {tabs.map((tab, index) => {
        const selected = tab.id === activeTab?.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${idPrefix}-${instance}-${tab.id}-tab`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-${instance}-${tab.id}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => setActiveTabId(tab.id)}
            onKeyDown={(event) => {
              let nextIndex = index;
              if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
              else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
              else if (event.key === 'Home') nextIndex = 0;
              else if (event.key === 'End') nextIndex = tabs.length - 1;
              else return;
              event.preventDefault();
              const nextTab = tabs[nextIndex];
              setActiveTabId(nextTab.id);
              window.requestAnimationFrame(() => {
                document.getElementById(`${idPrefix}-${instance}-${nextTab.id}-tab`)?.focus();
              });
            }}
            className={`min-h-11 flex-1 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors ${
              selected
                ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  const panel = (instance: string) => (
    <>
      {tabs.map((tab) => {
        const selected = tab.id === activeTab?.id;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${idPrefix}-${instance}-${tab.id}-panel`}
            aria-labelledby={`${idPrefix}-${instance}-${tab.id}-tab`}
            hidden={!selected}
            className="min-h-0 flex-1 overflow-hidden"
          >
            {tab.content}
          </div>
        );
      })}
    </>
  );

  if (layout === 'desktop') {
    return (
      <aside className="surface-panel order-2 hidden w-[var(--inspector-width)] shrink-0 flex-col overflow-hidden xl:flex">
        {tabList('desktop')}
        {panel('desktop')}
      </aside>
    );
  }

  const expanded = layout === 'tablet' ? dockOpen : mobileOpen;
  const toggle = () => {
    if (layout === 'tablet') setDockOpen((value) => !value);
    else setMobileOpen(true);
  };

  return (
    <>
      <div className="order-0 flex shrink-0 items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 xl:hidden">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-dim)]">Learning panel</p>
          <p className="truncate text-sm font-medium text-[var(--color-text)]">{activeTab?.label ?? label}</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-hover)] transition-colors hover:bg-[var(--color-accent-bg-hover)]"
        >
          {expanded ? 'Hide panel' : 'Open panel'}
        </button>
      </div>

      {layout === 'tablet' && dockOpen && (
        <section className="surface-panel order-2 flex h-[min(42dvh,28rem)] min-h-64 shrink-0 flex-col overflow-hidden">
          {tabList('tablet')}
          {panel('tablet')}
        </section>
      )}

      <Sheet
        open={layout === 'mobile' && mobileOpen}
        onClose={() => setMobileOpen(false)}
        label={label}
        placement="bottom"
        bodyClassName="p-0"
      >
        <div className="flex h-full min-h-[24rem] flex-col">
          {tabList('mobile')}
          {panel('mobile')}
        </div>
      </Sheet>
    </>
  );
}
