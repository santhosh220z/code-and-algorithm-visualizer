# Graph Report - code-and-algorithm-visualizer  (2026-09-25)

## Corpus Check
- 108 files · ~55,520 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 689 nodes · 1874 edges · 30 communities (25 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e9c3424b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- theme.ts
- stepHelpers.ts
- Step
- hanoi.ts
- devDependencies
- grid/bfs.ts
- GridViz.tsx
- codeRunner.ts
- presets.ts
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
- ResponsiveInspector.tsx
- AlgorithmControls.tsx
- CodePanel.tsx
- VisualizationCanvas.tsx

## God Nodes (most connected - your core abstractions)
1. `Step` - 54 edges
2. `AlgorithmDef` - 39 edges
3. `usePlayerStore` - 35 edges
4. `AlgorithmInput` - 35 edges
5. `Parser` - 31 edges
6. `makeArrayStep()` - 29 edges
7. `registerAlgorithm()` - 28 edges
8. `makePointer()` - 27 edges
9. `react` - 23 edges
10. `highlightSorted()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `ConsolePanelProps` --references--> `Step`  [EXTRACTED]
  src/components/code/ConsolePanel.tsx → src/core/types.ts
- `NarrationBarProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/NarrationBar.tsx → src/core/types.ts
- `VarsPanelProps` --references--> `Step`  [EXTRACTED]
  src/components/panels/VarsPanel.tsx → src/core/types.ts
- `VisualizationCanvasProps` --references--> `Step`  [EXTRACTED]
  src/components/viz/VisualizationCanvas.tsx → src/core/types.ts
- `InterpretResult` --references--> `Step`  [EXTRACTED]
  src/core/codeLang/interpreter.ts → src/core/types.ts

## Import Cycles
- None detected.

## Communities (30 total, 5 thin omitted)

### Community 0 - "theme.ts"
Cohesion: 0.13
Nodes (21): App(), ThemeSwitcher(), applyTheme(), clearThemePreview(), DEFAULT_THEME, getStorage(), initializeTheme(), isThemeId() (+13 more)

### Community 1 - "stepHelpers.ts"
Cohesion: 0.14
Nodes (29): fibonacci(), fibonacciDef, pseudocode, DEFAULT_VALUES, DEFAULT_WEIGHTS, knapsack(), knapsackDef, pseudocode (+21 more)

### Community 2 - "Step"
Cohesion: 0.07
Nodes (66): makeContainerStep(), pseudocode, queueDemo(), queueDemoDef, pseudocode, stackDemo(), stackDemoDef, factorialAlgo() (+58 more)

### Community 3 - "hanoi.ts"
Cohesion: 0.18
Nodes (17): hanoi(), hanoiDef, Peg, pseudocode, HANOI_BASE_Y, HANOI_DISK_H, HANOI_PEG_X, HANOI_VIEW_H (+9 more)

### Community 4 - "devDependencies"
Cohesion: 0.05
Nodes (41): oxlint, dependencies, react, react-dom, react-router-dom, zustand, devDependencies, oxlint (+33 more)

### Community 5 - "grid/bfs.ts"
Cohesion: 0.13
Nodes (35): closedHi(), frontierHi(), gridAstar(), gridAstarDef, pseudocode, gridBfs(), gridBfsDef, pathSteps() (+27 more)

### Community 6 - "GridViz.tsx"
Cohesion: 0.18
Nodes (13): EditorToolbar(), GRAPH_TOOLS, GRID_TOOLS, FILL, GridViz(), hiKey(), interpolateCells(), EditorState (+5 more)

### Community 7 - "codeRunner.ts"
Cohesion: 0.15
Nodes (21): CodeEditor(), CodeEditorGuide(), CodeEditorGuideProps, CodeEditorProps, interpretSource(), callFunction(), evalExpr(), execBlock() (+13 more)

### Community 8 - "presets.ts"
Cohesion: 0.08
Nodes (47): astar(), astarDef, pseudocode, bfs(), bfsDef, pathLength(), pseudocode, dfs() (+39 more)

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

### Community 22 - "App.tsx"
Cohesion: 0.15
Nodes (16): Sidebar(), SidebarContent(), SidebarContentProps, Badge(), BadgeProps, BadgeTone, tones, categories (+8 more)

### Community 23 - "usePlayerStore"
Cohesion: 0.26
Nodes (10): LearningStudioProps, InspectorTab, NarrationBar(), NarrationBarProps, PlayerControls(), SPEEDS, collectSteps(), generateRandomArray() (+2 more)

### Community 24 - "Layout.tsx"
Cohesion: 0.36
Nodes (8): Layout(), LearningStudio(), parseLoops(), useCurrentStep(), getAlgorithm(), supportsRegeneration(), AlgorithmLoader(), TraceStudio()

### Community 25 - "types.ts"
Cohesion: 0.05
Nodes (62): BSTNode, bstSearch(), bstSearchDef, buildBst(), PositionedBSTNode, pseudocode, TREE_VALUES, makeTreeStep() (+54 more)

### Community 27 - "ResponsiveInspector.tsx"
Cohesion: 0.24
Nodes (9): getLayout(), InspectorLayout, ResponsiveInspector(), ResponsiveInspectorProps, useInspectorLayout(), PLACEMENT_CLASSES, Sheet(), SheetPlacement (+1 more)

### Community 28 - "AlgorithmControls.tsx"
Cohesion: 0.19
Nodes (12): AlgorithmControls(), FieldKind, fieldsFor(), FieldSpec, parseList(), parseOperations(), Button(), ButtonProps (+4 more)

### Community 32 - "CodePanel.tsx"
Cohesion: 0.47
Nodes (5): CodePanel(), CodePanelProps, formatValue(), LoopScope, PseudocodeLine

### Community 34 - "VisualizationCanvas.tsx"
Cohesion: 0.19
Nodes (11): react, ConsolePanel(), ConsolePanelProps, formatValue(), VarsPanel(), VarsPanelProps, renderVisualization(), VisualizationCanvas() (+3 more)

## Knowledge Gaps
- **206 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `$schema`, `typescript`, `oxc` (+201 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Step` connect `Step` to `CodePanel.tsx`, `stepHelpers.ts`, `VisualizationCanvas.tsx`, `hanoi.ts`, `grid/bfs.ts`, `codeRunner.ts`, `presets.ts`, `Parser`, `usePlayerStore`, `types.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `react` connect `VisualizationCanvas.tsx` to `CodePanel.tsx`, `theme.ts`, `GridViz.tsx`, `codeRunner.ts`, `presets.ts`, `plugins`, `App.tsx`, `usePlayerStore`, `Layout.tsx`, `types.ts`, `ResponsiveInspector.tsx`, `AlgorithmControls.tsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `$schema` to the rest of the system?**
  _206 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `theme.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12807881773399016 - nodes in this community are weakly interconnected._
- **Should `stepHelpers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1422475106685633 - nodes in this community are weakly interconnected._
- **Should `Step` be split into smaller, more focused modules?**
  _Cohesion score 0.06965871902758299 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._