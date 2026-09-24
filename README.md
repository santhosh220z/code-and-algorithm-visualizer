# Algorithm Visualizer

An interactive, step-by-step visualizer for algorithms and data structures. Watch pseudocode, variables, and animated visualizations evolve in sync as each algorithm runs.

It also includes a **Code Visualizer**: paste or type your own Python-flavored program and watch it execute line by line, with live variables, loop progress, a recursive call stack, and console output.

## ✨ Features

- **Step-by-step playback** — play, pause, step forward/back, and jump to start/end
- **Live pseudocode panel** — active line highlighting, per-line hit counters, and execution trails
- **Linked visualizations** — arrays, graphs, grids, tables, trees, and linked lists that update with every step
- **Variable inspector** — see `i`, `left`, `right`, `pivot`, and other variables change in real time
- **Call stack view** — recursion frames shown for recursive algorithms
- **Editable inputs** — resize arrays, drag graph nodes, paint grid walls and weights, edit data structures
- **Regenerate** — fresh random inputs with one click (custom grid dimensions are preserved)
- **Code Visualizer** — write your own code and step through its execution (see below)

## 💻 Code Visualizer

Open **Code Visualizer** from the sidebar or the home page. Paste or type code in the
built-in editor, pick a sample program to start from, and hit **Visualize** to step through it.

Supported constructs (a teaching subset of Python, interpreted in the browser — no server):

| Feature | Examples |
| --- | --- |
| Variables & compound assignment | `a = 1`, `a += 2` |
| Conditionals | `if` / `elif` / `else` |
| Loops | `while cond:`, `for x in range(n):` |
| Functions & recursion | `def f(n):` … `return` |
| Lists | `[1, 2, 3]`, `a[i]`, `a.append(v)`, `a.pop()`, … |
| Output | `print(...)` |
| Built-ins | `range`, `len`, `sum`, `min`, `max`, `abs`, `round`, `sqrt`, `str`, `int`, `float` |

The trace highlights the executing line, shows every variable's value, tracks loop
iterations, renders the recursive call stack, and streams `print` output to a console panel.
Runaway loops are capped by a step budget so the browser never hangs.

## 🗺️ Algorithms

| Category | Algorithms |
| --- | --- |
| **Sorting** | Bubble, Selection, Insertion, Merge, Quick, Heap |
| **Searching** | Linear, Binary, Two Pointers |
| **Graph Traversal** | BFS, DFS, Dijkstra, A* |
| **Pathfinding (Grid)** | BFS, DFS, Dijkstra, A* |
| **Data Structures** | Stack, Queue, Binary Search Tree, Hash Table |
| **Dynamic Programming** | Fibonacci, 0/1 Knapsack, Longest Common Subsequence |
| **Recursion** | Factorial, Tower of Hanoi, Permutations |

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| UI | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build | [Vite](https://vitejs.dev) |
| State | [Zustand](https://zustand.docs.pmnd.rs) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Routing | [React Router 7](https://reactrouter.com) |
| Linting | [Oxlint](https://oxc.rs/docs/guide/usage/linter) |
| Testing | [Vitest](https://vitest.dev) |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Open the app
# http://localhost:5173
```

## 📦 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production (`tsc -b && vite build`) |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |
| `npx tsc --noEmit` | Type-check without emitting |
| `npx vitest run` | Run the test suite |

## 🏗️ Architecture

Algorithms are pure generator functions that yield a `Step` for every action — a pseudocode line, description, variables, loop context, and a visualization payload. The player store precomputes all steps up front, so scrubbing through a trace is always instant.

```
src/
├── algos/            # Algorithm generators (one file per algorithm)
│   └── <category>/   # sorting, search, graph, grid, ds, dp, recursion
├── core/
│   ├── types.ts      # Shared types (Step, AlgorithmDef, AlgorithmInput, …)
│   ├── stepHelpers.ts# Shared step builders (array, table, pointers, frames)
│   ├── registry.ts   # Algorithm registry + categories
│   ├── player.ts     # Zustand playback store
│   ├── presets.ts    # Random graph/grid/array generators
│   ├── codeRunner.ts # Code Visualizer store + sample snippets
│   └── codeLang/     # miniPython lexer, parser, interpreter
├── components/
│   ├── viz/          # ArrayViz, GraphViz, GridViz, …
│   ├── panels/       # CodePanel, VarsPanel, NarrationBar
│   ├── code/         # CodeEditor, ConsolePanel
│   ├── player/       # PlayerControls, EditorToolbar
│   └── layout/       # Layout, Sidebar
└── tests/            # Vitest files
```

The Code Visualizer reuses the same `Step` model: its interpreter
(`src/core/codeLang/`) walks the parsed program and emits one `Step` per executed
statement, which the existing player store then plays back like any algorithm.

## 🧩 Adding a New Algorithm

1. Create `src/algos/<category>/<name>.ts`, modeled on `src/algos/sorting/bubbleSort.ts`
2. Export a generator that yields `Step`s via the shared [step builders](src/core/stepHelpers.ts)
3. Register it in `src/algos/<category>/index.ts`
4. Add a test in `src/tests/`
5. Run `npx vitest run` to verify

---

Built by [santhosh220z](https://github.com/santhosh220z)