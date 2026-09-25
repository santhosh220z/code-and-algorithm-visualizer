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
  linkTo: string;
  gridDraft: { r: string; c: string } | null;
  inputDrafts: Record<string, Record<string, string>>;
  status: string;
  setTool: (tool: EditorTool) => void;
  setStatus: (status: string) => void;
  setPendingEdgeFrom: (id: string | null) => void;
  setLinkTo: (id: string) => void;
  setGridDraft: (draft: { r: string; c: string } | null) => void;
  setInputDraft: (algorithmId: string, name: string, value: string) => void;
  clearInputDrafts: (algorithmId: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  tool: 'select',
  pendingEdgeFrom: null,
  linkTo: '',
  gridDraft: null,
  inputDrafts: {},
  status: 'Choose a tool, then edit the visualization.',
  setStatus: (status) => set({ status }),
  setTool: (tool) =>
    set((s) => ({
      tool,
      pendingEdgeFrom: s.pendingEdgeFrom !== null && tool !== 'addEdge' ? null : s.pendingEdgeFrom,
    })),
  setPendingEdgeFrom: (pendingEdgeFrom) => set({ pendingEdgeFrom }),
  setLinkTo: (linkTo) => set({ linkTo }),
  setGridDraft: (gridDraft) => set({ gridDraft }),
  setInputDraft: (algorithmId, name, value) =>
    set((s) => ({
      inputDrafts: {
        ...s.inputDrafts,
        [algorithmId]: { ...(s.inputDrafts[algorithmId] ?? {}), [name]: value },
      },
    })),
  clearInputDrafts: (algorithmId) =>
    set((s) => {
      const next = { ...s.inputDrafts };
      delete next[algorithmId];
      return { inputDrafts: next };
    }),
}));