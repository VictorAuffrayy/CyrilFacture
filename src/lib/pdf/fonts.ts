import regularUrl from '@/assets/fonts/Archivo-Regular.ttf?url'
import boldUrl from '@/assets/fonts/Archivo-Bold.ttf?url'
import italicUrl from '@/assets/fonts/Archivo-Italic.ttf?url'
import type { KitFonts } from './pdfKit'

let cache: Promise<KitFonts | undefined> | null = null

/**
 * Archivo (charte LNS, licence OFL : src/assets/fonts/OFL.txt) pour le PDF, chargée une fois à la demande.
 * Échec de chargement : undefined, le PDF part en Helvetica plutôt que de ne pas partir.
 */
export function loadPdfFonts(): Promise<KitFonts | undefined> {
  cache ??= Promise.all(
    [regularUrl, boldUrl, italicUrl].map((u) => fetch(u).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))),
  )
    .then(([regular, bold, italic]) => ({ regular: new Uint8Array(regular), bold: new Uint8Array(bold), italic: new Uint8Array(italic) }))
    .catch((e) => {
      console.error('[pdf-fonts]', e)
      cache = null
      return undefined
    })
  return cache
}
