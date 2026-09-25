import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../core/player';
import { useEditorStore } from '../../core/editorStore';
import type { AlgorithmInput, GridHighlight, GridInputData } from '../../core/types';
import { MOTION, VIZ, resolveVisualState } from './palette';

const CELL = 10;

const FILL: Record<string, string> = {
  empty: VIZ.gridEmpty,
  wall: VIZ.wall,
  visited: VIZ.visited,
  frontier: VIZ.frontier,
  current: VIZ.current,
  path: VIZ.path,
};

function hiKey(r: number, c: number): string {
  return `${r},${c}`;
}

function interpolateCells(from: [number, number], to: [number, number]): [number, number][] {
  const dr = to[0] - from[0];
  const dc = to[1] - from[1];
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [];
  const path: [number, number][] = [];
  for (let i = 1; i <= steps; i++) {
    path.push([Math.round(from[0] + (dr * i) / steps), Math.round(from[1] + (dc * i) / steps)]);
  }
  return path;
}

export function GridViz() {
  const input = usePlayerStore((s) => s.input);
  const step = usePlayerStore((s) => s.steps[s.cursor]);
  const patchInput = usePlayerStore((s) => s.patchInput);
  const { tool, setStatus } = useEditorStore();

  const grid = (input as { grid?: GridInputData }).grid;
  const painting = useRef(false);
  const draggingMarker = useRef<'start' | 'end' | null>(null);
  const pendingCell = useRef<[number, number] | null>(null);
  const pendingPaintCells = useRef<[number, number][]>([]);
  const lastPaintCell = useRef<[number, number] | null>(null);
  const applyTimer = useRef<number | null>(null);
  const [keyboardCell, setKeyboardCell] = useState<[number, number]>([0, 0]);
  const [gridFocused, setGridFocused] = useState(false);

  useEffect(() => () => {
    if (applyTimer.current !== null) window.clearTimeout(applyTimer.current);
  }, []);

  if (!grid || step?.viz.type !== 'grid') {
    return (
      <div className="flex h-full items-center justify-center text-sm italic" style={{ color: VIZ.textDim }}>
        Press Play or → to step through the trace.
      </div>
    );
  }

  const hi = new Map<string, GridHighlight>();
  for (const h of step.viz.highlights) hi.set(hiKey(h.row, h.col), h);

  const walls = new Set(grid.walls);
  const startKey = hiKey(grid.start[0], grid.start[1]);
  const endKey = hiKey(grid.end[0], grid.end[1]);
  const keyboardRow = Math.max(0, Math.min(grid.rows - 1, keyboardCell[0]));
  const keyboardCol = Math.max(0, Math.min(grid.cols - 1, keyboardCell[1]));

  const update = (mutate: (g: GridInputData) => void) => {
    const copy: GridInputData = {
      ...grid,
      walls: [...grid.walls],
      weights: { ...grid.weights },
    };
    mutate(copy);
    patchInput({ grid: copy } as unknown as AlgorithmInput);
  };

  const eventToCell = (e: React.PointerEvent | React.MouseEvent): [number, number] | null => {
    const svg = e.currentTarget as SVGSVGElement;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const c = Math.floor(p.x / CELL);
    const r = Math.floor(p.y / CELL);
    if (r < 0 || c < 0 || r >= grid.rows || c >= grid.cols) return null;
    return [r, c];
  };

  const applyTool = (r: number, c: number, firstPress: boolean) => {
    const k = hiKey(r, c);
    const isEndpoint = k === startKey || k === endKey;

    if (tool === 'setStart') {
      if (!isEndpoint && !walls.has(k)) {
        update((g) => {
          g.start = [r, c];
        });
        if (firstPress) setStatus(`Start moved to row ${r + 1}, column ${c + 1}.`);
      } else if (firstPress) {
        setStatus('Choose an open cell for the start marker.');
      }
      return;
    }
    if (tool === 'setEnd') {
      if (!isEndpoint && !walls.has(k)) {
        update((g) => {
          g.end = [r, c];
        });
        if (firstPress) setStatus(`Goal moved to row ${r + 1}, column ${c + 1}.`);
      } else if (firstPress) {
        setStatus('Choose an open cell for the goal marker.');
      }
      return;
    }
    if (tool === 'wall') {
      if (isEndpoint) {
        if (firstPress) setStatus('Start and goal cells cannot be walls.');
        return;
      }
      update((g) => {
        const i = g.walls.indexOf(k);
        if (i !== -1) {
          if (firstPress) g.walls.splice(i, 1); // toggle off only on fresh press
        } else {
          delete g.weights[k];
          g.walls.push(k);
        }
      });
      if (firstPress) setStatus(`Toggled wall at row ${r + 1}, column ${c + 1}.`);
      return;
    }
    if (tool === 'erase') {
      if (isEndpoint) {
        if (firstPress) setStatus('Start and goal cells cannot be erased.');
        return;
      }
      update((g) => {
        const i = g.walls.indexOf(k);
        if (i !== -1) g.walls.splice(i, 1);
        delete g.weights[k];
      });
      if (firstPress) setStatus(`Cleared row ${r + 1}, column ${c + 1}.`);
      return;
    }
    if (tool === 'weight') {
      if (isEndpoint || walls.has(k)) {
        if (firstPress) setStatus('Weights can only be placed on open cells.');
        return;
      }
      const cycle = [2, 4, 6, 8];
      update((g) => {
        const cur = g.weights[k];
        if (cur === undefined) g.weights[k] = 2;
        else {
          const idx = cycle.indexOf(cur);
          if (idx === -1 || idx === cycle.length - 1) delete g.weights[k];
          else g.weights[k] = cycle[idx + 1];
        }
      });
      if (firstPress) setStatus(`Changed terrain cost at row ${r + 1}, column ${c + 1}.`);
      return;
    }
    // select tool: marker dragging handled at press
    if (tool === 'select' && firstPress) {
      if (k === startKey) draggingMarker.current = 'start';
      else if (k === endKey) draggingMarker.current = 'end';
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    const directions: Partial<Record<string, [number, number]>> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const direction = directions[event.key];
    if (direction) {
      event.preventDefault();
      const [row, col] = [keyboardRow, keyboardCol];
      const nextRow = Math.max(0, Math.min(grid.rows - 1, row + direction[0]));
      const nextCol = Math.max(0, Math.min(grid.cols - 1, col + direction[1]));
      const nextKey = hiKey(nextRow, nextCol);
      const currentKey = hiKey(row, col);
      if (tool === 'select' && (currentKey === startKey || currentKey === endKey) && !walls.has(nextKey) && nextKey !== startKey && nextKey !== endKey) {
        update((gridInput) => {
          if (currentKey === startKey) gridInput.start = [nextRow, nextCol];
          else gridInput.end = [nextRow, nextCol];
        });
        setStatus(`Moved ${currentKey === startKey ? 'start' : 'goal'} to row ${nextRow + 1}, column ${nextCol + 1}.`);
      }
      setKeyboardCell([nextRow, nextCol]);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (tool === 'select') {
        setStatus('Choose Set Start, Set Goal, Wall, Weight, or Erase to edit with the keyboard.');
        return;
      }
      applyTool(keyboardRow, keyboardCol, true);
    }
  };

  const applyPaintCell = (g: GridInputData, r: number, c: number): boolean => {
    const k = hiKey(r, c);
    if (k === hiKey(g.start[0], g.start[1]) || k === hiKey(g.end[0], g.end[1])) return false;
    if (tool === 'wall') {
      if (g.walls.includes(k)) return false;
      delete g.weights[k];
      g.walls.push(k);
      return true;
    }
    if (tool === 'erase') {
      let changed = false;
      const i = g.walls.indexOf(k);
      if (i !== -1) {
        g.walls.splice(i, 1);
        changed = true;
      }
      if (g.weights[k] !== undefined) {
        delete g.weights[k];
        changed = true;
      }
      return changed;
    }
    if (tool === 'weight') {
      if (g.walls.includes(k)) return false;
      const cycle = [2, 4, 6, 8];
      const cur = g.weights[k];
      if (cur === undefined) g.weights[k] = 2;
      else {
        const idx = cycle.indexOf(cur);
        if (idx === -1 || idx === cycle.length - 1) delete g.weights[k];
        else g.weights[k] = cycle[idx + 1];
      }
      return true;
    }
    return false;
  };

  const flushMove = () => {
    if (applyTimer.current !== null) window.clearTimeout(applyTimer.current);
    applyTimer.current = null;
    const marker = draggingMarker.current;
    if (marker) {
      const cell = pendingCell.current;
      pendingCell.current = null;
      if (!cell) return;
      const [r, c] = cell;
      const key = hiKey(r, c);
      if (walls.has(key) || key === startKey || key === endKey) return;
      update((gridInput) => {
        if (marker === 'start') gridInput.start = [r, c];
        else gridInput.end = [r, c];
      });
      return;
    }
    const cells = pendingPaintCells.current;
    pendingPaintCells.current = [];
    if (cells.length === 0) return;
    if (tool !== 'wall' && tool !== 'weight' && tool !== 'erase') return;
    let changed = false;
    update((g) => {
      for (const [r, c] of cells) {
        if (applyPaintCell(g, r, c)) changed = true;
      }
    });
    if (changed) setStatus(`Painted ${cells.length} cell${cells.length === 1 ? '' : 's'}.`);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const cell = eventToCell(e);
    if (!cell) return;
    painting.current = true;
    lastPaintCell.current = cell;
    (e.currentTarget as SVGSVGElement).setPointerCapture?.(e.pointerId);
    applyTool(cell[0], cell[1], true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!painting.current && !draggingMarker.current) return;
    const cell = eventToCell(e);
    if (!cell) return;
    if (draggingMarker.current) {
      pendingCell.current = cell;
    } else if (tool === 'wall' || tool === 'weight' || tool === 'erase') {
      const from = lastPaintCell.current ?? cell;
      pendingPaintCells.current.push(...interpolateCells(from, cell));
      lastPaintCell.current = cell;
    } else {
      return;
    }
    if (applyTimer.current !== null) window.clearTimeout(applyTimer.current);
    applyTimer.current = window.setTimeout(flushMove, 60);
  };

  const onPointerUp = () => {
    flushMove();
    painting.current = false;
    draggingMarker.current = null;
    lastPaintCell.current = null;
    pendingPaintCells.current = [];
  };

  const cursorClass =
    tool === 'wall' || tool === 'weight' ? 'cursor-crosshair'
    : tool === 'erase' ? 'cursor-cell'
    : tool === 'setStart' || tool === 'setEnd' ? 'cursor-pointer'
    : 'cursor-grab active:cursor-grabbing';

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const k = hiKey(r, c);
      const h = hi.get(k);
      const cellState = resolveVisualState(h?.kind);
      let fill = FILL.empty;
      if (walls.has(k)) fill = FILL.wall;
      else if (h) fill = cellState.fill;

      const weightVal = grid.weights[k];
      const isStart = k === startKey;
      const isEnd = k === endKey;

      cells.push(
        <g key={k} className={h?.kind === 'current' ? 'anim-viz-pulse' : ''}>
          <rect
            x={c * CELL + 0.4}
            y={r * CELL + 0.4}
            width={CELL - 0.8}
            height={CELL - 0.8}
            rx={1.2}
            fill={fill}
            stroke={weightVal !== undefined && !walls.has(k) ? VIZ.gridWeight : undefined}
            strokeWidth={weightVal !== undefined && !walls.has(k) ? 0.35 : 0}
            style={{
              transition: MOTION.fill,
            }}
          />
          {weightVal !== undefined && !walls.has(k) && (
            <text
              x={c * CELL + CELL / 2}
              y={r * CELL + CELL / 2 + 0.6}
              textAnchor="middle"
              fontSize={3.4}
              fontFamily={VIZ.fontCode}
              fontWeight={600}
              fill={VIZ.label}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {weightVal}
            </text>
          )}
          {h?.kind === 'current' && (
            <rect
              x={c * CELL + 0.4} y={r * CELL + 0.4} width={CELL - 0.8} height={CELL - 0.8}
              rx={1.2} fill="none" stroke={VIZ.current} strokeWidth={0.5}
              style={{ filter: `drop-shadow(0 0 ${VIZ.glowXs} ${VIZ.current})`, pointerEvents: 'none' }}
            />
          )}
          {(h?.g !== undefined || h?.g === 0) && h.kind !== 'path' && (
            <text
              x={c * CELL + 1} y={r * CELL + 3.6}
              fontSize={2.8}
              fontFamily={VIZ.fontCode}
              fontWeight={600}
              fill={h ? cellState.text : VIZ.label}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {Math.round(h.g! * 100) / 100}
            </text>
          )}
          {(isStart || isEnd) && (
            <>
              <rect
                x={c * CELL + 1.2} y={r * CELL + 1.2} width={CELL - 2.4} height={CELL - 2.4} rx={1.6}
                fill={isStart ? VIZ.start : VIZ.goal}
                stroke={isStart ? VIZ.start : VIZ.goal}
                strokeWidth={0.45}
                style={{ pointerEvents: 'none', transition: MOTION.geometry }}
              />
              <text
                x={c * CELL + CELL / 2} y={r * CELL + CELL / 2 + 1}
                textAnchor="middle" fontSize={4} fontWeight={700}
                fontFamily={VIZ.fontUi}
                fill={VIZ.onState}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {isStart ? 'S' : 'E'}
              </text>
            </>
          )}
        </g>
      );
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={`0 0 ${grid.cols * CELL} ${grid.rows * CELL}`}
        className={`max-h-full max-w-full rounded-[var(--radius-panel)] ${cursorClass}`}
        style={{ touchAction: 'none' }}
        role="application"
        tabIndex={0}
        aria-label={`Interactive pathfinding grid. Arrow keys move the editing cell; Enter applies the ${tool} tool. Current cell row ${keyboardRow + 1}, column ${keyboardCol + 1}.`}
        onFocus={() => setGridFocused(true)}
        onBlur={() => setGridFocused(false)}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {cells}
        {gridFocused && (
          <rect
            x={keyboardCol * CELL + 0.2}
            y={keyboardRow * CELL + 0.2}
            width={CELL - 0.4}
            height={CELL - 0.4}
            rx={1.5}
            fill="none"
            stroke={VIZ.text}
            strokeWidth={0.45}
            strokeDasharray="1 0.6"
            pointerEvents="none"
          />
        )}
      </svg>
    </div>
  );
}