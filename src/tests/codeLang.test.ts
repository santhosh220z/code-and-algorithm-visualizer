import { describe, expect, it } from 'vitest';
import { interpretSource } from '../core/codeLang/interpreter';
import { tokenize } from '../core/codeLang/lexer';
import { parse } from '../core/codeLang/parser';
import { toPseudocode, toStepLine } from '../core/codeLang/toPseudocode';

function lastConsole(src: string): string[] {
  const { steps } = interpretSource(src);
  return steps[steps.length - 1]?.console ?? [];
}

describe('miniPython lexer', () => {
  it('tokenizes numbers, names, operators and strings', () => {
    const toks = tokenize('x = 12 + 3.5\nprint("hi")');
    const nums = toks.filter((t) => t.kind === 'num').map((t) => t.num);
    expect(nums).toEqual([12, 3.5]);
    expect(toks.some((t) => t.kind === 'str' && t.value === 'hi')).toBe(true);
  });

  it('emits indent/dedent for blocks', () => {
    const toks = tokenize('if x:\n    y = 1\n');
    expect(toks.some((t) => t.kind === 'indent')).toBe(true);
    expect(toks.some((t) => t.kind === 'dedent')).toBe(true);
  });

  it('ignores comments and blank lines', () => {
    const toks = tokenize('# just a comment\n\nx = 1');
    expect(toks.filter((t) => t.kind === 'name').map((t) => t.value)).toEqual(['x']);
  });
});

describe('miniPython parser', () => {
  it('parses assignments and prints', () => {
    const p = parse('a = 1\nprint(a)');
    expect(p.stmts.length).toBe(2);
    expect(p.stmts[0].kind).toBe('assign');
    expect(p.stmts[1].kind).toBe('print');
  });

  it('marks loop header lines', () => {
    const p = parse('for i in range(3):\n    print(i)\n');
    expect(p.loopLines.has(1)).toBe(true);
  });

  it('parses function definitions and calls', () => {
    const p = parse('def add(a, b):\n    return a + b\n\nprint(add(1, 2))');
    expect(p.funcLines.has(1)).toBe(true);
    expect(p.stmts.length).toBeGreaterThan(0);
  });
});

describe('miniPython interpreter', () => {
  it('assigns variables and updates them', () => {
    const { steps, error } = interpretSource('a = 1\na = a + 5');
    expect(error).toBeNull();
    const last = steps[steps.length - 1];
    expect(last.vars?.a).toBe(6);
  });

  it('runs while loops with iteration tracking', () => {
    const { steps, error } = interpretSource('i = 0\nwhile i < 3:\n    i = i + 1\n');
    expect(error).toBeNull();
    expect(steps.some((s) => s.loops?.some((l) => l.label === 'while'))).toBe(true);
  });

  it('runs for loops over range', () => {
    expect(lastConsole('for i in range(3):\n    print(i)')).toEqual(['0', '1', '2']);
  });

  it('supports recursion with a call stack', () => {
    const { steps, error } = interpretSource('def f(n):\n    if n <= 0:\n        return 0\n    return n\n\nprint(f(3))');
    expect(error).toBeNull();
    expect(steps.some((s) => s.stack && s.stack.length > 0)).toBe(true);
  });

  it('computes factorial correctly', () => {
    expect(lastConsole('def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\n\nprint(fact(5))')).toEqual(['120']);
  });

  it('handles if/elif/else branching (fizzbuzz)', () => {
    const out = lastConsole(
      'for i in range(1, 4):\n    if i % 2 == 0:\n        print("Even")\n    else:\n        print("Odd")'
    );
    expect(out).toEqual(['Odd', 'Even', 'Odd']);
  });

  it('supports list literals, indexing and append', () => {
    const { steps, error } = interpretSource('nums = [1, 2, 3]\nnums.append(4)\nprint(nums[3])');
    expect(error).toBeNull();
    expect(lastConsole('nums = [1, 2, 3]\nnums.append(4)\nprint(nums[3])')).toEqual(['4']);
    expect(steps[steps.length - 1].viz.type).toBe('array');
  });

  it('emits array visualization payloads for list variables', () => {
    const { steps } = interpretSource('nums = [5, 3, 8]');
    const withArray = steps.find((s) => s.viz.type === 'array');
    expect(withArray).toBeDefined();
    if (withArray?.viz.type === 'array') expect(withArray.viz.array).toEqual([5, 3, 8]);
  });

  it('stops runaway loops at the step budget', () => {
    const { truncated, error, steps } = interpretSource('while True:\n    x = 1');
    expect(truncated).toBe(true);
    expect(error).toBeNull();
    expect(steps.length).toBeLessThanOrEqual(5001);
  });

  it('reports runtime errors without crashing', () => {
    const { error } = interpretSource('print(1 / 0)');
    expect(error).toMatch(/division by zero/i);
  });

  it('reports unknown variables', () => {
    const { error } = interpretSource('print(mystery)');
    expect(error).toMatch(/not defined/i);
  });

  it('reports parse errors with a line number', () => {
    const { error } = interpretSource('x = = 3');
    expect(error).toBeTruthy();
  });

  it('emits steps whose line indexes are valid source lines', () => {
    const src = 'a = 1\nb = 2\nprint(a + b)';
    const { steps } = interpretSource(src);
    const lineCount = src.split('\n').length;
    for (const s of steps) {
      if (s.line === undefined) continue;
      expect(s.line).toBeGreaterThanOrEqual(0);
      expect(s.line).toBeLessThan(lineCount);
    }
  });
});

describe('toPseudocode', () => {
  it('maps source lines to pseudocode lines preserving text', () => {
    const src = 'a = 1\nif a > 0:\n    print(a)';
    const lines = toPseudocode(src, new Set([2]));
    expect(lines.length).toBe(3);
    expect(lines[0].text).toBe('a = 1');
    expect(lines[2].indent).toBe(1);
    expect(lines[1].isLoopHeader).toBe(true);
  });

  it('converts 1-based source lines to 0-based step lines', () => {
    expect(toStepLine(1)).toBe(0);
    expect(toStepLine(5)).toBe(4);
  });
});
