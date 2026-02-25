import { useUIStore } from '../state/useUIStore'

export function DailyNudge() {
  const { nudgeDismissed, dismissNudge } = useUIStore()
  if (nudgeDismissed) return null

  return (
    <div className="animate-nudge-pulse bg-neo-gold border-4 border-neo-black rounded-md px-4 py-3 flex items-center justify-between gap-4 shadow-neo">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚔️</span>
        <p className="text-sm text-neo-black">
          <span className="font-bold uppercase">Your daily quest awaits</span>
          {' '}— don't break the streak!
        </p>
      </div>
      <button
        onClick={dismissNudge}
        className="text-neo-black hover:text-neo-accent transition-colors text-lg leading-none font-bold"
        aria-label="Dismiss nudge"
      >
        ×
      </button>
    </div>
  )
}
