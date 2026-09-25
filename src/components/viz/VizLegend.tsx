import type { VizPayload } from '../../core/types';
import { VIZ } from './palette';

type VizType = VizPayload['type'];

interface LegendItem {
  label: string;
  color: string;
  dashed?: boolean;
}

const LEGENDS: Partial<Record<VizType, LegendItem[]>> = {
  array: [
    { label: 'Current', color: VIZ.current },
    { label: 'Compare', color: VIZ.compare },
    { label: 'Swap', color: VIZ.swap },
    { label: 'Sorted', color: VIZ.sorted },
  ],
  search: [
    { label: 'Search range', color: VIZ.active, dashed: true },
    { label: 'Mid probe', color: VIZ.current },
    { label: 'Excluded', color: VIZ.idle },
    { label: 'Found', color: VIZ.sorted },
  ],
  graph: [
    { label: 'Current', color: VIZ.current },
    { label: 'Frontier', color: VIZ.frontier, dashed: true },
    { label: 'Visited', color: VIZ.visited },
    { label: 'Path', color: VIZ.path },
  ],
  grid: [
    { label: 'Current', color: VIZ.current },
    { label: 'Frontier', color: VIZ.frontier, dashed: true },
    { label: 'Visited', color: VIZ.visited },
    { label: 'Path', color: VIZ.path },
  ],
  tree: [
    { label: 'Current', color: VIZ.current },
    { label: 'Search', color: VIZ.swap },
    { label: 'Visited', color: VIZ.active },
  ],
  list: [
    { label: 'Current', color: VIZ.current },
    { label: 'Insert', color: VIZ.sorted },
    { label: 'Remove', color: VIZ.compare },
  ],
  table: [
    { label: 'Compute', color: VIZ.compute },
    { label: 'Read', color: VIZ.active },
    { label: 'Result', color: VIZ.path },
  ],
  callstack: [
    { label: 'Active call', color: VIZ.current },
    { label: 'Returning', color: VIZ.sorted },
    { label: 'Waiting', color: VIZ.idle },
  ],
  hanoi: [
    { label: 'Moving disk', color: VIZ.current },
    { label: 'Settled disk', color: VIZ.sorted },
  ],
};

export function VizLegend({ type }: { type?: VizType }) {
  const items = type ? LEGENDS[type] : undefined;
  if (!items?.length) return null;

  return (
    <div
      role="group"
      aria-label="Visualization legend"
      className="pointer-events-none flex max-w-full flex-wrap gap-x-3 gap-y-1 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/90 px-2.5 py-1.5 text-[10px] text-[var(--color-text-muted)] shadow-[var(--shadow-card)] backdrop-blur-sm"
    >
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-[var(--radius-control)]"
            style={{
              backgroundColor: item.color,
              border: `1px solid ${item.color}`,
              borderStyle: item.dashed ? 'dashed' : 'solid',
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
