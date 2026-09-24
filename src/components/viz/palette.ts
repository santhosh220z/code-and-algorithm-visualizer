/**
 * Shared visualization palette.
 *
 * Every visualizer reads its colors from here so the data palette is defined
 * once. Values reference CSS custom properties from `src/index.css`, so the
 * theme can be retuned in a single place.
 *
 * Rule: these hues are reserved for DATA. Brand chrome uses --color-accent.
 */

export const VIZ = {
  compare: 'var(--color-compare)',
  swap: 'var(--color-swap)',
  sorted: 'var(--color-sorted)',
  active: 'var(--color-active)',
  pivot: 'var(--color-pivot)',
  trail: 'var(--color-trail)',
  idle: 'var(--color-bar-idle)',
  idleStrong: 'var(--color-bar-idle-strong)',
  nodeFill: 'var(--color-node-fill)',
  nodeStroke: 'var(--color-node-stroke)',
} as const;

export const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
