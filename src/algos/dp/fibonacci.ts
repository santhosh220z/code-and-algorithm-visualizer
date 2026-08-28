import type { AlgorithmDef, AlgorithmInput, Step, TableCell } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { makeTableStep, tableCell, tableCompute, tableRead, tableResult } from './helpers';

const pseudocode = [
  { text: 'procedure fibonacci(n)', indent: 0 },
  { text: 'dp[0] = 0, dp[1] = 1', indent: 1 },
  { text: 'for i = 2 to n', indent: 1, isLoopHeader: true, loopLabel: 'fill' },
  { text: 'dp[i] = dp[i-1] + dp[i-2]', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'return dp[n]', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* fibonacci(input: AlgorithmInput): Generator<Step> {
  const n = Number(input.n ?? input.size ?? 10);
  const safeN = Math.min(Math.max(1, Math.floor(n)), 30);
  const dp: number[] = [0, 1];

  const toCells = (): TableCell[][] => [
    Array.from({ length: safeN + 1 }, (_, i) =>
      tableCell(0, i, dp[i] ?? '', i >= 0 && dp[i] !== undefined && i <= dp.length - 1)
    ),
  ];

  yield makeTableStep(toCells(), [], 1, `Base cases: dp[0]=0, dp[1]=1`, { n: safeN });

  for (let i = 2; i <= safeN; i++) {
    const prev1 = dp[i - 1];
    const prev2 = dp[i - 2];
    dp[i] = prev1 + prev2;
    yield makeTableStep(
      toCells(),
      [tableRead(0, i - 1), tableRead(0, i - 2), tableCompute(0, i)],
      3,
      `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${prev1} + ${prev2} = ${dp[i]}`,
      { i, prev1, prev2, value: dp[i] },
      [{ label: 'fill', iteration: i - 1 }]
    );
  }

  yield makeTableStep(
    toCells(),
    [tableResult(0, safeN)],
    5,
    `Fibonacci(${safeN}) = ${dp[safeN]}`,
    { result: dp[safeN], n: safeN }
  );
}

const fibonacciDef: AlgorithmDef = {
  id: 'dp-fibonacci',
  name: 'Fibonacci (DP)',
  category: 'dp',
  description: 'Computes the n-th Fibonacci number bottom-up with memoized dynamic programming (O(n) tabulation).',
  pseudocode,
  complexity: { time: 'O(n)', space: 'O(n)' },
  defaultInput: { n: 10 },
  run: fibonacci,
  ops: [{ id: 'n', label: 'n', needsValue: true }],
};

registerAlgorithm(fibonacciDef);
