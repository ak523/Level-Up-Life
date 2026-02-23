import { create } from 'zustand'
import type { FeedbackResult } from '../types'

interface UIStore {
  activeTab: 'form' | 'dashboard' | 'shop' | 'settings' | 'schedule' | 'heatmap'
  showFeedbackModal: boolean
  feedbackResult: FeedbackResult | null
  soundEnabled: boolean
  reducedMotion: boolean
  showExportImport: boolean
  nudgeDismissed: boolean
  setActiveTab: (tab: UIStore['activeTab']) => void
  openFeedbackModal: (result: FeedbackResult) => void
  closeFeedbackModal: () => void
  toggleSound: () => void
  toggleReducedMotion: () => void
  toggleExportImport: () => void
  dismissNudge: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'dashboard',
  showFeedbackModal: false,
  feedbackResult: null,
  soundEnabled: true,
  reducedMotion: false,
  showExportImport: false,
  nudgeDismissed: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  openFeedbackModal: (result) => set({ showFeedbackModal: true, feedbackResult: result }),
  closeFeedbackModal: () => set({ showFeedbackModal: false, feedbackResult: null }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
  toggleExportImport: () => set((s) => ({ showExportImport: !s.showExportImport })),
  dismissNudge: () => set({ nudgeDismissed: true }),
}))
