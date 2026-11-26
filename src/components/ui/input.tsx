import * as React from 'react'
import { cn } from '@/lib/utils'

/** Bordure d'erreur, pilotée par aria-invalid : l'état visuel et l'état annoncé ne peuvent pas diverger. */
export const INVALID = 'aria-[invalid=true]:border-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger/15'
/** Variante pour un contrôle dont la bordure est portée par un conteneur (combobox). */
export const INVALID_WITHIN =
  'has-[[aria-invalid=true]]:border-danger has-[[aria-invalid=true]]:ring-2 has-[[aria-invalid=true]]:ring-danger/15'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-md border border-field-border bg-white px-3 text-sm outline-none transition placeholder:text-ink-500 focus:border-brand-600 focus:ring-2 focus:ring-brand-600 disabled:bg-ink-50',
        INVALID,
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-md border border-field-border bg-white px-3 py-2 text-sm outline-none transition placeholder:text-ink-500 focus:border-brand-600 focus:ring-2 focus:ring-brand-600',
      INVALID,
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-xs font-medium text-ink-500', className)} {...props} />
}

/**
 * Libellé + contrôle + message d'erreur. Le contrôle enfant doit recevoir
 * `{...ariaFor(errors, id)}` pour être relié au message.
 *
 * `hint` : consigne du champ (reliée par `aria-describedby`, comme l'erreur).
 *
 * « Obligatoire » est écrit dans le libellé (masqué visuellement) plutôt que via
 * aria-required : il atteint ainsi aussi les contrôles custom, qui ne relaient
 * pas cet attribut.
 */
export function Field({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  id: string
  label: React.ReactNode
  required?: boolean
  error?: string
  /** Consigne d'une phrase, entre le libellé et le champ ; le contrôle la relie avec `ariaFor(errors, id, true)`. */
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      {/* id `${id}-label` : un contrôle composé (DateRangePicker) s'en sert pour nommer son groupe */}
      <Label htmlFor={id} id={`${id}-label`}>
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-danger"> *</span>
            <span className="sr-only"> (obligatoire)</span>
          </>
        )}
      </Label>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-xs text-ink-500">
          {hint}
        </p>
      )}
      <div className="mt-1">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11px] text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

/** Explique l'astérisque une fois par formulaire (WCAG 3.3.2). */
export function RequiredLegend() {
  return (
    <p className="text-[11px] text-ink-500">
      Les champs marqués <span className="text-danger">*</span> sont obligatoires.
    </p>
  )
}
