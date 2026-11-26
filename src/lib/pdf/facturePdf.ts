import { rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import fondUrl from '@/assets/fond-dojogyms.jpg?url'
import { formatDate, formatNumero, ligneCalcul } from '@/lib/factures'
import type { Facture, Parametres } from '@/lib/types'
import { loadPdfFonts } from './fonts'
import { A4_PORTRAIT, createKit, text, wrap, type Kit } from './pdfKit'

/** Bleu marine du blason DOJOGYM'S. */
const MARINE = rgb(0x14 / 255, 0x23 / 255, 0x50 / 255)
const [W, H] = A4_PORTRAIT

/*
 * Positions relevées sur la facture n°044 (fond de 794 x 1121 px, soit 0,75 pt par px).
 * y : distance depuis le HAUT de la page, convertie par `y()` (pdf-lib compte depuis le bas).
 */
const y = (fromTop: number) => H - fromTop
const POS = {
  gauche: 96,
  droite: 341,
  titre: 308,
  soulignement: 315,
  blocs: 354,
  interligneBlocs: 12.2,
  prestation: 482,
  interlignePrestation: 14.6,
  largeurPrestation: 425,
  reglementHaut: 613.5,
  reglementBas: 634.5,
  centre: 300.5,
  pied: 719.5,
  interlignePied: 15,
}

let fondDefaut: Promise<Uint8Array | undefined> | null = null
function chargerFondDefaut() {
  fondDefaut ??= fetch(fondUrl)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
    .then((b) => new Uint8Array(b))
    .catch((e) => {
      console.error('[fond]', e)
      fondDefaut = null
      return undefined
    })
  return fondDefaut
}

function dataUrlEnOctets(dataUrl: string): Uint8Array | undefined {
  const base64 = dataUrl.split(',')[1]
  if (!base64) return undefined
  const bin = atob(base64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function octetsDuFond(fond: string): Promise<Uint8Array | undefined> {
  if (fond === 'aucun') return undefined
  if (fond === 'defaut') return chargerFondDefaut()
  return dataUrlEnOctets(fond)
}

/** Lignes d'un texte sur plusieurs lignes, chacune coupée à `largeur`. */
function lignes(kit: Kit, valeur: string, font: PDFFont, taille: number, largeur: number): string[] {
  return valeur
    .split('\n')
    .map((l) => kit.safe(l))
    .filter(Boolean)
    .flatMap((l) => wrap(l, font, taille, largeur))
}

function bloc(page: PDFPage, contenu: string[], x: number, haut: number, interligne: number, font: PDFFont, taille: number) {
  contenu.forEach((l, i) => text(page, l, x, y(haut + i * interligne), { font, size: taille, color: MARINE }))
}

/** Fond simple quand Cyril n'en veut pas : page marine et grand cadre blanc. */
function dessinerFondSimple(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: MARINE })
  const m = 36
  const r = 28
  const w = W - 2 * m
  const h = H - 2 * m
  // chemin SVG : origine en haut à gauche, y vers le bas
  page.drawSvgPath(
    `M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`,
    { x: m, y: H - m, color: rgb(1, 1, 1) },
  )
}

export async function genererFacturePdf(f: Facture, p: Parametres): Promise<Uint8Array> {
  const [fonts, fond] = await Promise.all([loadPdfFonts(), octetsDuFond(p.fond)])
  const kit = await createKit(`Facture ${formatNumero(f.numero)}`, fond, fonts)
  const { doc, regular, bold } = kit
  const page = doc.addPage(A4_PORTRAIT)

  if (kit.logo) page.drawImage(kit.logo, { x: 0, y: 0, width: W, height: H })
  else dessinerFondSimple(page)

  // Titre souligné
  const titre = kit.safe(`FACTURE N°${formatNumero(f.numero)} : ${formatDate(f.date)}`)
  text(page, titre, POS.gauche, y(POS.titre), { font: regular, size: 17, color: MARINE, maxWidth: 400 })
  const finSoulignement = Math.max(POS.gauche + regular.widthOfTextAtSize(titre, 17) + 4, 317)
  page.drawLine({
    start: { x: POS.gauche, y: y(POS.soulignement) },
    end: { x: Math.min(finSoulignement, 500), y: y(POS.soulignement) },
    thickness: 0.8,
    color: MARINE,
  })

  // Émetteur (gauche) et destinataire (droite)
  const e = p.emetteur
  const gauche = [
    ...lignes(kit, e.nom, bold, 9.5, 230),
    ...lignes(kit, e.adresse, bold, 9.5, 230),
    ...(e.siret ? lignes(kit, `Siret : ${e.siret}`, bold, 9.5, 230) : []),
    ...(e.ape ? lignes(kit, `Code APE : ${e.ape}`, bold, 9.5, 230) : []),
  ]
  bloc(page, gauche, POS.gauche, POS.blocs, POS.interligneBlocs, bold, 9.5)
  const droite = [
    "À l'attention,",
    ...lignes(kit, f.destinataire.nom, bold, 9.5, 215),
    ...lignes(kit, f.destinataire.adresse, bold, 9.5, 215),
  ]
  bloc(page, droite, POS.droite, POS.blocs, POS.interligneBlocs, bold, 9.5)

  // Prestation : lieu, intitulé, période en gras ; calcul et mention TVA en normal
  const prestation: { l: string; font: PDFFont }[] = [
    ...lignes(kit, f.lieu, bold, 10.5, POS.largeurPrestation).map((l) => ({ l, font: bold })),
    ...lignes(kit, f.intitule, bold, 10.5, POS.largeurPrestation).map((l) => ({ l, font: bold })),
    ...lignes(kit, f.periode, bold, 10.5, POS.largeurPrestation).map((l) => ({ l, font: bold })),
    { l: kit.safe(ligneCalcul(f)), font: regular },
    ...lignes(kit, p.mentionTva, regular, 10.5, POS.largeurPrestation).map((l) => ({ l, font: regular })),
  ]
  prestation.forEach(({ l, font }, i) =>
    text(page, l, POS.gauche, y(POS.prestation + i * POS.interlignePrestation), { font, size: 10.5, color: MARINE }),
  )

  // Encadré du règlement, centré
  if (p.reglement.trim()) {
    const reglement = kit.safe(`RÈGLEMENT : ${p.reglement}`)
    const taille = 11
    const largeur = Math.min(bold.widthOfTextAtSize(reglement, taille), 470)
    const marge = 8
    page.drawRectangle({
      x: POS.centre - largeur / 2 - marge,
      y: y(POS.reglementBas),
      width: largeur + 2 * marge,
      height: POS.reglementBas - POS.reglementHaut,
      borderColor: MARINE,
      borderWidth: 1,
      color: rgb(1, 1, 1),
    })
    const milieu = (POS.reglementHaut + POS.reglementBas) / 2
    text(page, reglement, POS.centre, y(milieu + taille * 0.36), { font: bold, size: taille, color: MARINE, align: 'center', maxWidth: 470 })
  }

  // Pied : nom, téléphone, e-mail
  const pied = [
    { l: kit.safe(e.signature), font: bold },
    { l: kit.safe(e.telephone), font: regular },
    { l: kit.safe(e.email), font: regular },
  ].filter((x) => x.l)
  pied.forEach(({ l, font }, i) =>
    text(page, l, POS.centre, y(POS.pied + i * POS.interlignePied), { font, size: 10.5, color: MARINE, align: 'center', maxWidth: 180 }),
  )

  return doc.save()
}
