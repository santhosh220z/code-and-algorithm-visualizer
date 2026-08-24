import { useRef, useState } from 'react';
import { usePlayerStore } from '../../core/player';
import { useEditorStore } from '../../core/editorStore';
import { nextNodeId } from '../../core/presets';
import type { GraphEdgeBase, GraphInputData, GraphNodeHighlight, GraphEdgeHighlight, AlgorithmInput } from '../../core/types';

const NODE_FILL: Record<string, string> = {
  current: '#a855f7',
  path: '#4ade80',
  frontier: '#fbbf24',
  visited: '#3b5b82',
  default: '#23242f',
};

const NODE_STROKE: Record<string, string> = {
  current: '#c084fc',
  path: '#86efac',
  frontier: '#fcd34d',
  visited: '#60a5fa',
  default: '#3a3d49',
};

const EDGE_STROKE: Record<string, string> = {
  path: '#4ade80',
  comparing: '#f87171',
  relaxed: '#fbbf24',
  default: '#33364a',
};

const WEIGHT_CYCLE = [1, 2, 4, 6, 8];

function fmtDist(d?: number | null): string {
  if (d === undefined || d === null) return '';
  if (!Number.isFinite(d)) return '∞';
  return String(Math.round(d * 100) / 100);
}

export function GraphViz() {
  const input = usePlayerStore((s) => s.input);
  const step = usePlayerStore((s) => s.steps[s.cursor]);
  const patchInput = usePlayerStore((s) => s.patchInput);
  const { tool, pendingEdgeFrom, setPendingEdgeFrom } = useEditorStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const dragId = useRef<string | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  const graph = (input as { graph?: GraphInputData }).graph;
  const interactive = !!graph;

  const toSvg = (e: React.PointerEvent): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = new DOMPoint(e.clientX, e.clientY);
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: Math.max(2, Math.min(98, p.x)), y: Math.max(2, Math.min(98, p.y)) };
  };

  const update = (mutate: (g: GraphInputData) => void) => {
    if (!graph) return;
    const copy: GraphInputData = {
      ...graph,
      nodes: graph.nodes.map((n) => ({ ...n })),
      edges: graph.edges.map((e) => ({ ...e })),
    };
    mutate(copy);
    patchInput({ graph: copy } as unknown as AlgorithmInput);
  };

  const nodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    if (!graph) return;
    if (tool === 'select') {
      dragId.current = id;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } else if (tool === 'addEdge') {
      if (!pendingEdgeFrom) {
        setPendingEdgeFrom(id);
      } else if (pendingEdgeFrom !== id) {
        const exists = graph.edges.some(
          (x) =>
            (x.from === pendingEdgeFrom && x.to === id) ||
            (!graph.directed && x.from === id && x.to === pendingEdgeFrom)
        );
        if (!exists) {
          update((g) => g.edges.push({ from: pendingEdgeFrom, to: id, weight: 1 }));
        }
        setPendingEdgeFrom(null);
      }
    } else if (tool === 'delete') {
      if (graph.nodes.length <= 2) return;
      update((g) => {
        g.nodes = g.nodes.filter((n) => n.id !== id);
        g.edges = g.edges.filter((x) => x.from !== id && x.to !== id);
        if (g.startId === id) g.startId = g.nodes[0].id;
        if (g.endId === id) g.endId = g.nodes[g.nodes.length - 1].id;
      });
    } else if (tool === 'setStart') {
      update((g) => {
        g.startId = id;
      });
    } else if (tool === 'setEnd') {
      update((g) => {
        g.endId = id;
      });
    }
  };

  const svgPointerMove = (e: React.PointerEvent) => {
    const p = toSvg(e);
    if (dragId.current && p) {
      const id = dragId.current;
      update((g) => {
        const n = g.nodes.find((x) => x.id === id);
        if (n) {
          n.x = p.x;
          n.y = p.y;
        }
      });
    }
    if (pendingEdgeFrom || (tool === 'addNode' && p)) setMouse(p);
  };

  const svgPointerUp = () => {
    dragId.current = null;
  };

  const backgroundClick = (e: React.MouseEvent) => {
    if (tool !== 'addNode') {
      if (tool === 'addEdge' && pendingEdgeFrom) setPendingEdgeFrom(null);
      return;
    }
    const svg = svgRef.current;
    if (!svg) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
    const x = Math.max(5, Math.min(95, pt.x));
    const y = Math.max(5, Math.min(95, pt.y));
    update((g) => g.nodes.push({ id: nextNodeId(g.nodes.map((n) => n.id)), x, y }));
  };

  const edgeClick = (e: React.MouseEvent, edge: GraphEdgeBase) => {
    e.stopPropagation();
    if (tool === 'delete') {
      update((g) => {
        g.edges = g.edges.filter((x) => x !== edge);
      });
      return;
    }
    if (tool !== 'select' || !graph?.weighted) return;
    // Cycle weight 1→2→4→6→8→remove
    const idx = WEIGHT_CYCLE.indexOf(edge.weight);
    if (idx === -1 || idx === WEIGHT_CYCLE.length - 1) {
      update((g) => {
        g.edges = g.edges.filter((x) => x !== edge);
      });
    } else {
      update((g) => {
        const target = g.edges.find((x) => x.from === edge.from && x.to === edge.to && x.weight === edge.weight);
        if (target) target.weight = WEIGHT_CYCLE[idx + 1];
      });
    }
  };

  if (!interactive || !graph || step?.viz.type !== 'graph') {
    return (
      <div className="h-full flex items-center justify-center text-sm text-[#4a4d5a] italic">
        Press Play or → to step through the trace.
      </div>
    );
  }

  const nodeHi = new Map<string, GraphNodeHighlight>();
  for (const h of step.viz.highlights) nodeHi.set(h.id, h);

  const edgeHi = new Map<string, GraphEdgeHighlight>();
  for (const h of step.viz.edgeHighlights ?? []) {
    edgeHi.set(`${h.from}->${h.to}`, h);
    edgeHi.set(`${h.to}->${h.from}`, h);
  }

  const cursorClass =
    tool === 'addNode' ? 'cursor-copy'
    : tool === 'delete' ? 'cursor-not-allowed'
    : tool === 'select' ? 'cursor-grab active:cursor-grabbing'
    : 'cursor-crosshair';

  const pendingNode = pendingEdgeFrom ? graph.nodes.find((n) => n.id === pendingEdgeFrom) : null;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        ref={svgRef}
        viewBox="-2 -2 104 104"
        className={`max-h-full max-w-full ${cursorClass}`}
        style={{ aspectRatio: '1.6', touchAction: 'none' }}
        role="img"
        aria-label="Interactive graph editor"
        onPointerMove={svgPointerMove}
        onPointerUp={svgPointerUp}
        onClick={backgroundClick}
      >
        <defs>
          {(Object.keys(EDGE_STROKE) as (keyof typeof EDGE_STROKE)[]).map((k) => (
            <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={EDGE_STROKE[k]} />
            </marker>
          ))}
        </defs>

        {/* Edges */}
        {graph.edges.map((e, i) => {
          const a = graph.nodes.find((n) => n.id === e.from);
          const b = graph.nodes.find((n) => n.id === e.to);
          if (!a || !b) return null;
          const hi = edgeHi.get(`${e.from}->${e.to}`);
          const kind = hi?.kind;
          const stroke = EDGE_STROKE[kind ?? 'default'];
          const width = kind ? 1.1 : 0.55;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ox = (-dy / len) * 2.6;
          const oy = (dx / len) * 2.6;

          return (
            <g key={`${e.from}-${e.to}-${i}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={width}
                markerEnd={graph.directed ? `url(#arrow-${kind ?? 'default'})` : undefined}
                style={{ transition: 'stroke 180ms ease, stroke-width 180ms ease' }} />
              {/* Hit area */}
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={3}
                style={{ cursor: tool === 'select' && graph.weighted ? 'pointer' : 'inherit' }}
                onClick={(ev) => edgeClick(ev, e)}>
                <title>{`${e.from}–${e.to} w=${e.weight}${tool === 'select' && graph.weighted ? ' (click: cycle/remove)' : ''}`}</title>
              </line>
              {graph.weighted && (
                <text x={mx + ox} y={my + oy} textAnchor="middle" dominantBaseline="middle"
                  fontSize={2.6} fill={kind ? stroke : '#7a7f92'}
                  fontFamily="JetBrains Mono, monospace" paintOrder="stroke" stroke="#16171d"
                  strokeWidth={0.9} fontWeight={kind ? 700 : 400} style={{ pointerEvents: 'none' }}>
                  {e.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* Pending edge preview */}
        {pendingNode && mouse && (
          <line
            x1={pendingNode.x} y1={pendingNode.y} x2={mouse.x} y2={mouse.y}
            stroke="#c084fc" strokeWidth={0.6} strokeDasharray="1.5 1.5" opacity={0.8}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Nodes */}
        {graph.nodes.map((n) => {
          const hi = nodeHi.get(n.id);
          const kind = hi?.kind;
          const fill = NODE_FILL[kind ?? 'default'];
          const ring = NODE_STROKE[kind ?? 'default'];
          const isStart = n.id === graph.startId;
          const isEnd = n.id === graph.endId;
          const r = 3.4;
          const distLabel = fmtDist(hi?.dist);

          return (
            <g key={n.id}>
              {kind === 'current' && (
                <circle cx={n.x} cy={n.y} r={r + 1.6} fill="none" stroke="#a855f7" strokeWidth={0.35} opacity={0.55} />
              )}
              {pendingEdgeFrom === n.id && (
                <circle cx={n.x} cy={n.y} r={r + 1.2} fill="none" stroke="#c084fc" strokeWidth={0.5} strokeDasharray="1 1" />
              )}
              <circle
                cx={n.x} cy={n.y} r={r}
                fill={fill}
                stroke={isStart ? '#4ade80' : isEnd ? '#f87171' : ring}
                strokeWidth={isStart || isEnd ? 0.8 : 0.45}
                style={{
                  transition: 'fill 180ms ease, stroke 180ms ease',
                  filter: kind === 'current' ? 'drop-shadow(0 0 1.5px #a855f7)' : undefined,
                }}
                onPointerDown={(e) => nodePointerDown(e, n.id)}
              >
                <title>{`${n.id}${isStart ? ' · start' : ''}${isEnd ? ' · goal' : ''}`}</title>
              </circle>
              <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle"
                fontSize={2.9} fontFamily="Inter, sans-serif" fontWeight={600}
                fill={kind ? '#0f1015' : '#c8ccd8'} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {n.id}
              </text>
              {isStart && (
                <text x={n.x} y={n.y - r - 1.4} textAnchor="middle" fontSize={2.4} fill="#4ade80"
                  fontFamily="JetBrains Mono, monospace" fontWeight={700} style={{ pointerEvents: 'none' }}>
                  START
                </text>
              )}
              {isEnd && !isStart && (
                <text x={n.x} y={n.y - r - 1.4} textAnchor="middle" fontSize={2.4} fill="#f87171"
                  fontFamily="JetBrains Mono, monospace" fontWeight={700} style={{ pointerEvents: 'none' }}>
                  GOAL
                </text>
              )}
              {distLabel !== '' && (
                <text x={n.x} y={n.y + r + 2.8} textAnchor="middle" fontSize={2.4}
                  fill={kind === 'frontier' ? '#fcd34d' : kind === 'current' ? '#c084fc' : '#8fa8c9'}
                  fontFamily="JetBrains Mono, monospace" fontWeight={600}
                  paintOrder="stroke" stroke="#16171d" strokeWidth={0.8} style={{ pointerEvents: 'none' }}>
                  d={distLabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}