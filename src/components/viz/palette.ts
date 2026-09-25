import type { PointerRole } from '../../core/types';

export const VIZ = {
  compare: 'var(--viz-compare)',
  swap: 'var(--viz-swap)',
  sorted: 'var(--viz-sorted)',
  active: 'var(--viz-active)',
  pivot: 'var(--viz-current)',
  current: 'var(--viz-current)',
  frontier: 'var(--viz-frontier)',
  visited: 'var(--viz-visited)',
  path: 'var(--viz-path)',
  compute: 'var(--viz-compute)',
  trail: 'var(--viz-trail)',
  idle: 'var(--viz-idle)',
  idleStrong: 'var(--viz-idle-border)',
  nodeFill: 'var(--viz-node-fill)',
  nodeStroke: 'var(--viz-node-stroke)',
  gridEmpty: 'var(--viz-grid-empty)',
  wall: 'var(--viz-grid-wall)',
  gridWeight: 'var(--viz-grid-weight)',
  edge: 'var(--viz-edge)',
  start: 'var(--viz-start)',
  goal: 'var(--viz-goal)',
  label: 'var(--viz-label)',
  labelHalo: 'var(--viz-label-halo)',
  labelCanvas: 'var(--viz-label-canvas)',
  value: 'var(--viz-value)',
  valueCanvas: 'var(--viz-value-canvas)',
  canvas: 'var(--viz-canvas)',
  onState: 'var(--viz-on-strong)',
  onMuted: 'var(--viz-on-muted)',
  codeBg: 'var(--color-code-bg)',
  fontCode: 'var(--font-code)',
  fontUi: 'var(--font-ui)',
  glowXs: 'var(--viz-glow-xs)',
  glowSm: 'var(--viz-glow-sm)',
  glowMd: 'var(--viz-glow-md)',
  text: 'var(--color-text)',
  textMuted: 'var(--color-text-muted)',
  textDim: 'var(--color-text-dim)',
  border: 'var(--color-border)',
  borderStrong: 'var(--color-border-strong)',
  surface: 'var(--color-bg-elevated)',
  surfaceStrong: 'var(--color-surface-4)',
} as const;

export const POINTER_COLORS: Record<PointerRole, string> = {
  primary: 'var(--viz-pointer-primary)',
  secondary: 'var(--viz-pointer-secondary)',
  target: 'var(--viz-pointer-target)',
  pivot: 'var(--viz-pointer-pivot)',
  complete: 'var(--viz-pointer-complete)',
};

export const DISK_COLORS = [
  'var(--viz-disk-1)',
  'var(--viz-disk-2)',
  'var(--viz-disk-3)',
  'var(--viz-disk-4)',
  'var(--viz-disk-5)',
  'var(--viz-disk-6)',
  'var(--viz-disk-7)',
];

export interface VisualStateStyle {
  fill: string;
  stroke: string;
  text: string;
  glow: boolean;
  dashed: boolean;
}

const idleState: VisualStateStyle = {
  fill: VIZ.idle,
  stroke: VIZ.idleStrong,
  text: VIZ.label,
  glow: false,
  dashed: false,
};

export const VISUAL_STATES: Record<string, VisualStateStyle> = {
  idle: idleState,
  compare: { fill: VIZ.compare, stroke: VIZ.compare, text: VIZ.onState, glow: true, dashed: false },
  comparing: { fill: VIZ.compare, stroke: VIZ.compare, text: VIZ.onState, glow: true, dashed: false },
  swap: { fill: VIZ.swap, stroke: VIZ.swap, text: VIZ.onState, glow: true, dashed: false },
  relaxed: { fill: VIZ.swap, stroke: VIZ.swap, text: VIZ.onState, glow: true, dashed: false },
  sorted: { fill: VIZ.sorted, stroke: VIZ.sorted, text: VIZ.onState, glow: false, dashed: false },
  result: { fill: VIZ.path, stroke: VIZ.path, text: VIZ.onState, glow: false, dashed: false },
  insert: { fill: VIZ.sorted, stroke: VIZ.sorted, text: VIZ.onState, glow: false, dashed: false },
  delete: { fill: VIZ.compare, stroke: VIZ.compare, text: VIZ.onState, glow: true, dashed: false },
  pivot: { fill: VIZ.current, stroke: VIZ.current, text: VIZ.onState, glow: true, dashed: false },
  current: { fill: VIZ.current, stroke: VIZ.current, text: VIZ.onState, glow: true, dashed: false },
  compute: { fill: VIZ.compute, stroke: VIZ.compute, text: VIZ.onState, glow: true, dashed: false },
  read: { fill: VIZ.active, stroke: VIZ.active, text: VIZ.onState, glow: false, dashed: false },
  frontier: { fill: VIZ.frontier, stroke: VIZ.frontier, text: VIZ.onState, glow: false, dashed: true },
  visited: { fill: VIZ.visited, stroke: VIZ.active, text: VIZ.onState, glow: false, dashed: false },
  path: { fill: VIZ.path, stroke: VIZ.path, text: VIZ.onState, glow: false, dashed: false },
  search: { fill: VIZ.swap, stroke: VIZ.swap, text: VIZ.onState, glow: true, dashed: false },
  visit: { fill: VIZ.nodeFill, stroke: VIZ.active, text: VIZ.label, glow: false, dashed: false },
  trail: { fill: VIZ.trail, stroke: VIZ.active, text: VIZ.label, glow: false, dashed: true },
};

