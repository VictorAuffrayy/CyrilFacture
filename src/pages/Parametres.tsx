import { useRef } from 'react'
import { Download, ImageUp, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Carte, Titre } from '@/components/Layout'
import { aujourdhui } from '@/lib/factures'
import { imageEnFondA4, telecharger } from '@/lib/image'
import { lireSauvegarde, useStore } from '@/lib/store'
import type { Emetteur } from '@/lib/types'

const CHAMPS: { cle: keyof Emetteur; label: string; multiligne?: boolean }[] = [
  { cle: 'nom', label: 'Nom (en haut de la facture)' },
  { cle: 'adresse', label: 'Adresse', multiligne: true },
  { cle: 'siret', label: 'Siret' },
  { cle: 'ape', label: 'Code APE' },
  { cle: 'signature', label: 'Nom en bas de la facture' },
  { cle: 'telephone', label: 'Téléphone' },
  { cle: 'email', label: 'E-mail' },
]

export default function Parametres() {
  const parametres = useStore((s) => s.parametres)
  const majParametres = useStore((s) => s.majParametres)
  const majEmetteur = useStore((s) => s.majEmetteur)
  const restaurer = useStore((s) => s.restaurer)
  const champFond = useRef<HTMLInputElement>(null)
  const champSauvegarde = useRef<HTMLInputElement>(null)
  const e = parametres.emetteur
  const fondPerso = parametres.fond !== 'defaut' && parametres.fond !== 'aucun'

  async function choisirFond(fichier: File | undefined) {
    if (!fichier) return
    try {
      majParametres({ fond: await imageEnFondA4(fichier) })
      toast.success('Nouveau fond enregistré.')
    } catch {
      toast.error("Cette image n'a pas pu être lue.")
    }
  }

  function exporter() {
    const { parametres: p, destinataires, factures } = useStore.getState()
    telecharger(JSON.stringify({ parametres: p, destinataires, factures }, null, 2), `Sauvegarde factures ${aujourdhui()}.json`, 'application/json')
  }

  async function importer(fichier: File | undefined) {
    if (!fichier) return
    const donnees = lireSauvegarde(await fichier.text())
    if (!donnees) {
      toast.error("Ce fichier n'est pas une sauvegarde de l'app.")
      return
    }
    if (!window.confirm(`Remplacer les données actuelles par cette sauvegarde (${donnees.factures.length} factures) ?`)) return
    restaurer(donnees)
    toast.success('Sauvegarde restaurée.')
  }

  return (
    <>
      <Titre>Paramètres</Titre>
      <div className="grid gap-5 lg:grid-cols-2">
        <Carte className="space-y-4">
          <h2 className="text-base font-semibold text-ink-900">Vos coordonnées</h2>
          {CHAMPS.map(({ cle, label, multiligne }) => (
            <Field key={cle} id={cle} label={label}>
              {multiligne ? (
                <Textarea id={cle} rows={2} value={e[cle]} onChange={(ev) => majEmetteur({ [cle]: ev.target.value })} />
              ) : (
                <Input id={cle} value={e[cle]} onChange={(ev) => majEmetteur({ [cle]: ev.target.value })} />
              )}
            </Field>
          ))}
        </Carte>

        <div className="space-y-5">
          <Carte className="space-y-4">
            <h2 className="text-base font-semibold text-ink-900">Mentions</h2>
            <Field id="reglement" label="Règlement" hint="Imprimé après « RÈGLEMENT : » dans l'encadré.">
              <Input id="reglement" value={parametres.reglement} onChange={(ev) => majParametres({ reglement: ev.target.value })} />
            </Field>
            <Field id="tva" label="Mention TVA" hint="Sous le calcul des séances.">
              <Input id="tva" value={parametres.mentionTva} onChange={(ev) => majParametres({ mentionTva: ev.target.value })} />
            </Field>
          </Carte>

          <Carte className="space-y-3">
            <h2 className="text-base font-semibold text-ink-900">Fond de la facture</h2>
            <fieldset className="space-y-2 text-sm text-ink-700">
              <legend className="sr-only">Fond</legend>
              <label className="flex items-center gap-2">
                <input type="radio" name="fond" checked={parametres.fond === 'defaut'} onChange={() => majParametres({ fond: 'defaut' })} />
                Blason DOJOGYM'S (fourni)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="fond" checked={parametres.fond === 'aucun'} onChange={() => majParametres({ fond: 'aucun' })} />
                Fond simple, sans logo
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="fond" checked={fondPerso} disabled={!fondPerso} onChange={() => undefined} />
                Votre image {fondPerso ? '(enregistrée)' : ''}
              </label>
            </fieldset>
            <p className="text-xs text-ink-500">
              Pour un rendu plus net à l'impression, choisissez le fond vierge d'origine (sans texte), au format A4 portrait.
            </p>
            <input ref={champFond} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(ev) => void choisirFond(ev.target.files?.[0])} />
            <Button variant="secondary" onClick={() => champFond.current?.click()}>
              <ImageUp size={16} aria-hidden="true" /> Choisir une image de fond
            </Button>
          </Carte>

          <Carte className="space-y-3">
            <h2 className="text-base font-semibold text-ink-900">Sauvegarde</h2>
            <p className="text-sm text-ink-600">
              Les factures sont enregistrées dans ce navigateur, sur cet ordinateur. Téléchargez une sauvegarde de temps en temps : vider
              les données du navigateur les effacerait.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={exporter}>
                <Download size={16} aria-hidden="true" /> Télécharger une sauvegarde
              </Button>
              <input ref={champSauvegarde} type="file" accept="application/json,.json" className="hidden" onChange={(ev) => void importer(ev.target.files?.[0])} />
              <Button variant="ghost" onClick={() => champSauvegarde.current?.click()}>
                <Upload size={16} aria-hidden="true" /> Restaurer une sauvegarde
              </Button>
            </div>
          </Carte>
        </div>
      </div>
    </>
  )
}
