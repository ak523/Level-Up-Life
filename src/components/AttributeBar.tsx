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
          <span className="font-bold uppercase text-neo-black">{name}</span>
          <span className="font-bold text-neutral-500">{value}</span>
        </div>
        <div className="h-4 bg-white border-4 border-neo-black rounded-md overflow-hidden">
          <div
            className="h-full rounded-none transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  )
}
