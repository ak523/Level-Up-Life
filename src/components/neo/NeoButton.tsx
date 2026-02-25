import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'bg-neo-xp text-neo-black',
  secondary: 'bg-white text-neo-black',
  danger: 'bg-neo-accent text-white',
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function NeoButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: NeoButtonProps) {
  return (
    <button
      className={`
        font-bold uppercase border-4 border-neo-black rounded-md
        shadow-neo transition-all duration-150
        hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-hover
        active:translate-x-1 active:translate-y-1 active:shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}
      `.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
