import { computeXPProgress } from '../lib/rpg-math'

interface XPBarProps {
  totalXP: number
  level: number
}

export function XPBar({ totalXP, level }: XPBarProps) {
  const { currentXP, requiredXP, percentage } = computeXPProgress(totalXP, level)

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span className="text-brand-xp font-bold">LVL {level}</span>
        <span>{currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP</span>
      </div>
      <div className="h-4 bg-brand-surface rounded-full overflow-hidden border border-brand-card">
        <div
          className="h-full bg-gradient-to-r from-brand-xp to-blue-400 rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="text-right text-xs text-slate-500 mt-0.5">{percentage}%</div>
    </div>
  )
}
