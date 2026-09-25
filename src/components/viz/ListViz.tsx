import type { ListNode, ListHighlight, ListVizVariant } from '../../core/types';
import { MOTION, VIZ, resolveVisualState } from './palette';
import { orderListNodes } from './layouts';
import { useCanvasSize } from './useCanvasSize';

const NODE_WIDTH = 60;
const NODE_HEIGHT = 40;
const ARROW_SIZE = 12;
const GAP = 20;

const STACK_CAPACITY = 5;
const QUEUE_CAPACITY = 6;

const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);

function Cell({
  x,
  y,
  width,
  height,
  value,
  highlight,
  fontSize,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number | string;
  highlight?: ListHighlight;
  fontSize: number;
}) {
  const kind = highlight?.kind;
  const state = resolveVisualState(kind);
  const fill = kind ? state.fill : VIZ.nodeFill;
  const stroke = kind ? state.stroke : VIZ.nodeStroke;

  // A newly inserted element pops in; an existing one that just became the
  // active end pulses. They must be exclusive — both set the `animation`
  // shorthand, so stacking the classes would silently drop the pop.
  const motionClass = kind === 'insert' ? 'anim-viz-pop' : kind === 'current' ? 'anim-viz-pulse' : '';

  return (
    <g className={motionClass} style={{ transition: MOTION.node }}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={Math.min(12, height * 0.22)}
        fill={fill}
        stroke={stroke}
        strokeWidth={kind ? 2.5 : 1.5}
        style={{
          filter: kind ? `drop-shadow(0 0 ${VIZ.glowSm} ${state.stroke})` : undefined,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontFamily={VIZ.fontCode}
        fontWeight={700}
        fill={kind ? state.text : VIZ.label}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {value}
      </text>
    </g>
  );
}

function Caption({
  x,
  y,
  text,
  color,
  fontSize = 12,
  anchor = 'middle',
}: {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize?: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={fontSize}
      fontFamily={VIZ.fontCode}
      fontWeight={600}
      fill={color}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      {text}
    </text>
  );
}

function StackViz({
  nodes,
  highlights,
  width,
  height,
}: {
  nodes: ListNode[];
  highlights: ListHighlight[];
  width: number;
  height: number;
}) {
  const hiMap = new Map(highlights.map((h) => [h.nodeId, h]));
  // A stack grows upward: the last value is the top.
  const visible = nodes.slice(-STACK_CAPACITY);
  const hiddenBelow = nodes.length - visible.length;

  const margin = 18;
  const gap = 8;
  const labelZone = 32;
  const available = height - labelZone - margin;
  const cellH = clamp(38, available / (STACK_CAPACITY + (STACK_CAPACITY - 1) * (gap / 100)), 130);
  const gapY = Math.max(5, cellH * 0.12);
  const cellW = Math.min(width * 0.52, cellH * 2.05);
  const wallPad = cellW * 0.16;
  const tubeW = cellW + wallPad * 2;
  const tubeX = Math.round((width - tubeW) / 2);
  const tubeTop = labelZone;
  const tubeBottom = height - margin;
  const fontSize = clamp(15, cellH * 0.5, 46);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`Stack with ${nodes.length} element${nodes.length === 1 ? '' : 's'}${
        nodes.length ? `, top of stack is ${nodes[nodes.length - 1].value}` : ', currently empty'
      }`}
    >
      {/* open-topped tube: two walls, drawn slightly proud of the topmost cell */}
      <line x1={tubeX} y1={tubeTop} x2={tubeX} y2={tubeBottom} stroke={VIZ.borderStrong} strokeWidth={2.5} strokeLinecap="round" />
      <line
        x1={tubeX + tubeW}
        y1={tubeTop}
        x2={tubeX + tubeW}
        y2={tubeBottom}
        stroke={VIZ.borderStrong}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      <Caption x={tubeX + tubeW / 2} y={tubeTop - 11} text="TOP" color={VIZ.labelCanvas} fontSize={13} />

      {visible.length === 0 && (
        <Caption x={tubeX + tubeW / 2} y={tubeBottom - cellH / 2} text="empty stack" color={VIZ.labelCanvas} fontSize={14} />
      )}

      {visible.map((node, i) => {
        const fromBottom = visible.length - 1 - i;
        const y = tubeBottom - (fromBottom + 1) * cellH - fromBottom * gapY;
        return (
          <Cell
            key={node.id}
            x={tubeX + wallPad}
            y={Math.round(y)}
            width={cellW}
            height={Math.round(cellH)}
            value={node.value}
            highlight={hiMap.get(node.id)}
            fontSize={fontSize}
          />
        );
      })}

      {hiddenBelow > 0 && (
        <Caption
          x={width / 2}
          y={height - 4}
          text={`${hiddenBelow} older value${hiddenBelow === 1 ? '' : 's'} further down`}
          color={VIZ.labelCanvas}
          fontSize={11}
        />
      )}
    </svg>
  );
}

