import * as React from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin text-brand-700', className)} />
}

const LOADING_LINES = [
  'On aligne les lignes du devis…',
  'On additionne les jours…',
  'On relit les conditions générales…',
  'On vérifie les arrondis…',
  'On ressort les bons modèles…',
  'On chauffe le café… ☕',
  'On réveille les serveurs…',
]

// a playful line, only once the wait is noticeable (fast loads never flicker)
export function CenterSpinner() {
  const [line] = React.useState(() => LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)])
  const [slow, setSlow] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => setSlow(true), 600)
    return () => clearTimeout(t)
  }, [])
  return (
    <div role="status" className="flex h-full w-full flex-col items-center justify-center gap-3 py-20">
      <Spinner className="h-6 w-6" />
      <span className={cn('text-sm text-ink-500', slow ? 'animate-rise' : 'sr-only')}>{slow ? line : 'Chargement…'}</span>
    </div>
  )
}
/** Shown when a data query fails, instead of a misleading empty/blank screen. */
export function CenterError({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 py-20 text-center">
      <AlertTriangle className="h-6 w-6 text-danger" />
      <p className="font-medium text-ink-700">{message ?? 'Impossible de charger les données.'}</p>
      <p className="max-w-sm text-sm text-ink-500">Vérifiez votre connexion puis réessayez.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Réessayer
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string
  hint?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="mb-3 text-ink-300">{icon}</div>}
      <p className="font-medium text-ink-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-500">{hint}</p>}
    </div>
  )
}

/** Segmented control e.g. Active / Archived / All. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  disabled = false,
}: {
  options: { value: T; label: React.ReactNode }[]
  value: T
  onChange: (v: T) => void
  label?: string
  disabled?: boolean
}) {
  return (
    <div
      role="group"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cn('inline-flex rounded-lg bg-ink-100 p-0.5', disabled && 'opacity-50')}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md px-3 py-1 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:cursor-not-allowed',
            value === o.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
