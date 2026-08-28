export const HANOI_PEG_X: Record<'A' | 'B' | 'C', number> = { A: 150, B: 360, C: 570 };
export const HANOI_BASE_Y = 180;
export const HANOI_DISK_H = 22;
export const HANOI_VIEW_W = 720;
export const HANOI_VIEW_H = 260;

export function hanoiDiskWidth(disk: number): number {
  return 52 + disk * 34;
}

/** Resting y (center) of a disk at stack `index` (0 = bottom) on a peg. */
export function hanoiRestY(index: number): number {
  return HANOI_BASE_Y - (index + 1) * HANOI_DISK_H;
}

/** Height at which a picked-up disk hovers just above the source peg. */
export function hanoiHoverY(): number {
  return 6;
}
