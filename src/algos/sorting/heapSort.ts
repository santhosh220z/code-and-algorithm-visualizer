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
  { text: 'procedure heapSort(A)', indent: 0 },
  { text: 'n = length(A)', indent: 1 },
  { text: 'buildMaxHeap(A)', indent: 1 },
  { text: 'for i = n-1 down to 1', indent: 1, isLoopHeader: true, loopLabel: 'extract' },
  { text: 'swap A[0] and A[i]', indent: 2 },
  { text: 'heapify(A, 0, i)', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure buildMaxHeap(A)', indent: 0 },
  { text: 'for i = floor(n/2) - 1 down to 0', indent: 1, isLoopHeader: true, loopLabel: 'build' },
  { text: 'heapify(A, i, n)', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure heapify(A, idx, heapSize)', indent: 0 },
  { text: 'largest = idx', indent: 1 },
  { text: 'left = 2*idx + 1', indent: 1 },
  { text: 'right = 2*idx + 2', indent: 1 },
  { text: 'if left < heapSize and A[left] > A[largest]', indent: 1 },
  { text: 'largest = left', indent: 2 },
  { text: 'end if', indent: 1 },
  { text: 'if right < heapSize and A[right] > A[largest]', indent: 1 },
  { text: 'largest = right', indent: 2 },
  { text: 'end if', indent: 1 },
  { text: 'if largest ≠ idx', indent: 1 },
  { text: 'swap A[idx] and A[largest]', indent: 2 },
  { text: 'heapify(A, largest, heapSize)', indent: 2 },
  { text: 'end if', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

function* heapify(
  array: number[],
  idx: number,
  heapSize: number,
  depth: number
): Generator<Step> {
  let largest = idx;
  const left = 2 * idx + 1;
  const right = 2 * idx + 2;

  yield makeArrayStep(
    array,
    [],
    [makePointer(idx, 'idx', '#a855f7'), makePointer(left, 'L', '#60a5fa'), makePointer(right, 'R', '#60a5fa')],
    16,
    `Heapify at index ${idx}: left=${left < heapSize ? array[left] : '∅'}, right=${right < heapSize ? array[right] : '∅'}`,
    { idx, left, right, heapSize, largest, depth },
    []
  );

  if (left < heapSize && array[left] > array[largest]) {
    largest = left;
    yield makeArrayStep(
      array,
      highlightCompare(left, idx),
      [makePointer(idx, 'idx', '#a855f7'), makePointer(left, 'L', '#60a5fa'), makePointer(largest, 'largest', '#fbbf24')],
      20,
      `Left child ${array[left]} > A[${idx}] ${array[idx]}, largest = ${largest}`,
      { idx, left, right, heapSize, largest, depth },
      []
    );
  }

  if (right < heapSize && array[right] > array[largest]) {
    largest = right;
    yield makeArrayStep(
      array,
      highlightCompare(right, largest === left ? left : idx),
      [makePointer(idx, 'idx', '#a855f7'), makePointer(right, 'R', '#60a5fa'), makePointer(largest, 'largest', '#fbbf24')],
      23,
      `Right child ${array[right]} > A[${largest}] ${array[largest]}, largest = ${largest}`,
      { idx, left, right, heapSize, largest, depth },
      []
    );
  }

  if (largest !== idx) {
    yield makeArrayStep(
      array,
      highlightSwap(idx, largest),
      [makePointer(idx, 'idx', '#a855f7'), makePointer(largest, 'largest', '#fbbf24')],
      26,
      `Swap A[${idx}] = ${array[idx]} with A[${largest}] = ${array[largest]}`,
      { idx, largest, swapped: true, depth },
      []
    );
    [array[idx], array[largest]] = [array[largest], array[idx]];

    yield* heapify(array, largest, heapSize, depth + 1);
  }
}

function* buildMaxHeap(array: number[], n: number): Generator<Step> {
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield makeArrayStep(
      array,
      [],
      [makePointer(i, 'i', '#a855f7')],
      11,
      `Build heap: heapify from index ${i}`,
      { i, n },
      [{ label: 'build', iteration: Math.floor(n / 2) - i }]
    );
    yield* heapify(array, i, n, 0);
  }
}

export function* heapSort(input: AlgorithmInput): Generator<Step> {
  const array = [...(input.array ?? [64, 34, 25, 12, 22, 11, 90])];
  const n = array.length;

  yield makeArrayStep(array, [], [], 0, `Start heap sort on array of length ${n}`, { n });

  yield* buildMaxHeap(array, n);

  yield makeArrayStep(
    array,
    [],
    [],
    3,
    'Max heap built, begin extracting elements',
    { n, heapBuilt: true },
    []
  );

  for (let i = n - 1; i > 0; i--) {
    yield makeArrayStep(
      array,
      highlightSwap(0, i),
      [makePointer(0, 'root', '#a855f7'), makePointer(i, 'i', '#fbbf24')],
      4,
      `Extract max: swap root (${array[0]}) with A[${i}] (${array[i]})`,
      { i, root: array[0], last: array[i] },
      [{ label: 'extract', iteration: n - i }]
    );
    [array[0], array[i]] = [array[i], array[0]];

    yield makeArrayStep(
      array,
      highlightSorted(i),
      [makePointer(0, 'root', '#a855f7')],
      5,
      `Element ${array[i]} placed at sorted position ${i}`,
      { i, placed: array[i] },
      [{ label: 'extract', iteration: n - i }]
    );

    yield* heapify(array, 0, i, 0);
  }

  yield makeArrayStep(
    array,
    highlightSorted(0),
    [],
    5,
    'Final element in place',
    { sorted: true },
    []
  );

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

const heapSortDef: AlgorithmDef = {
  id: 'heap-sort',
  name: 'Heap Sort',
  category: 'sorting',
  description: 'Builds a max heap from the array, then repeatedly extracts the maximum element and rebuilds the heap.',
  pseudocode,
  complexity: { time: 'O(n log n)', space: 'O(1)' },
  defaultInput: { array: [64, 34, 25, 12, 22, 11, 90] },
  run: heapSort,
};

registerAlgorithm(heapSortDef);