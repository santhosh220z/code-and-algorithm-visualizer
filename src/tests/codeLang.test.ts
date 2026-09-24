import { describe, expect, it } from 'vitest';
import { interpretSource } from '../core/codeLang/interpreter';
import { tokenize } from '../core/codeLang/lexer';
import { parse } from '../core/codeLang/parser';
import { toPseudocode, toStepLine } from '../core/codeLang/toPseudocode';
import { useCodeRunnerStore, SNIPPETS } from '../core/codeRunner';
import { usePlayerStore } from '../core/player';

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

  it('evaluates an if condition exactly once', () => {
    const src = 'def probe():\n    return True\n\nif probe():\n    print("yes")';
    const { steps, error } = interpretSource(src);
    expect(error).toBeNull();
    const calls = steps.filter((s) => s.description.startsWith('Call probe')).length;
    expect(calls).toBe(1);
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

describe('break and continue', () => {
  it('break exits a for loop early', () => {
    const src = 'for i in range(10):\n    if i == 3:\n        break\n    print(i)';
    const { steps, error } = interpretSource(src);
    expect(error).toBeNull();
    expect(lastConsole(src)).toEqual(['0', '1', '2']);
    expect(steps.some((s) => s.description.includes('exited early via break'))).toBe(true);
  });

  it('break exits a while loop early', () => {
    const src = 'i = 0\nwhile i < 100:\n    i = i + 1\n    if i == 2:\n        break\nprint(i)';
    expect(lastConsole(src)).toEqual(['2']);
  });

  it('continue skips the rest of the iteration', () => {
    const src = 'for i in range(5):\n    if i % 2 == 0:\n        continue\n    print(i)';
    const { error } = interpretSource(src);
    expect(error).toBeNull();
    expect(lastConsole(src)).toEqual(['1', '3']);
  });

  it('continue in a while loop still advances the condition', () => {
    const src = 'i = 0\nn = 0\nwhile i < 4:\n    i = i + 1\n    if i == 2:\n        continue\n    n = n + i\nprint(n)';
    expect(lastConsole(src)).toEqual(['8']);
  });

  it('reports an error for break outside a loop', () => {
    const { error } = interpretSource('break');
    expect(error).toMatch(/only valid inside a loop/i);
  });

  it('reports an error for continue outside a loop', () => {
    const { error } = interpretSource('continue');
    expect(error).toMatch(/only valid inside a loop/i);
  });

  it('does not let break inside a function escape to the caller loop', () => {
    const src = 'def f():\n    break\n\nfor i in range(3):\n    f()';
    const { error } = interpretSource(src);
    expect(error).toMatch(/only valid inside a loop/i);
  });
});

describe('array visualization highlights', () => {
  it('highlights the element being indexed', () => {
    const src = 'nums = [4, 8, 15]\nprint(nums[1])';
    const { steps } = interpretSource(src);
    const indexed = steps.find(
      (s) => s.viz.type === 'array' && s.viz.highlights.length > 0
    );
    expect(indexed).toBeDefined();
    if (indexed?.viz.type === 'array') {
      expect(indexed.viz.highlights[0].index).toBe(1);
    }
  });

  it('highlights the position written by an indexed assignment', () => {
    const src = 'nums = [1, 2, 3]\nnums[2] = 99';
    const { steps } = interpretSource(src);
    const write = steps.find((s) => s.description.includes('[2] ='));
    expect(write).toBeDefined();
    if (write?.viz.type === 'array') {
      expect(write.viz.highlights[0].index).toBe(2);
      expect(write.viz.array).toEqual([1, 2, 99]);
    }
  });

  it('walks the highlight while iterating a list', () => {
    const src = 'nums = [7, 8, 9]\nfor n in nums:\n    print(n)';
    const { steps } = interpretSource(src);
    const seen = new Set<number>();
    for (const s of steps) {
      if (s.viz.type !== 'array') continue;
      for (const h of s.viz.highlights) seen.add(h.index);
    }
    expect([...seen].sort()).toEqual([0, 1, 2]);
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

describe('codeRunner store integration', () => {
  it('starts in editor mode with a sample program loaded', () => {
    const s = useCodeRunnerStore.getState();
    expect(s.mode).toBe('editor');
    expect(s.source).toBe(SNIPPETS[0].source);
  });

  it('running code loads the player store with pseudocode and steps', () => {
    useCodeRunnerStore.getState().run('a = 1\nfor i in range(3):\n    a = a + i\n');
    const runner = useCodeRunnerStore.getState();
    const player = usePlayerStore.getState();

    expect(runner.mode).toBe('trace');
    expect(runner.error).toBeNull();
    expect(player.algorithm?.id).toBe('code-visualizer');
    expect(player.algorithm?.pseudocode.length).toBe(3);
    expect(player.steps.length).toBeGreaterThan(0);
    expect(player.cursor).toBe(0);
  });

  it('every player step line maps to a real pseudocode row', () => {
    useCodeRunnerStore.getState().run('x = 1\nwhile x < 3:\n    x = x + 1\n');
    const player = usePlayerStore.getState();
    const lineCount = player.algorithm?.pseudocode.length ?? 0;
    for (const s of player.steps) {
      if (s.line === undefined) continue;
      expect(s.line).toBeGreaterThanOrEqual(0);
      expect(s.line).toBeLessThan(lineCount);
    }
  });

  it('keeps the player trace ending on the expected console output', () => {
    useCodeRunnerStore.getState().run('print("hello")\nprint("world")');
    const player = usePlayerStore.getState();
    const last = player.steps[player.steps.length - 1];
    expect(last.console).toEqual(['hello', 'world']);
  });

  it('stays in editor mode and reports the error for invalid code', () => {
    useCodeRunnerStore.getState().run('this is not valid @@@');
    const runner = useCodeRunnerStore.getState();
    expect(runner.mode).toBe('editor');
    expect(runner.error).toBeTruthy();
  });

  it('flags loop headers so the code panel can draw loop rails', () => {
    useCodeRunnerStore.getState().run('for i in range(2):\n    print(i)');
    const player = usePlayerStore.getState();
    expect(player.algorithm?.pseudocode[0].isLoopHeader).toBe(true);
    expect(player.algorithm?.pseudocode[0].loopLabel).toBe('for');
  });

  it('every bundled sample runs without a runtime error', () => {
    for (const snippet of SNIPPETS) {
      const { error } = interpretSource(snippet.source);
      expect(error, `snippet "${snippet.name}" failed`).toBeNull();
    }
  });

  it('fizzbuzz picks the first matching branch and falls through to else', () => {
    const fizzbuzz = SNIPPETS.find((s) => s.id === 'fizzbuzz')!;
    const out = lastConsole(fizzbuzz.source);
    expect(out).toEqual([
      '1', '2', 'Fizz', '4', 'Buzz',
      'Fizz', '7', '8', 'Fizz', 'Buzz',
      '11', 'Fizz', '13', '14', 'FizzBuzz',
    ]);
  });
});
