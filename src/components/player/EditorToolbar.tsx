import { useEffect, useState } from 'react';
import { useEditorStore } from '../../core/editorStore';
import { usePlayerStore } from '../../core/player';
import { nextNodeId, resizeGrid } from '../../core/presets';
import type { AlgorithmCategory, AlgorithmInput, GraphInputData, GridInputData } from '../../core/types';

const GRAPH_TOOLS = [
  { id: 'select', label: 'Move / Edit', icon: 'M5 3l14 8-6 2-2 6z' },
  { id: 'addNode', label: 'Add Node', icon: 'M12 5v14M5 12h14' },
  { id: 'addEdge', label: 'Link', icon: 'M8 12h8M8 8v8m8-8v8' },
  { id: 'setStart', label: 'Set Start', icon: 'M5 12l7-7v4h7v6h-7v4z' },
  { id: 'setEnd', label: 'Set Goal', icon: 'M19 12l-7 7v-4H5V8h7V4z' },
  { id: 'delete', label: 'Delete', icon: 'M4 7h16M9 7V5h6v2m-8 0 1 13h8l1-13' },
] as const;

const GRID_TOOLS = [
  { id: 'wall', label: 'Wall', icon: 'M3 5h18v6H3zM3 13h18v6H3zM9 5v6m6 6v6' },
  { id: 'weight', label: 'Weight', icon: 'M12 3l9 16H3zM12 9v5m0 2.5v.5' },
  { id: 'erase', label: 'Erase', icon: 'M4 15l7-7 6 6-4 4H7zM14 20h6' },
  { id: 'setStart', label: 'Set Start', icon: 'M5 12l7-7v4h7v6h-7v4z' },
  { id: 'setEnd', label: 'Set Goal', icon: 'M19 12l-7 7v-4H5V8h7V4z' },
] as const;

const numInput =
  'w-14 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-3)] px-1.5 py-1 text-center font-mono text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-elevated)]';

const selectInput =
  'min-h-10 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-3)] px-2 py-1.5 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)]';

