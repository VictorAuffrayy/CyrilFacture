import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Dialog({
  open,
  onClose,
  children,
  className,
  title,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  title?: React.ReactNode
}) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const headerRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()

  // Esc to close + trap Tab focus inside the dialog
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // un menu ouvert dans la fenêtre (SearchSelect) a déjà consommé Échap
        if (e.defaultPrevented) return
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const f = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // move focus into the dialog on open, restore it to the trigger on close
  React.useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    // premier champ ou bouton du contenu ; la croix de l'en-tête seulement s'il n'y a rien d'autre
    const all = Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    const first = all.find((el) => !headerRef.current?.contains(el)) ?? all[0]
    ;(first ?? panel)?.focus()
    // preventScroll : le déclencheur peut être hors champ (ex. barre du planning
    // qui ne prend pas le focus) — sans ça, la grille remonte à la fermeture
    return () => prev?.focus?.({ preventScroll: true })
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/40 mobile:pr-[env(safe-area-inset-right)] mobile:pl-[env(safe-area-inset-left)] md:p-4 md:py-12">
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          // < md : plein écran (min-h-dvh, sans coins) ; max-w-* non préfixé exprès :
          // les appelants passent max-w-md / max-w-sm et twMerge doit pouvoir l'écraser
          'relative min-h-dvh w-full max-w-lg bg-white pb-[env(safe-area-inset-bottom)] outline-none md:min-h-0 md:rounded-xl md:border md:border-ink-200 md:pb-0 md:shadow-xl',
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title != null ? titleId : undefined}
      >
        {title != null && (
          // sticky (mobile seulement) : le bouton Fermer reste visible quand le formulaire défile ;
          // pt : l'en-tête plein écran passe sous l'encoche (viewport-fit=cover)
          <div ref={headerRef} className="mobile:sticky mobile:top-0 z-10 flex items-center justify-between border-b border-ink-200 bg-white px-5 py-3.5 mobile:pt-[calc(0.875rem+env(safe-area-inset-top))] md:rounded-t-xl">
            <h2 id={titleId} className="text-lg font-semibold text-ink-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-700"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
