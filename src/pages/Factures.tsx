import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Copy, Download, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/misc'
import { Carte, Titre } from '@/components/Layout'
import { euros, formatDate, formatNumero, nomFichier, total } from '@/lib/factures'
import { telecharger } from '@/lib/image'
import { genererFacturePdf } from '@/lib/pdf/facturePdf'
import { useStore } from '@/lib/store'
import type { Facture } from '@/lib/types'

export default function Factures() {
  const factures = useStore((s) => s.factures)
  const parametres = useStore((s) => s.parametres)
  const creerFacture = useStore((s) => s.creerFacture)
  const majFacture = useStore((s) => s.majFacture)
  const supprimerFacture = useStore((s) => s.supprimerFacture)
  const navigate = useNavigate()
  const [aSupprimer, setASupprimer] = useState<Facture | null>(null)

  const triees = [...factures].sort((a, b) => b.numero - a.numero)
  const enAttente = factures.filter((f) => !f.payee).reduce((s, f) => s + total(f), 0)

  const nouvelle = (modele?: Facture) => navigate(`/factures/${creerFacture(modele)}`)

  async function pdf(f: Facture) {
    try {
      telecharger(await genererFacturePdf(f, parametres), nomFichier(f), 'application/pdf')
    } catch (e) {
      console.error(e)
      toast.error("Le PDF n'a pas pu être créé.")
    }
  }

  return (
    <>
      <Titre
        actions={
          <Button onClick={() => nouvelle()}>
            <Plus size={16} aria-hidden="true" /> Nouvelle facture
          </Button>
        }
      >
        Factures
      </Titre>

      {factures.length === 0 ? (
        <Carte>
          <EmptyState title="Aucune facture pour l'instant" hint="Créez la première : le numéro, la date et le calcul sont remplis pour vous." />
        </Carte>
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-600">
            {factures.length} facture{factures.length > 1 ? 's' : ''} · en attente de paiement :{' '}
            <strong className="text-ink-900">{euros(enAttente)}</strong>
          </p>
          <Carte className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-200 text-left text-xs text-ink-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">N°</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Destinataire</th>
                  <th className="px-4 py-2.5 font-medium">Lieu</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">Payée</th>
                  <th className="px-4 py-2.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {triees.map((f) => (
                  <tr key={f.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50">
                    <td className="px-4 py-2.5 font-semibold tabular-nums">
                      <Link to={`/factures/${f.id}`} className="text-brand-600 underline-offset-2 hover:underline">
                        {formatNumero(f.numero)}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{formatDate(f.date)}</td>
                    <td className="px-4 py-2.5">{f.destinataire.nom || '–'}</td>
                    <td className="px-4 py-2.5">{f.lieu || '–'}</td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">{euros(total(f))}</td>
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={f.payee}
                        onChange={(e) => majFacture(f.id, { payee: e.target.checked })}
                        aria-label={`Facture ${formatNumero(f.numero)} payée`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex justify-end gap-0.5">
                        <Button variant="ghost" size="icon" onClick={() => void pdf(f)} title="Télécharger le PDF" aria-label={`Télécharger le PDF de la facture ${formatNumero(f.numero)}`}>
                          <Download size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => nouvelle(f)} title="Dupliquer (numéro suivant, date du jour)" aria-label={`Dupliquer la facture ${formatNumero(f.numero)}`}>
                          <Copy size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setASupprimer(f)} title="Supprimer" aria-label={`Supprimer la facture ${formatNumero(f.numero)}`}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Carte>
        </>
      )}

      <ConfirmDialog
        open={aSupprimer != null}
        title="Supprimer la facture ?"
        message={aSupprimer && `La facture n°${formatNumero(aSupprimer.numero)} sera supprimée définitivement.`}
        confirmLabel="Supprimer"
        danger
        onConfirm={() => {
          if (aSupprimer) supprimerFacture(aSupprimer.id)
          setASupprimer(null)
        }}
        onClose={() => setASupprimer(null)}
      />
    </>
  )
}
