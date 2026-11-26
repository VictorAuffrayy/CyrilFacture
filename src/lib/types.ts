/** Celui qui facture : imprimé en haut à gauche et en pied de facture. */
export type Emetteur = {
  nom: string
  /** Adresse sur plusieurs lignes. */
  adresse: string
  siret: string
  ape: string
  /** Nom affiché en pied de page, au-dessus du téléphone et de l'e-mail. */
  signature: string
  telephone: string
  email: string
}

export type Parametres = {
  emetteur: Emetteur
  /** Imprimé dans l'encadré « RÈGLEMENT : … ». */
  reglement: string
  /** Mention sous le calcul, par exemple « (entreprise individuelle non assujettie à la TVA) ». */
  mentionTva: string
  /** 'defaut' : fond DOJOGYM'S fourni ; 'aucun' : fond simple dessiné ; sinon une image (data URL) choisie par Cyril. */
  fond: string
}

/** Association ou structure à qui Cyril envoie ses factures. */
export type Destinataire = {
  id: string
  nom: string
  /** Adresse sur plusieurs lignes. */
  adresse: string
}

export type Facture = {
  id: string
  numero: number
  /** AAAA-MM-JJ */
  date: string
  destinataireId: string | null
  /** Copie du destinataire au moment de la facture : modifier la liste ne change pas les anciennes factures. */
  destinataire: { nom: string; adresse: string }
  /** Ex. « FOYER KELLERMANN » */
  lieu: string
  /** Ex. « Cours de Judo Adapté » */
  intitule: string
  /** Ex. « Mai / Juin 2024 (hors vacances scolaires et jours fériés) » */
  periode: string
  seances: number
  tarif: number
  payee: boolean
}
