import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Download,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useTable } from '../../hooks/useTable'
import { cn, formatDate, formatNumber } from '../../utils/format'
import { downloadCSV } from '../../utils/export'
import { useMasterData } from '../../hooks/useMasterData'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card, { CardHeader } from '../../components/ui/Card'
import SearchInput from '../../components/ui/SearchInput'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import Tabs from '../../components/ui/Tabs'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Progress from '../../components/ui/Progress'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmployeeFormModal from '../../components/employees/EmployeeFormModal'

const ALL = 'Semua'
const STATUSES = ['Aktif', 'Masa Percobaan', 'Cuti', 'Nonaktif']
const GRADES = ['Grade A', 'Grade B', 'Grade C']

function gradeTone(grade) {
  if (grade === 'Grade A') return 'success'
  if (grade === 'Grade B') return 'info'
  return 'warning'
}

export default function EmployeeList() {
  const { employees, actions } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const { departments } = useMasterData()
  const [tab, setTab] = useState(ALL)
  const [department, setDepartment] = useState(ALL)
  const [grade, setGrade] = useState(ALL)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const stats = useMemo(() => {
    const active = employees.filter((item) => item.status === 'Aktif').length
    const probation = employees.filter((item) => item.status === 'Masa Percobaan').length
    const leave = employees.filter((item) => item.status === 'Cuti').length
    const totalAssets = employees.reduce((sum, item) => sum + (Number(item.assets) || 0), 0)
    const gradeA = employees.filter((item) => item.grade === 'Grade A').length
    return {
      total: employees.length,
      active,
      probation,
      leave,
      totalAssets,
      gradeA,
      compliance: Math.round((gradeA / Math.max(employees.length, 1)) * 100),
      custodians: employees.filter((item) => (Number(item.assets) || 0) > 0).length,
    }
  }, [employees])

  const distribution = useMemo(
    () =>
      departments
        .map((dept) => {
          const count = employees.filter((item) => item.department === dept.name).length
          return {
            ...dept,
            count,
            pct: Math.round((count / Math.max(employees.length, 1)) * 100),
          }
        })
        .sort((a, b) => b.count - a.count),
    [employees, departments],
  )

  const topCustodians = useMemo(
    () =>
      [...employees]
        .filter((item) => (Number(item.assets) || 0) > 0)
        .sort((a, b) => (Number(b.assets) || 0) - (Number(a.assets) || 0))
        .slice(0, 5),
    [employees],
  )

  const filtered = useMemo(
    () =>
      employees.filter(
        (item) =>
          (tab === ALL || item.status === tab) &&
          (department === ALL || item.department === department) &&
          (grade === ALL || item.grade === grade),
      ),
    [employees, tab, department, grade],
  )

  const table = useTable(filtered, {
    pageSize: 8,
    searchFields: ['name', 'id', 'email', 'phone', 'department', 'position', 'manager', 'location', 'grade', 'status'],
  })

  const counts = useMemo(() => {
    const map = { [ALL]: employees.length }
    STATUSES.forEach((status) => {
      map[status] = employees.filter((item) => item.status === status).length
    })
    return map
  }, [employees])

  const resetFilters = () => {
    setTab(ALL)
    setDepartment(ALL)
    setGrade(ALL)
    table.setQuery('')
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (employee) => {
    setEditing(employee)
    setFormOpen(true)
  }

  const handleSubmit = async (values) => {
    setBusy(true)
    try {
      if (editing) {
        await actions.updateEmployee(editing.id, values)
        toast.success('Data karyawan diperbarui', `${values.name} berhasil disimpan.`)
      } else {
        const created = await actions.createEmployee(values)
        toast.success('Karyawan ditambahkan', `${created.name} tercatat dengan ID ${created.id}.`)
      }
      setFormOpen(false)
      setEditing(null)
    } catch (error) {
      toast.error('Gagal menyimpan data', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await actions.deleteEmployee(deleteTarget.id)
      toast.success('Karyawan dihapus', `${deleteTarget.name} dikeluarkan dari direktori demo.`)
      setDeleteTarget(null)
    } catch (error) {
      toast.error('Gagal menghapus karyawan', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleExport = () => {
    downloadCSV(
      'assetflow-direktori-karyawan',
      [
        { label: 'ID Karyawan', key: 'id' },
        { label: 'Nama', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Telepon', key: 'phone' },
        { label: 'Departemen', key: 'department' },
        { label: 'Jabatan', key: 'position' },
        { label: 'Status', key: 'status' },
        { label: 'Tanggal Bergabung', value: (item) => formatDate(item.joinDate) },
        { label: 'Atasan', key: 'manager' },
        { label: 'Lokasi', key: 'location' },
        { label: 'Jumlah Aset', key: 'assets' },
        { label: 'Kepatuhan', key: 'grade' },
      ],
      table.all,
    )
    toast.success('Ekspor selesai', `${table.all.length} data karyawan diunduh sebagai CSV.`)
  }

  const columns = [
    {
      key: 'employee',
      header: 'Karyawan',
      sortKey: 'name',
      className: 'min-w-[220px]',
      render: (employee) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={employee.name} initials={employee.initials} color={employee.avatarColor} size="sm" status={employee.status === 'Aktif' ? 'Aktif' : undefined} />
          <div className="min-w-0">
            <Link
              to={`/employees/${employee.id}`}
              className="block truncate text-[11.5px] font-semibold text-ink-900 hover:text-navy-600 hover:underline"
            >
              {employee.name}
            </Link>
            <p className="mt-0.5 truncate text-[9.5px] text-ink-400">{employee.id} · {employee.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Departemen & Jabatan',
      sortKey: 'department',
      className: 'min-w-[210px]',
      render: (employee) => (
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-ink-800">
            <Building2 className="h-3 w-3 text-ink-400" />
            {employee.department}
          </p>
          <p className="mt-0.5 truncate text-[9.5px] text-ink-400">{employee.position}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Kontak',
      className: 'min-w-[150px]',
      render: (employee) => (
        <div className="space-y-0.5">
          <p className="text-[10.5px] font-medium text-ink-700">{employee.phone}</p>
          <p className="truncate text-[9.5px] text-ink-400">{employee.location}</p>
        </div>
      ),
    },
    {
      key: 'joinDate',
      header: 'Bergabung',
      sortKey: 'joinDate',
      className: 'min-w-[130px]',
      render: (employee) => (
        <div>
          <p className="text-[10.5px] font-medium text-ink-700">{formatDate(employee.joinDate)}</p>
          <p className="mt-0.5 truncate text-[9.5px] text-ink-400">Atasan: {employee.manager}</p>
        </div>
      ),
    },
    {
      key: 'assets',
      header: 'Kustodian',
      sortKey: 'assets',
      className: 'min-w-[90px]',
      render: (employee) => (
        <div>
          <p className="text-[12px] font-semibold text-ink-900">{employee.assets || 0}</p>
          <p className="text-[9px] text-ink-400">unit aset</p>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Kepatuhan',
      sortKey: 'grade',
      className: 'min-w-[120px]',
      render: (employee) => (
        <div className="space-y-1">
          <Badge tone={gradeTone(employee.grade)} dot>{employee.grade}</Badge>
          <p className="text-[9px] text-ink-400">audit kustodian</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      className: 'min-w-[130px]',
      render: (employee) => <StatusBadge status={employee.status} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      className: 'w-[110px]',
      render: (employee) => (
        <div className="flex items-center justify-end gap-0.5" onClick={(event) => event.stopPropagation()}>
          <Link
            to={`/employees/${employee.id}`}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-navy-700"
            aria-label={`Detail ${employee.name}`}
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => openEdit(employee)}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-navy-700"
            aria-label={`Edit ${employee.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(employee)}
            className="rounded p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Hapus ${employee.name}`}
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
        eyebrow="Data Karyawan"
        title="Direktori Karyawan & Kustodian Aset"
        description="Kelola data kepegawaian, penempatan departemen, kepatuhan kustodian, dan penugasan aset perusahaan."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Ekspor Direktori
            </Button>
            <Button variant="primary" icon={Plus} onClick={openCreate}>
              Tambah Karyawan
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total Karyawan" value={formatNumber(stats.total)} unit="orang" icon={Users} tone="navy" note={`${stats.probation} masa percobaan`} />
        <StatCard label="Karyawan Aktif" value={stats.active} unit="orang" icon={UserCheck} tone="teal" note={`${stats.leave} sedang cuti`} />
        <StatCard label="Kustodian Aset" value={stats.custodians} unit="orang" icon={Briefcase} tone="blue" note={`${stats.totalAssets} unit ditugaskan`} />
        <StatCard label="Kepatuhan Grade A" value={`${stats.compliance}%`} icon={ShieldCheck} tone="purple" note={`${stats.gradeA} karyawan terverifikasi`} />
      </div>

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
            placeholder="Cari nama, ID, email, jabatan, atau departemen…"
            className="w-full lg:w-[340px]"
          />
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
            <select value={department} onChange={(event) => setDepartment(event.target.value)} className="select h-9 text-[11.5px]" aria-label="Filter departemen">
              <option value={ALL}>Semua departemen</option>
              {departments.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
            <select value={grade} onChange={(event) => setGrade(event.target.value)} className="select h-9 text-[11.5px]" aria-label="Filter kepatuhan">
              <option value={ALL}>Semua grade</option>
              {GRADES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetFilters}>
              Reset filter
            </Button>
          </div>
          <span className="hidden text-[10px] text-ink-400 lg:block">{table.filteredCount} karyawan tampil</span>
        </div>
      </Card>

      <DataTable
        className="mt-3"
        tableClassName="min-w-[1120px]"
        columns={columns}
        rows={table.rows}
        sort={table.sort}
        onSort={table.toggleSort}
        onRowClick={(employee) => navigate(`/employees/${employee.id}`)}
        empty={{
          title: 'Tidak ada karyawan ditemukan',
          description: 'Tidak ada data yang sesuai dengan tab, pencarian, atau filter saat ini.',
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
            label="karyawan"
          />
        }
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Sebaran Karyawan per Departemen"
            subtitle="Komposisi tenaga kerja dan jumlah aset yang dikelola"
            action={<Badge tone="navy">{departments.length} departemen</Badge>}
          />
          <div className="space-y-3 border-t border-line px-5 py-4">
            {distribution.map((dept) => (
              <div key={dept.id}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-ink-800">{dept.name}</p>
                    <p className="text-[9px] text-ink-400">{dept.head} · {dept.assets} aset</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[10.5px] font-semibold text-ink-900">{dept.count}</span>
                    <span className="w-8 text-right text-[9px] text-ink-400">{dept.pct}%</span>
                  </div>
                </div>
                <Progress value={dept.pct} tone={dept.id === 'DEP-IT' ? 'teal' : dept.id === 'DEP-FIN' ? 'blue' : 'navy'} className="mt-1.5 h-1.5" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Kustodian Aset Teratas"
            subtitle="Karyawan dengan penugasan aset terbanyak"
            action={<BadgeCheck className="h-4 w-4 text-ink-400" />}
          />
          <div className="border-t border-line">
            {topCustodians.length === 0 ? (
              <EmptyState icon={Briefcase} title="Belum ada penugasan" description="Tambahkan aset ke PIC karyawan untuk melihat daftar ini." className="py-8" />
            ) : (
              topCustodians.map((employee) => (
                <Link
                  key={employee.id}
                  to={`/employees/${employee.id}`}
                  className="flex items-center gap-2.5 border-b border-line/70 px-5 py-2.5 transition last:border-0 hover:bg-slate-50/70"
                >
                  <Avatar name={employee.name} initials={employee.initials} color={employee.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-ink-900">{employee.name}</p>
                    <p className="truncate text-[9.5px] text-ink-400">{employee.department} · {employee.position}</p>
                  </div>
                  <div className={cn('flex shrink-0 items-center gap-1.5 text-[10px] font-semibold', employee.assets >= 3 ? 'text-brand-600' : 'text-ink-500')}>
                    <Briefcase className="h-3 w-3" />
                    {employee.assets} unit
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="border-t border-line bg-slate-50/60 px-5 py-2.5">
            <p className="text-[9.5px] text-ink-400">
              Kustodian wajib menandatangani BAST digital setiap serah terima aset.
            </p>
          </div>
        </Card>
      </div>

      <EmployeeFormModal
        open={formOpen}
        employee={editing}
        employees={employees}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
        submitting={busy}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={busy}
        title="Hapus data karyawan?"
        description={
          deleteTarget
            ? `${deleteTarget.name} (${deleteTarget.id}) akan dihapus dari direktori karyawan demo.`
            : undefined
        }
        confirmLabel="Hapus karyawan"
      >
        <div className="space-y-2 text-[11.5px] leading-relaxed text-ink-500">
          <p>Penghapusan hanya berlaku pada data demo di peramban ini dan tidak dapat dibatalkan otomatis.</p>
          {deleteTarget?.assets ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
              Karyawan ini masih tercatat sebagai PIC {deleteTarget.assets} unit aset. Pindahkan penugasan aset terlebih dahulu.
            </p>
          ) : null}
        </div>
      </ConfirmDialog>
    </div>
  )
}
