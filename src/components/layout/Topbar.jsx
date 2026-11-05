import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  Boxes,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Handshake,
  LifeBuoy,
  LogOut,
  Mail,
  Menu,
  Package,
  Search,
  Settings,
  ShieldCheck,
  User,
  UserRound,
  Wrench,
  X,
} from 'lucide-react'
import { breadcrumbMap } from '../../data/navigation'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { cn, formatDate } from '../../utils/format'
import Avatar from '../ui/Avatar'
import Dropdown, { DropdownDivider, DropdownItem } from '../ui/Dropdown'

function getBreadcrumb(pathname) {
  const match = breadcrumbMap.find((entry) => entry.test.test(pathname))
  return match?.items || ['AssetFlow', 'Dashboard']
}

const NOTIFICATION_META = {
  borrowing: { icon: Handshake, tile: 'bg-blue-50 text-blue-600', to: '/borrowings' },
  inventory: { icon: Package, tile: 'bg-amber-50 text-amber-600', to: '/inventory' },
  maintenance: { icon: Wrench, tile: 'bg-brand-50 text-brand-600', to: '/maintenance' },
  overdue: { icon: AlertTriangle, tile: 'bg-red-50 text-red-600', to: '/borrowings' },
}

function GlobalSearch({ onNavigate, autoFocus = false, className }) {
  const { assets, inventory, employees, borrowings, maintenance } = useData()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onPointer = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false)
    }
    const onShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onShortcut)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onShortcut)
    }
  }, [])

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    const match = (value) => String(value || '').toLowerCase().includes(needle)

    return [
      {
        label: 'Data Aset',
        icon: Boxes,
        items: assets
          .filter((asset) => match(asset.name) || match(asset.code) || match(asset.serial) || match(asset.category))
          .slice(0, 3)
          .map((asset) => ({ id: asset.id, title: asset.name, subtitle: `${asset.code} · ${asset.category}`, to: `/assets/${asset.id}` })),
      },
      {
        label: 'Inventaris',
        icon: Package,
        items: inventory
          .filter((item) => match(item.name) || match(item.sku) || match(item.category))
          .slice(0, 2)
          .map((item) => ({ id: item.id, title: item.name, subtitle: `${item.sku} · Stok ${item.stock} ${item.unit}`, to: '/inventory' })),
      },
      {
        label: 'Karyawan',
        icon: UserRound,
        items: employees
          .filter((employee) => match(employee.name) || match(employee.id) || match(employee.email))
          .slice(0, 2)
          .map((employee) => ({ id: employee.id, title: employee.name, subtitle: `${employee.id} · ${employee.department}`, to: `/employees/${employee.id}` })),
      },
      {
        label: 'Peminjaman',
        icon: Handshake,
        items: borrowings
          .filter((item) => match(item.code) || match(item.id) || match(item.purpose) || match(item.status))
          .slice(0, 2)
          .map((item) => ({ id: item.id, title: item.code, subtitle: `${item.status} · ${item.department}`, to: `/borrowings/${item.id}` })),
      },
      {
        label: 'Pemeliharaan',
        icon: Wrench,
        items: maintenance
          .filter((item) => match(item.code) || match(item.id) || match(item.problem) || match(item.status))
          .slice(0, 2)
          .map((item) => ({ id: item.id, title: item.code, subtitle: `${item.type} · ${item.status}`, to: `/maintenance/${item.id}` })),
      },
    ].filter((group) => group.items.length > 0)
  }, [query, assets, inventory, employees, borrowings, maintenance])

  const totalResults = groups.reduce((sum, group) => sum + group.items.length, 0)

  const go = (to) => {
    setOpen(false)
    setQuery('')
    navigate(to)
    onNavigate?.()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
    if (event.key === 'Enter' && groups[0]?.items[0]) {
      go(groups[0].items[0].to)
    }
  }

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Cari aset, karyawan, transaksi…"
        aria-label="Pencarian global"
        className="h-9 w-full rounded-lg border border-line bg-slate-50/80 pl-9 pr-14 text-[12px] text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-navy-400 focus:bg-white focus:ring-2 focus:ring-navy-700/8"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center rounded border border-line bg-white px-1.5 py-0.5 text-[8.5px] font-medium text-ink-400 lg:flex">
        Ctrl K
      </span>

      {open && query.trim() ? (
        <div className="animate-in absolute left-0 right-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-white py-1.5 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.4)] sm:-left-24 sm:right-auto sm:w-[420px]">
          {totalResults === 0 ? (
            <div className="px-4 py-8 text-center">
              <Search className="mx-auto h-5 w-5 text-ink-300" />
              <p className="mt-2 text-[12px] font-medium text-ink-900">Tidak ada hasil untuk “{query}”</p>
              <p className="mt-0.5 text-[11px] text-ink-500">Coba kata kunci lain seperti kode aset atau nama karyawan.</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="py-1">
                <div className="flex items-center gap-1.5 px-3 py-1">
                  <group.icon className="h-3 w-3 text-ink-400" />
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-ink-400">{group.label}</p>
                </div>
                {group.items.map((item) => (
                  <button
                    key={`${group.label}-${item.id}`}
                    type="button"
                    onClick={() => go(item.to)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-slate-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-ink-900">{item.title}</span>
                      <span className="block truncate text-[10.5px] text-ink-400">{item.subtitle}</span>
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-ink-300" />
                  </button>
                ))}
              </div>
            ))
          )}
          <div className="mt-1 flex items-center justify-between border-t border-line px-3 py-1.5 text-[9.5px] text-ink-400">
            <span>Enter untuk membuka hasil pertama</span>
            <span className="rounded border border-line px-1 py-0.5">ESC</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function Topbar({ onMenu }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { notifications, counts, actions } = useData()
  const toast = useToast()
  const [mobileSearch, setMobileSearch] = useState(false)
  const crumbs = getBreadcrumb(location.pathname)
  const unread = counts.unread

  useEffect(() => {
    setMobileSearch(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil keluar', 'Sesi demo Anda telah diakhiri.')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={onMenu}
          className="icon-btn -ml-1 shrink-0 lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-[11px]">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1
              return (
                <li key={`${crumb}-${index}`} className={cn('flex min-w-0 items-center gap-1.5', !last && 'hidden sm:flex')}>
                  {index > 0 ? <ChevronRight className="h-3 w-3 shrink-0 text-ink-300" /> : null}
                  <span
                    className={cn(
                      'truncate',
                      last ? 'font-semibold text-ink-900' : 'font-medium text-ink-400',
                      index === 0 && 'hidden md:inline',
                    )}
                  >
                    {crumb}
                  </span>
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <GlobalSearch className="hidden w-56 md:block lg:w-72 xl:w-80" />
          <button
            type="button"
            onClick={() => setMobileSearch((value) => !value)}
            className="icon-btn h-9 w-9 md:hidden"
            aria-label="Cari"
          >
            {mobileSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>

          <Dropdown
            width="w-72"
            trigger={
              <button type="button" className="icon-btn h-9 w-9" aria-label="Bantuan">
                <CircleHelp className="h-4 w-4" />
              </button>
            }
          >
            {({ close }) => (
              <div className="py-1.5">
                <div className="px-3 py-2">
                  <p className="text-[11.5px] font-semibold text-ink-900">Pusat Bantuan</p>
                  <p className="mt-0.5 text-[10.5px] text-ink-500">Sumber daya singkat untuk operasional aset.</p>
                </div>
                <DropdownDivider />
                <DropdownItem
                  icon={BookOpen}
                  onClick={() => {
                    close()
                    toast.info('Panduan Pengguna', 'Buka menu Data Aset → Registrasi Aset untuk membuat catatan aset baru.')
                  }}
                >
                  Panduan pengguna
                </DropdownItem>
                <DropdownItem
                  icon={ShieldCheck}
                  onClick={() => {
                    close()
                    toast.success('Status sistem', 'Semua layanan berjalan normal · uptime 99,98%')
                  }}
                >
                  Status sistem
                </DropdownItem>
                <DropdownItem
                  icon={Mail}
                  onClick={() => {
                    close()
                    toast.info('Hubungi dukungan', 'Email: support@assetflow.id · Senin–Jumat 08.00–17.00 WIB')
                  }}
                >
                  Hubungi dukungan
                </DropdownItem>
                <DropdownItem
                  icon={LifeBuoy}
                  onClick={() => {
                    close()
                    navigate('/settings')
                  }}
                >
                  Pengaturan bantuan
                </DropdownItem>
              </div>
            )}
          </Dropdown>

          <Dropdown
            width="w-[360px]"
            panelClassName="max-w-[calc(100vw-24px)]"
            trigger={
              <button type="button" className="icon-btn relative h-9 w-9" aria-label="Notifikasi">
                <Bell className="h-4 w-4" />
                {unread ? (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8.5px] font-bold text-white ring-2 ring-white">
                    {unread}
                  </span>
                ) : null}
              </button>
            }
          >
            {({ close }) => (
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-line px-3.5 py-3">
                  <div>
                    <p className="text-[12px] font-semibold text-ink-900">Notifikasi</p>
                    <p className="text-[10px] text-ink-400">{unread} belum dibaca dari {notifications.length} notifikasi</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      actions.markAllNotificationsRead()
                      toast.success('Semua notifikasi ditandai sudah dibaca')
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-600 hover:text-brand-700"
                  >
                    <CheckCheck className="h-3 w-3" /> Tandai semua
                  </button>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.map((item) => {
                    const meta = NOTIFICATION_META[item.type] || NOTIFICATION_META.borrowing
                    const Icon = meta.icon
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          actions.markNotificationRead(item.id)
                          close()
                          navigate(meta.to)
                        }}
                        className={cn(
                          'flex w-full gap-2.5 border-b border-line/60 px-3.5 py-3 text-left transition last:border-0 hover:bg-slate-50',
                          !item.read && 'bg-brand-50/30',
                        )}
                      >
                        <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', meta.tile)}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start gap-1.5">
                            <span className={cn('flex-1 text-[11.5px] leading-snug', item.read ? 'font-medium text-ink-700' : 'font-semibold text-ink-900')}>
                              {item.title}
                            </span>
                            {!item.read ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" /> : null}
                          </span>
                          <span className="mt-0.5 block line-clamp-2 text-[10.5px] leading-relaxed text-ink-500">{item.desc}</span>
                          <span className="mt-1 block text-[9.5px] text-ink-400">{item.time}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    close()
                    navigate('/dashboard')
                  }}
                  className="flex w-full items-center justify-center gap-1 border-t border-line px-3 py-2 text-[10.5px] font-semibold text-navy-700 transition hover:bg-slate-50"
                >
                  Lihat semua aktivitas <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </Dropdown>

          <span className="mx-1 hidden h-6 w-px bg-line sm:block" />

          <Dropdown
            width="w-64"
            trigger={
              <button type="button" className="flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-slate-50">
                <Avatar name={user?.name} initials={user?.initials} color={user?.avatarColor} size="md" />
                <span className="hidden min-w-0 text-left sm:block">
                  <span className="block max-w-[130px] truncate text-[11.5px] font-semibold leading-tight text-ink-900">
                    {user?.name}
                  </span>
                  <span className="block truncate text-[9.5px] text-ink-400">{user?.role}</span>
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-ink-400 sm:block" />
              </button>
            }
          >
            {({ close }) => (
              <div className="py-1.5">
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  <Avatar name={user?.name} initials={user?.initials} color={user?.avatarColor} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-ink-900">{user?.name}</p>
                    <p className="truncate text-[10px] text-ink-500">{user?.email}</p>
                    <p className="mt-0.5 inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-ink-600">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <DropdownDivider />
                <DropdownItem
                  icon={User}
                  onClick={() => {
                    close()
                    navigate('/employees/EMP-2021-001')
                  }}
                >
                  Profil saya
                </DropdownItem>
                <DropdownItem
                  icon={Settings}
                  onClick={() => {
                    close()
                    navigate('/settings')
                  }}
                >
                  Pengaturan akun
                </DropdownItem>
                <DropdownItem
                  icon={ShieldCheck}
                  onClick={() => {
                    close()
                    navigate('/users')
                  }}
                >
                  Keamanan & akses
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem icon={LogOut} danger onClick={handleLogout}>
                  Keluar dari akun
                </DropdownItem>
                <p className="px-3 pb-1 pt-2 text-[9px] text-ink-400">Login terakhir: {formatDate(new Date(), { withTime: true })}</p>
              </div>
            )}
          </Dropdown>
        </div>
      </div>

      {mobileSearch ? (
        <div className="border-t border-line bg-white px-4 py-2.5 md:hidden">
          <GlobalSearch autoFocus onNavigate={() => setMobileSearch(false)} />
        </div>
      ) : null}
    </header>
  )
}
