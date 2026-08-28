export const HANOI_PEG_X: Record<'A' | 'B' | 'C', number> = { A: 150, B: 360, C: 570 };
export const HANOI_BASE_Y = 180;
export const HANOI_DISK_H = 22;
export const HANOI_VIEW_W = 720;
export const HANOI_VIEW_H = 260;

/** Number of in-between frames to render while a disk travels between pegs. */
export const HANOI_MOTION_FRAMES = 6;

export function hanoiDiskWidth(disk: number): number {
  return 52 + disk * 34;
}

/** Resting y (center) of a disk at stack `index` (0 = bottom) on a peg. */
export function hanoiRestY(index: number): number {
  return HANOI_BASE_Y - (index + 1) * HANOI_DISK_H;
}

/** Height at which an in-flight disk hovers above the stacks. */
export function hanoiHoverY(): number {
  return 6;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/**
 * Position of a disk travelling from fromX to toX while lifting off the source
 * peg and settling onto the destination peg. Traces a smooth quadratic arc.
 */
export function hanoiInterpolate(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  t: number
): { x: number; y: number } {
  const tt = clamp01(t);
  const midX = (fromX + toX) / 2;
  const midY = Math.min(fromY, toY, hanoiHoverY());

  // quadratic bezier: p0 -> p1 -> p2
  const x =
    Math.pow(1 - tt, 2) * fromX + 2 * (1 - tt) * tt * midX + Math.pow(tt, 2) * toX;
  const y =
    Math.pow(1 - tt, 2) * fromY + 2 * (1 - tt) * tt * midY + Math.pow(tt, 2) * toY;
  return { x, y };
}

export function hanoiMidpoint(fromX: number, toX: number): number {
  return (fromX + toX) / 2;
}
