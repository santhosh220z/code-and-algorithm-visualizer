import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import {
  makeArrayStep,
  highlightCompare,
  highlightSorted,
  makePointer,
} from '../sorting/helpers';

const pseudocode = [
  { text: 'procedure twoSum(A, target)', indent: 0 },
  { text: 'sort A', indent: 1 },
  { text: 'left = 0', indent: 1 },
  { text: 'right = length(A) - 1', indent: 1 },
  { text: 'while left < right', indent: 1, isLoopHeader: true, loopLabel: 'twoPtr' },
  { text: 'sum = A[left] + A[right]', indent: 2 },
  { text: 'if sum == target', indent: 2 },
  { text: 'return (left, right)', indent: 3 },
  { text: 'else if sum < target', indent: 2 },
  { text: 'left = left + 1', indent: 3 },
  { text: 'else', indent: 2 },
  { text: 'right = right - 1', indent: 3 },
  { text: 'end if', indent: 2 },
  { text: 'end while', indent: 1 },
  { text: 'return none', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* twoPointers(input: AlgorithmInput): Generator<Step> {
  const array = [...(input.array ?? [11, 12, 22, 25, 34, 64, 90])].sort((a, b) => a - b);
  const target = input.target ?? 46;
  const n = array.length;

  let left = 0;
  let right = n - 1;

  yield makeArrayStep(
    array,
    [],
    [makePointer(left, 'left', '#a855f7'), makePointer(right, 'right', '#fbbf24')],
    2,
    `Two pointers for target ${target} in sorted array`,
    { n, target, left, right }
  );

  let iteration = 0;
  while (left < right) {
    iteration++;
    const sum = array[left] + array[right];

    yield makeArrayStep(
      array,
      [],
      [makePointer(left, 'left', '#a855f7'), makePointer(right, 'right', '#fbbf24')],
      5,
      `left=${left} (${array[left]}), right=${right} (${array[right]}), sum=${sum}`,
      { left, right, sum, target, iteration },
      [{ label: 'twoPtr', iteration }]
    );

    yield makeArrayStep(
      array,
      highlightCompare(left, right),
      [makePointer(left, 'left', '#a855f7'), makePointer(right, 'right', '#fbbf24')],
      6,
      `Compare sum ${sum} with target ${target}`,
      { left, right, sum, target, iteration },
      [{ label: 'twoPtr', iteration }]
    );

    if (sum === target) {
      yield makeArrayStep(
        array,
        highlightSorted(left, right),
        [makePointer(left, 'left', '#a855f7'), makePointer(right, 'right', '#fbbf24')],
        7,
        `Found pair: A[${left}] + A[${right}] = ${array[left]} + ${array[right]} = ${target}`,
        { left, right, sum, target, found: true },
        [{ label: 'twoPtr', iteration }]
      );
      return;
    } else if (sum < target) {
      yield makeArrayStep(
        array,
        [],
        [makePointer(left, 'left', '#a855f7'), makePointer(right, 'right', '#fbbf24')],
        9,
        `Sum ${sum} < target, move left++ to increase sum`,
        { left, right, sum, target, newLeft: left + 1, iteration },
        [{ label: 'twoPtr', iteration }]
      );
      left++;
    } else {
      yield makeArrayStep(
        array,
        [],
        [makePointer(left, 'left', '#a855f7'), makePointer(right, 'right', '#fbbf24')],
        11,
        `Sum ${sum} > target, move right-- to decrease sum`,
        { left, right, sum, target, newRight: right - 1, iteration },
        [{ label: 'twoPtr', iteration }]
      );
      right--;
    }
  }

  yield makeArrayStep(
    array,
    [],
    [],
    14,
    `No pair found that sums to ${target}`,
    { target, found: false },
    []
  );
}

const twoPointersDef: AlgorithmDef = {
  id: 'two-pointers',
  name: 'Two Pointers (Two Sum)',
  category: 'search',
  description: 'Uses two pointers at opposite ends of a sorted array to find pairs with a target sum.',
  pseudocode,
  complexity: { time: 'O(n log n) for sort + O(n)', space: 'O(1)' },
  defaultInput: { array: [11, 12, 22, 25, 34, 64, 90], target: 46 },
  run: twoPointers,
};

registerAlgorithm(twoPointersDef);