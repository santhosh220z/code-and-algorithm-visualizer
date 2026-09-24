# Graph Report - code-and-algorithm-visualizer  (2026-09-23)

## Corpus Check
- 82 files · ~34,664 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 474 nodes · 1252 edges · 22 communities (17 shown, 5 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `92a10d85`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Layout.tsx
- types.ts
- AlgorithmDef
- hanoi.ts
- devDependencies
- grid/bfs.ts
- graph/bfs.ts
- stepHelpers.ts
- registry.ts
- compilerOptions
- compilerOptions
- Step
- Algorithms auto-register via side-effect imports in src/algos/<category>/index.ts
- plugins
- Opencode Configuration
- graphify.js
- tsconfig.json
- regenerate() — fresh random data (respects custom grid dimensions)
- registerAlgorithm
- Step
- React + TypeScript + Vite

## God Nodes (most connected - your core abstractions)
1. `Step` - 45 edges
2. `AlgorithmDef` - 36 edges
3. `AlgorithmInput` - 33 edges
4. `makeArrayStep()` - 31 edges
5. `makePointer()` - 29 edges
6. `registerAlgorithm()` - 28 edges
7. `highlightSorted()` - 23 edges
8. `highlightCompare()` - 21 edges
9. `usePlayerStore` - 20 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `hanoi()` --calls--> `frame()`  [EXTRACTED]
  src/algos/recursion/hanoi.ts → src/core/stepHelpers.ts
- `NarrationBarProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/NarrationBar.tsx → src/core/types.ts
- `VarsPanelProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/VarsPanel.tsx → src/core/types.ts
- `Sidebar()` --calls--> `getAlgorithmsByCategory()`  [EXTRACTED]
  src/components/sidebar/Sidebar.tsx → src/core/registry.ts
- `PlayerState` --references--> `Step`  [EXTRACTED]
  src/core/player.ts → src/core/types.ts

## Import Cycles
- None detected.

## Communities (22 total, 5 thin omitted)

### Community 0 - "Layout.tsx"
Cohesion: 0.07
Nodes (44): react, Layout(), parseLoops(), EditorToolbar(), GRAPH_TOOLS, GRID_TOOLS, PlayerControls(), SPEEDS (+36 more)

### Community 1 - "types.ts"
Cohesion: 0.06
Nodes (36): BSTNode, bstSearch(), bstSearchDef, buildBst(), PositionedBSTNode, pseudocode, TREE_VALUES, makeTreeStep() (+28 more)

### Community 2 - "AlgorithmDef"
Cohesion: 0.10
Nodes (52): factorialAlgo(), factorialDef, pseudocode, fact(), permutations(), permutationsDef, pseudocode, binarySearch() (+44 more)

### Community 3 - "hanoi.ts"
Cohesion: 0.17
Nodes (18): hanoi(), hanoiDef, Peg, pseudocode, HANOI_BASE_Y, HANOI_DISK_H, HANOI_PEG_X, HANOI_VIEW_H (+10 more)

### Community 4 - "devDependencies"
Cohesion: 0.05
Nodes (39): oxlint, dependencies, react, react-dom, react-router-dom, zustand, devDependencies, oxlint (+31 more)

### Community 5 - "grid/bfs.ts"
Cohesion: 0.17
Nodes (32): closedHi(), frontierHi(), gridAstar(), gridAstarDef, pseudocode, gridBfs(), gridBfsDef, pathSteps() (+24 more)

### Community 6 - "graph/bfs.ts"
Cohesion: 0.20
Nodes (23): astar(), astarDef, pseudocode, bfs(), bfsDef, pathLength(), pseudocode, dfs() (+15 more)

### Community 7 - "stepHelpers.ts"
Cohesion: 0.17
Nodes (26): fibonacci(), fibonacciDef, pseudocode, DEFAULT_VALUES, DEFAULT_WEIGHTS, knapsack(), knapsackDef, pseudocode (+18 more)

### Community 8 - "registry.ts"
Cohesion: 0.09
Nodes (22): listNode(), makeListNodes(), makeListStep(), pseudocode, queueDemo(), queueDemoDef, pseudocode, stackDemo() (+14 more)

### Community 9 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 11 - "Step"
Cohesion: 0.16
Nodes (11): CodePanel(), CodePanelProps, formatValue(), LoopScope, NarrationBar(), NarrationBarProps, formatValue(), VarsPanel() (+3 more)

### Community 12 - "Algorithms auto-register via side-effect imports in src/algos/<category>/index.ts"
Cohesion: 0.17
Nodes (12): AlgorithmDef, Algorithm structure (e.g. src/algos/sorting/bubbleSort.ts):, Algorithms auto-register via side-effect imports in src/algos/<category>/index.ts, Known flaky test: graph.test.ts — "bfs path has minimal hop count" fails intermittently, graphify, src/main.tsx → src/App.tsx (routes: /, /category/:id, /algorithm/:id), patchInput(input) — regenerates trace, preserves cursor if at end, React 19 + TypeScript + Vite + Zustand + TailwindCSS v4 + React Router 7 (+4 more)

### Community 13 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 14 - "Opencode Configuration"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 21 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **165 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `$schema`, `typescript`, `oxc` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Step` connect `Step` to `Layout.tsx`, `types.ts`, `AlgorithmDef`, `hanoi.ts`, `grid/bfs.ts`, `graph/bfs.ts`, `stepHelpers.ts`, `registry.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `AlgorithmInput` connect `AlgorithmDef` to `Layout.tsx`, `types.ts`, `hanoi.ts`, `grid/bfs.ts`, `graph/bfs.ts`, `stepHelpers.ts`, `registry.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `react` connect `Layout.tsx` to `registry.ts`, `Step`, `plugins`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `$schema` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06994047619047619 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06387921022067364 - nodes in this community are weakly interconnected._
- **Should `AlgorithmDef` be split into smaller, more focused modules?**
  _Cohesion score 0.10357304387155133 - nodes in this community are weakly interconnected._