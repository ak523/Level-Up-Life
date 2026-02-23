import { useEffect } from 'react'
import { useGameStore } from './state/useGameStore'
import { useUIStore } from './state/useUIStore'
import { Dashboard } from './components/Dashboard'
import { ActivityForm } from './components/ActivityForm'
import { FeedbackModal } from './components/FeedbackModal'
import { Shop } from './components/Shop'
import { Settings } from './components/Settings'
import { NavBar } from './components/NavBar'
import { SchedulingLog } from './components/SchedulingLog'
import { Heatmap } from './components/Heatmap'

export default function App() {
  const { loadData } = useGameStore()
  const { activeTab } = useUIStore()

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <header className="bg-brand-surface border-b border-brand-card px-4 py-3 flex items-center justify-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚔️</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-brand-accent to-brand-xp bg-clip-text text-transparent">
            Level Up Life
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'form' && <ActivityForm />}
        {activeTab === 'schedule' && <SchedulingLog />}
        {activeTab === 'heatmap' && <Heatmap />}
        {activeTab === 'shop' && <Shop />}
        {activeTab === 'settings' && <Settings />}
      </main>

      <NavBar />
      <FeedbackModal />
    </div>
  )
}
