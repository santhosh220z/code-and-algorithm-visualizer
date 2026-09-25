import type { LoopScope, PseudocodeLine } from './types';

export function parseLoops(pseudocode: PseudocodeLine[]): LoopScope[] {
  const scopes: LoopScope[] = [];
  pseudocode.forEach((line, index) => {
    if (!line.isLoopHeader) return;
    let end = index;
    for (let nextIndex = index + 1; nextIndex < pseudocode.length; nextIndex++) {
      const next = pseudocode[nextIndex];
      if (next.text.trim() === '') continue;
      if (next.indent <= line.indent) break;
      end = nextIndex;
    }
    scopes.push({
      label: line.loopLabel ?? `loop${index}`,
      startLine: index,
      endLine: end,
      depth: line.indent,
    });
  });
  return scopes;
}
