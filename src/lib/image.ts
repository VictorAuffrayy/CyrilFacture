/**
 * Image choisie par Cyril comme fond de facture : recadrée au format A4 portrait et compressée en JPEG,
 * pour tenir dans la mémoire du navigateur (quelques centaines de Ko).
 */
export async function imageEnFondA4(fichier: File): Promise<string> {
  const url = URL.createObjectURL(fichier)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('image illisible'))
      i.src = url
    })
    const largeur = 1588
    const hauteur = Math.round(largeur * (297 / 210))
    const canvas = document.createElement('canvas')
    canvas.width = largeur
    canvas.height = hauteur
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas indisponible')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, largeur, hauteur)
    // « cover » : remplit la page, coupe ce qui dépasse
    const echelle = Math.max(largeur / img.naturalWidth, hauteur / img.naturalHeight)
    const w = img.naturalWidth * echelle
    const h = img.naturalHeight * echelle
    ctx.drawImage(img, (largeur - w) / 2, (hauteur - h) / 2, w, h)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Télécharge des octets sous un nom de fichier. */
export function telecharger(contenu: BlobPart | Uint8Array, nom: string, type: string) {
  const url = URL.createObjectURL(new Blob([contenu as BlobPart], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = nom
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
