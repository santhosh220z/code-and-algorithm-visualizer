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
  { text: 'procedure selectionSort(A)', indent: 0 },
  { text: 'n = length(A)', indent: 1 },
  { text: 'for i = 0 to n-2', indent: 1, isLoopHeader: true, loopLabel: 'outer' },
  { text: 'minIdx = i', indent: 2 },
  { text: 'for j = i+1 to n-1', indent: 2, isLoopHeader: true, loopLabel: 'inner' },
  { text: 'if A[j] < A[minIdx]', indent: 3 },
  { text: 'minIdx = j', indent: 4 },
  { text: 'end if', indent: 3 },
  { text: 'end for', indent: 2 },
  { text: 'if minIdx ≠ i', indent: 2 },
  { text: 'swap A[i] and A[minIdx]', indent: 3 },
  { text: 'end if', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* selectionSort(input: AlgorithmInput): Generator<Step> {
  const array = [...(input.array ?? [64, 34, 25, 12, 22, 11, 90])];
  const n = array.length;

  yield makeArrayStep(array, [], [makePointer(0, 'i')], 1, `Initialize array of length ${n}`, { n });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    yield makeArrayStep(
      array,
      [{ index: i, kind: 'current' }],
      [makePointer(i, 'i', '#a855f7'), makePointer(minIdx, 'min', '#fbbf24')],
      3,
      `Outer loop: assume minimum is at index ${i} (value ${array[i]})`,
      { i, minIdx },
      [{ label: 'outer', iteration: i + 1 }]
    );

    for (let j = i + 1; j < n; j++) {
      yield makeArrayStep(
        array,
        highlightCompare(j, minIdx),
        [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(minIdx, 'min', '#fbbf24')],
        5,
        `Inner loop: compare A[${j}] = ${array[j]} with current min A[${minIdx}] = ${array[minIdx]}`,
        { i, j, minIdx, compareValue: array[j], minValue: array[minIdx] },
        [{ label: 'outer', iteration: i + 1 }, { label: 'inner', iteration: j - i }]
      );

      if (array[j] < array[minIdx]) {
        minIdx = j;
        yield makeArrayStep(
          array,
          [{ index: minIdx, kind: 'current' }],
          [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(minIdx, 'min', '#fbbf24')],
          6,
          `New minimum found: A[${minIdx}] = ${array[minIdx]}`,
          { i, j, minIdx, minValue: array[minIdx] },
          [{ label: 'outer', iteration: i + 1 }, { label: 'inner', iteration: j - i }]
        );
      }
    }

    if (minIdx !== i) {
      yield makeArrayStep(
        array,
        highlightSwap(i, minIdx),
        [makePointer(i, 'i', '#a855f7'), makePointer(minIdx, 'min', '#fbbf24')],
        10,
        `Swap A[${i}] = ${array[i]} with A[${minIdx}] = ${array[minIdx]}`,
        { i, minIdx, a: array[i], b: array[minIdx] },
        [{ label: 'outer', iteration: i + 1 }]
      );

      [array[i], array[minIdx]] = [array[minIdx], array[i]];

      yield makeArrayStep(
        array,
        highlightSorted(i),
        [makePointer(i, 'i', '#a855f7')],
        10,
        `Swapped: element ${array[i]} now at correct position ${i}`,
        { i, minIdx, placed: array[i] },
        [{ label: 'outer', iteration: i + 1 }]
      );
    } else {
      yield makeArrayStep(
        array,
        highlightSorted(i),
        [makePointer(i, 'i', '#a855f7')],
        9,
        `Minimum already at position ${i}, no swap needed`,
        { i, minIdx },
        [{ label: 'outer', iteration: i + 1 }]
      );
    }
  }

  yield makeArrayStep(
    array,
    highlightSorted(...Array.from({ length: n }, (_, k) => k)),
    [],
    12,
    'Array fully sorted!',
    { sorted: true },
    []
  );
}

const selectionSortDef: AlgorithmDef = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  description: 'Repeatedly finds the minimum element from the unsorted portion and puts it at the beginning.',
  pseudocode,
  complexity: { time: 'O(n²)', space: 'O(1)' },
  defaultInput: { array: [64, 34, 25, 12, 22, 11, 90] },
  run: selectionSort,
};

registerAlgorithm(selectionSortDef);