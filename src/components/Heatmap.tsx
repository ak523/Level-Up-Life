import { useState, useEffect } from 'react'
import { getAllActivities } from '../data/repositories/activityRepo'
import { NeoCard } from './neo'

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

  const getIntensityColor = (xp: number): string => {
    if (xp <= 0) return '#FFFDF7'
    const intensity = Math.max(0.15, xp / maxXP)
    if (intensity < 0.3) return '#BAE6FD'
    if (intensity < 0.5) return '#7DD3FC'
    if (intensity < 0.75) return '#38BDF8'
    return '#0284C7'
  }

  return (
    <div className="space-y-4">
      <NeoCard>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="text-neo-black hover:bg-neo-gold border-4 border-neo-black rounded-md px-2 py-1 font-bold transition-all duration-150 hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
            aria-label="Previous month"
          >
            ◀
          </button>
          <h2 className="text-lg font-bold uppercase flex items-center gap-2">
            <span>📊</span> {monthLabel}
          </h2>
          <button
            onClick={nextMonth}
            className="text-neo-black hover:bg-neo-gold border-4 border-neo-black rounded-md px-2 py-1 font-bold transition-all duration-150 hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
            aria-label="Next month"
          >
            ▶
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs text-neo-black font-bold uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} className="aspect-square rounded-none" />
            }
            const dayNum = parseInt(cell.date.split('-')[2])
            const bgColor = getIntensityColor(cell.xp)
            return (
              <div
                key={cell.date}
                className="aspect-square rounded-none border-2 border-neo-black flex items-center justify-center text-xs relative group cursor-default"
                style={{ backgroundColor: bgColor }}
                title={`${cell.date}: ${cell.xp} XP`}
              >
                <span className={`text-[10px] font-bold ${cell.xp > 0 ? 'text-neo-black' : 'text-neutral-400'}`}>
                  {dayNum}
                </span>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                  <div className="bg-white border-4 border-neo-black rounded-md px-2 py-1 text-xs text-neo-black font-bold whitespace-nowrap shadow-neo">
                    {cell.xp > 0 ? `${cell.xp} XP` : 'No activity'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-neutral-500 uppercase">
          <span>Less</span>
          {['#FFFDF7', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0284C7'].map((color) => (
            <div
              key={color}
              className="w-5 h-5 rounded-none border-2 border-neo-black"
              style={{ backgroundColor: color }}
            />
          ))}
          <span>More</span>
        </div>
      </NeoCard>
    </div>
  )
}
