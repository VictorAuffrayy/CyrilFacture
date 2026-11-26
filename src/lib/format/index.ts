// Formats français des chiffres d'un devis (repris de cadran src/lib/format).
import { EMPTY } from '@/lib/utils'

export {
  formatDecimal,
  formatDecimalInput,
  formatJours,
  formatMontant,
  parseDecimalInput,
} from './numbers'
export { EMPTY }

/** `value` ou `EMPTY` si null, undefined ou chaîne vide. */
export function orEmpty(value: string | number | null | undefined): string {
  return value == null || value === '' ? EMPTY : String(value)
}

const dateCourte = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

/** Date courte « 3 nov. 2026 » (date seule AAAA-MM-JJ ou horodatage ISO), `EMPTY` si absente. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return EMPTY
  // une date seule est lue en heure locale : new Date('2026-11-03') serait minuit UTC, la veille à l'ouest
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  return Number.isNaN(d.getTime()) ? EMPTY : dateCourte.format(d)
}
