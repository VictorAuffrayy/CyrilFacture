import { describe, expect, it } from 'vitest'
import { annees, indicateurs } from './indicateurs'
import type { Facture } from './types'

let n = 0
const f = (p: Partial<Facture>): Facture => ({
  id: String(++n),
  numero: n,
  date: '2024-10-14',
  destinataireId: null,
  destinataire: { nom: 'Les Jours Heureux', adresse: '' },
  lieu: 'FOYER KELLERMANN',
  intitule: 'Cours de Judo Adapté',
  periode: '',
  seances: 14,
  tarif: 125,
  payee: true,
  ...p,
})

const jeu = [
  f({}),
  f({ date: '2024-03-02', seances: 4, tarif: 100, payee: false, lieu: 'Gymnase' }),
  f({ date: '2025-01-10', seances: 2, tarif: 50, destinataire: { nom: 'Autre', adresse: '' } }),
]

describe('indicateurs', () => {
  it('années, la plus récente d’abord', () => expect(annees(jeu)).toEqual([2025, 2024]))

  it('totaux d’une année', () => {
    const i = indicateurs(jeu, 2024)
    expect(i.nombre).toBe(2)
    expect(i.facture).toBe(2150)
    expect(i.encaisse).toBe(1750)
    expect(i.enAttente).toBe(400)
    expect(i.seances).toBe(18)
    expect(i.parSeance).toBe(119.44)
  })

  it('répartition par mois, lieu et destinataire', () => {
    const i = indicateurs(jeu, 2024)
    expect(i.parMois[9].montant).toBe(1750)
    expect(i.parMois[2].montant).toBe(400)
    expect(i.parLieu.map((g) => g.nom)).toEqual(['FOYER KELLERMANN', 'Gymnase'])
    expect(i.impayees).toHaveLength(1)
  })

  it('toutes les années', () => {
    const i = indicateurs(jeu, null)
    expect(i.facture).toBe(2250)
    expect(i.parDestinataire[0]).toMatchObject({ nom: 'Les Jours Heureux', factures: 2 })
  })

  it('aucune facture : pas de division par zéro', () => expect(indicateurs([], 2024).parSeance).toBe(0))
})
