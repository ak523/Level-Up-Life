interface StreakBadgeProps {
  streakDays: number
  reducedMotion?: boolean
}

export function StreakBadge({ streakDays, reducedMotion }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-2 bg-orange-950/40 border border-orange-500/30 rounded-xl px-4 py-2">
      <span
        className={`text-3xl ${!reducedMotion ? 'animate-flame-flicker' : ''}`}
        style={{ display: 'inline-block' }}
      >
        🔥
      </span>
      <div>
        <div className="text-xl font-bold text-orange-400">{streakDays}</div>
        <div className="text-xs text-slate-400">day streak</div>
      </div>
    </div>
  )
}
