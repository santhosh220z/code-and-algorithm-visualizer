# Graph Report - code-and-algorithm-visualizer  (2026-08-28)

## Corpus Check
- 79 files · ~34,872 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 468 nodes · 1194 edges · 19 communities (17 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `be0c291d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AlgorithmDef
- Layout.tsx
- types.ts
- grid/bfs.ts
- graph/bfs.ts
- devDependencies
- compilerOptions
- registry.ts
- compilerOptions
- plugins
- AGENTS.md
- graphify.js
- tsconfig.json
- opencode.json
- React + TypeScript + Vite
- knapsack.ts
- permutations.ts
- Step

## God Nodes (most connected - your core abstractions)
1. `Step` - 47 edges
2. `AlgorithmDef` - 36 edges
3. `AlgorithmInput` - 33 edges
4. `registerAlgorithm()` - 28 edges
5. `makeArrayStep()` - 25 edges
6. `makePointer()` - 23 edges
7. `highlightSorted()` - 21 edges
8. `usePlayerStore` - 20 edges
9. `highlightCompare()` - 19 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `hanoi()` --calls--> `frame()`  [EXTRACTED]
  src/algos/recursion/hanoi.ts → src/algos/recursion/helpers.ts
- `NarrationBarProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/NarrationBar.tsx → src/core/types.ts
- `VarsPanelProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/VarsPanel.tsx → src/core/types.ts
- `PlayerState` --references--> `Step`  [EXTRACTED]
  src/core/player.ts → src/core/types.ts
- `CategoryInfo` --references--> `AlgorithmCategory`  [EXTRACTED]
  src/core/registry.ts → src/core/types.ts

## Import Cycles
- None detected.

## Communities (19 total, 2 thin omitted)

### Community 0 - "AlgorithmDef"
Cohesion: 0.11
Nodes (48): binarySearch(), binarySearchDef, pseudocode, linearSearch(), linearSearchDef, pseudocode, pseudocode, twoPointers() (+40 more)

### Community 1 - "Layout.tsx"
Cohesion: 0.07
Nodes (43): react, Layout(), parseLoops(), EditorToolbar(), GRAPH_TOOLS, GRID_TOOLS, PlayerControls(), SPEEDS (+35 more)

### Community 2 - "types.ts"
Cohesion: 0.06
Nodes (52): BSTNode, bstSearch(), bstSearchDef, buildBst(), PositionedBSTNode, pseudocode, TREE_VALUES, hashTable() (+44 more)

### Community 3 - "grid/bfs.ts"
Cohesion: 0.17
Nodes (33): closedHi(), frontierHi(), gridAstar(), gridAstarDef, pseudocode, gridBfs(), gridBfsDef, pathSteps() (+25 more)

### Community 4 - "graph/bfs.ts"
Cohesion: 0.18
Nodes (24): astar(), astarDef, pseudocode, bfs(), bfsDef, pathLength(), pseudocode, dfs() (+16 more)

### Community 5 - "devDependencies"
Cohesion: 0.05
Nodes (39): oxlint, dependencies, react, react-dom, react-router-dom, zustand, devDependencies, oxlint (+31 more)

### Community 6 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 7 - "registry.ts"
Cohesion: 0.17
Nodes (14): App(), Sidebar(), algorithms, arrayPresets, categories, CATEGORY_NAMES, CategoryInfo, getAlgorithmsByCategory() (+6 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 9 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 10 - "AGENTS.md"
Cohesion: 0.25
Nodes (7): Adding a new algorithm, Architecture, Commands, File structure highlights, graphify, Key conventions, Testing

### Community 14 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 15 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 16 - "knapsack.ts"
Cohesion: 0.17
Nodes (22): fibonacci(), fibonacciDef, pseudocode, LoopInfo, makeTableStep(), tableCell(), tableCompute(), tableRead() (+14 more)

### Community 17 - "permutations.ts"
Cohesion: 0.14
Nodes (17): factorialAlgo(), factorialDef, pseudocode, hanoi(), hanoiDef, pseudocode, frame(), highlightCurrent() (+9 more)

### Community 18 - "Step"
Cohesion: 0.13
Nodes (11): CodePanel(), CodePanelProps, formatValue(), LoopScope, NarrationBar(), NarrationBarProps, formatValue(), VarsPanel() (+3 more)

## Knowledge Gaps
- **176 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `$schema`, `typescript`, `oxc` (+171 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Step` connect `Step` to `AlgorithmDef`, `Layout.tsx`, `types.ts`, `grid/bfs.ts`, `graph/bfs.ts`, `knapsack.ts`, `permutations.ts`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `AlgorithmInput` connect `AlgorithmDef` to `Layout.tsx`, `types.ts`, `grid/bfs.ts`, `graph/bfs.ts`, `knapsack.ts`, `permutations.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `AlgorithmDef` connect `AlgorithmDef` to `Layout.tsx`, `types.ts`, `grid/bfs.ts`, `graph/bfs.ts`, `registry.ts`, `knapsack.ts`, `permutations.ts`, `Step`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `$schema` to the rest of the system?**
  _176 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AlgorithmDef` be split into smaller, more focused modules?**
  _Cohesion score 0.10710382513661203 - nodes in this community are weakly interconnected._
- **Should `Layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0706605222734255 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05764145954521417 - nodes in this community are weakly interconnected._