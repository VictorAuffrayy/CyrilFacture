import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PARAMETRES_PAR_DEFAUT, nouvelleFacture } from './factures'
import type { Destinataire, Emetteur, Facture, Parametres } from './types'

/** Tout ce que l'app enregistre (aussi le contenu d'un fichier de sauvegarde). */
export type Donnees = {
  parametres: Parametres
  destinataires: Destinataire[]
  factures: Facture[]
}

type Store = Donnees & {
  majParametres: (patch: Partial<Omit<Parametres, 'emetteur'>>) => void
  majEmetteur: (patch: Partial<Emetteur>) => void
  ajouterDestinataire: (d: Omit<Destinataire, 'id'>) => string
  majDestinataire: (id: string, patch: Partial<Omit<Destinataire, 'id'>>) => void
  supprimerDestinataire: (id: string) => void
  /** Crée une facture (reprend `modele`, sinon la plus récente) et renvoie son id. */
  creerFacture: (modele?: Facture) => string
  majFacture: (id: string, patch: Partial<Omit<Facture, 'id'>>) => void
  supprimerFacture: (id: string) => void
  /** Remplace toutes les données par celles d'une sauvegarde. */
  restaurer: (d: Donnees) => void
}

const DESTINATAIRE_EXEMPLE: Destinataire = {
  id: 'jours-heureux',
  nom: 'Association Sportive Les Jours Heureux',
  adresse: '75012 Paris',
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      parametres: PARAMETRES_PAR_DEFAUT,
      destinataires: [DESTINATAIRE_EXEMPLE],
      factures: [],

      majParametres: (patch) => set((s) => ({ parametres: { ...s.parametres, ...patch } })),
      majEmetteur: (patch) =>
        set((s) => ({ parametres: { ...s.parametres, emetteur: { ...s.parametres.emetteur, ...patch } } })),

      ajouterDestinataire: (d) => {
        const id = crypto.randomUUID()
        set((s) => ({ destinataires: [...s.destinataires, { ...d, id }] }))
        return id
      },
      majDestinataire: (id, patch) =>
        set((s) => ({ destinataires: s.destinataires.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
      supprimerDestinataire: (id) => set((s) => ({ destinataires: s.destinataires.filter((d) => d.id !== id) })),

      creerFacture: (modele) => {
        const f = nouvelleFacture(get().factures, modele)
        // destinataire vide : premier de la liste
        if (!f.destinataire.nom && get().destinataires[0]) {
          const d = get().destinataires[0]
          f.destinataireId = d.id
          f.destinataire = { nom: d.nom, adresse: d.adresse }
        }
        set((s) => ({ factures: [...s.factures, f] }))
        return f.id
      },
      majFacture: (id, patch) => set((s) => ({ factures: s.factures.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
      supprimerFacture: (id) => set((s) => ({ factures: s.factures.filter((f) => f.id !== id) })),

      restaurer: (d) =>
        set({
          parametres: { ...PARAMETRES_PAR_DEFAUT, ...d.parametres, emetteur: { ...PARAMETRES_PAR_DEFAUT.emetteur, ...d.parametres?.emetteur } },
          destinataires: d.destinataires ?? [],
          factures: d.factures ?? [],
        }),
    }),
    {
      name: 'devis-cyril',
      version: 1,
      partialize: (s) => ({ parametres: s.parametres, destinataires: s.destinataires, factures: s.factures }),
    },
  ),
)

/** Vérifie qu'un fichier lu ressemble à une sauvegarde de l'app. */
export function lireSauvegarde(texte: string): Donnees | null {
  try {
    const d = JSON.parse(texte) as Partial<Donnees>
    if (!d || !Array.isArray(d.factures) || !Array.isArray(d.destinataires) || typeof d.parametres !== 'object') return null
    return d as Donnees
  } catch {
    return null
  }
}
