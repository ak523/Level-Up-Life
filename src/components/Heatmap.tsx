import { useState, useEffect } from 'react'
import { getAllActivities } from '../data/repositories/activityRepo'

export function Heatmap() {
  const [dailyXP, setDailyXP] = useState<Record<string, number>>({})
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  useEffect(() => {
    getAllActivities().then((activities) => {
      const map: Record<string, number> = {}
      for (const a of activities) {
        map[a.date] = (map[a.date] ?? 0) + a.finalXP
      }
      setDailyXP(map)
    })
  }, [])

  const { year, month } = currentMonth
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow = firstDay.getDay() // 0=Sun

  const monthLabel = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Build grid cells
  const cells: Array<{ date: string; xp: number } | null> = []
  // Empty padding for days before the 1st
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ date: dateStr, xp: dailyXP[dateStr] ?? 0 })
  }

  // Find max XP for color scaling
  const monthXPs = cells.filter(Boolean).map((c) => c!.xp)
  const maxXP = Math.max(1, ...monthXPs)

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { ...prev, month: prev.month - 1 }
    })
  }
  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { ...prev, month: prev.month + 1 }
    })
  }

  return (
    <div className="space-y-4">
      <div className="bg-brand-surface border border-brand-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="text-slate-400 hover:text-white transition-colors px-2 py-1"
            aria-label="Previous month"
          >
            ◀
          </button>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>📊</span> {monthLabel}
          </h2>
          <button
            onClick={nextMonth}
            className="text-slate-400 hover:text-white transition-colors px-2 py-1"
            aria-label="Next month"
          >
            ▶
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs text-slate-500 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} className="aspect-square rounded-md" />
            }
            const intensity = cell.xp > 0 ? Math.max(0.15, cell.xp / maxXP) : 0
            const dayNum = parseInt(cell.date.split('-')[2])
            return (
              <div
                key={cell.date}
                className="aspect-square rounded-md flex items-center justify-center text-xs relative group cursor-default"
                style={{
                  backgroundColor: intensity > 0 ? `rgba(0, 212, 255, ${intensity})` : 'rgba(255,255,255,0.03)',
                }}
                title={`${cell.date}: ${cell.xp} XP`}
              >
                <span className={`${intensity > 0.5 ? 'text-white' : 'text-slate-500'} text-[10px]`}>
                  {dayNum}
                </span>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                  <div className="bg-brand-bg border border-brand-card rounded px-2 py-1 text-xs text-slate-300 whitespace-nowrap shadow-lg">
                    {cell.xp > 0 ? `${cell.xp} XP` : 'No activity'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((level) => (
            <div
              key={level}
              className="w-4 h-4 rounded-sm"
              style={{
                backgroundColor: level > 0 ? `rgba(0, 212, 255, ${level})` : 'rgba(255,255,255,0.03)',
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
