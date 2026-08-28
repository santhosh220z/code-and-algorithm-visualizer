import type { Step, ArrayHighlight, Pointer } from '../../core/types';

export interface LoopInfo {
  label: string;
  iteration: number;
}
export interface StackFrame {
  fn: string;
  args: Record<string, unknown>;
}

export function makeArrayStep(
  array: number[],
  highlights: ArrayHighlight[],
  pointers: Pointer[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: LoopInfo[],
  stack?: StackFrame[]
): Step {
  return { line, description, vars, loops, stack, viz: { type: 'array', array: [...array], highlights, pointers } };
}

export function highlightCurrent(index: number): ArrayHighlight[] {
  return [{ index, kind: 'current' }];
}

export function highlightCompare(...indices: number[]): ArrayHighlight[] {
  return indices.map((index) => ({ index, kind: 'compare' as const }));
}

export function highlightSwap(...indices: number[]): ArrayHighlight[] {
  return indices.map((index) => ({ index, kind: 'swap' as const }));
}

export function highlightSorted(...indices: number[]): ArrayHighlight[] {
  return indices.map((index) => ({ index, kind: 'sorted' as const }));
}

export function makePointer(index: number, label: string, color?: string): Pointer {
  return { index, label, color };
}

export function frame(fn: string, args: Record<string, unknown>): StackFrame {
  return { fn, args };
}
