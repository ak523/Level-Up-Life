import { useUIStore } from '../state/useUIStore'
import { useGameStore } from '../state/useGameStore'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'form', label: 'Quest', icon: '⚔️' },
  { id: 'shop', label: 'Shop', icon: '🏪' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
] as const

export function NavBar() {
  const { activeTab, setActiveTab } = useUIStore()
  const { meta } = useGameStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-brand-surface border-t border-brand-card z-30 flex justify-center">
      <div className="flex w-full max-w-2xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-3 px-2 text-xs font-medium transition-all duration-200 hover:bg-brand-card/50 ${
              activeTab === tab.id ? 'text-brand-accent' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`text-xl mb-0.5 transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : ''}`}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {tab.id === 'shop' && meta && (
              <span className="text-brand-gold text-xs">{meta.attributes.GOLD}💰</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
