import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import {
  makeArrayStep,
  highlightCompare,
  highlightSwap,
  highlightSorted,
  makePointer,
} from './helpers';

const pseudocode = [
  { text: 'procedure insertionSort(A)', indent: 0 },
  { text: 'n = length(A)', indent: 1 },
  { text: 'for i = 1 to n-1', indent: 1, isLoopHeader: true, loopLabel: 'outer' },
  { text: 'key = A[i]', indent: 2 },
  { text: 'j = i - 1', indent: 2 },
  { text: 'while j ≥ 0 and A[j] > A[j+1]', indent: 2, isLoopHeader: true, loopLabel: 'inner' },
  { text: 'swap A[j] and A[j+1]', indent: 3 },
  { text: 'j = j - 1', indent: 3 },
  { text: 'end while', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* insertionSort(input: AlgorithmInput): Generator<Step> {
  const array = [...(input.array ?? [64, 34, 25, 12, 22, 11, 90])];
  const n = array.length;

  yield makeArrayStep(array, [], [makePointer(0, 'i')], 1, `Initialize array of length ${n}`, { n });

  for (let i = 1; i < n; i++) {
    const key = array[i];
    yield makeArrayStep(
      array,
      [{ index: i, kind: 'current' }],
      [makePointer(i, 'i', '#a855f7'), makePointer(i, 'key', '#fbbf24')],
      3,
      `Pick key = ${key} at index ${i}; slide it left into the sorted region`,
      { i, key },
      [{ label: 'outer', iteration: i }]
    );

    let j = i - 1;
    yield makeArrayStep(
      array,
      [],
      [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(j + 1, 'key', '#fbbf24')],
      4,
      `Set j = ${j} (element just left of the key)`,
      { i, j, key },
      [{ label: 'outer', iteration: i }]
    );

    while (j >= 0 && array[j] > array[j + 1]) {
      yield makeArrayStep(
        array,
        highlightCompare(j, j + 1),
        [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(j + 1, 'key', '#fbbf24')],
        5,
        `Is A[${j}] (${array[j]}) > A[${j + 1}] (the key, ${key})? Yes — out of order`,
        { i, j, key, a: array[j], b: array[j + 1] },
        [{ label: 'outer', iteration: i }, { label: 'inner', iteration: i - j }]
      );

      // Real adjacent exchange: the key physically moves one slot left.
      // No copies are made, so duplicate values never appear on screen.
      yield makeArrayStep(
        array,
        highlightSwap(j, j + 1),
        [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(j + 1, 'key', '#fbbf24')],
        6,
        `Out of order: exchange A[${j}] (${array[j]}) with A[${j + 1}] (${key})`,
        { i, j, key },
        [{ label: 'outer', iteration: i }, { label: 'inner', iteration: i - j }]
      );

      [array[j], array[j + 1]] = [array[j + 1], array[j]];

      yield makeArrayStep(
        array,
        highlightSwap(j, j + 1),
        [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(j + 1, 'key', '#fbbf24')],
        6,
        `Swapped: key ${key} moved left to index ${j}`,
        { i, j, key, movedTo: j },
        [{ label: 'outer', iteration: i }, { label: 'inner', iteration: i - j }]
      );

      j--;

      const ptrs = [makePointer(i, 'i', '#a855f7'), makePointer(j + 1, 'key', '#fbbf24')];
      if (j >= 0) ptrs.push(makePointer(j, 'j', '#60a5fa'));
      yield makeArrayStep(
        array,
        [],
        ptrs,
        7,
        `Decrement j to ${j}`,
        { i, j, key },
        [{ label: 'outer', iteration: i }, { label: 'inner', iteration: Math.max(1, i - j) }]
      );
    }

    // Loop ended: either A[j] <= key or we ran off the front.
    // With exchange-based movement the key is ALREADY in its final spot.
    const reason =
      j >= 0
        ? `A[${j}] (${array[j]}) is not greater than key ${key} — in order`
        : 'Reached the front of the array';
    yield makeArrayStep(
      array,
      highlightSorted(...Array.from({ length: i + 1 }, (_, k) => k)),
      [makePointer(i, 'i', '#a855f7')],
      8,
      `${reason}. Key ${key} settled at index ${j + 1}; subarray [0..${i}] is sorted`,
      { i, key, settledAt: j + 1 },
      [{ label: 'outer', iteration: i }]
    );
  }

  yield makeArrayStep(
    array,
    highlightSorted(...Array.from({ length: n }, (_, k) => k)),
    [],
    10,
    'Array fully sorted!',
    { sorted: true },
    []
  );
}

const insertionSortDef: AlgorithmDef = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  description: 'Builds the final sorted array one item at a time by sliding each element left into its correct position via adjacent swaps.',
  pseudocode,
  complexity: { time: 'O(n²)', space: 'O(1)' },
  defaultInput: { array: [64, 34, 25, 12, 22, 11, 90] },
  run: insertionSort,
};

registerAlgorithm(insertionSortDef);