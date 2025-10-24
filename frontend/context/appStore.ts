import { create } from 'zustand';
// JS module imports OK in TS
import { setOnboardingComplete as persistOnboarding, setConsentAccepted as persistConsent, clearOnboardingConsent } from '../utils/auth';

export type ReportItem = {
  id: string;
  date: string; // ISO
  riskScore: number; // 0..100
  summary?: string;
};

export type PredictionItem = {
  id: string; // reportId or generated id
  date: string; // ISO datetime
  diseases: Array<{ name: string; probability: number; band: 'low' | 'medium' | 'high' }>;
  summary: string; // e.g., Top: Diabetes High (82%)
  reportId?: string;
};

export type User = {
  email: string;
  name?: string;
};

interface AppState {
  // demo
  count: number;
  increment: () => void;
  // onboarding/consent
  onboardingComplete: boolean;
  consentAccepted: boolean;
  completeOnboarding: () => void;
  acceptConsent: () => void;
  resetOnboarding: () => void;
  // auth
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  // reports/history
  reportHistory: ReportItem[];
  addReport: (r: ReportItem) => void;
  setReports: (arr: ReportItem[]) => void;
  // predictions history
  predictionHistory: PredictionItem[];
  addPrediction: (p: PredictionItem) => void;
}

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  onboardingComplete: false,
  consentAccepted: false,
  completeOnboarding: () => {
    set({ onboardingComplete: true });
    // fire-and-forget persistence
    try { void persistOnboarding(true); } catch {}
  },
  acceptConsent: () => {
    set({ consentAccepted: true });
    try { void persistConsent(true); } catch {}
  },
  resetOnboarding: () => {
    set({ onboardingComplete: false, consentAccepted: false, currentUser: null });
    try { void clearOnboardingConsent(); } catch {}
  },
  currentUser: null,
  setCurrentUser: (u) => set({ currentUser: u }),
  reportHistory: [],
  addReport: (r) => set((s) => ({ reportHistory: [r, ...s.reportHistory] })),
  setReports: (arr) => set({ reportHistory: arr }),
  predictionHistory: [],
  addPrediction: (p) => set((s) => ({ predictionHistory: [p, ...s.predictionHistory] })),
}));
