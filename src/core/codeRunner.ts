import { create } from 'zustand';
import { interpretSource } from './codeLang/interpreter';
import { toPseudocode, trimSource } from './codeLang/toPseudocode';
import { usePlayerStore } from './player';
import type { AlgorithmDef, Step } from './types';

export const CODE_LANGUAGE = 'miniPython';
export const CODE_LANGUAGE_LABEL = 'Python (mini)';

export interface Snippet {
  id: string;
  name: string;
  description: string;
  source: string;
}

export const SNIPPETS: Snippet[] = [
  {
    id: 'fizzbuzz',
    name: 'FizzBuzz',
    description: 'Branching with %, if/elif/else',
    source: `for i in range(1, 16):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)
`,
  },
  {
    id: 'factorial',
    name: 'Factorial',
    description: 'Recursion and the call stack',
    source: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("5! =", factorial(5))
`,
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    description: 'List indexing, loop and break',
    source: `nums = [12, 7, 25, 3, 18]
target = 25
found = -1

for i in range(len(nums)):
    if nums[i] == target:
        found = i
        break

print("target at index", found)
`,
  },
  {
    id: 'sum-while',
    name: 'Sum with While',
    description: 'Accumulating with a while loop',
    source: `total = 0
i = 1

while i <= 10:
    total = total + i
    i = i + 1

print("sum 1..10 =", total)
`,
  },
  {
    id: 'list-build',
    name: 'Build a List',
    description: 'Growing a list with append',
    source: `squares = []

for i in range(1, 6):
    squares.append(i * i)

print(squares)
`,
  },
  {
    id: 'evens',
    name: 'Skip Odds',
    description: 'continue inside a for loop',
    source: `nums = [1, 2, 3, 4, 5, 6, 7, 8]

for n in nums:
    if n % 2 == 1:
        continue
    print("even:", n)
`,
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    description: 'Accumulator variables',
    source: `a = 0
b = 1

for i in range(1, 9):
    nxt = a + b
    a = b
    b = nxt
    print("fib", i, "=", a)
`,
  },
];

/** Build a synthetic AlgorithmDef so the existing player store drives playback. */
function buildDef(pseudocode: ReturnType<typeof toPseudocode>, steps: Step[]): AlgorithmDef {
  return {
    id: 'code-visualizer',
    name: CODE_LANGUAGE_LABEL,
    category: 'recursion',
    description: 'Step-through execution of your own code',
    pseudocode,
    complexity: { time: 'O(steps)', space: 'O(vars)' },
    defaultInput: {},
    run: function* (): Generator<Step> {
      yield* steps;
    },
  };
}

interface CodeRunnerState {
  source: string;
  mode: 'editor' | 'trace';
  error: string | null;
  setSource: (source: string) => void;
  run: (source?: string) => void;
  backToEditor: () => void;
}

export const useCodeRunnerStore = create<CodeRunnerState>((set, get) => ({
  source: SNIPPETS[0].source,
  mode: 'editor',
  error: null,

  setSource: (source) => set({ source, error: null }),

  run: (maybeSource) => {
    const src = trimSource(maybeSource ?? get().source);
    const result = interpretSource(src);
    if (result.error) {
      set({ source: src, mode: 'editor', error: result.error });
      return;
    }
    const pseudocode = toPseudocode(src, result.loopLines);
    usePlayerStore.getState().setAlgorithm(buildDef(pseudocode, result.steps), {});
    set({ source: src, mode: 'trace', error: null });
  },

  backToEditor: () => set({ mode: 'editor' }),
}));
