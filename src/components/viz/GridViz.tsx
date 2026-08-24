import { useRef } from 'react';
import { usePlayerStore } from '../../core/player';
import { useEditorStore } from '../../core/editorStore';
import type { AlgorithmInput, GridHighlight, GridInputData } from '../../core/types';

const CELL = 10;

const FILL = {
  empty: '#1c1d26',
  wall: '#0b0c11',
  visited: '#31465f',
  frontier: '#8a6a15',
  current: '#a855f7',
  path: '#2f7d4f',
};

function hiKey(r: number, c: number): string {
  return `${r},${c}`;
}

export function GridViz() {
  const input = usePlayerStore((s) => s.input);
  const step = usePlayerStore((s) => s.steps[s.cursor]);
  const patchInput = usePlayerStore((s) => s.patchInput);
  const { tool } = useEditorStore();

  const grid = (input as { grid?: GridInputData }).grid;
  const painting = useRef(false);
  const draggingMarker = useRef<'start' | 'end' | null>(null);

  if (!grid || step?.viz.type !== 'grid') {
    return (
      <div className="h-full flex items-center justify-center text-sm text-[#4a4d5a] italic">
        Press Play or → to step through the trace.
      </div>
    );
  }

  const hi = new Map<string, GridHighlight>();
  for (const h of step.viz.highlights) hi.set(hiKey(h.row, h.col), h);

  const walls = new Set(grid.walls);
  const startKey = hiKey(grid.start[0], grid.start[1]);
  const endKey = hiKey(grid.end[0], grid.end[1]);

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
      if (!isEndpoint && !walls.has(k)) update((g) => {
        g.start = [r, c];
      });
      return;
    }
    if (tool === 'setEnd') {
      if (!isEndpoint && !walls.has(k)) update((g) => {
        g.end = [r, c];
      });
      return;
    }
    if (tool === 'wall') {
      if (isEndpoint) return;
      update((g) => {
        const i = g.walls.indexOf(k);
        if (i !== -1) {
          if (firstPress) g.walls.splice(i, 1); // toggle off only on fresh press
        } else {
          delete g.weights[k];
          g.walls.push(k);
        }
      });
      return;
    }
    if (tool === 'erase') {
      if (isEndpoint) return;
      update((g) => {
        const i = g.walls.indexOf(k);
        if (i !== -1) g.walls.splice(i, 1);
        delete g.weights[k];
      });
      return;
    }
    if (tool === 'weight') {
      if (isEndpoint || walls.has(k)) return;
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
      return;
    }
    // select tool: marker dragging handled at press
    if (tool === 'select' && firstPress) {
      if (k === startKey) draggingMarker.current = 'start';
      else if (k === endKey) draggingMarker.current = 'end';
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const cell = eventToCell(e);
    if (!cell) return;
    painting.current = true;
    (e.currentTarget as SVGSVGElement).setPointerCapture?.(e.pointerId);
    applyTool(cell[0], cell[1], true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!painting.current && !draggingMarker.current) return;
    const cell = eventToCell(e);
    if (!cell) return;
    if (draggingMarker.current) {
      const [r, c] = cell;
      const k = hiKey(r, c);
      if (walls.has(k) || k === startKey || k === endKey) return;
      update((g) => {
        if (draggingMarker.current === 'start') g.start = [r, c];
        else g.end = [r, c];
      });
      return;
    }
    applyTool(cell[0], cell[1], false);
  };

  const onPointerUp = () => {
    painting.current = false;
    draggingMarker.current = null;
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
      let fill = FILL.empty;
      if (walls.has(k)) fill = FILL.wall;
      else if (h) fill = FILL[h.kind];

      const weightVal = grid.weights[k];
      const isStart = k === startKey;
      const isEnd = k === endKey;

      cells.push(
        <g key={k}>
          <rect
            x={c * CELL + 0.4}
            y={r * CELL + 0.4}
            width={CELL - 0.8}
            height={CELL - 0.8}
            rx={1.2}
            fill={fill}
            stroke={weightVal !== undefined && !walls.has(k) ? '#a16207' : undefined}
            strokeWidth={weightVal !== undefined && !walls.has(k) ? 0.35 : 0}
            style={{
              transition: 'fill 140ms ease',
            }}
          />
          {weightVal !== undefined && !walls.has(k) && (
            <text
              x={c * CELL + CELL / 2}
              y={r * CELL + CELL / 2 + 0.6}
              textAnchor="middle"
              fontSize={3.4}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={600}
              fill="#d4a72c"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {weightVal}
            </text>
          )}
          {h?.kind === 'current' && (
            <rect
              x={c * CELL + 0.4} y={r * CELL + 0.4} width={CELL - 0.8} height={CELL - 0.8}
              rx={1.2} fill="none" stroke="#c084fc" strokeWidth={0.5}
              style={{ filter: 'drop-shadow(0 0 1px #a855f7)', pointerEvents: 'none' }}
            />
          )}
          {(h?.g !== undefined || h?.g === 0) && h.kind !== 'path' && (
            <text
              x={c * CELL + 1} y={r * CELL + 3.6}
              fontSize={2.8}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={600}
              fill={h.kind === 'frontier' ? '#fcd34d' : h.kind === 'current' ? '#e9d5ff' : '#9db4d0'}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {Math.round(h.g! * 100) / 100}
            </text>
          )}
          {(isStart || isEnd) && (
            <>
              <rect
                x={c * CELL + 1.2} y={r * CELL + 1.2} width={CELL - 2.4} height={CELL - 2.4} rx={1.6}
                fill={isStart ? '#14532d' : '#7f1d1d'}
                stroke={isStart ? '#4ade80' : '#f87171'}
                strokeWidth={0.45}
                style={{ pointerEvents: 'none', transition: 'x 120ms ease, y 120ms ease' }}
              />
              <text
                x={c * CELL + CELL / 2} y={r * CELL + CELL / 2 + 1}
                textAnchor="middle" fontSize={4} fontWeight={700}
                fontFamily="Inter, sans-serif"
                fill={isStart ? '#4ade80' : '#f87171'}
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
        className={`max-h-full max-w-full rounded-lg ${cursorClass}`}
        style={{ touchAction: 'none' }}
        role="img"
        aria-label="Interactive pathfinding grid editor"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {cells}
      </svg>
    </div>
  );
}