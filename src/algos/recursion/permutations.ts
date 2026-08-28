import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { makeArrayStep, highlightCurrent, highlightSwap, makePointer, frame } from './helpers';

const pseudocode = [
  { text: 'procedure permute(A, l)', indent: 0 },
  { text: 'if l == len(A)', indent: 1 },
  { text: 'record permutation', indent: 2 },
  { text: 'else', indent: 1 },
  { text: 'for r = l to len(A)-1', indent: 2, isLoopHeader: true, loopLabel: 'swap' },
  { text: 'swap A[l] with A[r]', indent: 3 },
  { text: 'permute(A, l+1)', indent: 3 },
  { text: 'swap A[l] with A[r]  (backtrack)', indent: 3 },
  { text: 'end for', indent: 2 },
  { text: 'end if', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* permutations(input: AlgorithmInput): Generator<Step> {
  const arr = [...(input.array ?? [1, 2, 3])];
  const n = arr.length;
  const nSafe = Math.min(Math.max(1, n), 6);
  const a = arr.slice(0, nSafe);
  const permutations: number[][] = [];
  const stack: { fn: string; args: Record<string, unknown> }[] = [];

  const rec = function* (l: number): Generator<Step> {
    stack.push(frame('permute', { A: [...a], l }));
    if (l === a.length) {
      permutations.push([...a]);
      yield makeArrayStep(
        a,
        highlightCurrent(l - 1),
        [],
        2,
        `Permutation recorded: [${a.join(', ')}]`,
        { count: permutations.length, permutation: JSON.stringify(a) },
        [],
        [...stack]
      );
    } else {
      for (let r = l; r < a.length; r++) {
        yield makeArrayStep(
          a,
          highlightSwap(l, r),
          [makePointer(l, 'l', '#a855f7'), makePointer(r, 'r', '#60a5fa')],
          5,
          `Swap A[${l}]="${a[l]}" with A[${r}]="${a[r]}"`,
          { l, r, a: a[l], b: a[r] },
          [{ label: 'swap', iteration: r - l + 1 }],
          [...stack]
        );
        [a[l], a[r]] = [a[r], a[l]];
        yield makeArrayStep(
          a,
          highlightSwap(l, r),
          [makePointer(l, 'l', '#a855f7'), makePointer(r, 'r', '#60a5fa')],
          5,
          `Swapped: A=[${a.join(', ')}]`,
          { l, r },
          [{ label: 'swap', iteration: r - l + 1 }],
          [...stack]
        );
        yield* rec(l + 1);
        [a[l], a[r]] = [a[r], a[l]];
        yield makeArrayStep(
          a,
          highlightSwap(l, r),
          [makePointer(l, 'l', '#a855f7'), makePointer(r, 'r', '#60a5fa')],
          7,
          `Backtrack: restore A=[${a.join(', ')}]`,
          { l, r },
          [{ label: 'swap', iteration: r - l + 1 }],
          [...stack]
        );
      }
    }
    stack.pop();
  };

  yield makeArrayStep(
    a,
    [],
    [makePointer(0, 'l', '#a855f7')],
    0,
    `Generate all ${fact(a.length)} permutations of [${a.join(', ')}]`,
    { n: a.length },
    [],
    []
  );

  yield* rec(0);

  yield makeArrayStep(
    a,
    [],
    [],
    10,
    `Done — generated ${permutations.length} permutations`,
    { count: permutations.length, permutations: permutations.map((p) => `[${p.join(',')}]`) },
    [],
    []
  );
}

function fact(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

const permutationsDef: AlgorithmDef = {
  id: 'rec-permutations',
  name: 'Permutations',
  category: 'recursion',
  description: 'Generates all permutations of an array using the classic swap-and-backtrack recursion.',
  pseudocode,
  complexity: { time: 'O(n!)', space: 'O(n)' },
  defaultInput: { array: [1, 2, 3] },
  run: permutations,
};

registerAlgorithm(permutationsDef);
