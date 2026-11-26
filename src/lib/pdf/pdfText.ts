/** Textes pour pdf-lib (Helvetica standard, WinAnsi) et noms de fichiers. Repris de StaffPilot (web/src/lib/pdfText.ts). */
export function sanitizeForPDF(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .normalize('NFC')
    // € et ponctuation typographique : hors Latin-1 mais encodables en WinAnsi (Helvetica).
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\u2013\u2014\u2018\u2019\u201C\u201D\u2026\u20AC]/g, '?')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sanitizeForFilename(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .normalize('NFC')
    .replace(/[^\w\s\-.àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
