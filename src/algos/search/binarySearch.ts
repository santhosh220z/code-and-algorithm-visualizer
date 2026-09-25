import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { makeSearchStep, highlightCompare, highlightSorted } from '../../core/stepHelpers';

const pseudocode = [
  { text: 'procedure binarySearch(A, target)', indent: 0 },
  { text: 'left = 0', indent: 1 },
  { text: 'right = length(A) - 1', indent: 1 },
  { text: 'while left ≤ right', indent: 1, isLoopHeader: true, loopLabel: 'search' },
  { text: 'mid = floor((left + right) / 2)', indent: 2 },
  { text: 'if A[mid] == target', indent: 2 },
  { text: 'return mid', indent: 3 },
  { text: 'else if A[mid] < target', indent: 2 },
  { text: 'left = mid + 1', indent: 3 },
  { text: 'else', indent: 2 },
  { text: 'right = mid - 1', indent: 3 },
  { text: 'end if', indent: 2 },
  { text: 'end while', indent: 1 },
  { text: 'return -1', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* binarySearch(input: AlgorithmInput): Generator<Step> {
  const array = [...(input.array ?? [11, 12, 22, 25, 34, 64, 90])].sort((a, b) => a - b);
  const target = input.target ?? 22;
  const n = array.length;

  let left = 0;
  let right = n - 1;

  yield makeSearchStep(
    array,
    [],
    { left, right },
    null,
    1,
    `Binary search for ${target} in sorted array of length ${n}`,
    { n, target, left, right }
  );

  let iteration = 0;
  while (left <= right) {
    iteration++;
    const mid = Math.floor((left + right) / 2);

    yield makeSearchStep(
      array,
      [],
      { left, right },
      null,
      4,
      `Search range [${left}..${right}] (${right - left + 1} candidate${right - left === 0 ? '' : 's'}), mid = ${mid}`,
      { left, right, mid, iteration },
      [{ label: 'search', iteration }]
    );

    yield makeSearchStep(
      array,
      highlightCompare(mid),
      { left, right },
      null,
      5,
      `Compare A[${mid}] = ${array[mid]} with target ${target}`,
      { left, right, mid, midValue: array[mid], target, iteration },
      [{ label: 'search', iteration }]
    );

    if (array[mid] === target) {
      yield makeSearchStep(
        array,
        highlightSorted(mid),
        { left, right },
        mid,
        6,
        `Found target ${target} at index ${mid}!`,
        { left, right, mid, target, found: true },
        [{ label: 'search', iteration }]
      );
      return;
    } else if (array[mid] < target) {
      yield makeSearchStep(
        array,
        [],
        { left: mid + 1, right },
        null,
        8,
        `A[${mid}] (${array[mid]}) < target, so the left half is discarded: left = ${mid + 1}`,
        { left, right, mid, newLeft: mid + 1, iteration },
        [{ label: 'search', iteration }]
      );
      left = mid + 1;
    } else {
      yield makeSearchStep(
        array,
        [],
        { left, right: mid - 1 },
        null,
        10,
        `A[${mid}] (${array[mid]}) > target, so the right half is discarded: right = ${mid - 1}`,
        { left, right, mid, newRight: mid - 1, iteration },
        [{ label: 'search', iteration }]
      );
      right = mid - 1;
    }
  }

  yield makeSearchStep(
    array,
    [],
    null,
    null,
    13,
    `Target ${target} not found — the search range became empty`,
    { target, found: false },
    []
  );
}

const binarySearchDef: AlgorithmDef = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'search',
  description: 'Efficiently finds a target in a sorted array by repeatedly dividing the search interval in half.',
  pseudocode,
  complexity: { time: 'O(log n)', space: 'O(1)' },
  defaultInput: { array: [11, 12, 22, 25, 34, 64, 90], target: 22 },
  run: binarySearch,
};

registerAlgorithm(binarySearchDef);