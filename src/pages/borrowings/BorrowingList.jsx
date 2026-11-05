import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Handshake,
  PackageCheck,
  Plus,
  RotateCcw,
  Undo2,
  X,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useTable } from '../../hooks/useTable'
import { cn, formatDate, formatDateShort, formatNumber } from '../../utils/format'
import { downloadCSV } from '../../utils/export'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card, { CardHeader } from '../../components/ui/Card'
import SearchInput from '../../components/ui/SearchInput'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import Tabs from '../../components/ui/Tabs'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import AssetThumb from '../../components/ui/AssetThumb'
import Modal from '../../components/ui/Modal'
import Field, { Select, Textarea } from '../../components/ui/Field'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import BorrowingFormModal from '../../components/borrowings/BorrowingFormModal'

const ALL = 'Semua'
const STATUSES = ['Menunggu Persetujuan', 'Disetujui', 'Sedang Dipinjam', 'Terlambat', 'Dikembalikan', 'Ditolak']
const RETURN_CONDITIONS = [
  'Lengkap & kondisi baik',
  'Lengkap, ada lecet pemakaian wajar',
  'Kurang aksesori',
  'Rusak ringan — perlu pemeriksaan',
  'Rusak berat — eskalasi pemeliharaan',
]

function overdueDays(item) {
  if (!['Sedang Dipinjam', 'Terlambat'].includes(item.status)) return 0
  return Math.max(0, Math.ceil((Date.now() - new Date(item.dueDate).getTime()) / 86400000))
}

