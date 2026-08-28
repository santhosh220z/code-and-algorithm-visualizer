import type { AlgorithmDef, AlgorithmInput, Step, HanoiPegs, HanoiHighlight, HanoiMovingDisk } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { frame } from './helpers';
import { HANOI_MOTION_FRAMES, HANOI_PEG_X, hanoiInterpolate, hanoiRestY } from './hanoiGeometry';

const pseudocode = [
  { text: 'procedure hanoi(n, from, to, aux)', indent: 0 },
  { text: 'if n == 1', indent: 1 },
  { text: 'move disk 1 from "from" to "to"', indent: 2 },
  { text: 'else', indent: 1 },
  { text: 'hanoi(n-1, from, aux, to)', indent: 2 },
  { text: 'move disk n from "from" to "to"', indent: 2 },
  { text: 'hanoi(n-1, aux, to, from)', indent: 2 },
  { text: 'end if', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

type Peg = 'A' | 'B' | 'C';

export function* hanoi(input: AlgorithmInput): Generator<Step> {
  const n = Math.min(Math.max(1, Number(input.n ?? 3)), 7);
  const pegs: HanoiPegs = {
    A: Array.from({ length: n }, (_, i) => n - i),
    B: [],
    C: [],
  };
  const stack: { fn: string; args: Record<string, unknown> }[] = [];
  let moveCount = 0;
  let lastMoved: { peg: Peg; disk: number } | null = null;

  const render = (
    line: number,
    description: string,
    vars: Record<string, unknown>,
    pegsOverride: HanoiPegs = pegs,
    moving: HanoiMovingDisk | null = null
  ): Step => {
    const highlights: HanoiHighlight[] = [];
    if (lastMoved && moving === null) {
      highlights.push({ peg: lastMoved.peg, disk: lastMoved.disk, kind: 'settled' });
    }
    return {
      line,
      description,
      vars,
      loops: [],
      stack: [...stack],
      viz: { type: 'hanoi', pegs: pegsOverride, highlights, moving },
    };
  };

  const withoutTop = (peg: Peg): HanoiPegs => {
    const next: HanoiPegs = { A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] };
    next[peg].pop();
    return next;
  };

  const moveDisk = (from: string, to: string): void => {
    const disk = pegs[from as Peg].pop()!;
    pegs[to as Peg].push(disk);
    moveCount++;
    lastMoved = { peg: to as Peg, disk };
  };

  /** Emit a series of frames animating `disk` travelling from `from` to `to`. */
  const animateMove = function* (
    disk: number,
    from: string,
    to: string
  ): Generator<Step> {
    const frm = from as Peg;
    const dst = to as Peg;
    const fromX = HANOI_PEG_X[frm];
    const fromY = hanoiRestY(pegs[frm].length - 1);
    const toX = HANOI_PEG_X[dst];
    const toY = hanoiRestY(pegs[dst].length);
    const vars = { disk, from, to, move: moveCount + 1 };

    yield render(3, `Lift disk ${disk} off peg ${from}`, vars, withoutTop(frm), { disk, x: fromX, y: fromY });
    for (let i = 1; i <= HANOI_MOTION_FRAMES; i++) {
      const t = i / HANOI_MOTION_FRAMES;
      const { x, y } = hanoiInterpolate(fromX, fromY, toX, toY, t);
      yield render(3, `Move disk ${disk}: ${from} → ${to}`, { ...vars, phase: i }, withoutTop(frm), { disk, x, y });
    }
    moveDisk(from, to);
    yield render(
      3,
      `Set disk ${disk} onto peg ${to} — move ${moveCount}`,
      { disk, from, to, move: moveCount }
    );
  };

  const recursiveHanoi = function* (
    disk: number,
    from: string,
    to: string,
    aux: string
  ): Generator<Step> {
    stack.push(frame('hanoi', { n: disk, from, to, aux }));
    if (disk === 1) {
      yield* animateMove(disk, from, to);
      yield render(
        2,
        `Disk 1 moved to ${to} — move ${moveCount}`,
        { disk, from, to, move: moveCount }
      );
    } else {
      yield render(
        4,
        `Move top ${disk - 1} disks from ${from} to ${aux}`,
        { disk, from, to, aux }
      );
      yield* recursiveHanoi(disk - 1, from, aux, to);

      yield* animateMove(disk, from, to);
      yield render(
        5,
        `Disk ${disk} moved to ${to} — move ${moveCount}`,
        { disk, from, to, move: moveCount }
      );

      yield render(
        6,
        `Move top ${disk - 1} disks from ${aux} to ${to}`,
        { disk, aux, to, from }
      );
      yield* recursiveHanoi(disk - 1, aux, to, from);
    }
    stack.pop();
  };

  yield render(0, `Solve Tower of Hanoi with ${n} disks (A → C, using B as aux)`, { n });

  yield* recursiveHanoi(n, 'A', 'C', 'B');

  yield render(
    8,
    `Solved! ${moveCount} total moves (${Math.pow(2, n) - 1} minimum)`,
    { totalMoves: moveCount, minimum: Math.pow(2, n) - 1 }
  );
}

const hanoiDef: AlgorithmDef = {
  id: 'rec-hanoi',
  name: 'Tower of Hanoi',
  category: 'recursion',
  description: 'Solves the classic Tower of Hanoi puzzle recursively, requiring 2ⁿ − 1 moves.',
  pseudocode,
  complexity: { time: 'O(2ⁿ)', space: 'O(n)' },
  defaultInput: { n: 3 },
  run: hanoi,
  ops: [{ id: 'n', label: 'Disks', needsValue: true }],
};

registerAlgorithm(hanoiDef);
