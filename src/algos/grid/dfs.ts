import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { emptyGrid } from '../../core/presets';
import { asGridInput, makeGridStep, key, neighbors4, revealGridPath, noPathStep } from './helpers';
import { visitedHi, rcHi } from './bfs';

const pseudocode = [
  { text: 'procedure DFS(Grid, S, E)', indent: 0 },
  { text: 'stack = [S]; seen = {}; parent = {}', indent: 1 },
  { text: 'while stack is not empty', indent: 1, isLoopHeader: true, loopLabel: 'dfs' },
  { text: 'u = pop(stack)', indent: 2 },
  { text: 'if u == E', indent: 2 },
  { text: 'return path from parent', indent: 3 },
  { text: 'for each walkable neighbor v of u', indent: 2, isLoopHeader: true, loopLabel: 'nbr' },
  { text: 'if v not in seen', indent: 3 },
  { text: 'seen âˆª= {v}; parent[v] = u; push(stack, v)', indent: 4 },
  { text: 'return "no path"', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* gridDfs(input: AlgorithmInput): Generator<Step> {
  const g = asGridInput(input);
  const startKey = key(g.start[0], g.start[1]);
  const endKey = key(g.end[0], g.end[1]);

  const stack: string[] = [startKey];
  const seen = new Set<string>();
  const parent = new Map<string, string>();

  yield makeGridStep([], 1, `Initialize: stack = [S] (LIFO â€” dives deep first)`, { stackSize: 1 });

  let iter = 0;
  while (stack.length > 0) {
    iter++;
    const u = stack.pop()!;
    const [ur, uc] = u.split(',').map(Number);

    if (seen.has(u)) continue;

    if (u === endKey) {
      yield makeGridStep(
        [...visitedHi(seen, stack, u), { row: ur, col: uc, kind: 'current' }],
        5,
        `Popped ${u} â€” reached the goal!`,
        { u },
        [{ label: 'dfs', iteration: iter }]
      );
      yield* revealGridPath(parent, startKey, endKey, 5, `${pathSteps(parent, startKey, endKey)} steps`);
      return;
    }

    seen.add(u);
    yield makeGridStep(
      [...visitedHi(seen, stack, u), ...stack.map((k) => rcHi(k, 'frontier')), { row: ur, col: uc, kind: 'current' }],
      4,
      `Pop ${u}, mark seen. Stack depth ${stack.length}`,
      { u, stackDepth: stack.length },
      [{ label: 'dfs', iteration: iter }]
    );

    for (const [nr, nc] of neighbors4(g, ur, uc)) {
      const v = key(nr, nc);
      if (!seen.has(v)) {
        parent.set(v, u);
        stack.push(v);
        yield makeGridStep(
          [
            ...visitedHi(seen, stack, u),
            ...stack.map((k) => (k === v ? rcHi(v, 'frontier') : rcHi(k, 'frontier'))),
            { row: ur, col: uc, kind: 'current' },
          ],
          9,
          `${v} unseen â†’ parent[${v}] = ${u}, push`,
          { u, v, stackSize: stack.length },
          [{ label: 'dfs', iteration: iter }, { label: 'nbr', iteration: iter }]
        );
      }
    }
  }

  yield noPathStep(endKey, 9);
}

function pathSteps(parent: Map<string, string>, startKey: string, endKey: string): number {
  let steps = 0;
  let cur = endKey;
  while (cur !== startKey) {
    cur = parent.get(cur)!;
    steps++;
    if (steps > 5000) break;
  }
  return steps;
}

const gridDfsDef: AlgorithmDef = {
  id: 'grid-dfs',
  name: 'DFS Pathfinding',
  category: 'grid',
  description: 'Wanders deep along one corridor before backtracking. Finds A path, almost never the shortest one â€” great for seeing the difference.',
  pseudocode,
  complexity: { time: 'O(RÃ—C)', space: 'O(RÃ—C)' },
  defaultInput: { grid: emptyGrid() },
  run: gridDfs,
};

registerAlgorithm(gridDfsDef);