export function resolveVisualState(kind?: string): VisualStateStyle {
  return (kind && VISUAL_STATES[kind]) || idleState;
}

export const EASE = 'var(--ease-smooth)';
export const SPRING = 'var(--ease-out-back)';

/* --------------------------------- motion --------------------------------- */

/** Mirrors the autoplay cadence in PlayerControls so motion never outruns a step. */
export const STEP_BASE_MS = 700;

/**
 * Scales motion to playback speed. Transitions longer than the step interval
 * stack up and smear the canvas, so the base duration is capped at ~55% of it.
 */
export function motionScale(speed: number): number {
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
  const interval = Math.max(16, STEP_BASE_MS / safeSpeed);
  // The floor keeps motion visible, but never lets it exceed the step interval.
  const floor = Math.min(90, interval * 0.9);
  return Math.min(320, Math.round(Math.max(floor, interval * 0.55)));
}

export function motionVars(speed: number): Record<string, string> {
  const base = motionScale(speed);
  return {
    '--viz-motion-fast': `${Math.max(60, Math.round(base * 0.7))}ms`,
    '--viz-motion-normal': `${base}ms`,
    '--viz-motion-slow': `${Math.round(base * 1.25)}ms`,
    '--viz-motion-pointer': `${Math.round(base * 1.1)}ms`,
  };
}

const FAST = 'var(--viz-motion-fast)';
const NORMAL = 'var(--viz-motion-normal)';
const POINTER = 'var(--viz-motion-pointer)';
const STANDARD = 'var(--ease-standard)';
const EMPHASIZED = 'var(--ease-emphasized)';
const LINEAR = 'var(--ease-linear)';

/**
 * Shared transition presets. Always name the properties — `transition: all` also
 * animates geometry we never meant to move, and costs a repaint per property.
 */
export const MOTION = {
  color: `${FAST} ${LINEAR}`,
  fill: `fill ${FAST} ${STANDARD}, stroke ${FAST} ${STANDARD}`,
  node: `fill ${FAST} ${STANDARD}, stroke ${FAST} ${STANDARD}, opacity ${FAST} ${LINEAR}`,
  geometry: `x ${FAST} ${STANDARD}, y ${FAST} ${STANDARD}, width ${FAST} ${STANDARD}, height ${FAST} ${STANDARD}`,
  edge: `stroke ${FAST} ${STANDARD}, stroke-width ${FAST} ${STANDARD}`,
  bar: {
    height: NORMAL,
    size: `height ${NORMAL} ${STANDARD}, background-color ${FAST} ${LINEAR}, transform ${NORMAL} ${STANDARD}`,
  },
  swap: `transform ${NORMAL} ${EMPHASIZED}`,
  pointer: `left ${POINTER} ${STANDARD}, transform ${POINTER} ${STANDARD}`,
  enter: `${NORMAL} ${EMPHASIZED}`,
} as const;

/** Delay for the nth element of a multi-element change, capped so cascades stay tight. */
export function staggerDelay(index: number, changedCount: number): string {
  if (changedCount < 2) return '0ms';
  return `${Math.min(index * 14, 120)}ms`;
}
