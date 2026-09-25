import { useEffect, useRef, useState } from 'react';
import type { ArrayHighlight, Pointer } from '../../core/types';
import { MOTION, POINTER_COLORS, VIZ, resolveVisualState, staggerDelay } from './palette';

interface ArrayVizProps {
  array: number[];
  highlights: ArrayHighlight[];
  pointers: Pointer[];
  compact?: boolean;
}

/** Line box of the 11px mono value label, plus the gap kept above the row. */
const VALUE_LINE_H = 17;
const VALUE_HEADROOM = VALUE_LINE_H + 6;

export function ArrayViz({ array, highlights, pointers, compact = false }: ArrayVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(compact ? 420 : 760);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => setAvailableWidth(Math.max(160, element.clientWidth - 8));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [array.length, compact]);

  if (array.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm italic" style={{ color: VIZ.textDim }}>
        No data to visualize
      </div>
    );
  }

  const max = Math.max(...array, 1);
  const n = array.length;
  const gap = n > 40 ? 1 : compact ? 1 : 3;
  const barW = Math.max(compact ? 3 : 5, Math.min(compact ? 7 : 48, (availableWidth - gap * (n - 1)) / n));
  const chartH = compact ? 52 : availableWidth < 360 ? 120 : availableWidth < 520 ? 180 : 260;

  // Latest highlight wins per index
  const kindOf = new Map<number, ArrayHighlight['kind']>();
  for (const h of highlights) kindOf.set(h.index, h.kind);
  const changedCount = kindOf.size;

  // Stack row per pointer at the same index; keyed by label so arrows GLIDE.
  const rowOf = new Map<string, number>();
  const seenAt = new Map<number, number>();
  for (const p of pointers) {
    const row = seenAt.get(p.index) ?? 0;
    rowOf.set(p.label, row);
    seenAt.set(p.index, row + 1);
  }

  return (
    <div ref={containerRef} className="flex h-full w-full flex-col justify-end overflow-hidden">
      <div className="flex-1" />

      {/* Pointer labels — keyed by label + absolute left so they animate between indices */}
        <div className="relative mx-auto h-6" style={{ width: n * (barW + gap) }}>
        {pointers.map((p) => {
          const row = rowOf.get(p.label) ?? 0;
          return (
            <div
              key={p.label}
              className="absolute bottom-0 flex flex-col items-center"
              style={{
                left: p.index * (barW + gap),
                transform: `translateX(${barW / 2}px) translateY(-${row * 11}px)`,
                transition: MOTION.pointer,
              }}
            >
              <span
                className="text-[10px] font-mono font-semibold leading-tight whitespace-nowrap"
                style={{ color: p.color ?? POINTER_COLORS[p.role ?? 'primary'] }}
              >
                ▾{p.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bars */}
      <div className="flex items-end mx-auto" style={{ gap: `${gap}px`, height: chartH + 24 + VALUE_HEADROOM }}>
        {array.map((value, i) => {
          const kind = kindOf.get(i);
          const state = resolveVisualState(kind);
          const color = state.fill;
          const h = Math.max(6, (value / max) * chartH);
          // Sit the number inside the pillar when it fits, otherwise just above it.
          const valueInside = h >= VALUE_LINE_H + 3;
          const valueColor = kind ? state.text : valueInside ? VIZ.value : VIZ.valueCanvas;
          const active = kind === 'current' || kind === 'compare' || kind === 'pivot';
          const barTransition =
            kind === 'swap'
              ? `height ${MOTION.bar.height}, background-color ${MOTION.color}, transform ${MOTION.bar.height} var(--ease-emphasized), box-shadow ${MOTION.bar.height}`
              : `${MOTION.bar.size}, box-shadow ${MOTION.bar.height}`;
          return (
            <div key={i} className="relative shrink-0" style={{ width: barW }}>
              {/* Value label rides the pillar and never sits on the canvas grid */}
              {!compact && n <= 30 && (
                <span
                  className={`absolute left-1/2 z-10 -translate-x-1/2 text-center font-mono text-[11px] leading-none ${
                    kind ? 'font-bold' : ''
                  }`}
                  style={{
                    top: valueInside ? 4 : -(VALUE_LINE_H + 2),
                    width: barW * 2,
                    color: valueColor,
                    transition: `top ${MOTION.bar.height}, color ${MOTION.color}`,
                  }}
                >
                  {value}
                </span>
              )}
              {/* Pulse lives on a wrapper: an animation on `transform` would override
                  the inline lift/scale transform on the pillar itself. */}
              <div className={active ? 'anim-viz-pulse' : undefined} style={{ height: `${h}px` }}>
                <div
                  className="h-full w-full rounded-t-[var(--radius-control)]"
                  style={{
                    background: color,
                    boxShadow: state.glow ? `0 0 ${VIZ.glowMd} ${color}` : 'none',
                    transform:
                      kind === 'swap'
                        ? 'scaleY(1.07)'
                        : kind === 'compare' || kind === 'current'
                        ? 'translateY(-3px)'
                        : 'none',
                    transition: barTransition,
                    transitionDelay: staggerDelay(i, changedCount),
                  }}
                />
              </div>
              {!compact && n <= 20 && (
                <span className="mt-0.5 block select-none text-center font-mono text-[10px]" style={{ color: VIZ.valueCanvas }}>
                  {i}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}