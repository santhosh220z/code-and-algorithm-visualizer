import { describe, expect, it } from 'vitest';
import { STEP_BASE_MS, motionScale, motionVars, staggerDelay } from '../components/viz/palette';

describe('motion scale', () => {
  it('mirrors the autoplay cadence so motion never outruns a step', () => {
    // 1x -> 700ms interval, but the static ceiling keeps transitions comfortable
    expect(motionScale(1)).toBe(320);
    expect(STEP_BASE_MS).toBe(700);
  });

  it('shrinks monotonically as playback speeds up', () => {
    const scales = [0.5, 1, 2, 4, 8].map(motionScale);
    for (let i = 1; i < scales.length; i += 1) {
      expect(scales[i]).toBeLessThanOrEqual(scales[i - 1]);
    }
  });

  it('stays well under the step interval at every speed', () => {
    for (const speed of [0.5, 1, 2, 4, 8]) {
      const interval = Math.max(16, STEP_BASE_MS / speed);
      expect(motionScale(speed)).toBeLessThan(interval);
    }
  });

  it('clamps at both ends and survives bogus input', () => {
    expect(motionScale(0.5)).toBe(320);
    expect(motionScale(0.25)).toBeLessThanOrEqual(320);
    expect(motionScale(8)).toBeGreaterThanOrEqual(60);
    expect(motionScale(0)).toBe(motionScale(1));
    expect(motionScale(Number.NaN)).toBe(motionScale(1));
    expect(motionScale(Number.POSITIVE_INFINITY)).toBe(motionScale(1));
  });

  it('emits the four custom properties the visualizers consume', () => {
    const vars = motionVars(2);
    expect(Object.keys(vars).sort()).toEqual([
      '--viz-motion-fast',
      '--viz-motion-normal',
      '--viz-motion-pointer',
      '--viz-motion-slow',
    ]);
    for (const value of Object.values(vars)) expect(value).toMatch(/^\d+ms$/);
  });
});

describe('stagger', () => {
  it('does not delay anything when a single element changed', () => {
    expect(staggerDelay(0, 1)).toBe('0ms');
    expect(staggerDelay(7, 1)).toBe('0ms');
  });

  it('cascades multi-element changes', () => {
    expect(staggerDelay(0, 3)).toBe('0ms');
    expect(staggerDelay(1, 3)).toBe('14ms');
    expect(staggerDelay(2, 3)).toBe('28ms');
  });

  it('caps the cascade so long arrays do not lag', () => {
    expect(staggerDelay(50, 30)).toBe('120ms');
  });
});
