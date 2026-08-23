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
  { text: 'procedure bubbleSort(A)', indent: 0 },
  { text: 'n = length(A)', indent: 1 },
  { text: 'for i = 0 to n-2', indent: 1, isLoopHeader: true, loopLabel: 'outer' },
  { text: 'for j = 0 to n-2-i', indent: 2, isLoopHeader: true, loopLabel: 'inner' },
  { text: 'if A[j] > A[j+1]', indent: 3 },
  { text: 'swap A[j] and A[j+1]', indent: 4 },
  { text: 'end if', indent: 3 },
  { text: 'end for', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* bubbleSort(input: AlgorithmInput): Generator<Step> {
  const array = [...(input.array ?? [64, 34, 25, 12, 22, 11, 90])];
  const n = array.length;

  yield makeArrayStep(array, [], [makePointer(0, 'i'), makePointer(1, 'j')], 1, `Initialize array of length ${n}`, { n });

  for (let i = 0; i < n - 1; i++) {
    yield makeArrayStep(
      array,
      [],
      [makePointer(i, 'i', '#a855f7')],
      2,
      `Outer loop: pass ${i + 1} of ${n - 1}`,
      { i, n },
      [{ label: 'outer', iteration: i + 1 }]
    );

    for (let j = 0; j < n - 1 - i; j++) {
      yield makeArrayStep(
        array,
        highlightCompare(j, j + 1),
        [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(j + 1, 'j+1', '#60a5fa')],
        4,
        `Inner loop: compare index ${j} (${array[j]}) with ${j + 1} (${array[j + 1]})`,
        { i, j, a: array[j], b: array[j + 1] },
        [{ label: 'outer', iteration: i + 1 }, { label: 'inner', iteration: j + 1 }]
      );

      if (array[j] > array[j + 1]) {
        yield makeArrayStep(
          array,
          highlightSwap(j, j + 1),
          [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(j + 1, 'j+1', '#60a5fa')],
        4,
        `Condition true: ${array[j]} > ${array[j + 1]}, entering the swap branch`,
          { i, j, a: array[j], b: array[j + 1] },
          [{ label: 'outer', iteration: i + 1 }, { label: 'inner', iteration: j + 1 }]
        );

        [array[j], array[j + 1]] = [array[j + 1], array[j]];

        yield makeArrayStep(
          array,
          highlightSwap(j, j + 1),
          [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(j + 1, 'j+1', '#60a5fa')],
          5,
          `Swapped: array[${j}] = ${array[j]}, array[${j + 1}] = ${array[j + 1]}`,
          { i, j, a: array[j], b: array[j + 1] },
          [{ label: 'outer', iteration: i + 1 }, { label: 'inner', iteration: j + 1 }]
        );
      } else {
        yield makeArrayStep(
          array,
          highlightCompare(j, j + 1),
          [makePointer(i, 'i', '#a855f7'), makePointer(j, 'j', '#60a5fa'), makePointer(j + 1, 'j+1', '#60a5fa')],
          4,
          `No swap needed: ${array[j]} ≤ ${array[j + 1]}`,
          { i, j, a: array[j], b: array[j + 1] },
          [{ label: 'outer', iteration: i + 1 }, { label: 'inner', iteration: j + 1 }]
        );
      }
    }

    yield makeArrayStep(
      array,
      highlightSorted(n - 1 - i),
      [makePointer(i, 'i', '#a855f7')],
      8,
      `Pass ${i + 1} complete: element at index ${n - 1 - i} (${array[n - 1 - i]}) is now sorted`,
      { i, sortedIndex: n - 1 - i, value: array[n - 1 - i] },
      [{ label: 'outer', iteration: i + 1 }]
    );
  }

  yield makeArrayStep(
    array,
    highlightSorted(...Array.from({ length: n }, (_, k) => k)),
    [],
    9,
    'Array fully sorted!',
    { sorted: true },
    []
  );
}

const bubbleSortDef: AlgorithmDef = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'sorting',
  description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
  pseudocode,
  complexity: { time: 'O(n²)', space: 'O(1)' },
  defaultInput: { array: [64, 34, 25, 12, 22, 11, 90] },
  run: bubbleSort,
};

registerAlgorithm(bubbleSortDef);