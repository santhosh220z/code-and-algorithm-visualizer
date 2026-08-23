import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import {
  makeArrayStep,
  highlightCompare,
  highlightSorted,
  makePointer,
} from '../sorting/helpers';

const pseudocode = [
  { text: 'procedure linearSearch(A, target)', indent: 0 },
  { text: 'for i = 0 to length(A) - 1', indent: 1, isLoopHeader: true, loopLabel: 'search' },
  { text: 'if A[i] == target', indent: 2 },
  { text: 'return i', indent: 3 },
  { text: 'end if', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'return -1', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* linearSearch(input: AlgorithmInput): Generator<Step> {
  const array = [...(input.array ?? [64, 34, 25, 12, 22, 11, 90])];
  const target = input.target ?? 22;
  const n = array.length;

  yield makeArrayStep(array, [], [makePointer(0, 'i')], 1, `Search for target ${target} in array of length ${n}`, { n, target });

  for (let i = 0; i < n; i++) {
    yield makeArrayStep(
      array,
      highlightCompare(i, i),
      [makePointer(i, 'i', '#a855f7')],
      2,
      `Check index ${i}: A[${i}] = ${array[i]}`,
      { i, target, current: array[i] },
      [{ label: 'search', iteration: i + 1 }]
    );

    if (array[i] === target) {
      yield makeArrayStep(
        array,
        highlightSorted(i),
        [makePointer(i, 'i', '#a855f7')],
        3,
        `Found target ${target} at index ${i}!`,
        { i, target, found: true },
        [{ label: 'search', iteration: i + 1 }]
      );
      return;
    }
  }

  yield makeArrayStep(
    array,
    [],
    [],
    6,
    `Target ${target} not found in array`,
    { target, found: false },
    []
  );
}

const linearSearchDef: AlgorithmDef = {
  id: 'linear-search',
  name: 'Linear Search',
  category: 'search',
  description: 'Sequentially checks each element until the target is found or the end is reached.',
  pseudocode,
  complexity: { time: 'O(n)', space: 'O(1)' },
  defaultInput: { array: [64, 34, 25, 12, 22, 11, 90], target: 22 },
  run: linearSearch,
};

registerAlgorithm(linearSearchDef);