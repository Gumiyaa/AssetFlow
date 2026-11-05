import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  LifeBuoy,
  Sparkles,
  X,
} from 'lucide-react'
import { mainNavigation, systemNavigation } from '../../data/navigation'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../utils/format'

const BADGES = {
  '/inventory': 'lowStock',
  '/borrowings': 'pendingBorrowings',
  '/maintenance': 'activeMaintenance',
}

export default function Sidebar({ open, onClose }) {
  const location = useLocation()
  const { counts } = useData()
  const toast = useToast()

  const isActive = (to) =>
    to === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(to)

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-navy-950/55 backdrop-blur-[2px] transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[255px] flex-col bg-navy-700 text-white transition-transform duration-300 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Navigasi utama"
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] px-4">
          <Link to="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-brand-500 shadow-[0_6px_16px_-6px_rgba(14,147,132,0.9)]">
              <Boxes className="h-5 w-5 text-white" strokeWidth={2} />
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-white/10" />
            </span>
            <span className="min-w-0">
              <span className="block text-[16px] font-semibold leading-tight tracking-[-0.02em]">AssetFlow</span>
              <span className="block text-[8.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Asset Management
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="shrink-0 px-3 pt-3">
          <button
            type="button"
            onClick={() => toast.info('Workspace aktif', 'PT AssetFlow Nusantara · Jakarta HQ (demo)')}
            className="flex w-full items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.045] px-2.5 py-2 text-left transition hover:bg-white/[0.08]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-[10px] font-semibold text-brand-200">
              AF
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-medium text-white">PT AssetFlow Nusantara</span>
              <span className="block truncate text-[9.5px] text-slate-400">Jakarta HQ · Enterprise</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          </button>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400/80">Menu Utama</p>
          <div className="space-y-0.5">
            {mainNavigation.map((item) => {
              const active = isActive(item.to)
              const badgeKey = BADGES[item.to]
              const badgeValue = badgeKey ? counts[badgeKey] : 0
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn('nav-item group', active && 'nav-item-active')}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-brand-300' : 'text-slate-400 group-hover:text-slate-200')} strokeWidth={1.9} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {badgeValue ? (
                    <span className="rounded-full bg-red-500/90 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white">
                      {badgeValue}
                    </span>
                  ) : null}
                  {active ? <ChevronRight className="h-3.5 w-3.5 text-brand-300/80" /> : null}
                </NavLink>
              )
            })}
          </div>

          <p className="mt-5 px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400/80">Sistem</p>
          <div className="space-y-0.5">
            {systemNavigation.map((item) => {
              const active = isActive(item.to)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn('nav-item group', active && 'nav-item-active')}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-brand-300' : 'text-slate-400 group-hover:text-slate-200')} strokeWidth={1.9} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {active ? <ChevronRight className="h-3.5 w-3.5 text-brand-300/80" /> : null}
                </NavLink>
              )
            })}
          </div>
        </nav>

        <div className="shrink-0 space-y-3 border-t border-white/[0.07] p-3">
          <div className="relative overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-brand-500/10 p-3">
            <Sparkles className="absolute -right-2 -top-2 h-12 w-12 text-brand-400/15" />
            <div className="flex items-center gap-1.5">
              <LifeBuoy className="h-3.5 w-3.5 text-brand-300" />
              <p className="text-[11.5px] font-semibold text-white">Butuh bantuan?</p>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
              Panduan singkat pengelolaan aset dan alur persetujuan.
            </p>
            <button
              type="button"
              onClick={() =>
                toast.info(
                  'Pusat Bantuan',
                  'Gunakan menu Data Aset untuk registrasi, Peminjaman untuk approval, dan Laporan untuk ekspor data.',
                )
              }
              className="mt-2.5 inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand-200 transition hover:text-white"
            >
              Buka panduan
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center justify-between px-1 text-[9px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CircleHelp className="h-3 w-3" /> v3.4.1
            </span>
            <span>© 2026 AssetFlow</span>
          </div>
        </div>
      </aside>
    </>
  )
}
