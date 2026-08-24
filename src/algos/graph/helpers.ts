import type { Step, GraphInputData, GraphNodeHighlight, GraphEdgeHighlight } from '../../core/types';

export interface LoopInfo {
  label: string;
  iteration: number;
}

export function asGraphInput(input: unknown): GraphInputData {
  // Input arrives wrapped as { graph: GraphInputData }
  const wrapped = input as { graph?: GraphInputData };
  return wrapped.graph ?? (input as GraphInputData);
}

export function makeGraphStep(
  nodeHighlights: GraphNodeHighlight[],
  edgeHighlights: GraphEdgeHighlight[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: LoopInfo[]
): Step {
  return {
    line,
    description,
    vars,
    loops,
    viz: { type: 'graph', highlights: nodeHighlights, edgeHighlights },
  };
}

/** Deterministic adjacency list honoring direction; neighbors ordered by node index. */
export function buildAdjacency(input: GraphInputData): Map<string, { id: string; weight: number }[]> {
  const adj = new Map<string, { id: string; weight: number }[]>();
  for (const n of input.nodes) adj.set(n.id, []);
  const order = new Map(input.nodes.map((n, i) => [n.id, i]));
  for (const e of input.edges) {
    if (!adj.has(e.from) || !adj.has(e.to)) continue;
    adj.get(e.from)!.push({ id: e.to, weight: e.weight });
    if (!input.directed) adj.get(e.to)!.push({ id: e.from, weight: e.weight });
  }
  for (const list of adj.values()) {
    list.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  }
  return adj;
}

export function euclid(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Reveal the reconstructed path node-by-node with connecting edges. */
export function* revealPath(
  parent: Map<string, string>,
  startId: string,
  goalId: string,
  line: number,
  costLabel: string
): Generator<Step> {
  const path: string[] = [];
  let cur: string | null = goalId;
  let guard = 0;
  while (cur && guard++ < 500) {
    path.unshift(cur);
    if (cur === startId) break;
    cur = parent.get(cur) ?? null;
  }
  if (path[0] !== startId) path.unshift(startId);

  for (let i = 0; i < path.length; i++) {
    const nodeHi: GraphNodeHighlight[] = [];
    const edgeHi: GraphEdgeHighlight[] = [];
    for (let j = 0; j <= i; j++) nodeHi.push({ id: path[j], kind: 'path' });
    if (i > 0) edgeHi.push({ from: path[i - 1], to: path[i], kind: 'path' });
    yield makeGraphStep(
      nodeHi,
      edgeHi,
      line,
      `Path so far: ${path.slice(0, i + 1).join(' → ')}`,
      { progress: `${i + 1}/${path.length}`, costLabel },
      [{ label: 'reconstruct', iteration: i + 1 }]
    );
  }

  yield makeGraphStep(
    path.map((id) => ({ id, kind: 'path' as const })),
    path.slice(1).map((id, idx) => ({ from: path[idx], to: id, kind: 'path' as const })),
    line,
    `Final path: ${path.join(' → ')} (${costLabel})`,
    { pathEdges: Math.max(0, path.length - 1), costLabel, found: true },
    []
  );
}

export function noPathStep(goalId: string, line: number): Step {
  return makeGraphStep(
    [],
    [],
    line,
    `"${goalId}" is unreachable — search space exhausted`,
    { found: false },
    []
  );
}