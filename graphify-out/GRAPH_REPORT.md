# Graph Report - code-and-algorithm-visualizer  (2026-08-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 379 nodes · 947 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `44ccc8f4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Step
- Layout.tsx
- types.ts
- grid/bfs.ts
- graph/bfs.ts
- devDependencies
- compilerOptions
- registry.ts
- compilerOptions
- package.json
- bst.ts
- graphify.js
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `Step` - 36 edges
2. `AlgorithmDef` - 27 edges
3. `AlgorithmInput` - 27 edges
4. `makeArrayStep()` - 25 edges
5. `makePointer()` - 23 edges
6. `registerAlgorithm()` - 22 edges
7. `highlightSorted()` - 21 edges
8. `usePlayerStore` - 20 edges
9. `highlightCompare()` - 19 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `NarrationBarProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/NarrationBar.tsx → src/core/types.ts
- `VarsPanelProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/VarsPanel.tsx → src/core/types.ts
- `plugins` --extends--> `typescript`  [EXTRACTED]
  .oxlintrc.json → package.json
- `CodePanelProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/CodePanel.tsx → src/core/types.ts
- `CategoryInfo` --references--> `AlgorithmCategory`  [EXTRACTED]
  src/core/registry.ts → src/core/types.ts

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "Step"
Cohesion: 0.09
Nodes (52): linkedListDef, pseudocode, pseudocode, binarySearch(), binarySearchDef, pseudocode, linearSearch(), linearSearchDef (+44 more)

### Community 1 - "Layout.tsx"
Cohesion: 0.06
Nodes (47): react, Layout(), parseLoops(), NarrationBar(), NarrationBarProps, formatValue(), VarsPanel(), VarsPanelProps (+39 more)

### Community 2 - "types.ts"
Cohesion: 0.06
Nodes (34): BstNode, layoutBst(), inorder(), layoutTree(), inorder(), LinkedNode, LoopInfo, StackFrame (+26 more)

### Community 3 - "grid/bfs.ts"
Cohesion: 0.17
Nodes (33): closedHi(), frontierHi(), gridAstar(), gridAstarDef, pseudocode, gridBfs(), gridBfsDef, pathSteps() (+25 more)

### Community 4 - "graph/bfs.ts"
Cohesion: 0.18
Nodes (24): astar(), astarDef, pseudocode, bfs(), bfsDef, pathLength(), pseudocode, dfs() (+16 more)

### Community 5 - "devDependencies"
Cohesion: 0.07
Nodes (28): oxlint, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, devDependencies, oxlint (+20 more)

### Community 6 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 7 - "registry.ts"
Cohesion: 0.17
Nodes (14): App(), Sidebar(), algorithms, arrayPresets, categories, CATEGORY_NAMES, CategoryInfo, getAlgorithmsByCategory() (+6 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 9 - "package.json"
Cohesion: 0.11
Nodes (18): dependencies, react, react-dom, react-router-dom, zustand, name, private, scripts (+10 more)

### Community 10 - "bst.ts"
Cohesion: 0.38
Nodes (6): bstDef, bstGenerator(), inorder(), layoutBst(), inorder(), pseudocode

## Knowledge Gaps
- **137 isolated node(s):** `ArrayHighlights`, `ArrayPointers`, `ArrayViz`, `LoopInfo`, `StackFrame` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Layout.tsx` to `types.ts`, `devDependencies`, `registry.ts`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **Why does `plugins` connect `devDependencies` to `Layout.tsx`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **What connects `ArrayHighlights`, `ArrayPointers`, `ArrayViz` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Step` be split into smaller, more focused modules?**
  _Cohesion score 0.0927536231884058 - nodes in this community are weakly interconnected._
- **Should `Layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06265984654731457 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06423034330011074 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._