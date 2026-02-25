interface NeoProgressBarProps {
  percentage: number
  color: string
  label?: string
  value?: string | number
  height?: string
}

export function NeoProgressBar({
  percentage,
  color,
  label,
  value,
  height = 'h-5',
}: NeoProgressBarProps) {
  const clampedPct = Math.min(100, Math.max(0, percentage))
  return (
    <div>
      {(label || value !== undefined) && (
        <div className="flex justify-between text-xs font-bold uppercase text-neo-black mb-1">
          {label && <span>{label}</span>}
          {value !== undefined && <span>{value}</span>}
        </div>
      )}
      <div className={`${height} bg-white border-4 border-neo-black rounded-md overflow-hidden`}>
        <div
          className="h-full rounded-none transition-all duration-700"
          style={{ width: `${clampedPct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
