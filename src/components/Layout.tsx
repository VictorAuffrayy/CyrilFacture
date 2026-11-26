import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, FileText, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const LIENS = [
  { to: '/factures', label: 'Factures', icon: FileText },
  { to: '/indicateurs', label: 'Indicateurs', icon: BarChart3 },
  { to: '/destinataires', label: 'Destinataires', icon: Users },
  { to: '/parametres', label: 'Paramètres', icon: Settings },
]

export function Layout() {
  return (
    <div className="min-h-full">
      <header className="border-b border-ink-200 bg-brand-600 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to="/factures" className="text-base font-bold tracking-wide">
            DOJOGYM'S <span className="font-normal text-rose">· Factures</span>
          </NavLink>
          <nav className="flex gap-1" aria-label="Navigation principale">
            {LIENS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white',
                    isActive && 'bg-white/15 text-white',
                  )
                }
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export function Titre({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-ink-900">{children}</h1>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Carte({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn('rounded-lg border border-ink-200 bg-white p-5 shadow-xs', className)} {...props} />
}
