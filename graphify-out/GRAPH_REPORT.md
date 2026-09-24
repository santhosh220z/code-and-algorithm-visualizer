# Graph Report - code-and-algorithm-visualizer  (2026-09-24)

## Corpus Check
- 92 files · ~43,393 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 567 nodes · 1541 edges · 22 communities (17 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab9311ce`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Step
- types.ts
- AlgorithmDef
- hanoi.ts
- devDependencies
- grid/bfs.ts
- presets.ts
- codeRunner.ts
- registry.ts
- compilerOptions
- compilerOptions
- Parser
- Algorithms auto-register via side-effect imports in src/algos/<category>/index.ts
- plugins
- Opencode Configuration
- graphify.js
- tsconfig.json
- regenerate() — fresh random data (respects custom grid dimensions)
- registerAlgorithm
- Step
- Algorithm Visualizer

## God Nodes (most connected - your core abstractions)
1. `Step` - 50 edges
2. `AlgorithmDef` - 37 edges
3. `AlgorithmInput` - 33 edges
4. `Parser` - 31 edges
5. `makeArrayStep()` - 31 edges
6. `makePointer()` - 29 edges
7. `registerAlgorithm()` - 28 edges
8. `usePlayerStore` - 24 edges
9. `highlightSorted()` - 23 edges
10. `highlightCompare()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `InterpretResult` --references--> `Step`  [EXTRACTED]
  src/core/codeLang/interpreter.ts → src/core/types.ts
- `hanoi()` --calls--> `frame()`  [EXTRACTED]
  src/algos/recursion/hanoi.ts → src/core/stepHelpers.ts
- `ConsolePanelProps` --references--> `Step`  [EXTRACTED]
  src/components/code/ConsolePanel.tsx → src/core/types.ts
- `NarrationBarProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/NarrationBar.tsx → src/core/types.ts
- `VarsPanelProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/VarsPanel.tsx → src/core/types.ts

## Import Cycles
- None detected.

## Communities (22 total, 5 thin omitted)

### Community 0 - "Step"
Cohesion: 0.07
Nodes (42): react, App(), ConsolePanel(), ConsolePanelProps, Layout(), parseLoops(), CodePanel(), CodePanelProps (+34 more)

### Community 1 - "types.ts"
Cohesion: 0.06
Nodes (61): fibonacci(), fibonacciDef, pseudocode, DEFAULT_VALUES, DEFAULT_WEIGHTS, knapsack(), knapsackDef, pseudocode (+53 more)

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

### Community 6 - "presets.ts"
Cohesion: 0.09
Nodes (41): astar(), astarDef, pseudocode, bfs(), bfsDef, pathLength(), pseudocode, dfs() (+33 more)

### Community 7 - "codeRunner.ts"
Cohesion: 0.18
Nodes (18): CodeEditor(), CodeEditorProps, interpretSource(), callFunction(), evalExpr(), execBlock(), execStmt(), toPseudocode() (+10 more)

### Community 8 - "registry.ts"
Cohesion: 0.09
Nodes (22): listNode(), makeListNodes(), makeListStep(), pseudocode, queueDemo(), queueDemoDef, pseudocode, stackDemo() (+14 more)

### Community 9 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 11 - "Parser"
Cohesion: 0.11
Nodes (22): Expr, MiniProgram, Stmt, BreakSignal, ContinueSignal, Frame, FuncDef, InterpretResult (+14 more)

### Community 12 - "Algorithms auto-register via side-effect imports in src/algos/<category>/index.ts"
Cohesion: 0.17
Nodes (12): AlgorithmDef, Algorithm structure (e.g. src/algos/sorting/bubbleSort.ts):, Algorithms auto-register via side-effect imports in src/algos/<category>/index.ts, Known flaky test: graph.test.ts — "bfs path has minimal hop count" fails intermittently, graphify, src/main.tsx → src/App.tsx (routes: /, /category/:id, /algorithm/:id), patchInput(input) — regenerates trace, preserves cursor if at end, React 19 + TypeScript + Vite + Zustand + TailwindCSS v4 + React Router 7 (+4 more)

### Community 13 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 14 - "Opencode Configuration"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 21 - "Algorithm Visualizer"
Cohesion: 0.20
Nodes (9): 🧩 Adding a New Algorithm, Algorithm Visualizer, 🗺️ Algorithms, 🏗️ Architecture, 💻 Code Visualizer, ✨ Features, 🚀 Getting Started, 📦 Scripts (+1 more)

## Knowledge Gaps
- **180 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `$schema`, `typescript`, `oxc` (+175 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Step` connect `Step` to `types.ts`, `AlgorithmDef`, `hanoi.ts`, `grid/bfs.ts`, `presets.ts`, `codeRunner.ts`, `registry.ts`, `Parser`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `$schema` to the rest of the system?**
  _180 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Step` be split into smaller, more focused modules?**
  _Cohesion score 0.07242063492063493 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05981981981981982 - nodes in this community are weakly interconnected._
- **Should `AlgorithmDef` be split into smaller, more focused modules?**
  _Cohesion score 0.10140474100087796 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `presets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09023569023569024 - nodes in this community are weakly interconnected._