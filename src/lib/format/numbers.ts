const jours = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
})

const montant = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Décimaux sans unité (virgule, pas d’espace insécable pour la saisie). */
const decimal = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
  useGrouping: false,
})

export function formatJours(value: number | null | undefined): string {
  const n = Number(value)
  const safe = Number.isFinite(n) ? n : 0
  return jours.format(safe) + ' j'
}

export function formatMontant(value: number): string {
  return montant.format(value)
}

/** Nombre décimal affiché (virgule). */
export function formatDecimal(
  value: number | null | undefined,
  maximumFractionDigits = 3,
): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return decimal.format(0)
  if (maximumFractionDigits === 3) return decimal.format(n)
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
    useGrouping: false,
  }).format(n)
}

/** Parse une saisie décimale FR (virgule ou point, espaces ignorés). */
export function parseDecimalInput(value: string, allowNegative = false): number {
  const trimmed = value.trim()
  if (!trimmed) return 0
  const normalized = trimmed.replace(/\s/g, '').replace(',', '.')
  const n = Number(normalized)
  if (!Number.isFinite(n)) return 0
  return allowNegative ? n : Math.max(0, n)
}

/** Affiche un nombre pour champ texte (virgule décimale). */
export function formatDecimalInput(value: number): string {
  if (!value) return ''
  return decimal.format(value)
}
