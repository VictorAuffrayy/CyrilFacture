import { Dialog } from './dialog'
import { Button } from './button'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  danger = false,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  message: React.ReactNode
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} className="max-w-md">
      <div className="px-5 py-4 text-sm text-ink-700">{message}</div>
      <div className="flex items-center gap-2 border-t border-ink-200 px-5 py-3">
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </Dialog>
  )
}
