import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Check,
  Download,
  KeyRound,
  LockKeyhole,
  Minus,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useTable } from '../../hooks/useTable'
import { cn, formatNumber } from '../../utils/format'
import { downloadCSV } from '../../utils/export'
import { useMasterData } from '../../hooks/useMasterData'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import SearchInput from '../../components/ui/SearchInput'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import Tabs from '../../components/ui/Tabs'
import Progress from '../../components/ui/Progress'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import UserFormModal from '../../components/users/UserFormModal'

const ALL = 'Semua'
const STATUSES = ['Aktif', 'Nonaktif']
const ROLES = ['Super Admin', 'Asset Manager', 'Administrator', 'Warehouse Staff', 'Employee']

const RBAC = [
  { module: 'Dashboard', values: ['full', 'full', 'full', 'view', 'view'] },
  { module: 'Data Aset', values: ['full', 'full', 'view', 'view', 'none'] },
  { module: 'Inventaris', values: ['full', 'view', 'none', 'full', 'none'] },
  { module: 'Peminjaman', values: ['full', 'full', 'view', 'view', 'request'] },
  { module: 'Pemeliharaan', values: ['full', 'full', 'view', 'none', 'request'] },
  { module: 'Data Karyawan', values: ['full', 'view', 'full', 'none', 'none'] },
  { module: 'Laporan', values: ['full', 'full', 'full', 'view', 'none'] },
  { module: 'Manajemen Pengguna', values: ['full', 'none', 'view', 'none', 'none'] },
  { module: 'Pengaturan', values: ['full', 'view', 'view', 'none', 'none'] },
]

const SECURITY_AUDIT = [
  { id: 'SEC-01', title: 'Login berhasil · Andi Pratama', desc: 'macOS · Chrome · 10.12.84.15', time: 'Hari ini, 10:42 WIB', tone: 'success' },
  { id: 'SEC-02', title: 'Perubahan peran pengguna', desc: 'Hendra Setiawan ditetapkan sebagai Employee', time: 'Kemarin, 16:08 WIB', tone: 'warning' },
  { id: 'SEC-03', title: 'Metode 2FA diperbarui', desc: 'Riko Saputra · Authenticator App', time: '26 Okt 2025, 09:15 WIB', tone: 'info' },
  { id: 'SEC-04', title: 'Akun dinonaktifkan', desc: 'Hendra Setiawan · kebijakan masa percobaan', time: '24 Okt 2025, 08:30 WIB', tone: 'danger' },
  { id: 'SEC-05', title: 'Ekspor data pengguna', desc: 'Andi Pratama mengunduh direktori akun', time: '23 Okt 2025, 14:12 WIB', tone: 'neutral' },
]

function roleTone(role) {
  if (role === 'Super Admin') return 'navy'
  if (role === 'Asset Manager') return 'teal'
  if (role === 'Administrator') return 'info'
  if (role === 'Warehouse Staff') return 'warning'
  return 'neutral'
}

function PermissionCell({ value }) {
  if (value === 'full') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100"><Check className="h-2.5 w-2.5" /></span>
        Penuh
      </span>
    )
  }
  if (value === 'view') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100"><Check className="h-2.5 w-2.5" /></span>
        Lihat
      </span>
    )
  }
  if (value === 'request') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100"><Minus className="h-2.5 w-2.5" /></span>
        Ajukan
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-400">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100"><X className="h-2.5 w-2.5" /></span>
      Tidak
    </span>
  )
}

