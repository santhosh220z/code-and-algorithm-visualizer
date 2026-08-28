import type { AlgorithmDef, AlgorithmInput, Step, TableCell } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { makeTableStep, tableCell, tableCompute, tableRead, tableResult } from './helpers';

const pseudocode = [
  { text: 'procedure LCS(A, B)', indent: 0 },
  { text: 'dp[i][0] = 0, dp[0][j] = 0', indent: 1 },
  { text: 'for i = 1 to len(A)', indent: 1, isLoopHeader: true, loopLabel: 'rows' },
  { text: 'for j = 1 to len(B)', indent: 2, isLoopHeader: true, loopLabel: 'cols' },
  { text: 'if A[i-1] == B[j-1]', indent: 3 },
  { text: 'dp[i][j] = dp[i-1][j-1] + 1', indent: 4 },
  { text: 'else', indent: 3 },
  { text: 'dp[i][j] = max(dp[i-1][j], dp[i][j-1])', indent: 4 },
  { text: 'end if', indent: 3 },
  { text: 'end for', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'return dp[len(A)][len(B)]', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

const DEFAULT_A = 'ABCBDAB';
const DEFAULT_B = 'BDCAB';

export function* lcs(input: AlgorithmInput): Generator<Step> {
  const a = String(input.a ?? input.A ?? DEFAULT_A);
  const b = String(input.b ?? input.B ?? DEFAULT_B);
  const m = a.length;
  const n = b.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  const toCells = (): TableCell[][] => {
    const cells: TableCell[][] = [];
    // header row with B chars
    cells.push([
      tableCell(0, 0, ''),
      ...Array.from({ length: n }, (_, j) => tableCell(0, j + 1, b[j], true)),
    ]);
    for (let i = 1; i <= m; i++) {
      cells.push([
        tableCell(i, 0, a[i - 1], true),
        ...Array.from({ length: n }, (_, j) =>
          tableCell(i, j + 1, dp[i][j + 1] || '', i > 0 && dp[i][j + 1] > 0)
        ),
      ]);
    }
    return cells;
  };

  yield makeTableStep(toCells(), [], 1, `Initialize LCS table for A="${a}" and B="${b}"`, { lenA: m, lenB: n });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      let cell: number;
      if (a[i - 1] === b[j - 1]) {
        cell = dp[i - 1][j - 1] + 1;
        yield makeTableStep(
          toCells(),
          [tableRead(i - 1, j - 1), tableCompute(i, j)],
          5,
          `Match: "${a[i - 1]}" == "${b[j - 1]}" → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${cell}`,
          { i, j, char: a[i - 1], value: cell, match: true },
          [{ label: 'rows', iteration: i }, { label: 'cols', iteration: j }]
        );
      } else {
        cell = Math.max(dp[i - 1][j], dp[i][j - 1]);
        yield makeTableStep(
          toCells(),
          [tableRead(i - 1, j), tableRead(i, j - 1), tableCompute(i, j)],
          7,
          `No match: max(dp[${i - 1}][${j}]=${dp[i - 1][j]}, dp[${i}][${j - 1}]=${dp[i][j - 1]}) = ${cell}`,
          { i, j, value: cell, match: false },
          [{ label: 'rows', iteration: i }, { label: 'cols', iteration: j }]
        );
      }
      dp[i][j] = cell;
    }
  }

  // backtrack the LCS string
  let i = m, j = n;
  let resultRev = '';
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      resultRev += a[i - 1];
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  const lcsStr = [...resultRev].reverse().join('');

  yield makeTableStep(
    toCells(),
    [tableResult(m, n)],
    12,
    `LCS length = ${dp[m][n]}. Sequence: "${lcsStr || '∅'}"`,
    { result: dp[m][n], lcs: lcsStr || '∅' }
  );
}

const lcsDef: AlgorithmDef = {
  id: 'dp-lcs',
  name: 'Longest Common Subsequence',
  category: 'dp',
  description:
    'Finds the longest subsequence common to two strings using a 2D DP table and reconstructs the sequence by backtracking.',
  pseudocode,
  complexity: { time: 'O(m·n)', space: 'O(m·n)' },
  defaultInput: { a: DEFAULT_A, b: DEFAULT_B },
  run: lcs,
};

registerAlgorithm(lcsDef);
