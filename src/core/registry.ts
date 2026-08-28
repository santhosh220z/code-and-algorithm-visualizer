import type { AlgorithmDef, AlgorithmCategory } from './types';

const algorithms: AlgorithmDef[] = [];

export function registerAlgorithm(algo: AlgorithmDef): void {
  if (algorithms.some((a) => a.id === algo.id)) return;
  algorithms.push(algo);
}

export function getAlgorithm(id: string): AlgorithmDef | undefined {
  return algorithms.find((a) => a.id === id);
}

export function getAlgorithmsByCategory(category: AlgorithmCategory | string): AlgorithmDef[] {
  return algorithms.filter((a) => a.category === category);
}

export function getAllAlgorithms(): AlgorithmDef[] {
  return [...algorithms];
}

export interface CategoryInfo {
  id: AlgorithmCategory;
  name: string;
  icon: string;
  description: string;
}

export const categories: CategoryInfo[] = [
  { id: 'sorting', name: 'Sorting', icon: 'bars', description: 'Rearrange elements into order' },
  { id: 'search', name: 'Searching', icon: 'magnifier', description: 'Find a target in a collection' },
  { id: 'graph', name: 'Graph Traversal', icon: 'network', description: 'Explore nodes and edges (coming soon)' },
  { id: 'grid', name: 'Pathfinding', icon: 'grid', description: 'Navigate grids around obstacles (coming soon)' },
  { id: 'ds', name: 'Data Structures', icon: 'tree', description: 'Lists, trees, stacks and queues (coming soon)' },
  { id: 'dp', name: 'Dynamic Programming', icon: 'table', description: 'Build up optimal solutions (coming soon)' },
  { id: 'recursion', name: 'Recursion', icon: 'recurse', description: 'Functions that call themselves' },
];

export const CATEGORY_NAMES: Record<AlgorithmCategory, string> = {
  sorting: 'Sorting',
  search: 'Searching',
  graph: 'Graph Traversal',
  grid: 'Pathfinding',
  ds: 'Data Structures',
  dp: 'Dynamic Programming',
  recursion: 'Recursion',
};

export const arrayPresets = [
  { label: 'Random', generate: (size: number) => Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5) },
  {
    label: 'Sorted',
    generate: (size: number) =>
      Array.from({ length: size }, (_, i) => Math.round(((i + 1) / size) * 95) + 5),
  },
  {
    label: 'Reversed',
    generate: (size: number) =>
      Array.from({ length: size }, (_, i) => Math.round(((size - i) / size) * 95) + 5),
  },
  {
    label: 'Nearly Sorted',
    generate: (size: number) => {
      const arr = Array.from({ length: size }, (_, i) => Math.round(((i + 1) / size) * 95) + 5);
      for (let k = 0; k < 2 && size > 4; k++) {
        const i = Math.floor(Math.random() * size);
        const j = Math.floor(Math.random() * size);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  },
];