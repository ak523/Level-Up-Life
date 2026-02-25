import type { ReactNode, HTMLAttributes } from 'react'

interface NeoCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  color?: string
}

export function NeoCard({ children, color, className = '', ...props }: NeoCardProps) {
  return (
    <div
      className={`
        bg-white border-4 border-neo-black rounded-md shadow-neo-md p-5
        ${className}
      `.trim()}
      style={color ? { backgroundColor: color } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
