import type { CallFrame } from '../../core/types';
import { MOTION, VIZ } from './palette';
import { useCanvasSize } from './useCanvasSize';

const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);
const CAPACITY = 12;

interface CallStackVizProps {
  frames: CallFrame[];
  currentId: string | null;
  result?: number;
}

/**
 * The call stack, innermost call at the top. Descending pushes a new frame on top;
 * unwinding marks a frame with its return value, then it drops off.
 */
export function CallStackViz({ frames, currentId, result }: CallStackVizProps) {
  const { ref, size } = useCanvasSize();

  // newest call first; only the deepest CAPACITY frames fit the canvas
  const ordered = frames.slice(-CAPACITY).reverse();
  const hidden = Math.max(0, frames.length - CAPACITY);

  const width = size.width;
  const height = size.height;

  const cardH = clamp(38, (height - 74) / Math.max(1, CAPACITY), 66);
  const cardW = clamp(180, Math.min(width - 96, 420), width - 48);
  const cardX = Math.round((width - cardW) / 2);
  const gap = Math.max(4, cardH * 0.16);
  const top = Math.max(34, (height - (ordered.length * cardH + (ordered.length - 1) * gap)) / 2);
  const fontSize = clamp(13, cardH * 0.3, 19);

  const unwinding = ordered.some((frame) => frame.returned !== undefined);

  return (
    <div ref={ref} className="h-full w-full overflow-hidden p-3">
      {width > 0 && height > 0 && (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label={
            frames.length === 0
              ? result !== undefined
                ? `Call stack empty, factorial returned ${result}`
                : 'Call stack is empty'
              : `Call stack with ${frames.length} frame${frames.length === 1 ? '' : 's'}, innermost call ${frames[frames.length - 1].label}`
          }
        >
          <text
            x={width / 2}
            y={20}
            textAnchor="middle"
            fontSize={12}
            fontFamily={VIZ.fontCode}
            fontWeight={700}
            letterSpacing="0.1em"
            fill={VIZ.labelCanvas}
          >
            {frames.length === 0 ? 'STACK EMPTY' : unwinding ? 'UNWINDING' : 'CALL STACK'}
          </text>

          {ordered.map((frame, i) => {
            const isCurrent = frame.id === currentId;
            const isReturning = frame.returned !== undefined && isCurrent;
            const isWaiting = !isCurrent && frame.returned === undefined;
            const fill = isReturning
              ? VIZ.sorted
              : isCurrent
              ? VIZ.current
              : isWaiting
              ? VIZ.idle
              : VIZ.trail;
            const stroke = isCurrent || isReturning ? VIZ.onState : VIZ.idleStrong;
            const textColor = isCurrent || isReturning ? VIZ.onState : VIZ.label;
            const y = top + i * (cardH + gap);

            return (
              <g
                key={frame.id}
                className={isReturning ? 'anim-viz-pulse' : 'anim-viz-pop'}
                style={{ transition: MOTION.geometry }}
              >
                <rect
                  x={cardX}
                  y={y}
                  width={cardW}
                  height={cardH}
                  rx={Math.min(12, cardH * 0.22)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                  style={{
                    filter: isCurrent ? `drop-shadow(0 0 ${VIZ.glowSm} ${VIZ.current})` : undefined,
                  }}
                />
                <text
                  x={cardX + 16}
                  y={y + cardH / 2 + 1}
                  dominantBaseline="middle"
                  fontSize={fontSize * 0.85}
                  fontFamily={VIZ.fontCode}
                  fill={textColor}
                  opacity={0.7}
                >
                  {frames.length - i}
                </text>
                <text
                  x={cardX + 44}
                  y={y + cardH / 2 + 1}
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fontFamily={VIZ.fontCode}
                  fontWeight={700}
                  fill={textColor}
                >
                  {frame.label}
                </text>
                {frame.returned !== undefined && (
                  <text
                    x={cardX + cardW - 16}
                    y={y + cardH / 2 + 1}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={fontSize}
                    fontFamily={VIZ.fontCode}
                    fontWeight={700}
                    fill={textColor}
                  >
                    = {frame.returned}
                  </text>
                )}
              </g>
            );
          })}

          {ordered.length === 0 && (
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              fontSize={14}
              fontFamily={VIZ.fontCode}
              fontWeight={600}
              fill={VIZ.labelCanvas}
            >
              {result !== undefined ? `factorial returned ${result}` : 'no active calls'}
            </text>
          )}

          {hidden > 0 && (
            <text
              x={width / 2}
              y={height - 8}
              textAnchor="middle"
              fontSize={11}
              fontFamily={VIZ.fontCode}
              fill={VIZ.labelCanvas}
            >
              {`${hidden} outer frame${hidden === 1 ? '' : 's'} above`}
            </text>
          )}
        </svg>
      )}
    </div>
  );
}
