import * as React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'icon'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm disabled:bg-ink-100 disabled:text-ink-500 disabled:shadow-none',
  secondary: 'bg-ink-100 text-ink-800 hover:bg-ink-200 disabled:opacity-50',
  ghost: 'text-ink-600 hover:bg-ink-100 disabled:opacity-50',
  danger: 'bg-[var(--color-danger-fill,var(--color-danger))] text-white hover:opacity-90 disabled:bg-ink-100 disabled:text-ink-500',
  outline: 'border border-ink-300 bg-white text-ink-700 hover:bg-ink-50 disabled:opacity-50',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-9 px-4 text-sm',
  icon: 'h-8 w-8',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
