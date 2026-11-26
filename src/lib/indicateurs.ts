import { total } from './factures'
import type { Facture } from './types'

export const MOIS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']

export const anneeDe = (f: Pick<Facture, 'date'>) => Number(f.date.slice(0, 4))

/** Années qui ont au moins une facture, la plus récente d'abord. */
export const annees = (factures: Facture[]) => [...new Set(factures.map(anneeDe))].filter(Boolean).sort((a, b) => b - a)

export type Groupe = { nom: string; montant: number; seances: number; factures: number }

function grouper(factures: Facture[], cle: (f: Facture) => string): Groupe[] {
  const m = new Map<string, Groupe>()
  for (const f of factures) {
    const nom = cle(f).trim() || 'Sans nom'
    const g = m.get(nom) ?? { nom, montant: 0, seances: 0, factures: 0 }
    g.montant += total(f)
    g.seances += f.seances || 0
    g.factures += 1
    m.set(nom, g)
  }
  return [...m.values()].sort((a, b) => b.montant - a.montant)
}

const arrondi = (v: number) => Math.round(v * 100) / 100

/** Chiffres d'une année (`null` : toutes les années). Les factures sont rattachées au mois de leur date. */
export function indicateurs(toutes: Facture[], annee: number | null) {
  const factures = annee == null ? toutes : toutes.filter((f) => anneeDe(f) === annee)
  const facture = arrondi(factures.reduce((s, f) => s + total(f), 0))
  const encaisse = arrondi(factures.filter((f) => f.payee).reduce((s, f) => s + total(f), 0))
  const seances = factures.reduce((s, f) => s + (f.seances || 0), 0)
  const parMois = MOIS.map((mois, i) => {
    const du = factures.filter((f) => Number(f.date.slice(5, 7)) === i + 1)
    return { mois, montant: arrondi(du.reduce((s, f) => s + total(f), 0)), factures: du.length, seances: du.reduce((s, f) => s + (f.seances || 0), 0) }
  })
  return {
    nombre: factures.length,
    facture,
    encaisse,
    enAttente: arrondi(facture - encaisse),
    seances,
    /** Montant moyen d'une séance, sur l'ensemble des séances facturées. */
    parSeance: seances ? arrondi(facture / seances) : 0,
    parMois,
    parDestinataire: grouper(factures, (f) => f.destinataire.nom),
    parLieu: grouper(factures, (f) => f.lieu),
    impayees: factures.filter((f) => !f.payee).sort((a, b) => a.date.localeCompare(b.date)),
  }
}
