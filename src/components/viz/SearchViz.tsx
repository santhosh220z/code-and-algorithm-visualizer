import type { ArrayHighlight, SearchWindow } from '../../core/types';
import { MOTION, VIZ, resolveVisualState, staggerDelay } from './palette';

const CELL = 64;
const CELL_H = 54;
const GAP = 8;
const PAD = 18;
const TOP_LABEL = 22;
const BOTTOM_LABEL = 26;

interface SearchVizProps {
  array: number[];
  highlights: ArrayHighlight[];
  window: SearchWindow | null;
  found: number | null;
}

export function SearchViz({ array, highlights, window, found }: SearchVizProps) {
  const n = array.length;
  if (n === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm italic" style={{ color: VIZ.textDim }}>
        Nothing to search — the array is empty.
      </div>
    );
  }

  const kindOf = new Map<number, ArrayHighlight['kind']>();
  for (const h of highlights) kindOf.set(h.index, h.kind);

  const width = n * CELL + (n - 1) * GAP + PAD * 2;
  const cellsTop = TOP_LABEL;
  const cellsBottom = cellsTop + CELL_H;
  const height = cellsBottom + BOTTOM_LABEL + 10;

  const inRange = (i: number) => window !== null && i >= window.left && i <= window.right;
  const rangeStart = window ? window.left : 0;
  const rangeEnd = window ? window.right : -1;
  const hasRange = window !== null && window.right >= window.left;
  const bracketX = PAD + rangeStart * (CELL + GAP) - 5;
  const bracketW = (rangeEnd - rangeStart + 1) * (CELL + GAP) - GAP + 10;

  const caption = found !== null
    ? `Found at index ${found}`
    : hasRange
      ? `Still searching ${rangeEnd - rangeStart + 1} of ${n} element${n === 1 ? '' : 's'}`
      : 'Search range empty — target is not in this array';

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-auto p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="img"
        aria-label={`Sorted array of ${n} elements with the active search range from index ${rangeStart} to ${rangeEnd}. ${caption}.`}
      >
        {hasRange && (
          <>
            <rect
              x={bracketX}
              y={cellsTop - 5}
              width={bracketW}
              height={CELL_H + 10}
              rx={8}
              fill="none"
              stroke={VIZ.active}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              style={{ transition: MOTION.geometry }}
            />
            <text
              x={bracketX + bracketW / 2}
              y={TOP_LABEL - 9}
              textAnchor="middle"
              fontSize={10}
              fontFamily={VIZ.fontCode}
              fontWeight={600}
              fill={VIZ.active}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              range [{rangeStart}..{rangeEnd}]
            </text>
          </>
        )}

        {array.map((value, i) => {
          const kind = kindOf.get(i);
          const state = resolveVisualState(kind);
          const x = PAD + i * (CELL + GAP);
          const active = inRange(i);
          const fill = kind ? state.fill : active ? VIZ.nodeFill : VIZ.idle;
          const stroke = kind ? state.stroke : active ? VIZ.nodeStroke : VIZ.idleStrong;
          const textColor = kind ? state.text : active ? VIZ.label : VIZ.labelCanvas;

          return (
            <g
              key={i}
              className={kind === 'compare' || kind === 'sorted' ? 'anim-viz-pulse' : ''}
              style={{ transition: MOTION.node, opacity: active || kind ? 1 : 0.42, transitionDelay: staggerDelay(i, highlights.length) }}
            >
              <rect
                x={x}
                y={cellsTop}
                width={CELL}
                height={CELL_H}
                rx={7}
                fill={fill}
                stroke={stroke}
                strokeWidth={kind ? 2 : 1}
                style={{
                  filter: kind === 'current' || kind === 'compare'
                    ? `drop-shadow(0 0 ${VIZ.glowSm} ${VIZ.current})`
                    : undefined,
                }}
              />
              <text
                x={x + CELL / 2}
                y={cellsTop + CELL_H / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={16}
                fontFamily={VIZ.fontCode}
                fontWeight={600}
                fill={textColor}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {value}
              </text>
              <text
                x={x + CELL / 2}
                y={cellsBottom + 15}
                textAnchor="middle"
                fontSize={10}
                fontFamily={VIZ.fontCode}
                fill={active || kind ? VIZ.labelCanvas : VIZ.labelCanvas}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {i}
              </text>
            </g>
          );
        })}

        <text
          x={width / 2}
          y={cellsBottom + 26}
          textAnchor="middle"
          fontSize={11}
          fontFamily={VIZ.fontCode}
          fontWeight={600}
          fill={found !== null ? VIZ.sorted : hasRange ? VIZ.labelCanvas : VIZ.textDim}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {caption}
        </text>
      </svg>
    </div>
  );
}
