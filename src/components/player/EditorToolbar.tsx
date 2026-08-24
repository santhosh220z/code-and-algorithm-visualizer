import { useState } from 'react';
import { useEditorStore } from '../../core/editorStore';
import { usePlayerStore } from '../../core/player';
import { resizeGrid } from '../../core/presets';
import type { AlgorithmCategory, GridInputData, AlgorithmInput } from '../../core/types';

const GRAPH_TOOLS = [
  { id: 'select', label: 'Move / Edit', icon: 'M5 3l14 8-6 2-2 6z' },
  { id: 'addNode', label: 'Add Node', icon: 'M12 5v14M5 12h14' },
  { id: 'addEdge', label: 'Link', icon: 'M8 12h8M8 8v8m8-8v8' },
  { id: 'setStart', label: 'Set Start', icon: 'M5 12l7-7v4h7v6h-7v4z' },
  { id: 'setEnd', label: 'Set Goal', icon: 'M19 12l-7 7v-4H5V8h7V4z' },
  { id: 'delete', label: 'Delete', icon: 'M4 7h16M9 7V5h6v2m-8 0l1 13h8l1-13' },
] as const;

const GRID_TOOLS = [
  { id: 'wall', label: 'Wall', icon: 'M3 5h18v6H3zM3 13h18v6H3zM9 5v6m6 6v6' },
  { id: 'weight', label: 'Weight', icon: 'M12 3l9 16H3zM12 9v5m0 2.5v.5' },
  { id: 'erase', label: 'Erase', icon: 'M4 15l7-7 6 6-4 4H7zM14 20h6' },
  { id: 'setStart', label: 'Set Start', icon: 'M5 12l7-7v4h7v6h-7v4z' },
  { id: 'setEnd', label: 'Set Goal', icon: 'M19 12l-7 7v-4H5V8h7V4z' },
] as const;

const numInput =
  'w-14 px-1.5 py-1 rounded-md bg-[#20222f] border border-[var(--color-border)] text-[11px] font-mono text-white focus:border-[var(--color-accent)] focus:outline-none text-center';

export function EditorToolbar({ category }: { category: AlgorithmCategory }) {
  const { tool, setTool } = useEditorStore();
  const input = usePlayerStore((s) => s.input);
  const patchInput = usePlayerStore((s) => s.patchInput);
  const tools = category === 'graph' ? GRAPH_TOOLS : GRID_TOOLS;

  const grid = (input as { grid?: GridInputData }).grid;

  // Draft values: edits stay local until the user commits with OK / Enter.
  const [draft, setDraft] = useState<{ r: number; c: number } | null>(null);
  const rows = draft?.r ?? grid?.rows ?? 12;
  const cols = draft?.c ?? grid?.cols ?? 20;
  const dirty = !!grid && !!draft && (draft.r !== grid.rows || draft.c !== grid.cols);

  const commitSize = () => {
    if (!grid || !dirty) {
      setDraft(null);
      return;
    }
    patchInput({ grid: resizeGrid(grid, rows, cols) } as unknown as AlgorithmInput);
    setDraft(null);
  };

  return (
    <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] overflow-x-auto scrollbar-thin">
      {tools.map((t) => {
        const active = tool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={t.label}
            aria-pressed={active}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-150 active:scale-95 ${
              active
                ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)] border border-[var(--color-accent-border,#5b21b6)] shadow-[0_0_8px_rgba(168,85,247,0.25)]'
                : 'bg-[#20222f] text-[var(--color-text-muted)] border border-transparent hover:text-white hover:border-[var(--color-border)]'
            }`}
          >
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={t.icon} />
            </svg>
            {t.label}
          </button>
        );
      })}

      {/* Custom grid size — draft inputs, applied on OK */}
      {category === 'grid' && grid && (
        <div className="ml-auto flex items-center gap-1.5 shrink-0 pl-3 border-l border-[var(--color-border)]">
          <span className="text-[10px] uppercase tracking-wider text-[#4a4d5a]">Grid</span>
          <input
            type="number"
            min={5}
            max={30}
            value={rows}
            onChange={(e) => setDraft({ r: e.target.valueAsNumber, c: cols })}
            onKeyDown={(e) => e.key === 'Enter' && commitSize()}
            className={`${numInput} ${dirty ? 'border-[var(--color-accent)]' : ''}`}
            aria-label="Grid rows (5–30)"
            title="Rows (5–30)"
          />
          <span className="text-[#4a4d5a] text-xs">×</span>
          <input
            type="number"
            min={8}
            max={50}
            value={cols}
            onChange={(e) => setDraft({ r: rows, c: e.target.valueAsNumber })}
            onKeyDown={(e) => e.key === 'Enter' && commitSize()}
            className={`${numInput} ${dirty ? 'border-[var(--color-accent)]' : ''}`}
            aria-label="Grid columns (8–50)"
            title="Columns (8–50)"
          />
          <button
            onClick={commitSize}
            disabled={!dirty}
            title="Apply new grid size"
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${
              dirty
                ? 'bg-[var(--color-accent)] text-white shadow-[0_0_10px_rgba(168,85,247,0.35)] hover:bg-[var(--color-accent-hover)]'
                : 'bg-[#20222f] text-[#4a4d5a] border border-[var(--color-border)] cursor-not-allowed'
            }`}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}