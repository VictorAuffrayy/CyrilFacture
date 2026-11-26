import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Select } from '@/components/ui/select'
import { Carte, Titre } from '@/components/Layout'
import { euros, formatDate, formatNumero, total } from '@/lib/factures'
import { annees, indicateurs, type Groupe } from '@/lib/indicateurs'
import { useStore } from '@/lib/store'

function Tuile({ label, valeur, detail }: { label: string; valeur: string; detail?: string }) {
  return (
    <Carte className="p-4">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">{valeur}</p>
      {detail && <p className="mt-0.5 text-xs text-ink-500">{detail}</p>}
    </Carte>
  )
}

/** Montant facturé par mois : une seule série, info-bulle au survol et au clavier, tableau en dessous. */
function ParMois({ donnees, annee }: { donnees: ReturnType<typeof indicateurs>['parMois']; annee: number | null }) {
  const max = Math.max(...donnees.map((d) => d.montant), 0)
  const plusFort = max > 0 ? donnees.findIndex((d) => d.montant === max) : -1
  return (
    <Carte>
      <h2 className="text-base font-semibold text-ink-900">Facturé par mois{annee == null ? ' (toutes années)' : ''}</h2>
      <p className="mt-0.5 text-xs text-ink-500">Selon la date de la facture.</p>
      <div className="relative mt-6 h-56">
        {/* grille discrète : 0, moitié, maximum */}
        {[0, 0.5, 1].map((p) => (
          <div key={p} className="absolute inset-x-0 border-t border-ink-100" style={{ bottom: `${p * 100}%` }}>
            {max > 0 && p > 0 && <span className="absolute -top-2.5 left-0 bg-white pr-1 text-[11px] tabular-nums text-ink-500">{euros(Math.round(max * p))}</span>}
          </div>
        ))}
        <div className="absolute inset-0 left-14 flex items-end gap-1.5">
          {donnees.map((d, i) => (
            <div
              key={d.mois}
              tabIndex={0}
              aria-label={`${d.mois} : ${euros(d.montant)}, ${d.factures} facture${d.factures > 1 ? 's' : ''}, ${d.seances} séances`}
              className="group relative flex h-full flex-1 items-end outline-none"
            >
              <div
                className="w-full rounded-t-[4px] bg-brand-600 transition-colors group-hover:bg-brand-400 group-focus-visible:bg-brand-400"
                style={{ height: max ? `${(d.montant / max) * 100}%` : 0, minHeight: d.montant ? 2 : 0 }}
              />
              {i === plusFort && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold tabular-nums text-ink-700 group-hover:invisible">{euros(d.montant)}</span>
              )}
              <div className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-ink-900 px-2.5 py-1.5 text-xs text-white shadow-md group-hover:visible group-focus-visible:visible">
                <p className="font-semibold">{d.mois}</p>
                <p className="tabular-nums">{euros(d.montant)}</p>
                <p className="text-white/70">
                  {d.factures} facture{d.factures > 1 ? 's' : ''} · {d.seances} séance{d.seances > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ml-14 mt-2 flex gap-1.5">
        {donnees.map((d) => (
          <span key={d.mois} className="flex-1 text-center text-[11px] text-ink-500">
            {d.mois}
          </span>
        ))}
      </div>
      <details className="mt-4 text-sm">
        <summary className="text-xs text-ink-600 underline-offset-2 hover:underline">Voir le détail en tableau</summary>
        <table className="mt-2 w-full text-sm">
          <thead className="text-left text-xs text-ink-500">
            <tr>
              <th className="py-1 font-medium">Mois</th>
              <th className="py-1 text-right font-medium">Factures</th>
              <th className="py-1 text-right font-medium">Séances</th>
              <th className="py-1 text-right font-medium">Montant</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {donnees.map((d) => (
              <tr key={d.mois} className="border-t border-ink-100">
                <td className="py-1">{d.mois}</td>
                <td className="py-1 text-right">{d.factures}</td>
                <td className="py-1 text-right">{d.seances}</td>
                <td className="py-1 text-right">{euros(d.montant)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Carte>
  )
}

/** Classement en barres horizontales (une seule couleur, valeur écrite à côté). */
function Classement({ titre, groupes }: { titre: string; groupes: Groupe[] }) {
  const max = Math.max(...groupes.map((g) => g.montant), 0)
  return (
    <Carte>
      <h2 className="text-base font-semibold text-ink-900">{titre}</h2>
      {groupes.length === 0 ? (
        <p className="mt-3 text-sm text-ink-500">Aucune facture sur la période.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {groupes.map((g) => (
            <li key={g.nom}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-ink-800">{g.nom}</span>
                <span className="shrink-0 font-semibold tabular-nums text-ink-900">{euros(g.montant)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-ink-100">
                <div className="h-2 rounded-full bg-brand-600" style={{ width: max ? `${(g.montant / max) * 100}%` : 0 }} />
              </div>
              <p className="mt-0.5 text-xs text-ink-500">
                {g.factures} facture{g.factures > 1 ? 's' : ''} · {g.seances} séance{g.seances > 1 ? 's' : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Carte>
  )
}

export default function Indicateurs() {
  const factures = useStore((s) => s.factures)
  const liste = annees(factures)
  const anneeCourante = new Date().getFullYear()
  const [choix, setChoix] = useState<string>(() => String(liste.includes(anneeCourante) ? anneeCourante : (liste[0] ?? anneeCourante)))
  const annee = choix === 'toutes' ? null : Number(choix)
  const i = indicateurs(factures, annee)
  const periode = annee == null ? 'toutes années' : `en ${annee}`
  const precedente = annee == null ? null : indicateurs(factures, annee - 1)

  return (
    <>
      <Titre
        actions={
          <Select aria-label="Année" value={choix} onChange={(e) => setChoix(e.target.value)} className="w-44">
            {liste.length === 0 && <option value={anneeCourante}>{anneeCourante}</option>}
            {liste.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
            <option value="toutes">Toutes les années</option>
          </Select>
        }
      >
        Indicateurs
      </Titre>

      {factures.length === 0 ? (
        <Carte>
          <p className="py-10 text-center text-sm text-ink-500">
            Les indicateurs apparaîtront dès la première facture. <Link to="/factures" className="underline">Aller aux factures</Link>
          </p>
        </Carte>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Tuile
              label={`Facturé ${periode}`}
              valeur={euros(i.facture)}
              detail={precedente && precedente.nombre > 0 ? `${euros(precedente.facture)} en ${annee! - 1}` : `${i.nombre} facture${i.nombre > 1 ? 's' : ''}`}
            />
            <Tuile label="Encaissé" valeur={euros(i.encaisse)} detail={i.facture ? `${Math.round((i.encaisse / i.facture) * 100)} % du facturé` : undefined} />
            <Tuile label="En attente de paiement" valeur={euros(i.enAttente)} detail={`${i.impayees.length} facture${i.impayees.length > 1 ? 's' : ''} non payée${i.impayees.length > 1 ? 's' : ''}`} />
            <Tuile label="Séances facturées" valeur={String(i.seances)} detail={i.seances ? `${euros(i.parSeance)} par séance en moyenne` : undefined} />
          </div>

          <ParMois donnees={i.parMois} annee={annee} />

          <div className="grid gap-5 lg:grid-cols-2">
            <Classement titre="Par lieu" groupes={i.parLieu} />
            <Classement titre="Par destinataire" groupes={i.parDestinataire} />
          </div>

          <Carte>
            <h2 className="text-base font-semibold text-ink-900">À relancer</h2>
            {i.impayees.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Toutes les factures de la période sont payées.</p>
            ) : (
              <ul className="mt-3 divide-y divide-ink-100 text-sm">
                {i.impayees.map((f) => (
                  <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <Link to={`/factures/${f.id}`} className="font-semibold text-brand-600 hover:underline">
                      N°{formatNumero(f.numero)}
                    </Link>
                    <span className="flex-1 text-ink-700">
                      {f.destinataire.nom || '–'} · {f.lieu || '–'}
                    </span>
                    <span className="tabular-nums text-ink-500">{formatDate(f.date)}</span>
                    <span className="w-24 text-right font-semibold tabular-nums text-ink-900">{euros(total(f))}</span>
                  </li>
                ))}
              </ul>
            )}
          </Carte>
        </div>
      )}
    </>
  )
}
