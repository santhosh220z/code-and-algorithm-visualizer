# Graph Report - code-and-algorithm-visualizer  (2026-09-23)

## Corpus Check
- Corpus is ~35,756 words - fits in a single context window. You may not need a graph.

## Summary
- 488 nodes · 1231 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- UI Components & Player Core
- Data Structures & Visualizers
- Sorting & Search Algorithms
- Recursion Algorithms & Visualization
- Project Dependencies
- Grid Pathfinding Algorithms
- Graph Pathfinding Algorithms
- Dynamic Programming Algorithms
- App Shell & Routing
- TypeScript App Config
- TypeScript Node Config
- UI Panels & Core Types
- Project Documentation
- Lint Configuration
- Opencode Configuration
- Graphify Plugin Config
- Root TypeScript Config
- Player Regeneration
- Algorithm Registration
- Step Definition

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
- `NarrationBarProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/NarrationBar.tsx → src/core/types.ts
- `VarsPanelProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/VarsPanel.tsx → src/core/types.ts
- `PlayerState` --references--> `Step`  [EXTRACTED]
  src/core/player.ts → src/core/types.ts
- `CategoryInfo` --references--> `AlgorithmCategory`  [EXTRACTED]
  src/core/registry.ts → src/core/types.ts
- `fibonacci()` --calls--> `makeTableStep()`  [EXTRACTED]
  src/algos/dp/fibonacci.ts → src/algos/dp/helpers.ts

## Import Cycles
- None detected.

## Communities (21 total, 5 thin omitted)

### Community 0 - "UI Components & Player Core"
Cohesion: 0.07
Nodes (43): react, Layout(), parseLoops(), EditorToolbar(), GRAPH_TOOLS, GRID_TOOLS, PlayerControls(), SPEEDS (+35 more)

### Community 1 - "Data Structures & Visualizers"
Cohesion: 0.06
Nodes (52): BSTNode, bstSearch(), bstSearchDef, buildBst(), PositionedBSTNode, pseudocode, TREE_VALUES, hashTable() (+44 more)

### Community 2 - "Sorting & Search Algorithms"
Cohesion: 0.11
Nodes (48): binarySearch(), binarySearchDef, pseudocode, linearSearch(), linearSearchDef, pseudocode, pseudocode, twoPointers() (+40 more)

### Community 3 - "Recursion Algorithms & Visualization"
Cohesion: 0.10
Nodes (32): factorialAlgo(), factorialDef, pseudocode, hanoi(), hanoiDef, Peg, pseudocode, HANOI_BASE_Y (+24 more)

### Community 4 - "Project Dependencies"
Cohesion: 0.05
Nodes (39): oxlint, dependencies, react, react-dom, react-router-dom, zustand, devDependencies, oxlint (+31 more)

### Community 5 - "Grid Pathfinding Algorithms"
Cohesion: 0.17
Nodes (33): closedHi(), frontierHi(), gridAstar(), gridAstarDef, pseudocode, gridBfs(), gridBfsDef, pathSteps() (+25 more)

### Community 6 - "Graph Pathfinding Algorithms"
Cohesion: 0.18
Nodes (24): astar(), astarDef, pseudocode, bfs(), bfsDef, pathLength(), pseudocode, dfs() (+16 more)

### Community 7 - "Dynamic Programming Algorithms"
Cohesion: 0.17
Nodes (22): fibonacci(), fibonacciDef, pseudocode, LoopInfo, makeTableStep(), tableCell(), tableCompute(), tableRead() (+14 more)

### Community 8 - "App Shell & Routing"
Cohesion: 0.12
Nodes (14): App(), Sidebar(), algorithms, arrayPresets, categories, CATEGORY_NAMES, CategoryInfo, getAlgorithmsByCategory() (+6 more)

### Community 9 - "TypeScript App Config"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 10 - "TypeScript Node Config"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 11 - "UI Panels & Core Types"
Cohesion: 0.16
Nodes (11): CodePanel(), CodePanelProps, formatValue(), LoopScope, NarrationBar(), NarrationBarProps, formatValue(), VarsPanel() (+3 more)

### Community 12 - "Project Documentation"
Cohesion: 0.17
Nodes (12): AlgorithmDef, Algorithm structure (e.g. src/algos/sorting/bubbleSort.ts):, Algorithms auto-register via side-effect imports in src/algos/<category>/index.ts, Known flaky test: graph.test.ts — "bfs path has minimal hop count" fails intermittently, graphify, src/main.tsx → src/App.tsx (routes: /, /category/:id, /algorithm/:id), patchInput(input) — regenerates trace, preserves cursor if at end, React 19 + TypeScript + Vite + Zustand + TailwindCSS v4 + React Router 7 (+4 more)

### Community 13 - "Lint Configuration"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 14 - "Opencode Configuration"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

## Knowledge Gaps
- **175 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `$schema`, `typescript`, `oxc` (+170 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Step` connect `UI Panels & Core Types` to `UI Components & Player Core`, `Data Structures & Visualizers`, `Sorting & Search Algorithms`, `Recursion Algorithms & Visualization`, `Grid Pathfinding Algorithms`, `Graph Pathfinding Algorithms`, `Dynamic Programming Algorithms`, `App Shell & Routing`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `AlgorithmInput` connect `Sorting & Search Algorithms` to `UI Components & Player Core`, `Data Structures & Visualizers`, `Recursion Algorithms & Visualization`, `Grid Pathfinding Algorithms`, `Graph Pathfinding Algorithms`, `Dynamic Programming Algorithms`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `AlgorithmDef` connect `Sorting & Search Algorithms` to `UI Components & Player Core`, `Data Structures & Visualizers`, `Recursion Algorithms & Visualization`, `Grid Pathfinding Algorithms`, `Graph Pathfinding Algorithms`, `Dynamic Programming Algorithms`, `App Shell & Routing`, `UI Panels & Core Types`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `$schema` to the rest of the system?**
  _175 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Components & Player Core` be split into smaller, more focused modules?**
  _Cohesion score 0.0706605222734255 - nodes in this community are weakly interconnected._
- **Should `Data Structures & Visualizers` be split into smaller, more focused modules?**
  _Cohesion score 0.05764145954521417 - nodes in this community are weakly interconnected._
- **Should `Sorting & Search Algorithms` be split into smaller, more focused modules?**
  _Cohesion score 0.10710382513661203 - nodes in this community are weakly interconnected._