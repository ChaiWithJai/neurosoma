import { create } from 'zustand';
import type { EducationResponse } from './medgemma';
import type { MatchedProtocol } from './protocol-matcher';

type AppView = 'hero' | 'question' | 'results';

interface NeuroSomaStore {
  // View state
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // User's health question
  healthQuestion: string;
  setHealthQuestion: (q: string) => void;

  // Optional additional context
  condition: string;
  setCondition: (c: string) => void;
  currentTreatments: string;
  setCurrentTreatments: (t: string) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;

  // MedGemma education response
  education: EducationResponse | null;
  setEducation: (edu: EducationResponse | null) => void;

  // Matched protocol
  protocol: MatchedProtocol | null;
  setProtocol: (p: MatchedProtocol | null) => void;

  // Results section state (which tab is active)
  activeTab: 'education' | 'contraindications' | 'protocol';
  setActiveTab: (tab: 'education' | 'contraindications' | 'protocol') => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentView: 'hero' as AppView,
  healthQuestion: '',
  condition: '',
  currentTreatments: '',
  isLoading: false,
  error: null,
  education: null,
  protocol: null,
  activeTab: 'education' as const,
};

export const useNeuroSomaStore = create<NeuroSomaStore>((set) => ({
  ...initialState,

  setCurrentView: (view) => set({ currentView: view }),
  setHealthQuestion: (q) => set({ healthQuestion: q }),
  setCondition: (c) => set({ condition: c }),
  setCurrentTreatments: (t) => set({ currentTreatments: t }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err }),
  setEducation: (edu) => set({ education: edu }),
  setProtocol: (p) => set({ protocol: p }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  reset: () => set(initialState),
}));
