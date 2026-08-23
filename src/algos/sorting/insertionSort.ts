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
  { text: 'while j ≥ 0 and A[j] > key', indent: 2, isLoopHeader: true, loopLabel: 'inner' },
  { text: 'A[j+1] = A[j]', indent: 3 },
  { text: 'j = j - 1', indent: 3 },
  { text: 'end while', indent: 2 },
  { text: 'A[j+1] = key', indent: 2 },
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
      `Outer loop: pick key = ${key} at index ${i}`,
      { i, key },
      [{ label: 'outer', iteration: i }]
    );

    let j = i - 1;
    yield makeArrayStep(
      array,
      [],
      [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(i, 'key', '#fbbf24')],
      4,
      `Set j = ${j} (element before key)`,
      { i, j, key },
      [{ label: 'outer', iteration: i }]
    );

    while (j >= 0 && array[j] > key) {
      yield makeArrayStep(
        array,
        highlightCompare(j, j + 1),
        [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(i, 'key', '#fbbf24')],
        5,
        `Compare A[${j}] = ${array[j]} with key = ${key}`,
        { i, j, key, compareValue: array[j] },
        [{ label: 'outer', iteration: i }, { label: 'inner', iteration: i - j }]
      );

      yield makeArrayStep(
        array,
        highlightSwap(j, j + 1),
        [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(i, 'key', '#fbbf24')],
        6,
        `Shift A[${j}] (${array[j]}) right to index ${j + 1}`,
        { i, j, key, shiftedValue: array[j] },
        [{ label: 'outer', iteration: i }, { label: 'inner', iteration: i - j }]
      );

      array[j + 1] = array[j];
      j--;

      yield makeArrayStep(
        array,
        [],
        [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(i, 'key', '#fbbf24')],
        7,
        `Decrement j to ${j}`,
        { i, j, key },
        [{ label: 'outer', iteration: i }, { label: 'inner', iteration: i - j }]
      );
    }

    yield makeArrayStep(
      array,
      [],
      [makePointer(i, 'i', '#a855f7'), makePointer(j + 1, 'j+1', '#60a5fa'), makePointer(i, 'key', '#fbbf24')],
      8,
      `Exit while: j = ${j}, insert key at index ${j + 1}`,
      { i, j, key },
      [{ label: 'outer', iteration: i }]
    );

    array[j + 1] = key;

    yield makeArrayStep(
      array,
      highlightSorted(...Array.from({ length: i + 1 }, (_, k) => k)),
      [makePointer(i, 'i', '#a855f7')],
      9,
      `Inserted key = ${key} at index ${j + 1}; subarray [0..${i}] is sorted`,
      { i, key, insertedAt: j + 1 },
      [{ label: 'outer', iteration: i }]
    );
  }

  yield makeArrayStep(
    array,
    highlightSorted(...Array.from({ length: n }, (_, k) => k)),
    [],
    11,
    'Array fully sorted!',
    { sorted: true },
    []
  );
}

const insertionSortDef: AlgorithmDef = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  description: 'Builds the final sorted array one item at a time by inserting each element into its correct position.',
  pseudocode,
  complexity: { time: 'O(n²)', space: 'O(1)' },
  defaultInput: { array: [64, 34, 25, 12, 22, 11, 90] },
  run: insertionSort,
};

registerAlgorithm(insertionSortDef);