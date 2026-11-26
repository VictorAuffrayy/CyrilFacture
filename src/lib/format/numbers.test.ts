import { describe, expect, it } from 'vitest'

import { formatJours, formatMontant, parseDecimalInput } from './numbers'

describe('parseDecimalInput', () => {
  it('parse la virgule FR et espaces', () => {
    expect(parseDecimalInput('1 234,5')).toBe(1234.5)
  })

  it('clampe le négatif à 0 par défaut', () => {
    expect(parseDecimalInput('-0,5')).toBe(0)
  })

  it('garde le négatif si allowNegative', () => {
    expect(parseDecimalInput('-0,5', true)).toBe(-0.5)
  })

  it('renvoie 0 pour vide ou non numérique', () => {
    expect(parseDecimalInput('', true)).toBe(0)
    expect(parseDecimalInput('abc', true)).toBe(0)
  })
})

// Intl fr-FR sépare les milliers et l'unité par des espaces insécables : on les normalise pour comparer.
const spaces = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ')

describe('formats de devis', () => {
  it('formatMontant : euros, deux décimales, virgule', () => {
    expect(spaces(formatMontant(12480.5))).toBe('12 480,50 €')
  })

  it('formatJours : virgule et unité « j », 0 si invalide', () => {
    expect(spaces(formatJours(1.25))).toBe('1,25 j')
    expect(spaces(formatJours(Number.NaN))).toBe('0 j')
  })
})
