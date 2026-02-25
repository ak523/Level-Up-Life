import { computeXPProgress } from '../lib/rpg-math'
import { NeoProgressBar } from './neo'

interface XPBarProps {
  totalXP: number
  level: number
}

export function XPBar({ totalXP, level }: XPBarProps) {
  const { currentXP, requiredXP, percentage } = computeXPProgress(totalXP, level)

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-neutral-500 mb-1">
        <span className="text-neo-xp font-bold uppercase">LVL {level}</span>
        <span className="font-bold">{currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP</span>
      </div>
      <NeoProgressBar percentage={percentage} color="#38BDF8" height="h-5" />
      <div className="text-right text-xs font-bold text-neutral-500 mt-0.5">{percentage}%</div>
    </div>
  )
}
