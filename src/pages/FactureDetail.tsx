import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Carte } from '@/components/Layout'
import { euros, formatNumero, nomFichier, total } from '@/lib/factures'
import { telecharger } from '@/lib/image'
import { genererFacturePdf } from '@/lib/pdf/facturePdf'
import { useStore } from '@/lib/store'
import type { Facture, Parametres } from '@/lib/types'

/** Aperçu du PDF, régénéré 300 ms après la dernière frappe. */
function useApercu(facture: Facture | undefined, parametres: Parametres) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!facture) return
    let annule = false
    let cree: string | null = null
    const t = setTimeout(() => {
      genererFacturePdf(facture, parametres)
        .then((octets) => {
          if (annule) return
          cree = URL.createObjectURL(new Blob([octets as BlobPart], { type: 'application/pdf' }))
          setUrl(cree)
        })
        .catch((e) => console.error(e))
    }, 300)
    return () => {
      annule = true
      clearTimeout(t)
      // l'ancienne URL reste affichée jusqu'à la suivante : on la libère un peu plus tard
      if (cree) {
        const u = cree
        setTimeout(() => URL.revokeObjectURL(u), 2000)
      }
    }
  }, [facture, parametres])
  return url
}

const nombre = (v: string) => {
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export default function FactureDetail() {
  const { id } = useParams()
  const facture = useStore((s) => s.factures.find((f) => f.id === id))
  const factures = useStore((s) => s.factures)
  const destinataires = useStore((s) => s.destinataires)
  const parametres = useStore((s) => s.parametres)
  const majFacture = useStore((s) => s.majFacture)
  const creerFacture = useStore((s) => s.creerFacture)
  const navigate = useNavigate()
  const apercu = useApercu(facture, parametres)

  if (!facture) return <Navigate to="/factures" replace />
  const f = facture
  const maj = (patch: Partial<Facture>) => majFacture(f.id, patch)
  const doublon = factures.some((x) => x.id !== f.id && x.numero === f.numero)

  async function pdf() {
    try {
      telecharger(await genererFacturePdf(f, parametres), nomFichier(f), 'application/pdf')
    } catch (e) {
      console.error(e)
      toast.error("Le PDF n'a pas pu être créé.")
    }
  }

  function choisirDestinataire(destId: string) {
    const d = destinataires.find((x) => x.id === destId)
    if (d) maj({ destinataireId: d.id, destinataire: { nom: d.nom, adresse: d.adresse } })
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link to="/factures" className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-800" aria-label="Retour aux factures">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-ink-900">Facture n°{formatNumero(f.numero)}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(`/factures/${creerFacture(f)}`)}>
            <Copy size={16} aria-hidden="true" /> Dupliquer
          </Button>
          <Button onClick={() => void pdf()}>
            <Download size={16} aria-hidden="true" /> Télécharger le PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Carte className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field id="numero" label="Numéro" error={doublon ? 'Ce numéro est déjà utilisé par une autre facture.' : undefined}>
                <Input
                  id="numero"
                  type="number"
                  min={1}
                  value={f.numero || ''}
                  aria-invalid={doublon}
                  onChange={(e) => maj({ numero: Math.trunc(nombre(e.target.value)) })}
                />
              </Field>
              <Field id="date" label="Date">
                <Input id="date" type="date" value={f.date} onChange={(e) => e.target.value && maj({ date: e.target.value })} />
              </Field>
            </div>

            <Field id="destinataire" label="Destinataire" hint={<Link to="/destinataires" className="underline">Gérer la liste des destinataires</Link>}>
              <Select
                id="destinataire"
                value={destinataires.some((d) => d.id === f.destinataireId) ? (f.destinataireId ?? '') : ''}
                onChange={(e) => choisirDestinataire(e.target.value)}
              >
                <option value="" disabled>
                  {f.destinataire.nom || 'Choisir…'}
                </option>
                {destinataires.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nom}
                  </option>
                ))}
              </Select>
            </Field>
            {f.destinataire.nom && (
              <p className="whitespace-pre-line rounded-md bg-ink-50 px-3 py-2 text-xs text-ink-600">
                {f.destinataire.nom}
                {f.destinataire.adresse && `\n${f.destinataire.adresse}`}
              </p>
            )}
          </Carte>

          <Carte className="space-y-4">
            <Field id="lieu" label="Lieu" hint="Par exemple : FOYER KELLERMANN">
              <Input id="lieu" value={f.lieu} onChange={(e) => maj({ lieu: e.target.value })} />
            </Field>
            <Field id="intitule" label="Prestation">
              <Input id="intitule" value={f.intitule} onChange={(e) => maj({ intitule: e.target.value })} />
            </Field>
            <Field id="periode" label="Période" hint="Par exemple : Mai / Juin 2024 (hors vacances scolaires et jours fériés)">
              <Textarea id="periode" rows={2} value={f.periode} onChange={(e) => maj({ periode: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="seances" label="Nombre de séances">
                <Input id="seances" type="number" min={0} step={1} inputMode="numeric" value={f.seances || ''} onChange={(e) => maj({ seances: nombre(e.target.value) })} />
              </Field>
              <Field id="tarif" label="Tarif par séance (€)">
                <Input id="tarif" type="number" min={0} step="any" inputMode="decimal" value={f.tarif || ''} onChange={(e) => maj({ tarif: nombre(e.target.value) })} />
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-md bg-ink-50 px-4 py-3">
              <span className="text-sm text-ink-600">Total</span>
              <span className="text-xl font-bold tabular-nums text-ink-900">{euros(total(f))}</span>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={f.payee} onChange={(e) => maj({ payee: e.target.checked })} />
              Facture payée
            </label>
          </Carte>
          <p className="text-xs text-ink-500">Les modifications sont enregistrées automatiquement.</p>
        </div>

        <Carte className="flex min-h-[70vh] flex-col p-2">
          <h2 className="sr-only">Aperçu</h2>
          {apercu ? (
            <iframe title={`Aperçu de la facture ${formatNumero(f.numero)}`} src={`${apercu}#toolbar=0&navpanes=0&view=FitH`} className="h-full min-h-[70vh] w-full flex-1 rounded-md" />
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-ink-500">Préparation de l'aperçu…</div>
          )}
        </Carte>
      </div>
    </>
  )
}
