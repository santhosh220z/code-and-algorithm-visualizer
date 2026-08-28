import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { makeArrayStep, highlightCurrent, makePointer, frame } from './helpers';

const pseudocode = [
  { text: 'function factorial(n)', indent: 0 },
  { text: 'if n <= 1', indent: 1 },
  { text: 'return 1   // base case', indent: 2 },
  { text: 'end if', indent: 1 },
  { text: 'return n * factorial(n - 1)', indent: 1 },
  { text: 'end function', indent: 0 },
];

export function* factorialAlgo(input: AlgorithmInput): Generator<Step> {
  const n = Number(input.n ?? 6);
  const safeN = Math.min(Math.max(0, Math.floor(n)), 15);

  yield makeArrayStep(
    [safeN],
    highlightCurrent(0),
    [makePointer(0, 'call factorial')],
    0,
    `Call factorial(${safeN})`,
    { n: safeN },
    [],
    [frame('factorial', { n: safeN })]
  );

  const results: number[] = [];
  const stack: { fn: string; args: Record<string, unknown> }[] = [frame('factorial', { n: safeN })];

  for (let k = safeN; k >= 1; k--) {
    if (k <= 1) {
      yield makeArrayStep(
        [k],
        highlightCurrent(0),
        [makePointer(0, `n=${k}`)],
        1,
        `Base case reached: n=${k} ≤ 1`,
        { n: k, isBaseCase: true },
        [],
        stack
      );
    } else {
      yield makeArrayStep(
        [k],
        highlightCurrent(0),
        [makePointer(0, `n=${k}`)],
        0,
        `Call factorial(${k}) → waiting for factorial(${k - 1})`,
        { n: k },
        [],
        stack
      );
      stack.push(frame('factorial', { n: k - 1 }));
      yield makeArrayStep(
        [k - 1],
        highlightCurrent(0),
        [makePointer(0, `n=${k - 1}`)],
        0,
        `Recurse into factorial(${k - 1})`,
        { n: k - 1, depth: stack.length },
        [],
        [...stack]
      );
    }
  }

  // Unwind back up computing results
  let result = 1;
  for (let k = 1; k <= safeN; k++) {
    result *= k;
    stack.pop();
    yield makeArrayStep(
      [k],
      highlightCurrent(0),
      [makePointer(0, `n=${k}`)],
      4,
      `Return ${result} from factorial(${k}) = ${k} × factorial(${k - 1})`,
      { n: k, result },
      [],
      [...stack]
    );
    results.push(result);
  }

  yield makeArrayStep(
    [safeN],
    highlightCurrent(0),
    [],
    5,
    `factorial(${safeN}) = ${result}`,
    { result, n: safeN },
    [],
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