export function EditorToolbar({ category }: { category: AlgorithmCategory }) {
  const {
    tool,
    setTool,
    status,
    setStatus,
    pendingEdgeFrom,
    setPendingEdgeFrom,
    linkTo,
    setLinkTo,
    gridDraft,
    setGridDraft,
  } = useEditorStore();
  const input = usePlayerStore((state) => state.input);
  const patchInput = usePlayerStore((state) => state.patchInput);
  const tools = category === 'graph' ? GRAPH_TOOLS : GRID_TOOLS;
  const grid = (input as { grid?: GridInputData }).grid;
  const graph = (input as { graph?: GraphInputData }).graph;
  const [error, setError] = useState<string | null>(null);
  const draft = gridDraft;
  const linkFrom = pendingEdgeFrom ?? '';
  const rows = draft?.r ?? String(grid?.rows ?? 12);
  const cols = draft?.c ?? String(grid?.cols ?? 20);
  const dirty =
    !!grid &&
    !!draft &&
    (Number(draft.r) !== grid.rows || Number(draft.c) !== grid.cols);

  useEffect(() => {
    setTool('select');
    setPendingEdgeFrom(null);
    setLinkTo('');
    setGridDraft(null);
    setStatus('Move tool selected. Choose another tool to make changes.');
  }, [category, setTool, setStatus, setPendingEdgeFrom, setLinkTo, setGridDraft]);

  const commitSize = () => {
    const rowCount = Number(rows);
    const colCount = Number(cols);
    if (!Number.isInteger(rowCount) || rowCount < 5 || rowCount > 30) {
      setError('Rows must be a whole number from 5 to 30.');
      return;
    }
    if (!Number.isInteger(colCount) || colCount < 8 || colCount > 50) {
      setError('Columns must be a whole number from 8 to 50.');
      return;
    }
    if (!grid || !dirty) {
      setGridDraft(null);
      setError(null);
      return;
    }
    patchInput({ grid: resizeGrid(grid, rowCount, colCount) } as unknown as AlgorithmInput);
    setGridDraft(null);
    setError(null);
    setStatus(`Grid resized to ${rowCount} rows by ${colCount} columns.`);
  };

  const addNode = () => {
    if (!graph) return;
    const id = nextNodeId(graph.nodes.map((node) => node.id));
    patchInput({
      graph: { ...graph, nodes: [...graph.nodes, { id, x: 50, y: 50 }] },
    } as unknown as AlgorithmInput);
    setStatus(`Added node ${id} at the center of the graph.`);
  };

  const addLink = () => {
    if (!graph) return;
    const nodeIds = new Set(graph.nodes.map((node) => node.id));
    const from = nodeIds.has(linkFrom) ? linkFrom : graph.nodes[0]?.id;
    const to = nodeIds.has(linkTo) ? linkTo : graph.nodes[1]?.id;
    if (!from || !to || from === to) {
      setStatus('Choose two different nodes for the link.');
      return;
    }
    const exists = graph.edges.some(
      (edge) =>
        (edge.from === from && edge.to === to) ||
        (!graph.directed && edge.from === to && edge.to === from)
    );
    if (exists) {
      setStatus(`A link between ${from} and ${to} already exists.`);
      return;
    }
    patchInput({
      graph: { ...graph, edges: [...graph.edges, { from, to, weight: 1 }] },
    } as unknown as AlgorithmInput);
    setPendingEdgeFrom(null);
    setLinkTo('');
    setStatus(`Linked ${from} to ${to}.`);
  };

  return (
    <div className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="scrollbar-thin flex items-center gap-1.5 overflow-x-auto px-3 py-2">
        {tools.map((item) => {
          const active = tool === item.id;
          const destructive = item.id === 'delete';
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTool(item.id);
                setStatus(`${item.label} tool selected.`);
              }}
              title={item.label}
              aria-pressed={active}
              className={`flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-control)] border px-3 py-2 text-xs font-medium transition-all duration-150 active:scale-95 ${
                active
                  ? destructive
                    ? 'border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
                    : 'border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)] shadow-[0_0_10px_var(--color-accent-ring)]'
                  : destructive
                    ? 'border-transparent bg-transparent text-[var(--color-danger)] hover:border-[var(--color-danger-border)]'
                    : 'border-transparent bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:border-[var(--color-border)] hover:text-[var(--color-text)]'
              }`}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={item.icon} />
              </svg>
              {item.label}
            </button>
          );
        })}

        {category === 'graph' && graph && (
          <div className="flex shrink-0 items-center gap-2 border-l border-[var(--color-border)] pl-3">
            <label className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
              Start
              <select
                value={graph.startId}
                onChange={(event) => {
                  const startId = event.target.value;
                  patchInput({ graph: { ...graph, startId } } as unknown as AlgorithmInput);
                  setStatus(`${startId} is now the start node.`);
                }}
                className={selectInput}
              >
                {graph.nodes.map((node) => <option key={node.id} value={node.id}>{node.id}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
              Goal
              <select
                value={graph.endId}
                onChange={(event) => {
                  const endId = event.target.value;
                  patchInput({ graph: { ...graph, endId } } as unknown as AlgorithmInput);
                  setStatus(`${endId} is now the goal node.`);
                }}
                className={selectInput}
              >
                {graph.nodes.map((node) => <option key={node.id} value={node.id}>{node.id}</option>)}
              </select>
            </label>
            {tool === 'addNode' && (
              <button type="button" onClick={addNode} className="min-h-10 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-[var(--color-accent-ink)]">
                Add at center
              </button>
            )}
            {tool === 'addEdge' && (
              <>
                <select aria-label="Link from node" value={graph.nodes.some((node) => node.id === linkFrom) ? linkFrom : graph.nodes[0]?.id || ''} onChange={(event) => setPendingEdgeFrom(event.target.value)} className={selectInput}>
                  {graph.nodes.map((node) => <option key={node.id} value={node.id}>{node.id}</option>)}
                </select>
                <span aria-hidden="true" className="text-[var(--color-text-dim)]">to</span>
                <select aria-label="Link to node" value={graph.nodes.some((node) => node.id === linkTo) ? linkTo : graph.nodes[1]?.id || ''} onChange={(event) => setLinkTo(event.target.value)} className={selectInput}>
                  {graph.nodes.map((node) => <option key={node.id} value={node.id}>{node.id}</option>)}
                </select>
                <button type="button" onClick={addLink} className="min-h-10 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-[var(--color-accent-ink)]">
                  Add link
                </button>
              </>
            )}
          </div>
        )}

        {category === 'grid' && grid && (
          <div className="ml-auto flex shrink-0 items-center gap-1.5 border-l border-[var(--color-border)] pl-3">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">Grid</span>
            <input
              type="number"
              min={5}
              max={30}
              value={rows}
              onChange={(event) => {
                setGridDraft({ r: event.target.value, c: cols });
                setError(null);
              }}
              onKeyDown={(event) => event.key === 'Enter' && commitSize()}
              className={`${numInput} ${dirty ? 'border-[var(--color-accent)]' : ''}`}
              aria-label="Grid rows (5–30)"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'grid-size-error' : undefined}
            />
            <span className="text-xs text-[var(--color-text-dim)]">×</span>
            <input
              type="number"
              min={8}
              max={50}
              value={cols}
              onChange={(event) => {
                setGridDraft({ r: rows, c: event.target.value });
                setError(null);
              }}
              onKeyDown={(event) => event.key === 'Enter' && commitSize()}
              className={`${numInput} ${dirty ? 'border-[var(--color-accent)]' : ''}`}
              aria-label="Grid columns (8–50)"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'grid-size-error' : undefined}
            />
            <button
              type="button"
              onClick={commitSize}
              disabled={!dirty}
              className={`min-h-10 whitespace-nowrap rounded-[var(--radius-control)] px-3 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                dirty
                  ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)] shadow-[0_0_12px_var(--color-accent-ring)] hover:bg-[var(--color-accent-hover)]'
                  : 'cursor-not-allowed border border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text-dim)]'
              }`}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setGridDraft(null);
                setError(null);
              }}
              disabled={!draft}
              className="min-h-10 whitespace-nowrap rounded-[var(--radius-control)] px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)] disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <p aria-live="polite" className="border-t border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)]">
        <span className="sr-only">Editor status: </span>{status}
      </p>
      {error && (
        <p id="grid-size-error" role="alert" className="border-t border-[var(--color-danger-border)] px-3 py-2 text-xs text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
