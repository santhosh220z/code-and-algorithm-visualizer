import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import {
  makeArrayStep,
  highlightCompare,
  highlightSorted,
  makePointer,
} from './helpers';

const pseudocode = [
  { text: 'procedure mergeSort(A, left, right)', indent: 0 },
  { text: 'if left < right', indent: 1 },
  { text: 'mid = (left + right) / 2', indent: 2 },
  { text: 'mergeSort(A, left, mid)', indent: 2 },
  { text: 'mergeSort(A, mid+1, right)', indent: 2 },
  { text: 'merge(A, left, mid, right)', indent: 2 },
  { text: 'end if', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure merge(A, left, mid, right)', indent: 0 },
  { text: 'create temp arrays L[left..mid], R[mid+1..right]', indent: 1 },
  { text: 'i = 0, j = 0, k = left', indent: 1 },
  { text: 'while i < L.length and j < R.length', indent: 1, isLoopHeader: true, loopLabel: 'merge' },
  { text: 'if L[i] ≤ R[j]', indent: 2 },
  { text: 'A[k] = L[i]; i++', indent: 3 },
  { text: 'else', indent: 2 },
  { text: 'A[k] = R[j]; j++', indent: 3 },
  { text: 'end if', indent: 2 },
  { text: 'k++', indent: 2 },
  { text: 'end while', indent: 1 },
  { text: 'copy remaining L elements', indent: 1 },
  { text: 'copy remaining R elements', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

function* merge(
  array: number[],
  left: number,
  mid: number,
  right: number,
  depth: number
): Generator<Step> {
  const n1 = mid - left + 1;
  const n2 = right - mid;

  const L = array.slice(left, mid + 1);
  const R = array.slice(mid + 1, right + 1);

  yield makeArrayStep(
    array,
    [],
    [makePointer(left, 'L', '#a855f7'), makePointer(mid + 1, 'R', '#fbbf24'), makePointer(left, 'k', '#60a5fa')],
    10,
    `Merge: create L[${n1}] and R[${n2}] from indices [${left}..${mid}] and [${mid + 1}..${right}]`,
    { left, mid, right, L, R, depth },
    [{ label: 'merge', iteration: 1 }]
  );

  let i = 0, j = 0, k = left;
  let mergeIter = 1;

  while (i < n1 && j < n2) {
    const leftIdx = left + i;
    const rightIdx = mid + 1 + j;

    yield makeArrayStep(
      array,
      highlightCompare(leftIdx, rightIdx),
      [makePointer(leftIdx, 'L[i]', '#a855f7'), makePointer(rightIdx, 'R[j]', '#fbbf24'), makePointer(k, 'k', '#60a5fa')],
      13,
      `Compare L[${i}] = ${L[i]} with R[${j}] = ${R[j]}`,
      { left, mid, right, i, j, k, leftVal: L[i], rightVal: R[j], depth },
      [{ label: 'merge', iteration: mergeIter++ }]
    );

    if (L[i] <= R[j]) {
      yield makeArrayStep(
        array,
        [{ index: k, kind: 'current' }],
        [makePointer(leftIdx, 'L[i]', '#a855f7'), makePointer(rightIdx, 'R[j]', '#fbbf24'), makePointer(k, 'k', '#60a5fa')],
        14,
        `L[${i}] ≤ R[${j}], place ${L[i]} at A[${k}]`,
        { left, mid, right, i, j, k, placed: L[i], depth },
        [{ label: 'merge', iteration: mergeIter }]
      );
      array[k] = L[i];
      i++;
    } else {
      yield makeArrayStep(
        array,
        [{ index: k, kind: 'current' }],
        [makePointer(leftIdx, 'L[i]', '#a855f7'), makePointer(rightIdx, 'R[j]', '#fbbf24'), makePointer(k, 'k', '#60a5fa')],
        16,
        `L[${i}] > R[${j}], place ${R[j]} at A[${k}]`,
        { left, mid, right, i, j, k, placed: R[j], depth },
        [{ label: 'merge', iteration: mergeIter }]
      );
      array[k] = R[j];
      j++;
    }
    k++;
  }

  while (i < n1) {
    yield makeArrayStep(
      array,
      [{ index: k, kind: 'current' }],
      [makePointer(left + i, 'L[i]', '#a855f7'), makePointer(k, 'k', '#60a5fa')],
      20,
      `Copy remaining L[${i}] = ${L[i]} to A[${k}]`,
      { left, mid, right, i, j, k, placed: L[i], depth },
      [{ label: 'merge', iteration: mergeIter++ }]
    );
    array[k] = L[i];
    i++;
    k++;
  }

  while (j < n2) {
    yield makeArrayStep(
      array,
      [{ index: k, kind: 'current' }],
      [makePointer(mid + 1 + j, 'R[j]', '#fbbf24'), makePointer(k, 'k', '#60a5fa')],
      21,
      `Copy remaining R[${j}] = ${R[j]} to A[${k}]`,
      { left, mid, right, i, j, k, placed: R[j], depth },
      [{ label: 'merge', iteration: mergeIter++ }]
    );
    array[k] = R[j];
    j++;
    k++;
  }

  yield makeArrayStep(
    array,
    highlightSorted(...Array.from({ length: right - left + 1 }, (_, idx) => left + idx)),
    [],
    22,
    `Merge complete: subarray [${left}..${right}] is now sorted`,
    { left, mid, right, sorted: array.slice(left, right + 1), depth },
    []
  );
}

function* mergeSortRec(
  array: number[],
  left: number,
  right: number,
  depth: number
): Generator<Step> {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);

    yield makeArrayStep(
      array,
      [],
      [makePointer(left, 'left', '#a855f7'), makePointer(right, 'right', '#fbbf24'), makePointer(mid, 'mid', '#60a5fa')],
      1,
      `Recursive call: sort range [${left}..${right}], mid = ${mid}`,
      { left, mid, right, depth },
      []
    );

    yield* mergeSortRec(array, left, mid, depth + 1);
    yield* mergeSortRec(array, mid + 1, right, depth + 1);
    yield* merge(array, left, mid, right, depth);
  }
}

export function* mergeSort(input: AlgorithmInput): Generator<Step> {
  const array = [...(input.array ?? [64, 34, 25, 12, 22, 11, 90])];
  const n = array.length;

  yield makeArrayStep(array, [], [], 0, `Start merge sort on array of length ${n}`, { n });

  yield* mergeSortRec(array, 0, n - 1, 0);

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

const mergeSortDef: AlgorithmDef = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'sorting',
  description: 'Divide-and-conquer algorithm that divides the array into halves, sorts them recursively, and merges the sorted halves.',
  pseudocode,
  complexity: { time: 'O(n log n)', space: 'O(n)' },
  defaultInput: { array: [64, 34, 25, 12, 22, 11, 90] },
  run: mergeSort,
};

registerAlgorithm(mergeSortDef);