import * as React from 'react'
import { cn } from '@/lib/utils'
import { INVALID } from '@/components/ui/input'

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'select-chevron h-9 w-full rounded-md border border-field-border bg-white px-2.5 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600',
      INVALID,
      className,
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'
