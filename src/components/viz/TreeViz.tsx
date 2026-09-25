import type { TreeNode, TreeHighlight } from '../../core/types';
import { MOTION, VIZ, resolveVisualState } from './palette';
import { getTreeEdges, layoutTreeNodes } from './layouts';

const NODE_RADIUS = 18;

export function TreeViz({ nodes, highlights }: { nodes: TreeNode[]; highlights: TreeHighlight[] }) {
  if (nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm italic" style={{ color: VIZ.textDim }}>
        No tree to visualize
      </div>
    );
  }

  const hiMap = new Map(highlights.map((h) => [h.nodeId, h]));
  const positionedNodes = layoutTreeNodes(nodes);
  const positionedById = new Map(positionedNodes.map((node) => [node.id, node]));
  const edges = getTreeEdges(positionedNodes);

  const width = Math.max(800, Math.max(...positionedNodes.map((n) => n.x)) + 80);
  const height = Math.max(400, Math.max(...positionedNodes.map((n) => n.y)) + 60);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="max-h-full max-w-full"
        role="img"
        aria-label="Tree visualization with highlighted search states"
      >
        <defs>
          <marker
            id="arrow"
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

        {/* Edges */}
        {edges.map((edge) => {
          const parent = positionedById.get(edge.from);
          const child = positionedById.get(edge.to);
          if (!parent || !child) return null;
          return (
            <line
              key={`edge-${edge.from}-${edge.to}`}
              x1={parent.x}
              y1={parent.y + NODE_RADIUS}
              x2={child.x}
              y2={child.y - NODE_RADIUS}
              stroke={VIZ.edge}
              strokeWidth={1.5}
              markerEnd="url(#arrow)"
              style={{ pointerEvents: 'none' }}
            />
          );
        })}

        {/* Nodes */}
        {positionedNodes.map((node) => {
          const hi = hiMap.get(node.id);
          const kind = hi?.kind;
          const state = resolveVisualState(kind);
          const fill = kind ? state.fill : VIZ.idle;
          const stroke = kind ? state.stroke : VIZ.idleStrong;

          return (
            <g key={node.id} className="anim-viz-pop" style={{ transition: MOTION.node }}>
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
                fill={fill}
                stroke={stroke}
                strokeWidth={kind ? 2 : 1}
                style={{
                  filter: kind === 'current' ? `drop-shadow(0 0 ${VIZ.glowSm} ${VIZ.current})` : undefined,
                }}
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={13}
                fontFamily={VIZ.fontCode}
                fontWeight={600}
                fill={kind ? state.text : VIZ.label}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}