function QueueViz({
  nodes,
  highlights,
  width,
  height,
}: {
  nodes: ListNode[];
  highlights: ListHighlight[];
  width: number;
  height: number;
}) {
  const hiMap = new Map(highlights.map((h) => [h.nodeId, h]));
  // A queue fills from the front; the rear end grows to the right.
  const visible = nodes.slice(0, QUEUE_CAPACITY);
  const hiddenBehind = nodes.length - visible.length;

  const margin = 24;
  const gap = 8;
  const available = width - margin * 2;
  const cellW = clamp(56, available / (QUEUE_CAPACITY + (QUEUE_CAPACITY - 1) * (gap / 100)), 210);
  const gapX = Math.max(5, cellW * 0.12);
  const cellH = clamp(40, Math.min(cellW * 0.66, height * 0.5), 130);
  const wallPad = cellH * 0.18;
  const tubeH = cellH + wallPad * 2;
  const tubeY = Math.round((height - tubeH) / 2);
  const tubeX = margin;
  const tubeRight = width - margin;
  const fontSize = clamp(14, cellH * 0.46, 46);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`Queue with ${nodes.length} element${nodes.length === 1 ? '' : 's'}${
        nodes.length ? `, front is ${nodes[0].value}` : ', currently empty'
      }`}
    >
      <line x1={tubeX} y1={tubeY} x2={tubeRight} y2={tubeY} stroke={VIZ.borderStrong} strokeWidth={2.5} strokeLinecap="round" />
      <line
        x1={tubeX}
        y1={tubeY + tubeH}
        x2={tubeRight}
        y2={tubeY + tubeH}
        stroke={VIZ.borderStrong}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      <Caption x={tubeX + 8} y={tubeY - 12} text="FRONT" color={VIZ.labelCanvas} fontSize={12} anchor="start" />
      <Caption x={tubeRight - 8} y={tubeY - 12} text="REAR" color={VIZ.labelCanvas} fontSize={12} anchor="end" />

      {visible.length === 0 && (
        <Caption x={(tubeX + tubeRight) / 2} y={tubeY + tubeH / 2 + 5} text="empty queue" color={VIZ.labelCanvas} fontSize={14} />
      )}

      {visible.map((node, i) => (
        <Cell
          key={node.id}
          x={Math.round(tubeX + i * (cellW + gapX))}
          y={Math.round(tubeY + wallPad)}
          width={Math.round(cellW)}
          height={Math.round(cellH)}
          value={node.value}
          highlight={hiMap.get(node.id)}
          fontSize={fontSize}
        />
      ))}

      {hiddenBehind > 0 && (
        <Caption
          x={width / 2}
          y={height - 6}
          text={`${hiddenBehind} more waiting at the rear`}
          color={VIZ.labelCanvas}
          fontSize={11}
        />
      )}
    </svg>
  );
}

