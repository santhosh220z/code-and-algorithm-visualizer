import type { ListNode, ListHighlight } from '../../core/types';

const NODE_FILL: Record<ListHighlight['kind'], string> = {
  visit: '#3b5b82',
  insert: '#4ade80',
  delete: '#f87171',
  current: '#a855f7',
  trail: '#60a5fa',
};

const NODE_STROKE: Record<ListHighlight['kind'], string> = {
  visit: '#60a5fa',
  insert: '#86efac',
  delete: '#fca5a5',
  current: '#c084fc',
  trail: '#93c5fd',
};

const NODE_WIDTH = 60;
const NODE_HEIGHT = 40;
const ARROW_SIZE = 12;
const GAP = 20;

export function ListViz({ nodes, highlights }: { nodes: ListNode[]; highlights: ListHighlight[] }) {
  if (nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-[#4a4d5a] italic">
        No list to visualize
      </div>
    );
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const hiMap = new Map(highlights.map((h) => [h.nodeId, h]));

  const head = nodes.find((n) => !nodes.some((other) => other.next === n.id)) ?? nodes[0];

  const orderedNodes: ListNode[] = [];
  let current: ListNode | null | undefined = head;
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    orderedNodes.push(current);
    visited.add(current.id);
    current = current.next ? nodeMap.get(current.next) ?? null : null;
  }

  const totalWidth = orderedNodes.length * (NODE_WIDTH + GAP) - GAP + ARROW_SIZE;
  const centerX = totalWidth / 2;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <svg
        viewBox={`-${centerX} -60 ${totalWidth} 120`}
        className="max-w-full max-h-full"
        style={{ minWidth: '100%' }}
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
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#3a3d49" />
          </marker>
        </defs>

        {orderedNodes.map((node, i) => {
          const hi = hiMap.get(node.id);
          const kind = hi?.kind;
          const fill = kind ? NODE_FILL[kind] : '#23242f';
          const stroke = kind ? NODE_STROKE[kind] : '#3a3d49';

          const x = i * (NODE_WIDTH + GAP);
          const y = 0;

          return (
            <g key={node.id} style={{ transition: 'all 200ms ease' }}>
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
                  filter: kind === 'current' ? 'drop-shadow(0 0 4px #a855f7)' : undefined,
                }}
              />
              <text
                x={x + NODE_WIDTH / 2}
                y={y + 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={14}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
                fill={kind ? '#0f1015' : '#c8ccd8'}
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
                  stroke="#3a3d49"
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
                    stroke="#3a3d49"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    style={{ pointerEvents: 'none' }}
                  />
                  <line
                    x1={x + NODE_WIDTH}
                    y1={y + 8}
                    x2={x + NODE_WIDTH + 16}
                    y2={y - 8}
                    stroke="#3a3d49"
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