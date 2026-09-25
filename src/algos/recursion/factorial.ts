import type { AlgorithmDef, AlgorithmInput, CallFrame, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { makeCallStackStep } from './helpers';

const pseudocode = [
  { text: 'function factorial(n)', indent: 0 },
  { text: 'if n <= 1', indent: 1 },
  { text: 'return 1   // base case', indent: 2 },
  { text: 'end if', indent: 1 },
  { text: 'return n * factorial(n - 1)', indent: 1 },
  { text: 'end function', indent: 0 },
];

const MAX_N = 12;

export function* factorialAlgo(input: AlgorithmInput): Generator<Step> {
  const n = Number(input.n ?? 6);
  const safeN = Math.min(Math.max(0, Math.floor(n)), MAX_N);

  /** Outermost call first; the innermost frame is the one currently running. */
  const frames: CallFrame[] = [];

  const callFrame = (k: number): CallFrame => {
    const frame: CallFrame = { id: `n=${k}`, fn: 'factorial', label: `factorial(${k})` };
    frames.push(frame);
    return frame;
  };

  const asStack = () => frames.map((frame) => ({ fn: frame.fn, args: { n: frame.label.match(/\d+/)![0] } }));

  // ---- descend -----------------------------------------------------------
  let current = callFrame(safeN);
  yield makeCallStackStep(
    frames,
    current.id,
    undefined,
    0,
    safeN <= 1
      ? `Call factorial(${safeN}) — the base case is checked first`
      : `Call factorial(${safeN}) → waiting for factorial(${safeN - 1})`,
    { n: safeN, depth: frames.length },
    asStack()
  );

  for (let k = safeN; k >= 2; k--) {
    const next = k - 1;
    current = callFrame(next);
    yield makeCallStackStep(
      frames,
      current.id,
      undefined,
      0,
      next <= 1
        ? `Call factorial(${next}) — n ≤ 1, so this is the base case and it stops recursing`
        : `Call factorial(${next}) → waiting for factorial(${next - 1})`,
      { n: next, depth: frames.length },
      asStack()
    );
  }

  // base case: factorial(1) returns 1 without recursing
  current.returned = 1;
  yield makeCallStackStep(
    frames,
    current.id,
    undefined,
    1,
    `Base case reached: n=1 ≤ 1, so it returns 1`,
    { n: 1, isBaseCase: true, depth: frames.length },
    asStack()
  );

  // ---- unwind ------------------------------------------------------------
  let result = 1;
  for (let k = 1; k <= safeN; k++) {
    result *= k;
    const frame = frames.find((f) => f.id === `n=${k}`);
    if (frame) frame.returned = result;
    yield makeCallStackStep(
      frames,
      frame?.id ?? null,
      undefined,
      4,
      k === 1
        ? `Return 1 from factorial(1) — the base case feeds the chain`
        : `Return ${result} from factorial(${k}) = ${k} × factorial(${k - 1})`,
      { n: k, result, running: result },
      asStack()
    );
    // the frame that just returned leaves the stack, freeing the caller
    if (k < safeN) frames.pop();
  }

  yield makeCallStackStep(
    [],
    null,
    result,
    5,
    `factorial(${safeN}) = ${result} — every frame has returned`,
    { result, n: safeN },
    []
  );
}

const factorialDef: AlgorithmDef = {
  id: 'rec-factorial',
  name: 'Factorial',
  category: 'recursion',
  description: 'Computes n! recursively, illustrating the call stack unwinding and the base case.',
  pseudocode,
  complexity: { time: 'O(n)', space: 'O(n)' },
  defaultInput: { n: 6 },
  run: factorialAlgo,
  ops: [{ id: 'n', label: 'n', needsValue: true }],
};

registerAlgorithm(factorialDef);
