import { create } from 'zustand';

export type EditorTool =
  | 'select'      // drag nodes / move markers / cycle edge weights
  | 'addNode'
  | 'addEdge'
  | 'delete'
  | 'setStart'
  | 'setEnd'
  | 'wall'
  | 'weight'
  | 'erase';

interface EditorState {
  tool: EditorTool;
  pendingEdgeFrom: string | null;
  setTool: (tool: EditorTool) => void;
  setPendingEdgeFrom: (id: string | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  tool: 'select',
  pendingEdgeFrom: null,
  setTool: (tool) =>
    set((s) => ({
      tool,
      pendingEdgeFrom: s.pendingEdgeFrom !== null && tool !== 'addEdge' ? null : s.pendingEdgeFrom,
    })),
  setPendingEdgeFrom: (pendingEdgeFrom) => set({ pendingEdgeFrom }),
}));