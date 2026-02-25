import type { InputHTMLAttributes } from 'react'

interface NeoInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function NeoInput({ label, className = '', id, ...props }: NeoInputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold uppercase text-neo-black mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full bg-white border-4 border-neo-black rounded-md px-3 py-2
          text-neo-black placeholder-neutral-400
          focus:outline-none focus:shadow-neo-md focus:-translate-x-0.5 focus:-translate-y-0.5
          transition-all duration-150
          ${className}
        `.trim()}
        {...props}
      />
    </div>
  )
}
