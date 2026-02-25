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
    <div className="min-h-screen bg-neo-bg text-neo-black">
      <header className="bg-neo-gold border-b-4 border-neo-black px-4 py-3 flex items-center justify-center sticky top-0 z-20 shadow-neo">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚔️</span>
          <h1 className="text-xl font-bold uppercase tracking-wide text-neo-black">
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