export default function BorrowingList() {
  const { borrowings, assets, employees, actions } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState(ALL)
  const [department, setDepartment] = useState(ALL)
  const [priority, setPriority] = useState(ALL)
  const [formOpen, setFormOpen] = useState(false)
  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [handoverTarget, setHandoverTarget] = useState(null)
  const [returnTarget, setReturnTarget] = useState(null)
  const [returnCondition, setReturnCondition] = useState(RETURN_CONDITIONS[0])
  const [busy, setBusy] = useState(false)

  const departments = useMemo(() => [...new Set(borrowings.map((item) => item.department))], [borrowings])
  const priorities = useMemo(() => [...new Set(borrowings.map((item) => item.priority))], [borrowings])

  const stats = useMemo(
    () => ({
      total: borrowings.length,
      pending: borrowings.filter((item) => item.status === 'Menunggu Persetujuan').length,
      active: borrowings.filter((item) => item.status === 'Sedang Dipinjam').length,
      overdue: borrowings.filter((item) => item.status === 'Terlambat').length,
      returned: borrowings.filter((item) => item.status === 'Dikembalikan').length,
    }),
    [borrowings],
  )

  const filtered = useMemo(
    () =>
      borrowings.filter(
        (item) =>
          (tab === ALL || item.status === tab) &&
          (department === ALL || item.department === department) &&
          (priority === ALL || item.priority === priority),
      ),
    [borrowings, tab, department, priority],
  )

  const table = useTable(filtered, {
    pageSize: 8,
    searchFields: [
      'code',
      'id',
      'purpose',
      'department',
      'priority',
      (item) => employees.find((employee) => employee.id === item.employeeId)?.name,
      (item) => employees.find((employee) => employee.id === item.employeeId)?.id,
      (item) => assets.find((asset) => asset.id === item.assetId)?.name,
      (item) => assets.find((asset) => asset.id === item.assetId)?.code,
    ],
  })

  const resetFilters = () => {
    setTab(ALL)
    setDepartment(ALL)
    setPriority(ALL)
    table.setQuery('')
  }

  const counts = useMemo(() => {
    const map = { [ALL]: borrowings.length }
    STATUSES.forEach((status) => {
      map[status] = borrowings.filter((item) => item.status === status).length
    })
    return map
  }, [borrowings])

  const handleCreate = async (values) => {
    setBusy(true)
    try {
      const created = await actions.createBorrowing(values)
      toast.success('Pengajuan dibuat', `${created.code} menunggu persetujuan administrator.`)
      setFormOpen(false)
      navigate(`/borrowings/${created.id}`)
    } catch (error) {
      toast.error('Gagal membuat pengajuan', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleApprove = async () => {
    if (!approveTarget) return
    setBusy(true)
    try {
      await actions.approveBorrowing(approveTarget.id)
      toast.success('Peminjaman disetujui', `${approveTarget.code} siap diserahkan ke pemohon.`)
      setApproveTarget(null)
    } catch (error) {
      toast.error('Gagal menyetujui', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    if (rejectReason.trim().length < 10) {
      toast.warning('Alasan terlalu singkat', 'Tuliskan alasan penolakan minimal 10 karakter.')
      return
    }
    setBusy(true)
    try {
      await actions.rejectBorrowing(rejectTarget.id, rejectReason.trim())
      toast.warning('Pengajuan ditolak', `${rejectTarget.code} ditolak dengan catatan.`)
      setRejectTarget(null)
      setRejectReason('')
    } catch (error) {
      toast.error('Gagal menolak', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleHandover = async () => {
    if (!handoverTarget) return
    setBusy(true)
    try {
      await actions.handOverBorrowing(handoverTarget.id)
      toast.success('Aset diserahkan', `${handoverTarget.code} kini berstatus sedang dipinjam.`)
      setHandoverTarget(null)
    } catch (error) {
      toast.error('Gagal menyerahkan aset', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleReturn = async () => {
    if (!returnTarget) return
    setBusy(true)
    try {
      await actions.returnBorrowing(returnTarget.id, returnCondition)
      toast.success('Pengembalian tercatat', `${returnTarget.code} · ${returnCondition}`)
      setReturnTarget(null)
    } catch (error) {
      toast.error('Gagal mencatat pengembalian', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleExport = () => {
    downloadCSV(
      'assetflow-peminjaman',
      [
        { label: 'Kode', key: 'code' },
        { label: 'Karyawan', value: (item) => employees.find((employee) => employee.id === item.employeeId)?.name || '-' },
        { label: 'NIP', key: 'employeeId' },
        { label: 'Departemen', key: 'department' },
        { label: 'Aset', value: (item) => assets.find((asset) => asset.id === item.assetId)?.name || '-' },
        { label: 'Kode Aset', value: (item) => assets.find((asset) => asset.id === item.assetId)?.code || '-' },
        { label: 'Tanggal Pinjam', value: (item) => formatDate(item.borrowDate) },
        { label: 'Target Kembali', value: (item) => formatDate(item.dueDate) },
        { label: 'Status', key: 'status' },
        { label: 'Prioritas', key: 'priority' },
      ],
      table.all,
    )
    toast.success('Ekspor selesai', `${table.all.length} baris peminjaman diunduh sebagai CSV.`)
  }

  const pendingQueue = borrowings.filter((item) => item.status === 'Menunggu Persetujuan').slice(0, 4)
  const dueSoon = borrowings
    .filter((item) => ['Sedang Dipinjam', 'Terlambat'].includes(item.status))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4)

  const columns = [
    {
      key: 'code',
      header: 'Peminjaman',
      sortKey: 'code',
      className: 'min-w-[150px]',
      render: (item) => (
        <div>
          <Link to={`/borrowings/${item.id}`} className="text-[11.5px] font-semibold text-ink-900 hover:text-navy-600 hover:underline">
            {item.code}
          </Link>
          <p className="mt-0.5 text-[9.5px] text-ink-400">
            {item.id} · {item.priority}
          </p>
        </div>
      ),
    },
    {
      key: 'employee',
      header: 'Pemohon',
      sortKey: 'employeeId',
      className: 'min-w-[195px]',
      render: (item) => {
        const employee = employees.find((entry) => entry.id === item.employeeId)
        return (
          <div className="flex items-center gap-2">
            <Avatar name={employee?.name || item.createdBy} initials={employee?.initials} color={employee?.avatarColor} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-semibold text-ink-900">{employee?.name || item.createdBy}</p>
              <p className="mt-0.5 truncate text-[9.5px] text-ink-400">
                {item.employeeId} · {item.department}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'asset',
      header: 'Aset yang Dipinjam',
      sortKey: 'assetId',
      className: 'min-w-[230px]',
      render: (item) => {
        const asset = assets.find((entry) => entry.id === item.assetId)
        return (
          <div className="flex items-center gap-2">
            <AssetThumb category={asset?.category} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-medium text-ink-800">{asset?.name || 'Aset tidak ditemukan'}</p>
              <p className="mt-0.5 truncate text-[9.5px] text-ink-400">
                {asset?.code} · SN {asset?.serial}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'period',
      header: 'Periode Pinjam',
      sortKey: 'borrowDate',
      className: 'min-w-[150px]',
      render: (item) => {
        const late = overdueDays(item)
        return (
          <div>
            <p className="text-[11px] font-medium text-ink-700">{formatDateShort(item.borrowDate)}</p>
            <p className="mt-0.5 text-[9.5px] text-ink-400">s.d. {formatDate(item.dueDate)}</p>
            {late > 0 ? <p className="mt-0.5 text-[9.5px] font-semibold text-red-600">Terlambat {late} hari</p> : null}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      className: 'min-w-[125px]',
      render: (item) => (
        <div className="space-y-1">
          <StatusBadge status={item.status} />
          {item.status === 'Dikembalikan' && item.returnDate ? (
            <p className="text-[9px] text-ink-400">{formatDateShort(item.returnDate)}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      className: 'w-[130px]',
      render: (item) => (
        <div className="flex items-center justify-end gap-0.5" onClick={(event) => event.stopPropagation()}>
          <Link
            to={`/borrowings/${item.id}`}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-navy-700"
            aria-label={`Detail ${item.code}`}
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          {item.status === 'Menunggu Persetujuan' ? (
            <>
              <button
                type="button"
                onClick={() => setApproveTarget(item)}
                className="rounded p-1.5 text-ink-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                aria-label={`Setujui ${item.code}`}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(item)
                  setRejectReason('')
                }}
                className="rounded p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Tolak ${item.code}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : null}
          {item.status === 'Disetujui' ? (
            <button
              type="button"
              onClick={() => setHandoverTarget(item)}
              className="rounded p-1.5 text-ink-400 transition hover:bg-blue-50 hover:text-blue-600"
              aria-label={`Serahkan ${item.code}`}
            >
              <PackageCheck className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {['Sedang Dipinjam', 'Terlambat'].includes(item.status) ? (
            <button
              type="button"
              onClick={() => {
                setReturnTarget(item)
                setReturnCondition(RETURN_CONDITIONS[0])
              }}
              className="rounded p-1.5 text-ink-400 transition hover:bg-brand-50 hover:text-brand-600"
              aria-label={`Catat pengembalian ${item.code}`}
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Peminjaman"
        title="Peminjaman & Sirkulasi Aset"
        description="Kelola permohonan pinjam pakai, verifikasi serah terima, persetujuan berjenjang, dan pemantauan batas pengembalian aset perusahaan."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Ekspor Laporan
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setFormOpen(true)}>
              Ajukan Peminjaman
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total Peminjaman" value={formatNumber(stats.total)} unit="transaksi" icon={Handshake} tone="navy" note={`${stats.returned} sudah dikembalikan`} />
        <StatCard label="Menunggu Persetujuan" value={stats.pending} unit="permohonan" icon={Clock3} tone="amber" note="perlu otorisasi admin" />
        <StatCard label="Sedang Dipinjam" value={stats.active} unit="unit aset" icon={PackageCheck} tone="blue" note="aktif di berbagai departemen" />
        <StatCard label="Terlambat" value={stats.overdue} unit="kasus" icon={AlertTriangle} tone="red" note="denda & notifikasi aktif" />
      </div>

      {stats.pending ? (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 sm:flex-row sm:items-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Clock3 className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold text-amber-900">
              {stats.pending} permohonan menunggu otorisasi administrator
            </p>
            <p className="text-[10.5px] text-amber-700/80">
              Tinjau kebutuhan, ketersediaan aset, dan rekomendasi atasan sebelum menyetujui peminjaman.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTab('Menunggu Persetujuan')}
            className="text-[10.5px] font-semibold text-amber-800 hover:underline"
          >
            Buka antrean
          </button>
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
            placeholder="Cari kode pinjam, nama karyawan, NIP, atau aset…"
            className="w-full lg:w-[330px]"
          />
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
            <select value={department} onChange={(event) => setDepartment(event.target.value)} className="select h-9 text-[11.5px]" aria-label="Filter departemen">
              <option value={ALL}>Semua departemen</option>
              {departments.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="select h-9 text-[11.5px]" aria-label="Filter prioritas">
              <option value={ALL}>Semua prioritas</option>
              {priorities.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetFilters}>
              Reset filter
            </Button>
          </div>
          <span className="hidden text-[10px] text-ink-400 lg:block">{stats.active + stats.overdue} aset sedang beredar</span>
        </div>
      </Card>

      <DataTable
        className="mt-3"
        tableClassName="min-w-[1120px]"
        columns={columns}
        rows={table.rows}
        sort={table.sort}
        onSort={table.toggleSort}
        empty={{
          title: 'Tidak ada peminjaman',
          description: 'Tidak ada pengajuan yang sesuai dengan tab, pencarian, atau filter saat ini.',
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
            label="peminjaman"
          />
        }
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Antrean Persetujuan"
            subtitle="Permohonan terbaru yang memerlukan keputusan"
            action={<Badge tone="warning">{stats.pending} menunggu</Badge>}
          />
          <div className="border-t border-line">
            {pendingQueue.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Antrean bersih" description="Semua permohonan peminjaman sudah ditinjau." className="py-8" />
            ) : (
              pendingQueue.map((item) => {
                const employee = employees.find((entry) => entry.id === item.employeeId)
                const asset = assets.find((entry) => entry.id === item.assetId)
                return (
                  <div key={item.id} className="flex flex-col gap-2 border-b border-line/70 px-5 py-3 last:border-0 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Avatar name={employee?.name} initials={employee?.initials} color={employee?.avatarColor} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-ink-900">{employee?.name}</p>
                        <p className="truncate text-[9.5px] text-ink-400">{asset?.name} · {asset?.code}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button size="xs" variant="secondary" icon={Check} onClick={() => setApproveTarget(item)}>
                        Setujui
                      </Button>
                      <Button
                        size="xs"
                        variant="danger-soft"
                        icon={X}
                        onClick={() => {
                          setRejectTarget(item)
                          setRejectReason('')
                        }}
                      >
                        Tolak
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Jadwal Pengembalian"
            subtitle="Aset beredar dengan tenggat terdekat"
            action={<CalendarClock className="h-4 w-4 text-ink-400" />}
          />
          <div className="border-t border-line">
            {dueSoon.length === 0 ? (
              <EmptyState icon={CalendarClock} title="Tidak ada aset beredar" description="Semua aset telah dikembalikan ke gudang." className="py-8" />
            ) : (
              dueSoon.map((item) => {
                const employee = employees.find((entry) => entry.id === item.employeeId)
                const asset = assets.find((entry) => entry.id === item.assetId)
                const late = overdueDays(item)
                return (
                  <Link
                    key={item.id}
                    to={`/borrowings/${item.id}`}
                    className="flex items-center gap-2.5 border-b border-line/70 px-5 py-3 transition last:border-0 hover:bg-slate-50/70"
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', late > 0 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')}>
                      {late > 0 ? <AlertTriangle className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-ink-900">{asset?.name}</p>
                      <p className="truncate text-[9.5px] text-ink-400">
                        {employee?.name} · {formatDate(item.dueDate)}
                      </p>
                    </div>
                    <Badge tone={late > 0 ? 'danger' : 'info'}>{late > 0 ? `+${late} hari` : 'Tepat waktu'}</Badge>
                  </Link>
                )
              })
            )}
          </div>
        </Card>
      </div>

      <BorrowingFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        submitting={busy}
        employees={employees}
        assets={assets}
      />

      <ConfirmDialog
        open={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        loading={busy}
        destructive={false}
        title="Setujui permohonan peminjaman?"
        description={approveTarget ? `${approveTarget.code} akan disetujui dan siap masuk ke proses serah terima aset.` : ''}
        confirmLabel="Setujui peminjaman"
      />

      <ConfirmDialog
        open={Boolean(handoverTarget)}
        onClose={() => setHandoverTarget(null)}
        onConfirm={handleHandover}
        loading={busy}
        destructive={false}
        title="Konfirmasi serah terima aset"
        description={handoverTarget ? `Pastikan unit fisik dan aksesori ${handoverTarget.code} telah diperiksa sebelum diserahkan.` : ''}
        confirmLabel="Serahkan aset"
      />

      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Tolak permohonan peminjaman"
        description="Alasan penolakan akan dicatat pada linimasa dan notifikasi pemohon."
        icon={X}
        tone="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectTarget(null)} disabled={busy}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleReject} loading={busy}>
              Tolak pengajuan
            </Button>
          </>
        }
      >
        <Field label="Alasan penolakan" htmlFor="reject-reason" required hint="Minimal 10 karakter, jelaskan kebijakan atau kendala yang relevan.">
          <Textarea
            id="reject-reason"
            rows={4}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Contoh: Aset dialokasikan untuk kebutuhan operasional lain pada periode yang sama."
          />
        </Field>
      </Modal>

      <Modal
        open={Boolean(returnTarget)}
        onClose={() => setReturnTarget(null)}
        title="Catat pengembalian aset"
        description="Pilih kondisi unit setelah inspeksi fisik oleh petugas gudang."
        icon={RotateCcw}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReturnTarget(null)} disabled={busy}>
              Batal
            </Button>
            <Button variant="teal" onClick={handleReturn} loading={busy}>
              Simpan pengembalian
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Kondisi saat dikembalikan" htmlFor="return-condition" required>
            <Select id="return-condition" value={returnCondition} onChange={(event) => setReturnCondition(event.target.value)}>
              {RETURN_CONDITIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <div className="rounded-lg border border-line bg-slate-50/70 p-3 text-[10.5px] leading-relaxed text-ink-500">
            Pengembalian akan mengubah status aset kembali menjadi <span className="font-semibold text-ink-700">Tersedia</span>.
            Kondisi rusak ringan akan tercatat pada grade aset dan dapat memicu tiket pemeliharaan.
          </div>
        </div>
      </Modal>
    </div>
  )
}
