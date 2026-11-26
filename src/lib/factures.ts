import type { Facture, Parametres } from './types'

/** 44 -> « 044 » */
export const formatNumero = (n: number) => String(Math.max(0, Math.trunc(n))).padStart(3, '0')

/** « 2024-10-14 » -> « 14/10/2024 » */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}

/** Date du jour au format AAAA-MM-JJ, en heure locale. */
export function aujourdhui(d = new Date()): string {
  const p = (v: number) => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** 1750 -> « 1750€ », 62.5 -> « 62,50€ » (comme sur les factures de Cyril, sans espace des milliers). */
export function euros(v: number): string {
  const entier = Number.isInteger(v)
  return `${v.toLocaleString('fr-FR', { useGrouping: false, minimumFractionDigits: entier ? 0 : 2, maximumFractionDigits: 2 })}€`
}

export const total = (f: Pick<Facture, 'seances' | 'tarif'>) => Math.round((f.seances || 0) * (f.tarif || 0) * 100) / 100

/** « 14 séances x 125€ = 1750€ » */
export function ligneCalcul(f: Pick<Facture, 'seances' | 'tarif'>): string {
  const s = f.seances || 0
  return `${s} séance${s > 1 ? 's' : ''} x ${euros(f.tarif || 0)} = ${euros(total(f))}`
}

export const prochainNumero = (factures: Facture[]) => factures.reduce((max, f) => Math.max(max, f.numero), 0) + 1

/** Nouvelle facture : reprend la plus récente (ou `modele`) avec le numéro suivant et la date du jour. */
export function nouvelleFacture(factures: Facture[], modele?: Facture): Facture {
  const base = modele ?? [...factures].sort((a, b) => b.numero - a.numero)[0]
  return {
    id: crypto.randomUUID(),
    numero: prochainNumero(factures),
    date: aujourdhui(),
    destinataireId: base?.destinataireId ?? null,
    destinataire: base ? { ...base.destinataire } : { nom: '', adresse: '' },
    lieu: base?.lieu ?? '',
    intitule: base?.intitule ?? 'Cours de Judo Adapté',
    periode: base?.periode ?? '',
    seances: base?.seances ?? 1,
    tarif: base?.tarif ?? 0,
    payee: false,
  }
}

export const nomFichier = (f: Facture) =>
  `Facture ${formatNumero(f.numero)}${f.destinataire.nom ? ` - ${f.destinataire.nom}` : ''}.pdf`.replace(/[\\/:*?"<>|]/g, '-')

export const PARAMETRES_PAR_DEFAUT: Parametres = {
  emetteur: {
    nom: 'AUBOURG Cyril',
    adresse: '73 bis rue Sophie Rodrigues\n92500 Rueil Malmaison',
    siret: '50787960900018',
    ape: '8551Z',
    signature: 'Cyril Aubourg',
    telephone: '06 62 74 23 66',
    email: 'cyrilaubourg@hotmail.com',
  },
  reglement: "par chèque ou virement à l'ordre de Cyril Aubourg",
  mentionTva: '(entreprise individuelle non assujettie à la TVA)',
  fond: 'defaut',
}
