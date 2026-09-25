import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../core/player';
import { useEditorStore } from '../../core/editorStore';
import { nextNodeId } from '../../core/presets';
import type { GraphEdgeBase, GraphInputData, GraphNodeHighlight, GraphEdgeHighlight, AlgorithmInput } from '../../core/types';
import { MOTION, VIZ, resolveVisualState } from './palette';

const EDGE_STROKE: Record<string, string> = {
  path: VIZ.sorted,
  comparing: VIZ.compare,
  relaxed: VIZ.swap,
  default: VIZ.edge,
};

const WEIGHT_CYCLE = [1, 2, 4, 6, 8];

function fmtDist(d?: number | null): string {
  if (d === undefined || d === null) return '';
  if (!Number.isFinite(d)) return '∞';
  return String(Math.round(d * 100) / 100);
}

function isSameEdge(a: GraphEdgeBase, b: GraphEdgeBase): boolean {
  return a.from === b.from && a.to === b.to && a.weight === b.weight;
}

export function GraphViz() {
  const input = usePlayerStore((s) => s.input);
  const step = usePlayerStore((s) => s.steps[s.cursor]);
  const patchInput = usePlayerStore((s) => s.patchInput);
  const { tool, pendingEdgeFrom, setPendingEdgeFrom, setStatus } = useEditorStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const dragId = useRef<string | null>(null);
  const pendingDrag = useRef<{ x: number; y: number } | null>(null);
  const dragTimer = useRef<number | null>(null);
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

  const flushDrag = () => {
    if (dragTimer.current !== null) window.clearTimeout(dragTimer.current);
    dragTimer.current = null;
    const position = pendingDrag.current;
    pendingDrag.current = null;
    const id = dragId.current;
    if (!id || !position) return;
    update((graphInput) => {
      const node = graphInput.nodes.find((item) => item.id === id);
      if (node) {
        node.x = position.x;
        node.y = position.y;
      }
    });
  };

  useEffect(() => () => {
    if (dragTimer.current !== null) window.clearTimeout(dragTimer.current);
  }, []);

  const nodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    if (!graph) return;
    if (tool === 'select') {
      dragId.current = id;
      setStatus(`Moving node ${id}.`);
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } else if (tool === 'addEdge') {
      if (!pendingEdgeFrom) {
        setPendingEdgeFrom(id);
        setStatus(`Link started at ${id}. Choose the destination node.`);
      } else if (pendingEdgeFrom !== id) {
        const exists = graph.edges.some(
          (x) =>
            (x.from === pendingEdgeFrom && x.to === id) ||
            (!graph.directed && x.from === id && x.to === pendingEdgeFrom)
        );
        if (!exists) {
          update((g) => g.edges.push({ from: pendingEdgeFrom, to: id, weight: 1 }));
          setStatus(`Linked ${pendingEdgeFrom} to ${id}.`);
        } else {
          setStatus(`A link between ${pendingEdgeFrom} and ${id} already exists.`);
        }
        setPendingEdgeFrom(null);
      }
    } else if (tool === 'delete') {
      if (graph.nodes.length <= 2) {
        setStatus('A graph must keep at least two nodes.');
        return;
      }
      update((g) => {
        g.nodes = g.nodes.filter((n) => n.id !== id);
        g.edges = g.edges.filter((x) => x.from !== id && x.to !== id);
        if (g.startId === id) g.startId = g.nodes[0].id;
        if (g.endId === id) g.endId = g.nodes[g.nodes.length - 1].id;
      });
      setStatus(`Deleted node ${id} and its connected links.`);
    } else if (tool === 'setStart') {
      update((g) => {
        g.startId = id;
      });
      setStatus(`${id} is now the start node.`);
    } else if (tool === 'setEnd') {
      update((g) => {
        g.endId = id;
      });
      setStatus(`${id} is now the goal node.`);
    }
  };

  const svgPointerMove = (e: React.PointerEvent) => {
    const p = toSvg(e);
    if (dragId.current && p) {
      pendingDrag.current = p;
      if (dragTimer.current !== null) window.clearTimeout(dragTimer.current);
      dragTimer.current = window.setTimeout(flushDrag, 60);
    }
    if (pendingEdgeFrom || (tool === 'addNode' && p)) setMouse(p);
  };

  const svgPointerUp = () => {
    flushDrag();
    if (dragId.current) setStatus(`Placed node ${dragId.current}.`);
    dragId.current = null;
  };

  const backgroundClick = (e: React.MouseEvent) => {
    if (!graph) return;
    if (tool !== 'addNode') {
      if (tool === 'addEdge' && pendingEdgeFrom) {
        setPendingEdgeFrom(null);
        setStatus('Link cancelled.');
      }
      return;
    }
    const svg = svgRef.current;
    if (!svg) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
    const x = Math.max(5, Math.min(95, pt.x));
    const y = Math.max(5, Math.min(95, pt.y));
    const id = nextNodeId(graph.nodes.map((node) => node.id));
    update((g) => g.nodes.push({ id, x, y }));
    setStatus(`Added node ${id}.`);
  };

  const edgeClick = (e: React.MouseEvent, edge: GraphEdgeBase) => {
    e.stopPropagation();
    if (tool === 'delete') {
      update((g) => {
        g.edges = g.edges.filter((item) => !isSameEdge(item, edge));
      });
      setStatus(`Deleted link ${edge.from}–${edge.to}.`);
      return;
    }
    if (tool !== 'select' || !graph?.weighted) return;
    // Cycle weight 1→2→4→6→8→remove
    const idx = WEIGHT_CYCLE.indexOf(edge.weight);
    if (idx === -1 || idx === WEIGHT_CYCLE.length - 1) {
      update((g) => {
        g.edges = g.edges.filter((item) => !isSameEdge(item, edge));
      });
      setStatus(`Removed link ${edge.from}–${edge.to}.`);
    } else {
      update((g) => {
        const target = g.edges.find((x) => x.from === edge.from && x.to === edge.to && x.weight === edge.weight);
        if (target) target.weight = WEIGHT_CYCLE[idx + 1];
      });
      setStatus(`Changed link ${edge.from}–${edge.to} to weight ${WEIGHT_CYCLE[idx + 1]}.`);
    }
  };

  const nodeKeyDown = (event: React.KeyboardEvent<SVGCircleElement>, id: string) => {
    if (!graph) return;
    const directions: Partial<Record<string, [number, number]>> = {
      ArrowUp: [0, -2],
      ArrowDown: [0, 2],
      ArrowLeft: [-2, 0],
      ArrowRight: [2, 0],
    };
    const direction = directions[event.key];
    if (tool === 'select' && direction) {
      event.preventDefault();
      update((graphInput) => {
        const node = graphInput.nodes.find((item) => item.id === id);
        if (node) {
          node.x = Math.max(2, Math.min(98, node.x + direction[0]));
          node.y = Math.max(2, Math.min(98, node.y + direction[1]));
        }
      });
      setStatus(`Moved node ${id} with the keyboard.`);
      return;
    }
    if (tool === 'delete' && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      if (graph.nodes.length <= 2) {
        setStatus('A graph must keep at least two nodes.');
        return;
      }
      update((graphInput) => {
        graphInput.nodes = graphInput.nodes.filter((node) => node.id !== id);
        graphInput.edges = graphInput.edges.filter((edge) => edge.from !== id && edge.to !== id);
        if (graphInput.startId === id) graphInput.startId = graphInput.nodes[0].id;
        if (graphInput.endId === id) graphInput.endId = graphInput.nodes[graphInput.nodes.length - 1].id;
      });
      setStatus(`Deleted node ${id} with the keyboard.`);
    }
  };

  const edgeKeyDown = (event: React.KeyboardEvent<SVGLineElement>, edge: GraphEdgeBase) => {
    if (!graph) return;
    if (tool === 'delete' && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      update((graphInput) => {
        graphInput.edges = graphInput.edges.filter((item) => !isSameEdge(item, edge));
      });
      setStatus(`Deleted link ${edge.from}–${edge.to}.`);
      return;
    }
    if (tool === 'select' && graph.weighted && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      const index = WEIGHT_CYCLE.indexOf(edge.weight);
      if (index === -1 || index === WEIGHT_CYCLE.length - 1) {
        update((graphInput) => {
          graphInput.edges = graphInput.edges.filter((item) => !isSameEdge(item, edge));
        });
        setStatus(`Removed link ${edge.from}–${edge.to}.`);
      } else {
        update((graphInput) => {
          const target = graphInput.edges.find((item) => item.from === edge.from && item.to === edge.to && item.weight === edge.weight);
          if (target) target.weight = WEIGHT_CYCLE[index + 1];
        });
        setStatus(`Changed link ${edge.from}–${edge.to} to weight ${WEIGHT_CYCLE[index + 1]}.`);
      }
    }
  };

  if (!interactive || !graph || step?.viz.type !== 'graph') {
    return (
      <div className="flex h-full items-center justify-center text-sm italic" style={{ color: VIZ.textDim }}>
        Press Play or → to step through the trace.
      </div>
    );
  }

  const nodeHi = new Map<string, GraphNodeHighlight>();
  for (const h of step.viz.highlights) nodeHi.set(h.id, h);

  const edgeHi = new Map<string, GraphEdgeHighlight>();
  for (const h of step.viz.edgeHighlights ?? []) {
    edgeHi.set(`${h.from}->${h.to}`, h);
    if (!graph.directed) edgeHi.set(`${h.to}->${h.from}`, h);
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
        role="group"
        aria-label="Interactive graph visualization. Use the editor toolbar to choose a tool."
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
          const edgeState = resolveVisualState(kind);
          const stroke = kind ? edgeState.stroke : VIZ.edge;
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
                style={{ transition: MOTION.edge }} />
              {/* Hit area */}
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="none" strokeWidth={3} pointerEvents="stroke"
                tabIndex={0}
                role="button"
                aria-label={`Link ${e.from} to ${e.to}, weight ${e.weight}. Press Enter to cycle its weight or Delete to remove it.`}
                style={{ cursor: tool === 'select' && graph.weighted ? 'pointer' : 'inherit' }}
                onKeyDown={(event) => edgeKeyDown(event, e)}
                onClick={(ev) => edgeClick(ev, e)}>
                <title>{`${e.from}–${e.to} w=${e.weight}${tool === 'select' && graph.weighted ? ' (click: cycle/remove)' : ''}`}</title>
              </line>
              {graph.weighted && (
                <text x={mx + ox} y={my + oy} textAnchor="middle" dominantBaseline="middle"
                  fontSize={2.6} fill={kind ? stroke : VIZ.labelCanvas}
                  fontFamily={VIZ.fontCode} paintOrder="stroke" stroke={kind ? VIZ.labelHalo : VIZ.canvas}
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
            stroke={VIZ.current} strokeWidth={0.6} strokeDasharray="1.5 1.5" opacity={0.8}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Nodes */}
        {graph.nodes.map((n) => {
          const hi = nodeHi.get(n.id);
          const kind = hi?.kind;
          const state = resolveVisualState(kind);
          const fill = state.fill;
          const ring = state.stroke;
          const isStart = n.id === graph.startId;
          const isEnd = n.id === graph.endId;
          const r = 3.4;
          const distLabel = fmtDist(hi?.dist);

          return (
            <g key={n.id}>
              {kind === 'current' && (
                <circle cx={n.x} cy={n.y} r={r + 1.6} fill="none" stroke={VIZ.current} strokeWidth={0.35} opacity={0.55} />
              )}
              {pendingEdgeFrom === n.id && (
                <circle cx={n.x} cy={n.y} r={r + 1.2} fill="none" stroke={VIZ.current} strokeWidth={0.5} strokeDasharray="1 1" />
              )}
              <circle
                cx={n.x} cy={n.y} r={r}
                fill={fill}
                stroke={isStart ? VIZ.start : isEnd ? VIZ.goal : ring}
                strokeWidth={isStart || isEnd ? 0.8 : 0.45}
                tabIndex={0}
                role="button"
                aria-label={`Node ${n.id}${isStart ? ', start' : ''}${isEnd ? ', goal' : ''}. Use arrow keys to move it when the Move tool is active.`}
                style={{
                  transition: MOTION.fill,
                  filter: kind === 'current' ? `drop-shadow(0 0 ${VIZ.glowXs} ${VIZ.current})` : undefined,
                }}
                onKeyDown={(event) => nodeKeyDown(event, n.id)}
                onPointerDown={(e) => nodePointerDown(e, n.id)}
              >
                <title>{`${n.id}${isStart ? ' · start' : ''}${isEnd ? ' · goal' : ''}`}</title>
              </circle>
              <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle"
                fontSize={2.9} fontFamily={VIZ.fontUi} fontWeight={600}
                fill={kind ? state.text : VIZ.label} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {n.id}
              </text>
              {isStart && (
                <text x={n.x} y={n.y - r - 1.4} textAnchor="middle" fontSize={2.4} fill={VIZ.start}
                  fontFamily={VIZ.fontCode} fontWeight={700} style={{ pointerEvents: 'none' }}>
                  START
                </text>
              )}
              {isEnd && !isStart && (
                <text x={n.x} y={n.y - r - 1.4} textAnchor="middle" fontSize={2.4} fill={VIZ.goal}
                  fontFamily={VIZ.fontCode} fontWeight={700} style={{ pointerEvents: 'none' }}>
                  GOAL
                </text>
              )}
              {distLabel !== '' && (
                <text x={n.x} y={n.y + r + 2.8} textAnchor="middle" fontSize={2.4}
                  fill={kind ? state.text : VIZ.labelCanvas}
                  fontFamily={VIZ.fontCode} fontWeight={600}
                  paintOrder="stroke" stroke={kind ? VIZ.labelHalo : VIZ.canvas} strokeWidth={0.8} style={{ pointerEvents: 'none' }}>
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