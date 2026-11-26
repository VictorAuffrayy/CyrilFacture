import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFImage, type PDFPage, type RGB } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { sanitizeForPDF } from './pdfText'

// Socle des PDF, repris de StaffPilot (web/src/lib/pdfKit.ts) : seulement ce que le devis utilise.

export const mm = (v: number) => v * 2.83465
export const A4_PORTRAIT: [number, number] = [mm(210), mm(297)]
export const MARGIN = mm(12)

const hex = (h: string) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255)
/** Encres de la charte LNS ; le corail n'apparaît pas dans un devis (pas d'action sur papier). */
export const C = {
  ink: hex('#1f1d1a'),
  gray: hex('#6b665e'),
  faint: hex('#a29e95'),
  line: hex('#e7e3da'),
  soft: hex('#f7f5f0'),
  danger: hex('#c2362b'),
}

export type Kit = {
  doc: PDFDocument
  regular: PDFFont
  bold: PDFFont
  italic: PDFFont
  logo?: PDFImage
  /** Texte encodable dans la police (Archivo, sinon Helvetica WinAnsi) : le reste devient « ? ». */
  safe: (text: string | null | undefined) => string
}

/** Police de la charte LNS (Archivo, licence OFL, src/assets/fonts) : fichiers TTF chargés à la demande. */
export type KitFonts = { regular: Uint8Array; bold: Uint8Array; italic: Uint8Array }

export async function createKit(title: string, logoPng?: Uint8Array, fonts?: KitFonts): Promise<Kit> {
  const doc = await PDFDocument.create()
  // Archivo intégrée (seulement les caractères utilisés) ; sans elle (tests, chargement raté) : Helvetica
  let regular: PDFFont, bold: PDFFont, italic: PDFFont
  if (fonts) {
    doc.registerFontkit(fontkit)
    ;[regular, bold, italic] = await Promise.all([
      doc.embedFont(fonts.regular, { subset: true }),
      doc.embedFont(fonts.bold, { subset: true }),
      doc.embedFont(fonts.italic, { subset: true }),
    ])
  } else {
    regular = await doc.embedFont(StandardFonts.Helvetica)
    bold = await doc.embedFont(StandardFonts.HelveticaBold)
    italic = await doc.embedFont(StandardFonts.HelveticaOblique)
  }
  const charset = new Set(regular.getCharacterSet())
  const safe = (text: string | null | undefined) =>
    Array.from(sanitizeForPDF((text ?? '').replace(/[\u00A0\u202F]/g, ' ')), (c) => (charset.has(c.codePointAt(0)!) ? c : '?')).join('')
  doc.setTitle(safe(title))
  doc.setProducer('Factures DOJOGYM\'S')
  // PNG ou JPEG (logo des Paramètres) : on lit la signature du fichier ; un logo illisible ne bloque pas le PDF
  let logo: PDFImage | undefined
  if (logoPng?.length) {
    const jpeg = logoPng[0] === 0xff && logoPng[1] === 0xd8
    logo = await (jpeg ? doc.embedJpg(logoPng) : doc.embedPng(logoPng)).catch(() => undefined)
  }
  return { doc, regular, bold, italic, safe, logo }
}

/** 1 / 0,5 / 1 234,25 : jamais de décimales inutiles. */
export const num = (v: number) => (Math.round(v * 100) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 }).replace(/[\u00A0\u202F]/g, ' ')
export const eur = (v: number) => v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }).replace(/[\u00A0\u202F]/g, ' ')

function fit(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text
  let cut = text
  while (cut.length > 1 && font.widthOfTextAtSize(`${cut}...`, size) > maxWidth) cut = cut.slice(0, -1)
  return `${cut}...`
}

/**
 * Coupe un paragraphe en lignes de largeur maxWidth : aux espaces, et dans un mot plus large que la ligne.
 * Le texte doit déjà être passé par kit.safe (qui change les \n en espace : découper les paragraphes avant).
 */
export function wrap(value: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = []
  let line = ''
  for (let word of value.split(' ').filter(Boolean)) {
    while (word.length > 1 && font.widthOfTextAtSize(word, size) > maxWidth) {
      let n = word.length - 1
      while (n > 1 && font.widthOfTextAtSize(word.slice(0, n), size) > maxWidth) n--
      if (line) out.push(line)
      line = ''
      out.push(word.slice(0, n))
      word = word.slice(n)
    }
    const next = line ? `${line} ${word}` : word
    if (!line || font.widthOfTextAtSize(next, size) <= maxWidth) line = next
    else {
      out.push(line)
      line = word
    }
  }
  out.push(line)
  return out
}

type TextOpts = { font: PDFFont; size: number; color?: RGB; align?: 'left' | 'right' | 'center'; maxWidth?: number }
/** Texte placé par son bord gauche, droit ou son centre (selon align), tronqué à maxWidth. */
export function text(page: PDFPage, value: string, x: number, y: number, { font, size, color = C.ink, align = 'left', maxWidth }: TextOpts) {
  const s = maxWidth ? fit(value, font, size, maxWidth) : value
  const w = font.widthOfTextAtSize(s, size)
  const left = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x
  page.drawText(s, { x: left, y, font, size, color })
}
