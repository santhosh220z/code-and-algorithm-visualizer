import { create } from 'zustand';
import type { Step, AlgorithmDef, AlgorithmInput } from './types';

interface PlayerState {
  algorithm: AlgorithmDef | null;
  input: AlgorithmInput;
  steps: Step[];
  cursor: number;
  isPlaying: boolean;
  speed: number;
  hitCounts: number[];
  executedLines: Set<number>;

  setAlgorithm: (algo: AlgorithmDef, input?: AlgorithmInput) => void;
  regenerate: () => void;
  setCursor: (cursor: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;
  togglePlay: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
}

function collectSteps(algo: AlgorithmDef, input: AlgorithmInput): Step[] {
  const steps: Step[] = [];
  for (const step of algo.run(input)) {
    steps.push(step);
  }
  return steps;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  algorithm: null,
  input: {},
  steps: [],
  cursor: 0,
  isPlaying: false,
  speed: 1,
  hitCounts: [],
  executedLines: new Set<number>(),

  setAlgorithm: (algo, input) => {
    const effective = input ?? algo.defaultInput;
    const steps = collectSteps(algo, effective);
    set({
      algorithm: algo,
      input: effective,
      steps,
      cursor: 0,
      isPlaying: false,
    });
  },

  regenerate: () => {
    const { algorithm, input } = get();
    if (!algorithm) return;

    let nextInput = input;
    if ('array' in algorithm.defaultInput) {
      const size = Array.isArray((input as { array?: number[] }).array)
        ? ((input as { array: number[] }).array.length)
        : ((algorithm.defaultInput.size as number) ?? 12);
      nextInput = { ...input, array: generateRandomArray(size, 99) };
    }

    const steps = collectSteps(algorithm, nextInput);
    set({ input: nextInput, steps, cursor: 0, isPlaying: false });
  },

  setCursor: (cursor) => {
    const { steps } = get();
    if (steps.length === 0) return;
    set({ cursor: Math.max(0, Math.min(cursor, steps.length - 1)) });
  },

  stepForward: () => {
    const { cursor, steps } = get();
    if (cursor < steps.length - 1) {
      set({ cursor: cursor + 1 });
    }
  },

  stepBackward: () => {
    const { cursor } = get();
    if (cursor > 0) {
      set({ cursor: cursor - 1 });
    }
  },

  jumpToStart: () => {
    set({ cursor: 0, isPlaying: false });
  },

  jumpToEnd: () => {
    const { steps } = get();
    if (steps.length > 0) set({ cursor: steps.length - 1 });
  },

  togglePlay: () => {
    const { isPlaying, cursor, steps } = get();
    if (!isPlaying && cursor >= steps.length - 1 && steps.length > 0) {
      set({ cursor: 0, isPlaying: true });
    } else {
      set({ isPlaying: !isPlaying });
    }
  },

  pause: () => set({ isPlaying: false }),

  setSpeed: (speed) => set({ speed }),
}));

export function generateRandomArray(size: number, max = 99): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 5);
}

export function useCurrentStep(): Step | null {
  const steps = usePlayerStore((s) => s.steps);
  const cursor = usePlayerStore((s) => s.cursor);
  return steps[cursor] ?? null;
}

/** Hit counts per line for all steps up to and including the cursor. */
export function useHistoryStats(steps: Step[], cursor: number): number[] {
  const counts: number[] = [];
  for (let i = 0; i <= cursor; i++) {
    const line = steps[i].line;
    if (line !== undefined) {
      while (counts.length <= line) counts.push(0);
      counts[line]++;
    }
  }
  return counts;
}