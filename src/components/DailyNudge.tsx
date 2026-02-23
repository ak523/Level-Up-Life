import { useUIStore } from '../state/useUIStore'

export function DailyNudge() {
  const { nudgeDismissed, dismissNudge } = useUIStore()
  if (nudgeDismissed) return null

  return (
    <div className="animate-nudge-pulse bg-gradient-to-r from-brand-accent/20 to-purple-600/20 border border-brand-accent/40 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚔️</span>
        <p className="text-sm text-slate-200">
          <span className="font-bold text-brand-accent">Your daily quest awaits</span>
          {' '}— don't break the streak!
        </p>
      </div>
      <button
        onClick={dismissNudge}
        className="text-slate-500 hover:text-white transition-colors text-lg leading-none"
        aria-label="Dismiss nudge"
      >
        ×
      </button>
    </div>
  )
}
