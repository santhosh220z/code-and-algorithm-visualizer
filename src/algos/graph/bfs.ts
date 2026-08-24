import type { AlgorithmDef, AlgorithmInput, Step, GraphNodeHighlight, GraphEdgeHighlight } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { SAMPLE_GRAPH } from '../../core/presets';
import { asGraphInput, makeGraphStep, buildAdjacency, revealPath, noPathStep } from './helpers';

const pseudocode = [
  { text: 'procedure BFS(G, start, goal)', indent: 0 },
  { text: 'queue = [start]', indent: 1 },
  { text: 'visited = {start}, parent = {}', indent: 1 },
  { text: 'while queue is not empty', indent: 1, isLoopHeader: true, loopLabel: 'bfs' },
  { text: 'u = dequeue(queue)', indent: 2 },
  { text: 'if u == goal', indent: 2 },
  { text: 'return path reconstructed from parent', indent: 3 },
  { text: 'for each neighbor v of u', indent: 2, isLoopHeader: true, loopLabel: 'nbr' },
  { text: 'if v not in visited', indent: 3 },
  { text: 'mark v visited', indent: 4 },
  { text: 'parent[v] = u; enqueue(queue, v)', indent: 4 },
  { text: 'end for', indent: 2 },
  { text: 'return "no path"', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* bfs(input: AlgorithmInput): Generator<Step> {
  const g = asGraphInput(input);
  const adj = buildAdjacency(g);
  const { startId, endId } = g;

  const visited = new Set([startId]);
  const parent = new Map<string, string>();
  const queue: string[] = [startId];

  yield makeGraphStep(
    [{ id: startId, kind: 'frontier' }],
    [],
    2,
    `Initialize: queue = [${startId}], visited = {${startId}}`,
    { queue: [startId], visited: [startId] }
  );

  let iter = 0;
  while (queue.length > 0) {
    iter++;
    const u = queue.shift()!;

    const frontierNow = queue.map((id) => ({ id, kind: 'frontier' as const }));
    const visitedHi: GraphNodeHighlight[] = [...visited]
      .filter((id) => id !== u && !queue.includes(id))
      .map((id) => ({ id, kind: 'visited' as const }));

    if (u === endId) {
      yield makeGraphStep(
        [...visitedHi, ...frontierNow, { id: u, kind: 'current' }],
        [],
        6,
        `Dequeued ${u} — it IS the goal! Reconstruct path via parent pointers`,
        { u, dequeuedFrom: 'queue front (FIFO)' },
        [{ label: 'bfs', iteration: iter }]
      );
      yield* revealPath(parent, startId, endId, 6, `${pathLength(parent, startId, endId)} hops`);
      return;
    }

    yield makeGraphStep(
      [...visitedHi, ...frontierNow, { id: u, kind: 'current' }],
      [],
      5,
      `Dequeue ${u} (FIFO — oldest first). Neighbors: ${adj.get(u)!.map((n) => n.id).join(', ') || 'none'}`,
      { u, queueSize: queue.length },
      [{ label: 'bfs', iteration: iter }]
    );

    for (const { id: v } of adj.get(u)!) {
      const edgeHi: GraphEdgeHighlight[] = [{ from: u, to: v, kind: 'comparing' }];
      if (!visited.has(v)) {
        visited.add(v);
        parent.set(v, u);
        queue.push(v);
        yield makeGraphStep(
          [
            ...[...visited].filter((id) => id !== u && !queue.includes(id)).map((id) => ({ id, kind: 'visited' as const })),
            ...queue.filter((id) => id !== v).map((id) => ({ id, kind: 'frontier' as const })),
            { id: v, kind: 'frontier' },
            { id: u, kind: 'current' },
          ],
          edgeHi,
          9,
          `${v} unvisited → mark visited, parent[${v}] = ${u}, enqueue`,
          { u, v, queue: [...queue] },
          [{ label: 'bfs', iteration: iter }, { label: 'nbr', iteration: iter }]
        );
      } else {
        yield makeGraphStep(
          [
            ...[...visited].filter((id) => id !== u && !queue.includes(id)).map((id) => ({ id, kind: 'visited' as const })),
            ...queue.map((id) => ({ id, kind: 'frontier' as const })),
            { id: u, kind: 'current' },
          ],
          edgeHi,
          8,
          `${v} already in visited — skip`,
          { u, v },
          [{ label: 'bfs', iteration: iter }, { label: 'nbr', iteration: iter }]
        );
      }
    }
  }

  yield noPathStep(endId, 12);
}

function pathLength(parent: Map<string, string>, startId: string, goalId: string): number {
  // Returns HOP COUNT (edges), not node count.
  let hops = 0;
  let cur = goalId;
  while (cur !== startId) {
    cur = parent.get(cur)!;
    hops++;
    if (hops > 500) break;
  }
  return hops;
}

const bfsDef: AlgorithmDef = {
  id: 'graph-bfs',
  name: 'BFS',
  category: 'graph',
  description: 'Explores neighbors level by level using a FIFO queue. Finds the fewest-hops path (ignores edge weights).',
  pseudocode,
  complexity: { time: 'O(V + E)', space: 'O(V)' },
  defaultInput: { graph: SAMPLE_GRAPH },
  run: bfs,
};

registerAlgorithm(bfsDef);