function LinkedViz({ nodes, highlights }: { nodes: ListNode[]; highlights: ListHighlight[] }) {
  const hiMap = new Map(highlights.map((h) => [h.nodeId, h]));
  const orderedNodes = orderListNodes(nodes);
  const totalWidth = orderedNodes.length * (NODE_WIDTH + GAP) - GAP + ARROW_SIZE;
  const centerX = totalWidth / 2;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <svg
        viewBox={`-${centerX} -60 ${totalWidth} 120`}
        className="max-h-full max-w-full"
        style={{ minWidth: '100%' }}
        role="img"
        aria-label="Linked data structure with highlighted operation states"
      >
        <defs>
          <marker
            id="list-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill={VIZ.edge} />
          </marker>
        </defs>

        {orderedNodes.map((node, i) => {
          const hi = hiMap.get(node.id);
          const kind = hi?.kind;
          const state = resolveVisualState(kind);
          const fill = kind ? state.fill : VIZ.idle;
          const stroke = kind ? state.stroke : VIZ.idleStrong;

          const x = i * (NODE_WIDTH + GAP);
          const y = 0;

          return (
            <g key={node.id} className="anim-viz-pop" style={{ transition: MOTION.node }}>
              <rect
                x={x}
                y={y - NODE_HEIGHT / 2}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={6}
                fill={fill}
                stroke={stroke}
                strokeWidth={kind ? 2 : 1}
                style={{
                  filter: kind === 'current' ? `drop-shadow(0 0 ${VIZ.glowSm} ${VIZ.current})` : undefined,
                }}
              />
              <text
                x={x + NODE_WIDTH / 2}
                y={y + 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={14}
                fontFamily={VIZ.fontCode}
                fontWeight={600}
                fill={kind ? state.text : VIZ.label}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.value}
              </text>

              {node.next && i < orderedNodes.length - 1 && (
                <line
                  x1={x + NODE_WIDTH}
                  y1={y}
                  x2={x + NODE_WIDTH + GAP}
                  y2={y}
                  stroke={VIZ.edge}
                  strokeWidth={1.5}
                  markerEnd="url(#list-arrow)"
                  style={{ pointerEvents: 'none' }}
                />
              )}

              {node.next === undefined && (
                <g>
                  <line
                    x1={x + NODE_WIDTH}
                    y1={y - 8}
                    x2={x + NODE_WIDTH + 16}
                    y2={y + 8}
                    stroke={VIZ.edge}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    style={{ pointerEvents: 'none' }}
                  />
                  <line
                    x1={x + NODE_WIDTH}
                    y1={y + 8}
                    x2={x + NODE_WIDTH + 16}
                    y2={y - 8}
                    stroke={VIZ.edge}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    style={{ pointerEvents: 'none' }}
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ListViz({
  nodes,
  highlights,
  variant = 'linked',
}: {
  nodes: ListNode[];
  highlights: ListHighlight[];
  variant?: ListVizVariant;
}) {
  const { ref, size } = useCanvasSize();

  if (variant === 'linked') {
    if (nodes.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-sm italic" style={{ color: VIZ.textDim }}>
          No list to visualize
        </div>
      );
    }
    return <LinkedViz nodes={nodes} highlights={highlights} />;
  }

  const label = variant === 'stack' ? 'stack' : 'queue';

  return (
    <div ref={ref} className="h-full w-full overflow-hidden p-3">
      {size.width > 0 && size.height > 0 &&
        (variant === 'stack' ? (
          <StackViz nodes={nodes} highlights={highlights} width={size.width} height={size.height} />
        ) : (
          <QueueViz nodes={nodes} highlights={highlights} width={size.width} height={size.height} />
        ))}
      <span className="sr-only">{nodes.length === 0 ? `empty ${label}` : `${nodes.length} items in the ${label}`}</span>
    </div>
  );
}
