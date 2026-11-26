import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Carte, Titre } from '@/components/Layout'
import { useStore } from '@/lib/store'
import type { Destinataire } from '@/lib/types'

export default function Destinataires() {
  const destinataires = useStore((s) => s.destinataires)
  const ajouter = useStore((s) => s.ajouterDestinataire)
  const maj = useStore((s) => s.majDestinataire)
  const supprimer = useStore((s) => s.supprimerDestinataire)
  const [aSupprimer, setASupprimer] = useState<Destinataire | null>(null)

  return (
    <>
      <Titre
        actions={
          <Button onClick={() => ajouter({ nom: '', adresse: '' })}>
            <Plus size={16} aria-hidden="true" /> Ajouter un destinataire
          </Button>
        }
      >
        Destinataires
      </Titre>
      <p className="mb-4 max-w-2xl text-sm text-ink-600">
        Les associations et structures à qui vous envoyez vos factures. Modifier un destinataire ne change pas les factures déjà faites.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {destinataires.map((d) => (
          <Carte key={d.id} className="space-y-3">
            <Field id={`nom-${d.id}`} label="Nom">
              <Input id={`nom-${d.id}`} value={d.nom} placeholder="Association…" onChange={(e) => maj(d.id, { nom: e.target.value })} />
            </Field>
            <Field id={`adresse-${d.id}`} label="Adresse">
              <Textarea id={`adresse-${d.id}`} rows={3} value={d.adresse} placeholder={'Rue…\nCode postal Ville'} onChange={(e) => maj(d.id, { adresse: e.target.value })} />
            </Field>
            <Button variant="ghost" size="sm" onClick={() => setASupprimer(d)}>
              <Trash2 size={14} aria-hidden="true" /> Supprimer
            </Button>
          </Carte>
        ))}
      </div>
      {destinataires.length === 0 && <p className="text-sm text-ink-500">Aucun destinataire pour l'instant.</p>}

      <ConfirmDialog
        open={aSupprimer != null}
        title="Supprimer ce destinataire ?"
        message={`« ${aSupprimer?.nom || 'Sans nom'} » sera retiré de la liste. Les factures déjà faites gardent son nom et son adresse.`}
        confirmLabel="Supprimer"
        danger
        onConfirm={() => {
          if (aSupprimer) supprimer(aSupprimer.id)
          setASupprimer(null)
        }}
        onClose={() => setASupprimer(null)}
      />
    </>
  )
}
