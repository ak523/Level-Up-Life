interface AttributeBarProps {
  name: string
  value: number
  color: string
  icon: string
}

const MAX_DISPLAY = 500

export function AttributeBar({ name, value, color, icon }: AttributeBarProps) {
  const pct = Math.min(100, Math.round((value / MAX_DISPLAY) * 100))
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg w-6 text-center">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-0.5">
          <span className="font-semibold text-slate-300">{name}</span>
          <span className="text-slate-400">{value}</span>
        </div>
        <div className="h-2 bg-brand-surface rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  )
}
