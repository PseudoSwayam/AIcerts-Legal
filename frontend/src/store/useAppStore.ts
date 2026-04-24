import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Clause, ContractDocument, PlaybookRule } from "@/types";
import { mockPlaybookRules, mockRecentDocs } from "@/services/legalApi";

interface AppState {
  // Documents
  documents: ContractDocument[];
  uploadedDocument: { name: string; text: string } | null;
  setUploadedDocument: (doc: { name: string; text: string } | null) => void;

  // Generated contract
  generatedContract: string;
  setGeneratedContract: (text: string) => void;

  // Risk / clause analysis
  clauses: Clause[];
  setClauses: (clauses: Clause[]) => void;

  // Playbook
  playbookRules: PlaybookRule[];
  addPlaybookRule: (rule: PlaybookRule) => void;
  removePlaybookRule: (id: string) => void;

  // Settings
  apiKey: string;
  setApiKey: (key: string) => void;
  aiSuggestionsEnabled: boolean;
  setAiSuggestionsEnabled: (v: boolean) => void;
  autoAnalyzeOnUpload: boolean;
  setAutoAnalyzeOnUpload: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      documents: mockRecentDocs,
      uploadedDocument: null,
      setUploadedDocument: (uploadedDocument) => set({ uploadedDocument }),

      generatedContract: "",
      setGeneratedContract: (generatedContract) => set({ generatedContract }),

      clauses: [],
      setClauses: (clauses) => set({ clauses }),

      playbookRules: mockPlaybookRules,
      addPlaybookRule: (rule) =>
        set((s) => ({ playbookRules: [rule, ...s.playbookRules] })),
      removePlaybookRule: (id) =>
        set((s) => ({ playbookRules: s.playbookRules.filter((r) => r.id !== id) })),

      apiKey: "",
      setApiKey: (apiKey) => set({ apiKey }),
      aiSuggestionsEnabled: true,
      setAiSuggestionsEnabled: (aiSuggestionsEnabled) => set({ aiSuggestionsEnabled }),
      autoAnalyzeOnUpload: true,
      setAutoAnalyzeOnUpload: (autoAnalyzeOnUpload) => set({ autoAnalyzeOnUpload }),
    }),
    {
      name: "legal-tool-store",
      partialize: (state) => ({
        playbookRules: state.playbookRules,
        apiKey: state.apiKey,
        aiSuggestionsEnabled: state.aiSuggestionsEnabled,
        autoAnalyzeOnUpload: state.autoAnalyzeOnUpload,
      }),
    }
  )
);
