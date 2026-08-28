import type { AlgorithmDef, AlgorithmInput, Step, TableCell } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { makeTableStep, tableCell, tableCompute, tableRead, tableResult } from './helpers';

const pseudocode = [
  { text: 'procedure knapsack(items, capacity)', indent: 0 },
  { text: 'dp[i][c] = 0 for all i, c', indent: 1 },
  { text: 'for i = 1 to n', indent: 1, isLoopHeader: true, loopLabel: 'items' },
  { text: 'for c = 1 to capacity', indent: 2, isLoopHeader: true, loopLabel: 'cap' },
  { text: 'if weight[i] <= c', indent: 3 },
  { text: 'dp[i][c] = max(dp[i-1][c], value[i] + dp[i-1][c-weight[i]])', indent: 4 },
  { text: 'else', indent: 3 },
  { text: 'dp[i][c] = dp[i-1][c]', indent: 4 },
  { text: 'end if', indent: 3 },
  { text: 'end for', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'return dp[n][capacity]', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

const DEFAULT_WEIGHTS = [2, 3, 4, 5];
const DEFAULT_VALUES = [3, 4, 5, 6];

export function* knapsack(input: AlgorithmInput): Generator<Step> {
  const weights = (input.weights as number[]) ?? DEFAULT_WEIGHTS;
  const values = (input.values as number[]) ?? DEFAULT_VALUES;
  const capacity = Number(input.capacity ?? 8);
  const n = weights.length;
  const safeCap = Math.min(Math.max(1, Math.floor(capacity)), 20);

  // dp[i][c]: max value using first i items with capacity c (0-indexed item rows)
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(safeCap + 1).fill(0));

  const toCells = (): TableCell[][] =>
    dp.map((row, r) =>
      row.map((cell, c) => tableCell(r, c, cell === 0 && r > 0 && c > 0 ? '' : cell, r > 0 && c > 0))
    );

  yield makeTableStep(toCells(), [], 1, `Initialize DP table (${n}+1 items × ${safeCap}+1 capacity)`, { n, safeCap });

  for (let i = 1; i <= n; i++) {
    for (let c = 1; c <= safeCap; c++) {
      const w = weights[i - 1];
      const v = values[i - 1];
      let value: number;
      if (w <= c) {
        const skip = dp[i - 1][c];
        const take = v + dp[i - 1][c - w];
        value = Math.max(skip, take);
        yield makeTableStep(
          toCells(),
          [tableRead(i - 1, c), tableRead(i - 1, c - w), tableCompute(i, c)],
          5,
          `Item ${i} (w=${w}, v=${v}) fits in cap ${c}: max(${skip}, ${v}+${dp[i - 1][c - w]}) = ${value}`,
          { i, c, w, v, skip, take, value },
          [{ label: 'items', iteration: i }, { label: 'cap', iteration: c }]
        );
      } else {
        value = dp[i - 1][c];
        yield makeTableStep(
          toCells(),
          [tableRead(i - 1, c), tableCompute(i, c)],
          7,
          `Item ${i} (w=${w}) doesn't fit cap ${c}: carry over ${value}`,
          { i, c, w, value },
          [{ label: 'items', iteration: i }, { label: 'cap', iteration: c }]
        );
      }
      dp[i][c] = value;
    }
  }

  // Backtrack to find which items are selected
  let i = n;
  let c = safeCap;
  const chosen: number[] = [];
  while (i > 0 && c > 0) {
    if (dp[i][c] !== dp[i - 1][c]) {
      chosen.push(i);
      c -= weights[i - 1];
    }
    i--;
  }

  yield makeTableStep(
    toCells(),
    [tableResult(n, safeCap)],
    12,
    `Optimal value = ${dp[n][safeCap]}. Items selected: #${chosen.join(', #') || 'none'}`,
    { result: dp[n][safeCap], selected: chosen.map((k) => `#${k}`).join(', ') || 'none', capacity: safeCap }
  );
}

const knapsackDef: AlgorithmDef = {
  id: 'dp-knapsack',
  name: '0/1 Knapsack',
  category: 'dp',
  description: 'Finds the maximum value that fits a capacity constraint using a 2D DP table with backtracking.',
  pseudocode,
  complexity: { time: 'O(n·C)', space: 'O(n·C)' },
  defaultInput: { weights: DEFAULT_WEIGHTS, values: DEFAULT_VALUES, capacity: 8 },
  run: knapsack,
  ops: [{ id: 'capacity', label: 'Capacity', needsValue: true }],
};

registerAlgorithm(knapsackDef);
