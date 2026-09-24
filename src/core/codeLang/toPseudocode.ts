import type { PseudocodeLine } from '../types';

/** Convert 1-based source line numbers to the 0-based indexes used by Step.line. */
export const toStepLine = (sourceLine: number): number => Math.max(0, sourceLine - 1);

/**
 * Map raw source text into PseudocodeLine[] so the existing CodePanel can
 * render it: real text, real indentation, and loop headers flagged so the
 * vertical loop rails light up during playback.
 */
export function toPseudocode(source: string, loopLines: Set<number>): PseudocodeLine[] {
  const raw = source.replace(/\t/g, '  ').split('\n');
  return raw.map((text, idx) => {
    const lineNo = idx + 1;
    const indent = text.length - text.trimStart().length;
    const isLoopHeader = loopLines.has(lineNo);
    let loopLabel: string | undefined;
    if (isLoopHeader) {
      const trimmed = text.trimStart();
      if (trimmed.startsWith('for')) loopLabel = 'for';
      else if (trimmed.startsWith('while')) loopLabel = 'while';
    }
    return { text, indent: Math.floor(indent / 4), isLoopHeader: isLoopHeader || undefined, loopLabel };
  });
}

/** Strip trailing blank lines so the panel doesn't render dead space. */
export function trimSource(source: string): string {
  return source.replace(/\s+$/, '');
}
