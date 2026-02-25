interface StreakBadgeProps {
  streakDays: number
  reducedMotion?: boolean
}

export function StreakBadge({ streakDays, reducedMotion }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-2 bg-neo-orange border-4 border-neo-black rounded-md px-4 py-2 shadow-neo">
      <span
        className={`text-3xl ${!reducedMotion ? 'animate-flame-flicker' : ''}`}
        style={{ display: 'inline-block' }}
      >
        🔥
      </span>
      <div>
        <div className="text-xl font-bold text-neo-black">{streakDays}</div>
        <div className="text-xs font-bold uppercase text-neo-black/70">day streak</div>
      </div>
    </div>
  )
}
