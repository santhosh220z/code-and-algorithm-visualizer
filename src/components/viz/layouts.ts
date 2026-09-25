import type { ListNode, TreeNode } from '../../core/types';

const H_SPACING = 60;
const V_SPACING = 70;

export function orderListNodes(nodes: ListNode[]): ListNode[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const referenced = new Set(nodes.flatMap((node) => (node.next ? [node.next] : [])));
  const head = nodes.find((node) => !referenced.has(node.id)) ?? nodes[0];
  const ordered: ListNode[] = [];
  const visited = new Set<string>();
  let current: ListNode | undefined = head;

  while (current && !visited.has(current.id)) {
    ordered.push(current);
    visited.add(current.id);
    current = current.next ? nodeMap.get(current.next) : undefined;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) ordered.push(node);
  }

  return ordered;
}

export interface TreeEdge {
  from: string;
  to: string;
}

export function layoutTreeNodes(nodes: TreeNode[]): TreeNode[] {
  const sourceById = new Map(nodes.map((node) => [node.id, node]));
  const positionedById = new Map(nodes.map((node) => [node.id, { ...node }]));
  const visited = new Set<string>();

  const layout = (nodeId: string, depth: number, startX: number): number => {
    if (visited.has(nodeId)) return startX;
    const node = positionedById.get(nodeId);
    if (!node) return startX;

    visited.add(nodeId);
    const childIds = [node.left, node.right].filter(
      (id): id is string => typeof id === 'string' && positionedById.has(id)
    );

    if (childIds.length === 0) {
      node.x = startX + H_SPACING / 2;
      node.y = depth * V_SPACING + 40;
      return startX + H_SPACING;
    }

    let cursor = startX;
    const childNodes: TreeNode[] = [];
    for (const childId of childIds) {
      cursor = layout(childId, depth + 1, cursor);
      const child = positionedById.get(childId);
      if (child) childNodes.push(child);
    }

    node.x = childNodes.reduce((sum, child) => sum + child.x, 0) / childNodes.length;
    node.y = depth * V_SPACING + 40;
    return cursor;
  };

  const roots = nodes.filter((node) => !node.parent || !sourceById.has(node.parent));
  let cursor = 40;
  for (const root of roots) cursor = layout(root.id, 0, cursor);
  for (const node of nodes) {
    if (!visited.has(node.id)) cursor = layout(node.id, 0, cursor);
  }

  return [...positionedById.values()];
}

export function getTreeEdges(nodes: TreeNode[]): TreeEdge[] {
  const ids = new Set(nodes.map((node) => node.id));
  return nodes.flatMap((node) =>
    [node.left, node.right]
      .filter((id): id is string => typeof id === 'string' && ids.has(id))
      .map((id) => ({ from: node.id, to: id }))
  );
}
