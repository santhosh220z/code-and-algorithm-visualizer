import type { TreeNode, TreeHighlight } from '../../core/types';

const NODE_FILL: Record<TreeHighlight['kind'], string> = {
  visit: '#3b5b82',
  insert: '#4ade80',
  delete: '#f87171',
  search: '#fbbf24',
  current: '#a855f7',
  trail: '#60a5fa',
};

const NODE_STROKE: Record<TreeHighlight['kind'], string> = {
  visit: '#60a5fa',
  insert: '#86efac',
  delete: '#fca5a5',
  search: '#fcd34d',
  current: '#c084fc',
  trail: '#93c5fd',
};

const NODE_RADIUS = 18;
const H_SPACING = 60;
const V_SPACING = 70;

export function TreeViz({ nodes, highlights }: { nodes: TreeNode[]; highlights: TreeHighlight[] }) {
  if (nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-[#4a4d5a] italic">
        No tree to visualize
      </div>
    );
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const hiMap = new Map(highlights.map((h) => [h.nodeId, h]));

  const roots = nodes.filter((n) => !n.parent || !nodeMap.has(n.parent));

  const computePositions = (node: TreeNode, depth: number, xOffset: number): number => {
    const children = nodes.filter((n) => n.parent === node.id);
    if (children.length === 0) {
      node.x = xOffset;
      node.y = depth * V_SPACING + 40;
      return xOffset + H_SPACING;
    }

    let childX = xOffset;
    for (const child of children) {
      childX = computePositions(child, depth + 1, childX);
    }
    node.x = (children[0].x + children[children.length - 1].x) / 2;
    node.y = depth * V_SPACING + 40;
    return childX;
  };

  const positionedNodes = [...nodes];
  computePositions(roots[0], 0, 40);

  const width = Math.max(800, Math.max(...positionedNodes.map((n) => n.x)) + 80);
  const height = Math.max(400, Math.max(...positionedNodes.map((n) => n.y)) + 60);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="max-w-full max-h-full">
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
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#3a3d49" />
          </marker>
        </defs>

        {/* Edges */}
        {positionedNodes.map((node) => {
          if (node.left && nodeMap.has(node.left)) {
            const child = nodeMap.get(node.left)!;
            return (
              <line
                key={`edge-${node.id}-${node.left}`}
                x1={node.x}
                y1={node.y + NODE_RADIUS}
                x2={child.x}
                y2={child.y - NODE_RADIUS}
                stroke="#3a3d49"
                strokeWidth={1.5}
                markerEnd="url(#arrow)"
                style={{ pointerEvents: 'none' }}
              />
            );
          }
          if (node.right && nodeMap.has(node.right)) {
            const child = nodeMap.get(node.right)!;
            return (
              <line
                key={`edge-${node.id}-${node.right}`}
                x1={node.x}
                y1={node.y + NODE_RADIUS}
                x2={child.x}
                y2={child.y - NODE_RADIUS}
                stroke="#3a3d49"
                strokeWidth={1.5}
                markerEnd="url(#arrow)"
                style={{ pointerEvents: 'none' }}
              />
            );
          }
          return null;
        })}

        {/* Nodes */}
        {positionedNodes.map((node) => {
          const hi = hiMap.get(node.id);
          const kind = hi?.kind;
          const fill = kind ? NODE_FILL[kind] : '#23242f';
          const stroke = kind ? NODE_STROKE[kind] : '#3a3d49';

          return (
            <g key={node.id} style={{ transition: 'all 200ms ease' }}>
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
                fill={fill}
                stroke={stroke}
                strokeWidth={kind ? 2 : 1}
                style={{
                  filter: kind === 'current' ? 'drop-shadow(0 0 4px #a855f7)' : undefined,
                }}
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={13}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
                fill={kind ? '#0f1015' : '#c8ccd8'}
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