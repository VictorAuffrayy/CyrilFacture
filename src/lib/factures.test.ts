import { describe, expect, it } from 'vitest'
import { aujourdhui, euros, formatDate, formatNumero, ligneCalcul, nomFichier, nouvelleFacture, prochainNumero, total } from './factures'
import type { Facture } from './types'

const f = (p: Partial<Facture>): Facture => ({
  id: 'x',
  numero: 1,
  date: '2024-10-14',
  destinataireId: 'd1',
  destinataire: { nom: 'Association Sportive Les Jours Heureux', adresse: '75012 Paris' },
  lieu: 'FOYER KELLERMANN',
  intitule: 'Cours de Judo Adapté',
  periode: 'Mai / Juin 2024',
  seances: 14,
  tarif: 125,
  payee: true,
  ...p,
})

describe('formats', () => {
  it('numéro sur 3 chiffres', () => {
    expect(formatNumero(44)).toBe('044')
    expect(formatNumero(1234)).toBe('1234')
  })
  it('date française', () => expect(formatDate('2024-10-14')).toBe('14/10/2024'))
  it('date du jour en heure locale', () => expect(aujourdhui(new Date(2026, 0, 5))).toBe('2026-01-05'))
  it('euros sans espace des milliers', () => {
    expect(euros(1750)).toBe('1750€')
    expect(euros(62.5)).toBe('62,50€')
  })
})

describe('calcul', () => {
  it('reproduit la facture 044', () => {
    expect(total(f({}))).toBe(1750)
    expect(ligneCalcul(f({}))).toBe('14 séances x 125€ = 1750€')
  })
  it('singulier pour une séance', () => expect(ligneCalcul(f({ seances: 1 }))).toBe('1 séance x 125€ = 125€'))
  it('arrondi au centime', () => expect(total(f({ seances: 3, tarif: 33.335 }))).toBe(100.01))
})

describe('nouvelle facture', () => {
  it('numéro suivant le plus grand', () => expect(prochainNumero([f({ numero: 44 }), f({ numero: 12 })])).toBe(45))
  it('première facture : numéro 1', () => expect(prochainNumero([])).toBe(1))
  it('reprend la plus récente, non payée', () => {
    const n = nouvelleFacture([f({ numero: 12, lieu: 'A' }), f({ numero: 44, lieu: 'B' })])
    expect(n.numero).toBe(45)
    expect(n.lieu).toBe('B')
    expect(n.payee).toBe(false)
  })
  it('nom de fichier sans caractère interdit', () => expect(nomFichier(f({ destinataire: { nom: 'A/B', adresse: '' } }))).toBe('Facture 001 - A-B.pdf'))
})
