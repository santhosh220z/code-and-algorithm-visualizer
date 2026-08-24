import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { SAMPLE_GRAPH } from '../../core/presets';
import { asGraphInput, makeGraphStep, buildAdjacency, revealPath, noPathStep } from './helpers';

const pseudocode = [
  { text: 'procedure DFS(G, start, goal)', indent: 0 },
  { text: 'stack = [start]', indent: 1 },
  { text: 'visited = {}, parent = {}', indent: 1 },
  { text: 'while stack is not empty', indent: 1, isLoopHeader: true, loopLabel: 'dfs' },
  { text: 'u = pop(stack)', indent: 2 },
  { text: 'if u in visited', indent: 2 },
  { text: 'continue', indent: 3 },
  { text: 'mark u visited', indent: 2 },
  { text: 'if u == goal', indent: 2 },
  { text: 'return path reconstructed from parent', indent: 3 },
  { text: 'for each neighbor v of u', indent: 2, isLoopHeader: true, loopLabel: 'nbr' },
  { text: 'if v not in visited', indent: 3 },
  { text: 'parent[v] = u; push(stack, v)', indent: 4 },
  { text: 'return "no path"', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* dfs(input: AlgorithmInput): Generator<Step> {
  const g = asGraphInput(input);
  const adj = buildAdjacency(g);
  const { startId, endId } = g;

  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const stack: string[] = [startId];

  yield makeGraphStep([], [], 1, `Initialize: stack = [${startId}] (LIFO — depth first)`, {
    stack: [startId],
    visited: [],
  });

  let iter = 0;
  while (stack.length > 0) {
    iter++;
    const u = stack.pop()!;

    if (visited.has(u)) {
      yield makeGraphStep(
        [...visited].map((id) => ({ id, kind: 'visited' as const })),
        [],
        5,
        `Popped ${u}, but it was already visited via a deeper path — continue`,
        { u },
        [{ label: 'dfs', iteration: iter }]
      );
      continue;
    }

    if (u === endId) {
      yield makeGraphStep(
        [...[...visited].map((id) => ({ id, kind: 'visited' as const })), { id: u, kind: 'current' }],
        [],
        9,
        `Visited ${u} — it IS the goal! Reconstruct path via parent pointers`,
        { u },
        [{ label: 'dfs', iteration: iter }]
      );
      yield* revealPath(parent, startId, endId, 9, `${pathLen(parent, startId, endId)} edges`);
      return;
    }

    visited.add(u);
    yield makeGraphStep(
      [
        ...[...visited].filter((id) => id !== u).map((id) => ({ id, kind: 'visited' as const })),
        { id: u, kind: 'current' },
      ],
      [],
      7,
      `Pop ${u} and mark visited. Stack: [${[...stack].reverse().join(', ') || 'empty'}] (top right)`,
      { u, stackDepth: stack.length },
      [{ label: 'dfs', iteration: iter }]
    );

    for (const { id: v } of adj.get(u)!) {
      if (!visited.has(v)) {
        parent.set(v, u);
        stack.push(v);
        yield makeGraphStep(
          [
            ...[...visited].filter((id) => id !== u).map((id) => ({ id, kind: 'visited' as const })),
            ...stack.map((id) => ({ id, kind: 'frontier' as const })),
            { id: u, kind: 'current' },
          ],
          [{ from: u, to: v, kind: 'comparing' }],
          13,
          `${v} unvisited → parent[${v}] = ${u}, push to stack`,
          { u, v, stackSize: stack.length },
          [{ label: 'dfs', iteration: iter }, { label: 'nbr', iteration: iter }]
        );
      }
    }
  }

  yield noPathStep(endId, 13);
}

function pathLen(parent: Map<string, string>, startId: string, goalId: string): number {
  // Edge count along the parent chain.
  let len = 0;
  let cur = goalId;
  while (cur !== startId) {
    cur = parent.get(cur)!;
    len++;
    if (len > 500) break;
  }
  return len;
}

const dfsDef: AlgorithmDef = {
  id: 'graph-dfs',
  name: 'DFS',
  category: 'graph',
  description: 'Dives as deep as possible along each branch using a LIFO stack before backtracking. Path found is not necessarily shortest.',
  pseudocode,
  complexity: { time: 'O(V + E)', space: 'O(V)' },
  defaultInput: { graph: SAMPLE_GRAPH },
  run: dfs,
};

registerAlgorithm(dfsDef);