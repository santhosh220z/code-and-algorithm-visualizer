import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import {
  makeArrayStep,
  highlightCompare,
  highlightSwap,
  highlightSorted,
  highlightPivot,
  makePointer,
} from './helpers';

const pseudocode = [
  { text: 'procedure quickSort(A, low, high)', indent: 0 },
  { text: 'if low < high', indent: 1 },
  { text: 'pivotIdx = partition(A, low, high)', indent: 2 },
  { text: 'quickSort(A, low, pivotIdx - 1)', indent: 2 },
  { text: 'quickSort(A, pivotIdx + 1, high)', indent: 2 },
  { text: 'end if', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure partition(A, low, high)', indent: 0 },
  { text: 'pivot = A[high]', indent: 1 },
  { text: 'i = low - 1', indent: 1 },
  { text: 'for j = low to high-1', indent: 1, isLoopHeader: true, loopLabel: 'partition' },
  { text: 'if A[j] ≤ pivot', indent: 2 },
  { text: 'i = i + 1', indent: 3 },
  { text: 'swap A[i] and A[j]', indent: 3 },
  { text: 'end if', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'swap A[i+1] and A[high]', indent: 1 },
  { text: 'return i + 1', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

function* partition(
  array: number[],
  low: number,
  high: number,
  depth: number
): Generator<Step, number> {
  const pivot = array[high];
  let i = low - 1;

  yield makeArrayStep(
    array,
    highlightPivot(high),
    [makePointer(low, 'low', '#a855f7'), makePointer(high, 'pivot', '#f87171'), makePointer(i, 'i', '#60a5fa')],
    9,
    `Partition [${low}..${high}]: pivot = A[${high}] = ${pivot}, i = ${i}`,
    { low, high, pivot, i, depth },
    [{ label: 'partition', iteration: 1 }]
  );

  for (let j = low; j < high; j++) {
    yield makeArrayStep(
      array,
      highlightCompare(j, high),
      [makePointer(low, 'low', '#a855f7'), makePointer(high, 'pivot', '#f87171'), makePointer(j, 'j', '#60a5fa'), makePointer(i, 'i', '#fbbf24')],
      12,
      `Compare A[${j}] = ${array[j]} with pivot ${pivot}`,
      { low, high, pivot, i, j, compareValue: array[j], depth },
      [{ label: 'partition', iteration: j - low + 1 }]
    );

    if (array[j] <= pivot) {
      i++;
      if (i !== j) {
        yield makeArrayStep(
          array,
          highlightSwap(i, j),
          [makePointer(low, 'low', '#a855f7'), makePointer(high, 'pivot', '#f87171'), makePointer(j, 'j', '#60a5fa'), makePointer(i, 'i', '#fbbf24')],
          14,
          `A[${j}] ≤ pivot: increment i to ${i}, swap A[${i}] and A[${j}]`,
          { low, high, pivot, i, j, swapped: true, depth },
          [{ label: 'partition', iteration: j - low + 1 }]
        );
        [array[i], array[j]] = [array[j], array[i]];
      } else {
        yield makeArrayStep(
          array,
          [{ index: i, kind: 'current' }],
          [makePointer(low, 'low', '#a855f7'), makePointer(high, 'pivot', '#f87171'), makePointer(j, 'j', '#60a5fa'), makePointer(i, 'i', '#fbbf24')],
          13,
          `A[${j}] ≤ pivot: increment i to ${i} (no swap needed)`,
          { low, high, pivot, i, j, swapped: false, depth },
          [{ label: 'partition', iteration: j - low + 1 }]
        );
      }
    } else {
      yield makeArrayStep(
        array,
        highlightCompare(j, high),
        [makePointer(low, 'low', '#a855f7'), makePointer(high, 'pivot', '#f87171'), makePointer(j, 'j', '#60a5fa'), makePointer(i, 'i', '#fbbf24')],
      12,
      `A[${j}] > pivot: no action, continue`,
        { low, high, pivot, i, j, compareValue: array[j], depth },
        [{ label: 'partition', iteration: j - low + 1 }]
      );
    }
  }

  const pivotFinal = i + 1;
  yield makeArrayStep(
    array,
    highlightSwap(pivotFinal, high),
    [makePointer(low, 'low', '#a855f7'), makePointer(high, 'pivot', '#f87171'), makePointer(pivotFinal, 'i+1', '#fbbf24')],
    17,
    `Partition done: swap pivot A[${high}] with A[${pivotFinal}]`,
    { low, high, pivot, i, pivotFinal, depth },
    []
  );
  [array[pivotFinal], array[high]] = [array[high], array[pivotFinal]];

  yield makeArrayStep(
    array,
    highlightSorted(pivotFinal),
    [makePointer(pivotFinal, 'pivot', '#4ade80')],
    18,
    `Pivot ${pivot} placed at final position ${pivotFinal}`,
    { low, high, pivot, pivotFinal, depth },
    []
  );

  return pivotFinal;
}

function* quickSortRec(
  array: number[],
  low: number,
  high: number,
  depth: number
): Generator<Step> {
  if (low < high) {
    yield makeArrayStep(
      array,
      [],
      [makePointer(low, 'low', '#a855f7'), makePointer(high, 'high', '#fbbf24')],
      1,
      `QuickSort range [${low}..${high}]`,
      { low, high, depth },
      []
    );

    const pivotIdx = yield* partition(array, low, high, depth);

    yield* quickSortRec(array, low, pivotIdx - 1, depth + 1);
    yield* quickSortRec(array, pivotIdx + 1, high, depth + 1);
  }
}

export function* quickSort(input: AlgorithmInput): Generator<Step> {
  const array = [...(input.array ?? [64, 34, 25, 12, 22, 11, 90])];
  const n = array.length;

  yield makeArrayStep(array, [], [], 0, `Start quick sort on array of length ${n}`, { n });

  yield* quickSortRec(array, 0, n - 1, 0);

  yield makeArrayStep(
    array,
    highlightSorted(...Array.from({ length: n }, (_, k) => k)),
    [],
    0,
    'Array fully sorted!',
    { sorted: true },
    []
  );
}

const quickSortDef: AlgorithmDef = {
  id: 'quick-sort',
  name: 'Quick Sort',
  category: 'sorting',
  description: 'Divide-and-conquer algorithm that picks a pivot and partitions the array around it, recursively sorting sub-arrays.',
  pseudocode,
  complexity: { time: 'O(n log n) avg, O(n²) worst', space: 'O(log n)' },
  defaultInput: { array: [64, 34, 25, 12, 22, 11, 90] },
  run: quickSort,
};

registerAlgorithm(quickSortDef);