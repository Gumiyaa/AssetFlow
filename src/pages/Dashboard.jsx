import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  ClipboardList,
  Clock3,
  Download,
  FileBarChart2,
  Handshake,
  Package,
  Plus,
  RefreshCw,
  TrendingUp,
  Wrench,
  X,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { activities as seedActivities, assetGrowth, categoryDistribution, conditionData, weeklyOperations } from '../data/mockData'
import { cn, formatCurrency, formatDate, formatNumber, statusTone, truncate } from '../utils/format'
import { downloadCSV } from '../utils/export'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Card, { CardHeader } from '../components/ui/Card'
import Badge, { StatusBadge } from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import AssetThumb from '../components/ui/AssetThumb'
import Progress from '../components/ui/Progress'
import Button from '../components/ui/Button'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 shadow-lg">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <div className="mt-1 space-y-0.5">
        {payload.map((item) => (
          <p key={item.dataKey} className="flex items-center gap-1.5 text-[11px] text-ink-700">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color || item.fill }} />
            {item.name}: <span className="font-semibold text-ink-900">
              {item.dataKey === 'value' ? `Rp ${item.value} M` : `${formatNumber(item.value)} unit`}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { assets, inventory, borrowings, maintenance, employees, counts, actions, activities } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const [period, setPeriod] = useState(6)
  const [alertOpen, setAlertOpen] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const totalAssets = 1404 + assets.length
  const activeLoans = borrowings.filter((item) => ['Sedang Dipinjam', 'Terlambat'].includes(item.status)).length
  const pending = borrowings.filter((item) => item.status === 'Menunggu Persetujuan').slice(0, 3)
  const lowStock = inventory.filter((item) => item.status !== 'Aman').slice(0, 4)
  const urgentTickets = maintenance.filter((item) => !['Selesai'].includes(item.status)).slice(0, 3)
  const chartData = useMemo(() => assetGrowth.slice(-period), [period])
  const totalUnits = chartData.reduce((sum, item) => sum + item.units, 0)
  const activityFeed = (activities?.length ? activities : seedActivities).slice(0, 5)

  const handleApprove = async (item) => {
    setBusyId(item.id)
    try {
      await actions.approveBorrowing(item.id)
      toast.success('Peminjaman disetujui', `${item.code} · ${item.department}`)
    } catch (error) {
      toast.error('Gagal menyetujui', error.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (item) => {
    setBusyId(item.id)
    try {
      await actions.rejectBorrowing(item.id, 'Ditolak cepat dari antrean persetujuan dashboard.')
      toast.warning('Peminjaman ditolak', `${item.code} telah ditolak.`)
    } catch (error) {
      toast.error('Gagal menolak', error.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleExport = () => {
    downloadCSV(
      'assetflow-ringkasan-operasional',
      [
        { label: 'Bulan', key: 'month' },
        { label: 'Unit Masuk', key: 'units' },
        { label: 'Nilai Perolehan (Miliar)', key: 'value' },
      ],
      chartData,
    )
    toast.success('Ekspor berhasil', 'Ringkasan tren aset diunduh sebagai CSV.')
  }

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow={`${formatDate(new Date(), { long: true })} · Jakarta HQ`}
        title="Ringkasan Operasional"
        description="Pantau kondisi aset, sirkulasi peminjaman, dan pekerjaan pemeliharaan dalam satu tampilan."
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={() => { actions.refresh(); toast.info('Data disegarkan', 'Seluruh data demo telah dimuat ulang dari penyimpanan lokal.') }}>
              Segarkan
            </Button>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Ekspor
            </Button>
            <Button variant="primary" icon={Plus} to="/assets/create">
              Registrasi Aset
            </Button>
          </>
        }
      />

      {alertOpen && (counts.pendingBorrowings > 0 || counts.overdue > 0) ? (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/40 px-4 py-3 sm:flex-row sm:items-center">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-amber-900">
              {counts.pendingBorrowings} pengajuan peminjaman menunggu persetujuan
              {counts.overdue ? ` · ${counts.overdue} pengembalian terlambat` : ''}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800/80">
              Otorisasi diperlukan agar aset dapat diserahkan sesuai jadwal. Tinjau antrean sebelum batas waktu.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="secondary" to="/borrowings" className="border-amber-200 bg-white text-amber-900 hover:bg-amber-50">
              Review sekarang
            </Button>
            <button
              type="button"
              onClick={() => setAlertOpen(false)}
              className="rounded-md p-1.5 text-amber-700/70 transition hover:bg-amber-100"
              aria-label="Tutup peringatan"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Aset" value={formatNumber(totalAssets)} unit="unit" icon={Boxes} tone="navy" delta={4.8} note="12 unit bulan ini" />
        <StatCard label="Nilai Perolehan" value="Rp 24,7 M" icon={TrendingUp} tone="teal" delta={2.1} note="nilai buku Rp 18,9 M" />
        <StatCard label="Sedang Dipinjam" value={28 + activeLoans} unit="unit" icon={Handshake} tone="blue" delta={-3.2} note="7 jatuh tempo pekan ini" />
        <StatCard label="Menunggu Persetujuan" value={counts.pendingBorrowings} unit="pengajuan" icon={Clock3} tone="amber" note="perlu tindakan admin" />
        <StatCard label="Tiket Pemeliharaan" value={counts.activeMaintenance} unit="aktif" icon={Wrench} tone="purple" note="2 prioritas tinggi" />
        <StatCard label="Stok Menipis" value={counts.lowStock} unit="SKU" icon={Package} tone="red" note="di bawah batas minimum" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader
            title="Tren Perolehan Aset"
            subtitle={`${totalUnits} unit tercatat dalam ${period} bulan terakhir`}
            action={
              <select
                value={period}
                onChange={(event) => setPeriod(Number(event.target.value))}
                className="select h-8 w-auto px-2 pr-7 text-[11px]"
              >
                <option value={3}>3 bulan</option>
                <option value={6}>6 bulan</option>
              </select>
            }
          />
          <div className="flex flex-wrap items-center gap-4 px-5 pb-2">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] text-ink-500">
              <span className="h-2 w-2 rounded-sm bg-brand-500" /> Populasi aset (unit)
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] text-ink-500">
              <span className="h-0.5 w-4 rounded-full bg-amber-500" /> Nilai perolehan (Rp M)
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
              <ArrowUpRight className="h-3 w-3" /> +18,4% YoY
            </span>
          </div>
          <div className="h-[264px] px-2 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 18, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#169e8d" />
                    <stop offset="100%" stopColor="#a8eadd" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} width={36} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(15,23,42,0.03)' }} />
                <Bar dataKey="units" name="Populasi" fill="url(#barGradient)" radius={[5, 5, 0, 0]} maxBarSize={34} />
                <Line type="monotone" dataKey="value" name="Nilai" stroke="#F79009" strokeWidth={2} dot={{ r: 3, fill: '#fff', stroke: '#F79009', strokeWidth: 2 }} activeDot={{ r: 4 }} yAxisId={1} />
                <YAxis yAxisId={1} hide domain={[0, 4]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader title="Komposisi Kategori" subtitle="Distribusi 1.428 unit aset" action={<Badge tone="teal">Live</Badge>} />
          <div className="relative mx-auto h-[184px] w-full max-w-[260px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={78} paddingAngle={3} strokeWidth={0}>
                  {categoryDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${formatNumber(value)} unit`, name]}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e5e9f0', fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[19px] font-semibold tracking-[-0.03em] text-ink-900">1.428</span>
              <span className="text-[9.5px] uppercase tracking-[0.08em] text-ink-400">Total unit</span>
            </div>
          </div>
          <div className="space-y-2 px-5 pb-5">
            {categoryDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
                <span className="min-w-0 flex-1 truncate text-[11px] text-ink-600">{item.name}</span>
                <span className="text-[10.5px] font-medium text-ink-900">{formatNumber(item.value)}</span>
                <span className="w-8 text-right text-[10px] text-ink-400">{item.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader title="Kondisi Aset" subtitle="Hasil inspeksi & audit fisik" action={<Link to="/assets" className="text-[10.5px] font-medium text-navy-700 hover:underline">Detail</Link>} />
          <div className="space-y-4 px-5 pb-5">
            {conditionData.map((item) => (
              <div key={item.name}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="truncate text-[11px] text-ink-600">{item.name}</span>
                  <span className="shrink-0 text-[10.5px] font-semibold text-ink-900">
                    {formatNumber(item.count)} <span className="font-normal text-ink-400">({item.value}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
                </div>
              </div>
            ))}
            <div className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-[10px] leading-relaxed text-ink-500">
              Audit terakhir 28 Okt 2025 · 96% aset terverifikasi sesuai lokasi tercatat.
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Sirkulasi Mingguan" subtitle="Peminjaman vs pengembalian" action={<Badge tone="info">Minggu IV</Badge>} />
          <div className="h-[206px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyOperations} margin={{ top: 8, right: 12, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 9.5, fill: '#94a3b8' }} dy={4} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9.5, fill: '#94a3b8' }} width={30} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e9f0', fontSize: 11 }} cursor={{ fill: 'rgba(15,23,42,0.03)' }} />
                <Bar dataKey="borrow" name="Dipinjam" fill="#17324d" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="returned" name="Dikembalikan" fill="#71d8c7" radius={[3, 3, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between border-t border-line px-5 py-2.5 text-[10px]">
            <span className="flex items-center gap-1.5 text-ink-500"><span className="h-2 w-2 rounded-sm bg-navy-700" /> Dipinjam</span>
            <span className="flex items-center gap-1.5 text-ink-500"><span className="h-2 w-2 rounded-sm bg-brand-300" /> Dikembalikan</span>
            <span className="font-medium text-emerald-600">Tingkat kembali 82%</span>
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader
            title="Antrean Persetujuan"
            subtitle={`${counts.pendingBorrowings} pengajuan menunggu tindakan`}
            action={<Link to="/borrowings" className="text-[10.5px] font-medium text-navy-700 hover:underline">Semua</Link>}
          />
          <div className="divide-y divide-line border-t border-line">
            {pending.length === 0 ? (
              <p className="px-5 py-8 text-center text-[11px] text-ink-500">Tidak ada antrean. Semua pengajuan telah ditinjau.</p>
            ) : (
              pending.map((item) => {
                const employee = employees.find((entry) => entry.id === item.employeeId)
                const asset = assets.find((entry) => entry.id === item.assetId)
                return (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <Avatar name={employee?.name} initials={employee?.initials} color={employee?.avatarColor} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-[11.5px] font-semibold text-ink-900">{employee?.name || item.createdBy}</p>
                          <Badge tone="warning" className="shrink-0">Menunggu</Badge>
                        </div>
                        <p className="truncate text-[10.5px] text-ink-500">{asset?.name || 'Aset tidak ditemukan'}</p>
                        <p className="mt-0.5 text-[9.5px] text-ink-400">
                          {formatDate(item.borrowDate)} – {formatDate(item.dueDate)} · {item.priority}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 pl-10">
                      <Link to={`/borrowings/${item.id}`} className="text-[10px] font-medium text-navy-700 hover:underline">
                        Lihat detail
                      </Link>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => handleReject(item)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-line text-ink-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          aria-label="Tolak pengajuan"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => handleApprove(item)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-40"
                          aria-label="Setujui pengajuan"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader title="Stok Menipis" subtitle="Perlu pengadaan ulang" action={<Link to="/inventory" className="text-[10.5px] font-medium text-navy-700 hover:underline">Kelola</Link>} />
          <div className="space-y-3 px-5 pb-5">
            {lowStock.map((item) => (
              <div key={item.id} className="flex items-center gap-2.5">
                <AssetThumb category="Mesin Kantor" size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-ink-900">{item.name}</p>
                  <p className="text-[9.5px] text-ink-400">{item.location} · min. {item.minStock} {item.unit}</p>
                  <Progress value={(item.stock / Math.max(item.minStock, 1)) * 100} tone={item.stock === 0 ? 'red' : 'amber'} className="mt-1 h-1" />
                </div>
                <span className={cn('shrink-0 text-[11px] font-semibold', item.stock === 0 ? 'text-red-600' : 'text-amber-600')}>
                  {item.stock} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Tiket Prioritas" subtitle="Pemeliharaan aktif" action={<Link to="/maintenance" className="text-[10.5px] font-medium text-navy-700 hover:underline">Semua</Link>} />
          <div className="space-y-3 px-5 pb-5">
            {urgentTickets.map((ticket) => {
              const asset = assets.find((entry) => entry.id === ticket.assetId)
              return (
                <Link key={ticket.id} to={`/maintenance/${ticket.id}`} className="block rounded-lg border border-line p-2.5 transition hover:border-slate-300 hover:bg-slate-50/60">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-ink-400">{ticket.code}</p>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="mt-1 truncate text-[11px] font-medium text-ink-900">{asset?.name || 'Aset'}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Progress value={ticket.progress} tone={ticket.priority === 'Tinggi' ? 'red' : 'amber'} className="h-1" />
                    <span className="shrink-0 text-[9.5px] font-medium text-ink-500">{ticket.progress}%</span>
                  </div>
                  <p className="mt-1 text-[9.5px] text-ink-400">{ticket.type} · Target {formatDate(ticket.targetDate)}</p>
                </Link>
              )
            })}
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Aktivitas Terkini" subtitle="Log audit sistem" action={<Link to="/reports" className="text-[10.5px] font-medium text-navy-700 hover:underline">Log</Link>} />
          <div className="px-5 pb-4">
            <ol className="relative ml-1 border-l border-line">
              {activityFeed.map((activity) => (
                <li key={activity.id} className="relative pb-3 pl-4 last:pb-0">
                  <span
                    className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full ring-2 ring-white"
                    style={{ background: activity.color }}
                  />
                  <p className="line-clamp-2 text-[10.5px] font-medium leading-relaxed text-ink-800">{activity.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-[9.5px] text-ink-400">{activity.desc}</p>
                  <p className="mt-0.5 text-[9px] text-ink-400">{activity.time}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="border-t border-line px-5 py-2.5">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-navy-700 hover:underline"
            >
              Buka pusat laporan <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[10.5px] text-ink-500 sm:flex-row sm:items-center">
        <span className="inline-flex items-center gap-1.5">
          <ClipboardList className="h-3.5 w-3.5 text-ink-400" />
          Data demo tersinkronisasi dengan penyimpanan lokal browser Anda.
        </span>
        <span className="flex items-center gap-3">
          <Link to="/reports" className="inline-flex items-center gap-1 font-medium text-navy-700 hover:underline">
            <FileBarChart2 className="h-3 w-3" /> Laporan bulanan
          </Link>
          <span className="h-2.5 w-px bg-line" />
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-1 font-medium text-navy-700 hover:underline">
            <Download className="h-3 w-3" /> Unduh ringkasan
          </button>
        </span>
      </div>
    </div>
  )
}
