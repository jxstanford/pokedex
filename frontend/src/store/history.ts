import { create } from 'zustand';
import type { AnalysisResponse } from '../types/pokemon';

interface HistoryState {
  entries: AnalysisResponse[];
  addEntry: (analysis: AnalysisResponse) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  entries: [],
  addEntry: (analysis) =>
    set((state) => ({
      entries: [analysis, ...state.entries].slice(0, 10),
    })),
  clear: () => set({ entries: [] }),
}));
