## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

---

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` (runs `tsc -b && vite build`) |
| Lint | `npm run lint` (oxlint) |
| Preview build | `npm run preview` |
| Tests | `npx vitest run` |
| Typecheck | `npx tsc --noEmit` |

**Order matters**: `lint -> typecheck -> test` for CI-style verification.

---

## Architecture

**Stack**: React 19 + TypeScript + Vite + Zustand + TailwindCSS v4 + React Router 7

**Entry points**:
- `src/main.tsx` → `src/App.tsx` (routes: `/`, `/category/:id`, `/algorithm/:id`)
- Algorithms auto-register via side-effect imports in `src/algos/<category>/index.ts`

**Core types** (`src/core/types.ts`):
- `AlgorithmDef` — generator function (`run: (input) => Generator<Step>`), pseudocode lines, complexity, default input
- `Step` — line number, description, vars, loop stack, viz payload (array/graph/grid/tree/list/table/none)
- Categories: `sorting`, `search`, `graph`, `grid`, `ds`, `dp`, `recursion`

**Registry** (`src/core/registry.ts`):
- `registerAlgorithm(def)` — called at module load in each algorithm file
- `getAlgorithm(id)`, `getAlgorithmsByCategory(cat)`, `getAllAlgorithms()`

**Player store** (`src/core/player.ts`):
- Zustand store with steps precomputed on algorithm/input change
- `patchInput(input)` — regenerates trace, preserves cursor if at end
- `regenerate()` — fresh random data (respects custom grid dimensions)
- `useCurrentStep()`, `useHistoryStats(steps, cursor)`

**Algorithm structure** (e.g. `src/algos/sorting/bubbleSort.ts`):
1. Import types, registry, helpers
2. Define pseudocode array (objects with `text`, `indent`, `isLoopHeader`, `loopLabel`)
3. Export generator function `*algoName(input)` yielding `Step` objects via helpers
4. Create `AlgorithmDef` and call `registerAlgorithm(def)`

**Visualizers** (`src/components/viz/`):
- `ArrayViz`, `GraphViz`, `GridViz` — render `Step.viz` payload

---

## Testing

- Framework: Vitest
- Test files: `src/tests/*.test.ts`
- Run single test file: `npx vitest run src/tests/graph.test.ts`
- Tests import algorithm modules via side-effect: `import '../algos/graph'`
- Graph/grid tests verify: path optimality, wall respect, cost matching, directed behavior, ID regeneration
- Sorting tests verify: final sorted array, pseudocode line validity, semantic line matching, no duplicate values mid-trace
- Search tests verify: correct index/pair finding

**Known flaky test**: `graph.test.ts` — "bfs path has minimal hop count" fails intermittently (expects 3 hops, gets 4). See `vitest-out.txt`.

---

## Adding a new algorithm

1. Create `src/algos/<category>/<name>.ts`
2. Follow pattern in `bubbleSort.ts`: generator yielding `Step` via `makeArrayStep`/`makeGraphStep`/`makeGridStep` from helpers
3. Export and register in `src/algos/<category>/index.ts`
4. Add tests in `src/tests/` mirroring existing patterns
5. Run `npx vitest run` to verify

---

## Key conventions

- Algorithm generators are pure; no side effects
- Steps reference pseudocode line numbers (0-indexed); must not point to blank lines
- `Step.viz` payload discriminated union by `type` — exhaustive handling in visualizers
- Grid/graph input uses normalized coordinates (0–100 for graph, row/col for grid)
- Grid walls/weights use `"r,c"` string keys
- Player precomputes all steps upfront — suitable for algorithms with bounded steps

---

## File structure highlights

```
src/
├── algos/
│   ├── sorting/     # 6 algorithms (bubble, insertion, selection, merge, quick, heap)
│   ├── search/      # 3 algorithms (linear, binary, two-pointers)
│   ├── graph/       # 4 algorithms (bfs, dfs, dijkstra, astar)
│   ├── grid/        # 4 algorithms (bfs, dfs, dijkstra, astar)
│   └── <category>/index.ts   # side-effect imports for registration
├── core/
│   ├── types.ts     # all shared types
│   ├── registry.ts  # algorithm registry + categories
│   ├── player.ts    # Zustand store + step collection
│   └── presets.ts   # random graph/grid generators
├── components/
│   ├── viz/         # ArrayViz, GraphViz, GridViz
│   ├── panels/      # CodePanel, VarsPanel, NarrationBar
│   ├── player/      # PlayerControls, EditorToolbar
│   └── layout/      # Layout, Sidebar
└── tests/           # vitest files
```