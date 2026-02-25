import { useUIStore } from '../state/useUIStore'
import { useGameStore } from '../state/useGameStore'

const TABS = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'form', label: 'Quest', icon: '⚔️' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
  { id: 'heatmap', label: 'Heatmap', icon: '📊' },
  { id: 'shop', label: 'Shop', icon: '🏪' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
] as const

export function NavBar() {
  const { activeTab, setActiveTab } = useUIStore()
  const { meta } = useGameStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-neo-black z-30 flex justify-center">
      <div className="flex w-full max-w-2xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-3 px-2 text-xs font-bold uppercase transition-all duration-150 ${
              activeTab === tab.id
                ? 'text-neo-black bg-neo-gold'
                : 'text-neutral-500 hover:text-neo-black hover:bg-neutral-100'
            }`}
          >
            <span className={`text-xl mb-0.5 ${activeTab === tab.id ? 'scale-110' : ''}`}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {tab.id === 'shop' && meta && (
              <span className="text-neo-black text-xs font-bold">{meta.attributes.GOLD}💰</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
