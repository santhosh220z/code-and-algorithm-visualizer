import type { Step, GridInputData, GridHighlight } from '../../core/types';

export interface LoopInfo {
  label: string;
  iteration: number;
}

export function asGridInput(input: unknown): GridInputData {
  const wrapped = input as { grid?: GridInputData };
  return wrapped.grid ?? (input as GridInputData);
}

export const key = (r: number, c: number) => `${r},${c}`;

export function makeGridStep(
  highlights: GridHighlight[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: LoopInfo[]
): Step {
  return { line, description, vars, loops, viz: { type: 'grid', highlights } };
}

export function isWall(g: GridInputData, r: number, c: number): boolean {
  return g.walls.includes(key(r, c));
}

export function costOf(g: GridInputData, r: number, c: number): number {
  return g.weights[key(r, c)] ?? 1;
}

const DELTAS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/** Walkable 4-neighbors in deterministic order: up, down, left, right. */
export function neighbors4(g: GridInputData, r: number, c: number): [number, number][] {
  const out: [number, number][] = [];
  for (const [dr, dc] of DELTAS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nc < 0 || nr >= g.rows || nc >= g.cols) continue;
    if (isWall(g, nr, nc)) continue;
    out.push([nr, nc]);
  }
  return out;
}

export function* revealGridPath(
  parent: Map<string, string>,
  startKey: string,
  endKey: string,
  line: number,
  costLabel: string
): Generator<Step> {
  const path: string[] = [];
  let cur: string | null = endKey;
  let guard = 0;
  while (cur && guard++ < 5000) {
    path.unshift(cur);
    if (cur === startKey) break;
    cur = parent.get(cur) ?? null;
  }
  if (path[0] !== startKey) path.unshift(startKey);

  const toRC = (k: string): [number, number] => {
    const [r, c] = k.split(',').map(Number);
    return [r, c];
  };

  for (let i = 0; i < path.length; i++) {
    const hi: GridHighlight[] = path.slice(0, i + 1).map((k) => {
      const [r, c] = toRC(k);
      return { row: r, col: c, kind: 'path' as const };
    });
    yield makeGridStep(
      hi,
      line,
      `Path so far: ${i + 1} of ${path.length} cells`,
      { progress: `${i + 1}/${path.length}` },
      [{ label: 'reconstruct', iteration: i + 1 }]
    );
  }

  yield makeGridStep(
    path.map((k) => {
      const [r, c] = toRC(k);
      return { row: r, col: c, kind: 'path' as const };
    }),
    line,
    `Final path: ${Math.max(0, path.length - 1)} steps (${costLabel})`,
    { pathSteps: Math.max(0, path.length - 1), costLabel, found: true },
    []
  );
}

export function noPathStep(endKey: string, line: number): Step {
  return makeGridStep([], line, `"${endKey}" unreachable — every reachable cell was explored`, { found: false }, []);
}