export default function UserList() {
  const { users, actions } = useData()
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const { departments } = useMasterData()
  const [tab, setTab] = useState(ALL)
  const [role, setRole] = useState(ALL)
  const [department, setDepartment] = useState(ALL)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [actionTarget, setActionTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const currentId = currentUser?.id || 'USR-001'

  const stats = useMemo(() => {
    const active = users.filter((item) => item.status === 'Aktif').length
    const with2FA = users.filter((item) => item.twoFA && item.twoFA !== 'Belum Aktif').length
    const admins = users.filter((item) => ['Super Admin', 'Administrator'].includes(item.role)).length
    return {
      total: users.length,
      active,
      with2FA,
      admins,
      coverage: Math.round((with2FA / Math.max(users.length, 1)) * 100),
      inactive: users.filter((item) => item.status === 'Nonaktif').length,
    }
  }, [users])

  const filtered = useMemo(
    () =>
      users.filter(
        (item) =>
          (tab === ALL || item.status === tab) &&
          (role === ALL || item.role === role) &&
          (department === ALL || item.department === department),
      ),
    [users, tab, role, department],
  )

  const table = useTable(filtered, {
    pageSize: 8,
    searchFields: ['name', 'id', 'email', 'role', 'department', 'modules', 'twoFA', 'device', 'status'],
  })

  const counts = useMemo(
    () => ({
      [ALL]: users.length,
      Aktif: users.filter((item) => item.status === 'Aktif').length,
      Nonaktif: users.filter((item) => item.status === 'Nonaktif').length,
    }),
    [users],
  )

  const without2FA = useMemo(() => users.filter((item) => !item.twoFA || item.twoFA === 'Belum Aktif'), [users])

  const resetFilters = () => {
    setTab(ALL)
    setRole(ALL)
    setDepartment(ALL)
    table.setQuery('')
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (user) => {
    setEditing(user)
    setFormOpen(true)
  }

  const handleSubmit = async (values) => {
    setBusy(true)
    try {
      if (editing) {
        await actions.updateUser(editing.id, values)
        toast.success('Pengguna diperbarui', `${values.name} · peran ${values.role}.`)
      } else {
        const created = await actions.createUser(values)
        toast.success('Pengguna dibuat', `${created.name} tercatat dengan ID ${created.id}.`)
      }
      setFormOpen(false)
      setEditing(null)
    } catch (error) {
      toast.error('Gagal menyimpan pengguna', error.message)
    } finally {
      setBusy(false)
    }
  }

  const askDelete = (user) => {
    if (user.id === currentId) {
      toast.warning('Tidak dapat menghapus akun sendiri', 'Gunakan akun Super Admin lain untuk menghapus akun ini.')
      return
    }
    setActionTarget({ type: 'delete', user })
  }

  const askToggle = (user) => {
    if (user.id === currentId) {
      toast.warning('Tidak dapat menonaktifkan akun sendiri', 'Akun yang sedang digunakan harus tetap aktif.')
      return
    }
    setActionTarget({ type: 'toggle', user })
  }

  const handleConfirmAction = async () => {
    if (!actionTarget) return
    setBusy(true)
    try {
      if (actionTarget.type === 'delete') {
        await actions.deleteUser(actionTarget.user.id)
        toast.success('Pengguna dihapus', `${actionTarget.user.name} dikeluarkan dari manajemen pengguna.`)
      } else {
        await actions.toggleUserStatus(actionTarget.user.id)
        toast.success(
          'Status akun diperbarui',
          `${actionTarget.user.name} kini ${actionTarget.user.status === 'Aktif' ? 'Nonaktif' : 'Aktif'}.`,
        )
      }
      setActionTarget(null)
    } catch (error) {
      toast.error('Gagal memproses tindakan', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleExport = () => {
    downloadCSV(
      'assetflow-manajemen-pengguna',
      [
        { label: 'ID Pengguna', key: 'id' },
        { label: 'Nama', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Peran', key: 'role' },
        { label: 'Departemen', key: 'department' },
        { label: 'Status', key: 'status' },
        { label: '2FA', key: 'twoFA' },
        { label: 'Modul', key: 'modules' },
        { label: 'Terakhir Aktif', key: 'lastActive' },
        { label: 'Perangkat', key: 'device' },
      ],
      table.all,
    )
    toast.success('Ekspor selesai', `${table.all.length} akun pengguna diunduh sebagai CSV.`)
  }

  const columns = [
    {
      key: 'name',
      header: 'Pengguna',
      sortKey: 'name',
      className: 'min-w-[230px]',
      render: (user) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={user.name} initials={user.initials} color={user.avatarColor} size="sm" status={user.status === 'Aktif' ? 'Aktif' : undefined} />
          <div className="min-w-0">
            <p className="truncate text-[11.5px] font-semibold text-ink-900">
              {user.name}
              {user.id === currentId ? <span className="ml-1.5 rounded bg-brand-50 px-1 text-[8.5px] font-semibold text-brand-700">Anda</span> : null}
            </p>
            <p className="mt-0.5 truncate text-[9.5px] text-ink-400">{user.id} · {user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Peran RBAC',
      sortKey: 'role',
      className: 'min-w-[140px]',
      render: (user) => (
        <div className="space-y-1">
          <Badge tone={roleTone(user.role)} dot>{user.role}</Badge>
          <p className="max-w-[150px] truncate text-[9px] text-ink-400">{user.modules}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Departemen',
      sortKey: 'department',
      className: 'min-w-[150px]',
      render: (user) => (
        <div>
          <p className="text-[10.5px] font-medium text-ink-700">{user.department}</p>
          <p className="mt-0.5 text-[9px] text-ink-400">{user.employeeId}</p>
        </div>
      ),
    },
    {
      key: 'twoFA',
      header: 'Autentikasi 2FA',
      sortKey: 'twoFA',
      className: 'min-w-[155px]',
      render: (user) => (
        <Badge tone={user.twoFA === 'Belum Aktif' ? 'warning' : 'success'} dot>
          {user.twoFA}
        </Badge>
      ),
    },
    {
      key: 'lastActive',
      header: 'Terakhir Aktif',
      className: 'min-w-[165px]',
      render: (user) => (
        <div>
          <p className="text-[10.5px] font-medium text-ink-700">{user.lastActive}</p>
          <p className="mt-0.5 max-w-[165px] truncate text-[9px] text-ink-400">{user.device}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      className: 'min-w-[100px]',
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      className: 'w-[120px]',
      render: (user) => (
        <div className="flex items-center justify-end gap-0.5">
          <button
            type="button"
            onClick={() => openEdit(user)}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-navy-700"
            aria-label={`Edit ${user.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => askToggle(user)}
            disabled={user.id === currentId}
            className="rounded p-1.5 text-ink-400 transition hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`${user.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'} ${user.name}`}
          >
            <Power className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => askDelete(user)}
            disabled={user.id === currentId}
            className="rounded p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Hapus ${user.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Manajemen Sistem"
        title="Manajemen Pengguna & Hak Akses"
        description="Kelola akun internal, peran RBAC, autentikasi dua faktor, dan audit keamanan sistem."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Ekspor Pengguna
            </Button>
            <Button variant="primary" icon={Plus} onClick={openCreate}>
              Tambah Pengguna
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total Pengguna" value={formatNumber(stats.total)} unit="akun" icon={Users} tone="navy" note={`${stats.inactive} nonaktif`} />
        <StatCard label="Akun Aktif" value={stats.active} unit="akun" icon={ShieldCheck} tone="teal" note={`${stats.admins} admin & super admin`} />
        <StatCard label="Cakupan 2FA" value={`${stats.coverage}%`} icon={KeyRound} tone="blue" note={`${stats.with2FA} dari ${stats.total} akun`} />
        <StatCard label="Tanpa 2FA" value={without2FA.length} unit="akun" icon={AlertTriangle} tone="amber" note="perlu penguatan keamanan" />
      </div>

      {without2FA.length ? (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 sm:flex-row sm:items-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold text-amber-900">{without2FA.length} akun belum mengaktifkan autentikasi dua faktor</p>
            <p className="text-[10.5px] text-amber-700/80">
              {without2FA.map((user) => user.name).join(', ')} · aktifkan 2FA sebelum memberikan akses modul sensitif.
            </p>
          </div>
          <Button size="sm" variant="secondary" className="border-amber-200 bg-white text-amber-900 hover:bg-amber-50" onClick={() => openEdit(without2FA[0])}>
            Tinjau akun
          </Button>
        </div>
      ) : null}

      <Card className="mt-4 p-3">
        <Tabs
          items={[
            { key: ALL, label: 'Semua', count: counts[ALL] },
            ...STATUSES.map((status) => ({ key: status, label: status, count: counts[status] })),
          ]}
          value={tab}
          onChange={setTab}
          variant="pill"
          className="border-b-0 pb-2"
        />
        <div className="mt-1 flex flex-col gap-2.5 border-t border-line pt-2.5 lg:flex-row lg:items-center">
          <SearchInput
            value={table.query}
            onChange={table.setQuery}
            placeholder="Cari nama, email, peran, atau perangkat…"
            className="w-full lg:w-[330px]"
          />
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
            <select value={role} onChange={(event) => setRole(event.target.value)} className="select h-9 text-[11.5px]" aria-label="Filter peran">
              <option value={ALL}>Semua peran</option>
              {ROLES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={department} onChange={(event) => setDepartment(event.target.value)} className="select h-9 text-[11.5px]" aria-label="Filter departemen">
              <option value={ALL}>Semua departemen</option>
              {departments.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetFilters}>
              Reset filter
            </Button>
          </div>
          <span className="hidden text-[10px] text-ink-400 lg:block">{table.filteredCount} akun tampil</span>
        </div>
      </Card>

      <DataTable
        className="mt-3"
        tableClassName="min-w-[1100px]"
        columns={columns}
        rows={table.rows}
        sort={table.sort}
        onSort={table.toggleSort}
        empty={{
          title: 'Tidak ada pengguna ditemukan',
          description: 'Coba ubah tab status, peran, departemen, atau kata kunci pencarian.',
          action: (
            <Button size="sm" variant="secondary" icon={RotateCcw} onClick={resetFilters}>
              Reset filter
            </Button>
          ),
        }}
        footer={
          <Pagination
            page={table.page}
            pageSize={table.size}
            total={table.filteredCount}
            totalPages={table.totalPages}
            onPage={table.setPage}
            onPageSize={table.setSize}
            label="pengguna"
          />
        }
      />

      <Card className="mt-4">
        <CardHeader
          title="Matriks Hak Akses (RBAC)"
          subtitle="Izin modul berdasarkan peran pengguna"
          action={<Badge tone="navy">{ROLES.length} peran</Badge>}
        />
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[860px]">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-5 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">Modul</th>
                {ROLES.map((item) => (
                  <th key={item} className="px-3 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">{item}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {RBAC.map((row) => (
                <tr key={row.module} className="transition hover:bg-slate-50/60">
                  <td className="px-5 py-2.5 text-[10.5px] font-medium text-ink-800">{row.module}</td>
                  {row.values.map((value, index) => (
                    <td key={`${row.module}-${ROLES[index]}`} className="px-3 py-2.5">
                      <PermissionCell value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-line bg-slate-50/50 px-5 py-2.5 text-[9.5px] text-ink-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Penuh: buat, ubah, hapus</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" /> Lihat: baca saja</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Ajukan: permintaan terbatas</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /> Tidak ada akses</span>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Cakupan Autentikasi 2FA"
            subtitle="Kepatuhan keamanan akun internal"
            action={<Badge tone={stats.coverage >= 80 ? 'success' : 'warning'}>{stats.coverage}%</Badge>}
          />
          <div className="border-t border-line px-5 py-4">
            <Progress value={stats.coverage} tone={stats.coverage >= 80 ? 'teal' : 'amber'} className="h-2" />
            <div className="mt-3 space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <Avatar name={user.name} initials={user.initials} color={user.avatarColor} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-medium text-ink-800">{user.name}</p>
                    <p className="truncate text-[9px] text-ink-400">{user.role} · {user.twoFA}</p>
                  </div>
                  {user.twoFA === 'Belum Aktif' ? (
                    <Button size="xs" variant="secondary" onClick={() => openEdit(user)}>Aktifkan</Button>
                  ) : (
                    <Badge tone="success" dot>Aktif</Badge>
                  )}
                </div>
              ))}
            </div>
            {without2FA.length === 0 ? (
              <p className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-2.5 text-[9.5px] text-emerald-800">
                Seluruh akun telah mengaktifkan autentikasi dua faktor.
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Log Audit Keamanan"
            subtitle="Peristiwa autentikasi & perubahan akses"
            action={<LockKeyhole className="h-4 w-4 text-ink-400" />}
          />
          <div className="border-t border-line">
            {SECURITY_AUDIT.map((event) => (
              <div key={event.id} className="flex items-start gap-2.5 border-b border-line/70 px-5 py-3 last:border-0">
                <span
                  className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    event.tone === 'success' && 'bg-emerald-50 text-emerald-600',
                    event.tone === 'warning' && 'bg-amber-50 text-amber-600',
                    event.tone === 'danger' && 'bg-red-50 text-red-600',
                    event.tone === 'info' && 'bg-blue-50 text-blue-600',
                    event.tone === 'neutral' && 'bg-slate-100 text-ink-500',
                  )}
                >
                  {event.tone === 'success' ? <Check className="h-3.5 w-3.5" /> : event.tone === 'danger' ? <LockKeyhole className="h-3.5 w-3.5" /> : event.tone === 'info' ? <KeyRound className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] font-semibold text-ink-900">{event.title}</p>
                  <p className="mt-0.5 truncate text-[9.5px] text-ink-400">{event.desc}</p>
                  <p className="mt-0.5 text-[9px] text-ink-400">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-line bg-slate-50/60 px-5 py-2.5">
            <p className="text-[9.5px] text-ink-400">Log demo menampilkan 5 peristiwa terakhir. Retensi audit produksi 365 hari.</p>
          </div>
        </Card>
      </div>

      <UserFormModal
        open={formOpen}
        user={editing}
        users={users}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
        submitting={busy}
      />

      <ConfirmDialog
        open={Boolean(actionTarget)}
        onClose={() => setActionTarget(null)}
        onConfirm={handleConfirmAction}
        loading={busy}
        destructive={actionTarget?.type === 'delete'}
        title={
          actionTarget?.type === 'delete'
            ? 'Hapus akun pengguna?'
            : actionTarget?.user?.status === 'Aktif'
              ? 'Nonaktifkan akun pengguna?'
              : 'Aktifkan kembali akun?'
        }
        description={
          actionTarget
            ? actionTarget.type === 'delete'
              ? `${actionTarget.user.name} (${actionTarget.user.id}) akan dihapus dari manajemen pengguna demo.`
              : `${actionTarget.user.name} akan ${actionTarget.user.status === 'Aktif' ? 'kehilangan' : 'memperoleh kembali'} akses ke sistem.`
            : undefined
        }
        confirmLabel={
          actionTarget?.type === 'delete'
            ? 'Hapus pengguna'
            : actionTarget?.user?.status === 'Aktif'
              ? 'Nonaktifkan'
              : 'Aktifkan'
        }
      >
        <div className="space-y-2 text-[11.5px] leading-relaxed text-ink-500">
          <p>
            {actionTarget?.type === 'delete'
              ? 'Penghapusan akun hanya berlaku pada data demo dan tidak dapat dibatalkan otomatis.'
              : 'Perubahan status berlaku segera pada sesi demo berikutnya dan tercatat pada log audit.'}
          </p>
          {actionTarget?.user?.role === 'Super Admin' && actionTarget.type !== 'delete' ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
              Akun ini memiliki peran Super Admin. Pastikan masih ada minimal satu Super Admin aktif.
            </p>
          ) : null}
        </div>
      </ConfirmDialog>
    </div>
  )
}
