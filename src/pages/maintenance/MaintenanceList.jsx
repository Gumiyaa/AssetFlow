import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  Plus,
  RotateCcw,
  ShieldCheck,
  Timer,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useTable } from '../../hooks/useTable'
import { cn, formatCurrency, formatDate, formatDateShort, formatNumber } from '../../utils/format'
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
import AssetThumb from '../../components/ui/AssetThumb'
import Progress from '../../components/ui/Progress'
import EmptyState from '../../components/ui/EmptyState'
import MaintenanceFormModal from '../../components/maintenance/MaintenanceFormModal'

const ALL = 'Semua'
const STATUSES = ['Menunggu', 'Dalam Pengerjaan', 'Menunggu Suku Cadang', 'Selesai']
const PRIORITIES = ['Tinggi', 'Sedang', 'Rendah', 'Preventif']

function priorityTone(priority) {
  if (priority === 'Tinggi') return 'danger'
  if (priority === 'Sedang') return 'warning'
  if (priority === 'Preventif') return 'info'
  return 'neutral'
}

export default function MaintenanceList() {
  const { maintenance, assets, actions } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState(ALL)
  const [priority, setPriority] = useState(ALL)
  const [type, setType] = useState(ALL)
  const [formOpen, setFormOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const types = useMemo(() => [...new Set(maintenance.map((item) => item.type))], [maintenance])

  const stats = useMemo(
    () => ({
      total: maintenance.length,
      active: maintenance.filter((item) => item.status !== 'Selesai').length,
      progress: maintenance.filter((item) => item.status === 'Dalam Pengerjaan').length,
      waitingParts: maintenance.filter((item) => item.status === 'Menunggu Suku Cadang').length,
      done: maintenance.filter((item) => item.status === 'Selesai').length,
      high: maintenance.filter((item) => item.priority === 'Tinggi' && item.status !== 'Selesai').length,
      actualCost: maintenance.reduce((sum, item) => sum + (item.actual || 0), 0),
      estimateCost: maintenance.reduce((sum, item) => sum + (item.estimate || 0), 0),
    }),
    [maintenance],
  )

  const filtered = useMemo(
    () =>
      maintenance.filter(
        (item) =>
          (tab === ALL || item.status === tab) &&
          (priority === ALL || item.priority === priority) &&
          (type === ALL || item.type === type),
      ),
    [maintenance, tab, priority, type],
  )

  const table = useTable(filtered, {
    pageSize: 8,
    searchFields: [
      'code',
      'id',
      'type',
      'priority',
      'status',
      'technician',
      'vendor',
      'problem',
      (item) => assets.find((asset) => asset.id === item.assetId)?.name,
      (item) => assets.find((asset) => asset.id === item.assetId)?.code,
    ],
  })

  const counts = useMemo(() => {
    const map = { [ALL]: maintenance.length }
    STATUSES.forEach((status) => {
      map[status] = maintenance.filter((item) => item.status === status).length
    })
    return map
  }, [maintenance])

  const resetFilters = () => {
    setTab(ALL)
    setPriority(ALL)
    setType(ALL)
    table.setQuery('')
  }

  const handleCreate = async (values) => {
    setBusy(true)
    try {
      const created = await actions.createMaintenance(values)
      toast.success('Tiket dibuat', `${created.code} masuk antrean pemeliharaan.`)
      setFormOpen(false)
      navigate(`/maintenance/${created.id}`)
    } catch (error) {
      toast.error('Gagal membuat tiket', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleExport = () => {
    downloadCSV(
      'assetflow-pemeliharaan',
      [
        { label: 'Kode Tiket', key: 'code' },
        { label: 'Aset', value: (item) => assets.find((asset) => asset.id === item.assetId)?.name || '-' },
        { label: 'Kode Aset', value: (item) => assets.find((asset) => asset.id === item.assetId)?.code || '-' },
        { label: 'Jenis', key: 'type' },
        { label: 'Prioritas', key: 'priority' },
        { label: 'Teknisi', key: 'technician' },
        { label: 'Vendor', key: 'vendor' },
        { label: 'Tanggal Masuk', value: (item) => formatDate(item.submittedDate) },
        { label: 'Target Selesai', value: (item) => formatDate(item.targetDate) },
        { label: 'Progres', value: (item) => `${item.progress}%` },
        { label: 'Status', key: 'status' },
        { label: 'Estimasi', key: 'estimate' },
        { label: 'Realisasi', key: 'actual' },
      ],
      table.all,
    )
    toast.success('Ekspor selesai', `${table.all.length} tiket pemeliharaan diunduh sebagai CSV.`)
  }

  const criticalQueue = maintenance
    .filter((item) => item.status !== 'Selesai')
    .sort((a, b) => {
      const weight = { Tinggi: 0, Sedang: 1, Preventif: 2, Rendah: 3 }
      return (weight[a.priority] ?? 4) - (weight[b.priority] ?? 4)
    })
    .slice(0, 4)

  const upcoming = maintenance
    .filter((item) => item.status !== 'Selesai')
    .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
    .slice(0, 4)

  const columns = [
    {
      key: 'code',
      header: 'Tiket',
      sortKey: 'code',
      className: 'min-w-[160px]',
      render: (item) => (
        <div>
          <Link to={`/maintenance/${item.id}`} className="text-[11.5px] font-semibold text-ink-900 hover:text-navy-600 hover:underline">
            {item.code}
          </Link>
          <p className="mt-0.5 text-[9.5px] text-ink-400">{item.id} · {formatDateShort(item.submittedDate)}</p>
        </div>
      ),
    },
    {
      key: 'asset',
      header: 'Aset',
      sortKey: 'assetId',
      className: 'min-w-[240px]',
      render: (item) => {
        const asset = assets.find((entry) => entry.id === item.assetId)
        return (
          <div className="flex items-center gap-2">
            <AssetThumb category={asset?.category} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-medium text-ink-800">{asset?.name || 'Aset tidak ditemukan'}</p>
              <p className="mt-0.5 truncate text-[9.5px] text-ink-400">{asset?.code} · {asset?.location}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'type',
      header: 'Jenis & Prioritas',
      sortKey: 'type',
      className: 'min-w-[150px]',
      render: (item) => (
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-ink-700">{item.type}</p>
          <Badge tone={priorityTone(item.priority)} dot>{item.priority}</Badge>
        </div>
      ),
    },
    {
      key: 'technician',
      header: 'Teknisi / Vendor',
      sortKey: 'technician',
      className: 'min-w-[170px]',
      render: (item) => (
        <div>
          <p className="truncate text-[11px] font-medium text-ink-700">{item.technician}</p>
          <p className="mt-0.5 truncate text-[9.5px] text-ink-400">{item.vendor}</p>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progres',
      sortKey: 'progress',
      className: 'min-w-[130px]',
      render: (item) => (
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10.5px] font-semibold text-ink-800">{item.progress}%</span>
            <span className="text-[9px] text-ink-400">{formatDateShort(item.targetDate)}</span>
          </div>
          <Progress
            value={item.progress}
            tone={item.status === 'Selesai' ? 'teal' : item.priority === 'Tinggi' ? 'red' : 'amber'}
            className="mt-1 h-1.5"
          />
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      className: 'min-w-[145px]',
      render: (item) => (
        <div className="space-y-1">
          <StatusBadge status={item.status} />
          {item.completedDate ? <p className="text-[9px] text-ink-400">{formatDateShort(item.completedDate)}</p> : null}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      className: 'w-[90px]',
      render: (item) => (
        <div className="flex items-center justify-end gap-0.5" onClick={(event) => event.stopPropagation()}>
          <Link
            to={`/maintenance/${item.id}`}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-navy-700"
            aria-label={`Detail ${item.code}`}
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Pemeliharaan"
        title="Pemeliharaan & Perbaikan Aset"
        description="Kelola tiket korektif dan preventif, pantau progres teknisi, serta kendalikan biaya pemeliharaan aset perusahaan."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Ekspor Laporan
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setFormOpen(true)}>
              Buat Tiket
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total Tiket" value={formatNumber(stats.total)} unit="tiket" icon={ClipboardList} tone="navy" note={`${stats.done} selesai`} />
        <StatCard label="Sedang Ditangani" value={stats.active} unit="tiket" icon={Wrench} tone="blue" note={`${stats.progress} dalam pengerjaan`} />
        <StatCard label="Prioritas Tinggi" value={stats.high} unit="aktif" icon={AlertTriangle} tone="red" note="memerlukan eskalasi" />
        <StatCard label="Realisasi Biaya" value={formatCurrency(stats.actualCost, { compact: true })} icon={TrendingUp} tone="teal" note={`estimasi ${formatCurrency(stats.estimateCost, { compact: true })}`} />
      </div>

      {stats.high ? (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 sm:flex-row sm:items-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold text-red-900">{stats.high} tiket prioritas tinggi masih terbuka</p>
            <p className="text-[10.5px] text-red-700/80">
              Tinjau SLA vendor, ketersediaan suku cadang, dan dampak operasional sebelum menutup tiket.
            </p>
          </div>
          <button type="button" onClick={() => setPriority('Tinggi')} className="text-[10.5px] font-semibold text-red-800 hover:underline">
            Filter prioritas tinggi
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
            placeholder="Cari kode tiket, aset, teknisi, atau keluhan…"
            className="w-full lg:w-[330px]"
          />
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="select h-9 text-[11.5px]" aria-label="Filter prioritas">
              <option value={ALL}>Semua prioritas</option>
              {PRIORITIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={type} onChange={(event) => setType(event.target.value)} className="select h-9 text-[11.5px]" aria-label="Filter jenis">
              <option value={ALL}>Semua jenis</option>
              {types.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetFilters}>
              Reset filter
            </Button>
          </div>
          <span className="hidden text-[10px] text-ink-400 lg:block">{stats.active} tiket aktif</span>
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
          title: 'Tidak ada tiket pemeliharaan',
          description: 'Tidak ada tiket yang sesuai dengan tab, pencarian, atau filter saat ini.',
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
            label="tiket"
          />
        }
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Antrean Prioritas"
            subtitle="Tiket aktif yang memerlukan perhatian"
            action={<Badge tone="danger">{stats.high} tinggi</Badge>}
          />
          <div className="border-t border-line">
            {criticalQueue.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Semua tiket terkendali" description="Tidak ada tiket aktif saat ini." className="py-8" />
            ) : (
              criticalQueue.map((item) => {
                const asset = assets.find((entry) => entry.id === item.assetId)
                return (
                  <Link
                    key={item.id}
                    to={`/maintenance/${item.id}`}
                    className="flex items-center gap-2.5 border-b border-line/70 px-5 py-3 transition last:border-0 hover:bg-slate-50/70"
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', item.priority === 'Tinggi' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600')}>
                      <Wrench className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-ink-900">{asset?.name || item.code}</p>
                      <p className="truncate text-[9.5px] text-ink-400">{item.code} · {item.technician}</p>
                    </div>
                    <div className="w-16 shrink-0">
                      <Progress value={item.progress} tone={item.priority === 'Tinggi' ? 'red' : 'amber'} />
                      <p className="mt-1 text-right text-[9px] text-ink-400">{item.progress}%</p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Target Penyelesaian" subtitle="Tenggat tiket aktif terdekat" action={<CalendarClock className="h-4 w-4 text-ink-400" />} />
          <div className="border-t border-line">
            {upcoming.length === 0 ? (
              <EmptyState icon={CalendarClock} title="Tidak ada tenggat" description="Semua tiket telah diselesaikan." className="py-8" />
            ) : (
              upcoming.map((item) => {
                const asset = assets.find((entry) => entry.id === item.assetId)
                const late = new Date(item.targetDate) < new Date()
                return (
                  <Link
                    key={item.id}
                    to={`/maintenance/${item.id}`}
                    className="flex items-center gap-2.5 border-b border-line/70 px-5 py-3 transition last:border-0 hover:bg-slate-50/70"
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', late ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')}>
                      {late ? <AlertTriangle className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-ink-900">{asset?.name || item.code}</p>
                      <p className="truncate text-[9.5px] text-ink-400">{formatDate(item.targetDate)} · {item.status}</p>
                    </div>
                    <Badge tone={late ? 'danger' : 'info'}>{late ? 'Lewat target' : 'Terjadwal'}</Badge>
                  </Link>
                )
              })
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><ShieldCheck className="h-4 w-4" /></span>
          <div>
            <p className="text-[9.5px] uppercase tracking-wide text-ink-400">Tingkat penyelesaian</p>
            <p className="text-[15px] font-semibold text-ink-900">{Math.round((stats.done / Math.max(stats.total, 1)) * 100)}%</p>
            <p className="text-[9px] text-ink-400">{stats.done} dari {stats.total} tiket</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Timer className="h-4 w-4" /></span>
          <div>
            <p className="text-[9.5px] uppercase tracking-wide text-ink-400">Menunggu suku cadang</p>
            <p className="text-[15px] font-semibold text-ink-900">{stats.waitingParts}</p>
            <p className="text-[9px] text-ink-400">tiket tertahan pengadaan</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><TrendingUp className="h-4 w-4" /></span>
          <div>
            <p className="text-[9.5px] uppercase tracking-wide text-ink-400">Efisiensi biaya</p>
            <p className="text-[15px] font-semibold text-ink-900">
              {stats.estimateCost ? `${Math.round(((stats.estimateCost - stats.actualCost) / stats.estimateCost) * 100)}%` : '—'}
            </p>
            <p className="text-[9px] text-ink-400">di bawah estimasi</p>
          </div>
        </div>
      </div>

      <MaintenanceFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        submitting={busy}
        assets={assets}
      />
    </div>
  )
}
