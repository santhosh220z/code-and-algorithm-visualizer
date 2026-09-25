# Graph Report - code-and-algorithm-visualizer  (2026-09-25)

## Corpus Check
- 110 files · ~56,890 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 692 nodes · 1891 edges · 30 communities (25 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b834f4a7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- theme.ts
- stepHelpers.ts
- Step
- hanoi.ts
- devDependencies
- grid/bfs.ts
- presets.ts
- interpreter.ts
- graph/bfs.ts
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
- App.tsx
- usePlayerStore
- Layout.tsx
- types.ts
- EditorToolbar.tsx
- react
- AlgorithmControls.tsx
- CodeVisualizerPage.tsx

## God Nodes (most connected - your core abstractions)
1. `Step` - 54 edges
2. `AlgorithmDef` - 39 edges
3. `usePlayerStore` - 35 edges
4. `AlgorithmInput` - 35 edges
5. `Parser` - 31 edges
6. `registerAlgorithm()` - 28 edges
7. `makeArrayStep()` - 27 edges
8. `makePointer()` - 25 edges
9. `highlightSorted()` - 23 edges
10. `react` - 22 edges

## Surprising Connections (you probably didn't know these)
- `ConsolePanelProps` --references--> `Step`  [EXTRACTED]
  src/components/code/ConsolePanel.tsx → src/core/types.ts
- `NarrationBarProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/NarrationBar.tsx → src/core/types.ts
- `VarsPanelProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/VarsPanel.tsx → src/core/types.ts
- `VisualizationCanvasProps` --references--> `Step`  [EXTRACTED]
  src/components/viz/VisualizationCanvas.tsx → src/core/types.ts
- `FuncDef` --references--> `Stmt`  [EXTRACTED]
  src/core/codeLang/interpreter.ts → src/core/codeLang/ast.ts

## Import Cycles
- None detected.

## Communities (30 total, 5 thin omitted)

### Community 0 - "theme.ts"
Cohesion: 0.20
Nodes (19): ModeToggle(), applyTheme(), DARK_QUERY, getStorage(), initializeTheme(), isThemeId(), modeOf(), resolveStoredTheme() (+11 more)

### Community 1 - "stepHelpers.ts"
Cohesion: 0.10
Nodes (39): fibonacci(), fibonacciDef, pseudocode, DEFAULT_VALUES, DEFAULT_WEIGHTS, knapsack(), knapsackDef, pseudocode (+31 more)

### Community 2 - "Step"
Cohesion: 0.07
Nodes (67): makeContainerStep(), pseudocode, queueDemo(), queueDemoDef, pseudocode, stackDemo(), stackDemoDef, factorialAlgo() (+59 more)

### Community 3 - "hanoi.ts"
Cohesion: 0.18
Nodes (17): hanoi(), hanoiDef, Peg, pseudocode, HANOI_BASE_Y, HANOI_DISK_H, HANOI_PEG_X, HANOI_VIEW_H (+9 more)

### Community 4 - "devDependencies"
Cohesion: 0.05
Nodes (41): oxlint, dependencies, react, react-dom, react-router-dom, zustand, devDependencies, oxlint (+33 more)

### Community 5 - "grid/bfs.ts"
Cohesion: 0.17
Nodes (32): closedHi(), frontierHi(), gridAstar(), gridAstarDef, pseudocode, gridBfs(), gridBfsDef, pathSteps() (+24 more)

### Community 6 - "presets.ts"
Cohesion: 0.10
Nodes (21): buildWalls(), carveRoute(), dist(), emptyGrid(), mulberry32(), nextNodeId(), nodeIdAt(), nodeIdIndex() (+13 more)

### Community 7 - "interpreter.ts"
Cohesion: 0.09
Nodes (33): MiniProgram, BreakSignal, ContinueSignal, Frame, FuncDef, InterpretResult, interpretSource(), callFunction() (+25 more)

### Community 8 - "graph/bfs.ts"
Cohesion: 0.20
Nodes (23): astar(), astarDef, pseudocode, bfs(), bfsDef, pathLength(), pseudocode, dfs() (+15 more)

### Community 9 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 11 - "Parser"
Cohesion: 0.26
Nodes (4): Expr, Stmt, Token, Parser

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

### Community 22 - "App.tsx"
Cohesion: 0.15
Nodes (16): Sidebar(), SidebarContent(), SidebarContentProps, Badge(), BadgeProps, BadgeTone, tones, categories (+8 more)

### Community 23 - "usePlayerStore"
Cohesion: 0.19
Nodes (15): ConsolePanel(), ConsolePanelProps, LearningStudio(), LearningStudioProps, InspectorTab, NarrationBar(), NarrationBarProps, PlayerControls() (+7 more)

### Community 24 - "Layout.tsx"
Cohesion: 0.24
Nodes (11): Layout(), CodePanel(), CodePanelProps, formatValue(), LoopScope, parseLoops(), getAlgorithm(), supportsRegeneration() (+3 more)

### Community 25 - "types.ts"
Cohesion: 0.05
Nodes (66): ArrayViz(), ArrayVizProps, CallStackViz(), CallStackVizProps, clamp(), EDGE_STROKE, fmtDist(), GraphViz() (+58 more)

### Community 26 - "EditorToolbar.tsx"
Cohesion: 0.24
Nodes (9): EditorToolbar(), GRAPH_TOOLS, GRID_TOOLS, EditorState, EditorTool, useEditorStore, resizeGrid(), CategoryInfo (+1 more)

### Community 27 - "react"
Cohesion: 0.19
Nodes (11): react, App(), getLayout(), InspectorLayout, ResponsiveInspector(), ResponsiveInspectorProps, useInspectorLayout(), PLACEMENT_CLASSES (+3 more)

### Community 28 - "AlgorithmControls.tsx"
Cohesion: 0.19
Nodes (12): AlgorithmControls(), FieldKind, fieldsFor(), FieldSpec, parseList(), parseOperations(), Button(), ButtonProps (+4 more)

### Community 34 - "CodeVisualizerPage.tsx"
Cohesion: 0.17
Nodes (13): CodeEditor(), CodeEditorGuide(), CodeEditorGuideProps, CodeEditorProps, formatValue(), VarsPanel(), VarsPanelProps, renderVisualization() (+5 more)

## Knowledge Gaps
- **205 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `$schema`, `typescript`, `oxc` (+200 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Step` connect `Step` to `stepHelpers.ts`, `CodeVisualizerPage.tsx`, `hanoi.ts`, `grid/bfs.ts`, `presets.ts`, `interpreter.ts`, `graph/bfs.ts`, `usePlayerStore`, `Layout.tsx`, `types.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `CodeVisualizerPage.tsx`, `plugins`, `App.tsx`, `usePlayerStore`, `Layout.tsx`, `types.ts`, `EditorToolbar.tsx`, `AlgorithmControls.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `Stmt` connect `Parser` to `interpreter.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `$schema` to the rest of the system?**
  _205 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `stepHelpers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09948979591836735 - nodes in this community are weakly interconnected._
- **Should `Step` be split into smaller, more focused modules?**
  _Cohesion score 0.06703271562571494 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._