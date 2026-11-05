import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Database,
  Download,
  Eye,
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  PieChart as PieChartIcon,
  Printer,
  RotateCcw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useTable } from '../../hooks/useTable'
import {
  amortizationSeries,
  categoryDistribution,
  conditionData,
  depreciationProjection,
  portfolioDistribution,
  reportSummary,
  reports as seedReports,
} from '../../data/mockData'
import { cn, formatCurrency, formatNumber } from '../../utils/format'
import { downloadCSV, printSection } from '../../utils/export'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import SearchInput from '../../components/ui/SearchInput'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import Progress from '../../components/ui/Progress'

const ALL = 'Semua'

function ReportTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 shadow-lg">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <div className="mt-1 space-y-0.5">
        {payload.map((item) => (
          <p key={item.dataKey} className="flex items-center gap-1.5 text-[11px] text-ink-700">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color || item.fill }} />
            {item.name}: <span className="font-semibold text-ink-900">
              {item.dataKey === 'value' ? `Rp ${formatNumber(item.value, { maximumFractionDigits: 1 })} M` : formatNumber(item.value)}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}

function reportPreviewData(report, { employees, borrowings, assets }) {
  if (!report) return { columns: [], rows: [] }
  if (report.category === 'Keuangan & Depresiasi') {
    return {
      columns: [
        { key: 'year', label: 'Tahun Buku' },
        { key: 'value', label: 'Nilai Buku (Rp M)' },
      ],
      rows: amortizationSeries,
    }
  }
  if (report.category === 'Operasional & Servis') {
    return {
      columns: [
        { key: 'code', label: 'Kode Pengajuan' },
        { key: 'department', label: 'Departemen' },
        { key: 'status', label: 'Status' },
        { key: 'borrowDate', label: 'Tanggal Pinjam' },
      ],
      rows: borrowings.slice(0, 8),
    }
  }
  if (report.category === 'Audit & Inventaris') {
    return {
      columns: [
        { key: 'name', label: 'Kategori Aset' },
        { key: 'value', label: 'Unit' },
        { key: 'pct', label: 'Porsi (%)' },
      ],
      rows: categoryDistribution,
    }
  }
  return {
    columns: [
      { key: 'name', label: 'Karyawan' },
      { key: 'department', label: 'Departemen' },
      { key: 'grade', label: 'Grade Kepatuhan' },
      { key: 'assets', label: 'Aset' },
    ],
    rows: [...employees].sort((a, b) => (Number(b.assets) || 0) - (Number(a.assets) || 0)).slice(0, 8),
  }
}

export default function Reports() {
  const { assets, borrowings, employees } = useData()
  const toast = useToast()
  const [category, setCategory] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [period, setPeriod] = useState('all')
  const [preview, setPreview] = useState(null)

  const categories = useMemo(() => [ALL, ...new Set(seedReports.map((report) => report.category))], [])
  const statuses = useMemo(() => [ALL, ...new Set(seedReports.map((report) => report.status))], [])

  const filtered = useMemo(
    () =>
      seedReports.filter(
        (report) =>
          (category === ALL || report.category === category) &&
          (status === ALL || report.status === status),
      ),
    [category, status],
  )

  const table = useTable(filtered, {
    pageSize: 6,
    searchFields: ['code', 'title', 'desc', 'category', 'period', 'owner', 'scope', 'status'],
  })

  const assetUnits = useMemo(() => assets.length, [assets])
  const totalBookValue = useMemo(() => assets.reduce((sum, asset) => sum + (Number(asset.bookValue) || 0), 0), [assets])
  const previewData = useMemo(() => reportPreviewData(preview, { employees, borrowings, assets }), [preview, employees, borrowings, assets])

  const amortizationView = useMemo(() => {
    if (period === 'history') return amortizationSeries.filter((item) => !item.year.includes('F'))
    if (period === 'forecast') return amortizationSeries.filter((item) => Number(item.year.replace('F', '')) >= 2025)
    return amortizationSeries
  }, [period])

  const amortizationStats = useMemo(() => {
    if (!amortizationView.length) return { first: 0, last: 0, average: 0, firstYear: '—', lastYear: '—' }
    const first = amortizationView[0]
    const last = amortizationView[amortizationView.length - 1]
    const average = amortizationView.reduce((sum, item) => sum + item.value, 0) / amortizationView.length
    return { first: first.value, last: last.value, average: average.toFixed(1), firstYear: first.year, lastYear: last.year }
  }, [amortizationView])

  const resetFilters = () => {
    setCategory(ALL)
    setStatus(ALL)
    table.setQuery('')
  }

  const handleExportLibrary = () => {
    downloadCSV(
      'assetflow-daftar-laporan',
      [
        { label: 'Kode', key: 'code' },
        { label: 'Judul', key: 'title' },
        { label: 'Kategori', key: 'category' },
        { label: 'Periode', key: 'period' },
        { label: 'Format', value: (report) => report.formats.join(' / ') },
        { label: 'Diperbarui', key: 'updated' },
        { label: 'Status', key: 'status' },
        { label: 'Pemilik', key: 'owner' },
        { label: 'Cakupan', key: 'scope' },
      ],
      table.all,
    )
    toast.success('Ekspor selesai', `${table.all.length} entri perpustakaan laporan diunduh sebagai CSV.`)
  }

  const handleDownload = (report) => {
    let columns = []
    let rows = []
    if (report.category === 'Keuangan & Depresiasi') {
      columns = [
        { label: 'Tahun Buku', key: 'year' },
        { label: 'Nilai Buku (Rp M)', key: 'value' },
      ]
      rows = amortizationSeries
    } else if (report.category === 'Operasional & Servis') {
      columns = [
        { label: 'Kode Pengajuan', key: 'code' },
        { label: 'Departemen', key: 'department' },
        { label: 'Status', key: 'status' },
        { label: 'Tanggal Pinjam', key: 'borrowDate' },
        { label: 'Jatuh Tempo', key: 'dueDate' },
      ]
      rows = borrowings
    } else if (report.category === 'Audit & Inventaris') {
      columns = [
        { label: 'Kategori Aset', key: 'name' },
        { label: 'Jumlah Unit', key: 'value' },
        { label: 'Porsi (%)', key: 'pct' },
      ]
      rows = categoryDistribution
    } else {
      columns = [
        { label: 'Karyawan', key: 'name' },
        { label: 'Departemen', key: 'department' },
        { label: 'Grade', key: 'grade' },
        { label: 'Jumlah Aset', key: 'assets' },
      ]
      rows = employees
    }

    const summary = [
      { label: 'Kode Laporan', key: 'code' },
      { label: 'Judul', key: 'title' },
      { label: 'Kategori', key: 'category' },
      { label: 'Periode', key: 'period' },
      { label: 'Pemilik', key: 'owner' },
      { label: 'Cakupan', key: 'scope' },
      { label: 'Diperbarui', key: 'updated' },
    ]

    if (rows.length && columns.length) {
      downloadCSV(`AssetFlow-${report.code}`, columns, rows)
    } else {
      downloadCSV(`AssetFlow-${report.code}`, summary, [report])
    }
    toast.success('Laporan diunduh', `${report.code} tersedia dalam format CSV demo.`)
  }

  const handleExportAllCharts = () => {
    downloadCSV(
      'assetflow-ringkasan-aset',
      [
        { label: 'Metrik', value: (item) => item.label },
        { label: 'Nilai', value: (item) => item.value },
      ],
      [
        { label: 'Total unit aset', value: formatNumber(assetUnits) },
        { label: 'Nilai buku', value: formatCurrency(totalBookValue) },
        { label: 'CAPEX', value: reportSummary.capex },
        { label: 'Depresiasi', value: reportSummary.depreciation },
        { label: 'OPEX', value: reportSummary.opex },
        { label: 'Kepatuhan BAST', value: reportSummary.compliance },
        ...amortizationSeries.map((item) => ({ label: `Nilai buku ${item.year}`, value: `Rp ${item.value} M` })),
      ],
    )
    toast.success('Ringkasan diunduh', 'Metrik portofolio dan amortisasi disimpan sebagai CSV.')
  }

  const columns = [
    {
      key: 'title',
      header: 'Laporan',
      sortKey: 'title',
      className: 'min-w-[280px]',
      render: (report) => (
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-ink-500">
            <FileBarChart2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setPreview(report)}
              className="block truncate text-[11.5px] font-semibold text-ink-900 hover:text-navy-600 hover:underline"
            >
              {report.title}
            </button>
            <p className="mt-0.5 line-clamp-1 text-[9.5px] text-ink-400">{report.code} · {report.scope}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      sortKey: 'category',
      className: 'min-w-[160px]',
      render: (report) => (
        <div>
          <p className="text-[10.5px] font-medium text-ink-700">{report.category}</p>
          <p className="mt-0.5 text-[9px] text-ink-400">{report.owner}</p>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Periode',
      sortKey: 'period',
      className: 'min-w-[125px]',
      render: (report) => (
        <div>
          <p className="text-[10.5px] text-ink-700">{report.period}</p>
          <p className="mt-0.5 text-[9px] text-ink-400">Update {report.updated}</p>
        </div>
      ),
    },
    {
      key: 'formats',
      header: 'Format',
      className: 'min-w-[110px]',
      render: (report) => (
        <div className="flex flex-wrap gap-1">
          {report.formats.map((format) => (
            <Badge key={format} tone={format === 'XLSX' ? 'teal' : 'info'}>{format}</Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      className: 'min-w-[100px]',
      render: (report) => (
        <Badge tone={report.status === 'Siap' ? 'success' : report.status === 'Otomatis' ? 'info' : 'neutral'} dot>
          {report.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      className: 'w-[130px]',
      render: (report) => (
        <div className="flex items-center justify-end gap-0.5">
          <button
            type="button"
            onClick={() => setPreview(report)}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-navy-700"
            aria-label={`Pratinjau ${report.code}`}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDownload(report)}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-navy-700"
            aria-label={`Unduh ${report.code}`}
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setPreview(report)
              window.setTimeout(printSection, 80)
            }}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-navy-700"
            aria-label={`Cetak ${report.code}`}
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Laporan & Analitik"
        title="Pusat Laporan Portofolio Aset"
        description="Analisis nilai aset, amortisasi, distribusi portofolio, dan unduh laporan operasional siap audit."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExportLibrary}>
              Ekspor Daftar
            </Button>
            <Button variant="secondary" icon={Printer} onClick={printSection}>
              Cetak Ringkasan
            </Button>
            <Button variant="primary" icon={FileSpreadsheet} onClick={handleExportAllCharts}>
              Unduh Data
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total CAPEX" value={reportSummary.capex} icon={Wallet} tone="navy" note={`${formatNumber(assetUnits)} unit dalam demo`} />
        <StatCard label="Depresiasi Tahun Ini" value={reportSummary.depreciation} icon={TrendingDown} tone="red" note="metode garis lurus" />
        <StatCard label="OPEX Pemeliharaan" value={reportSummary.opex} icon={TrendingUp} tone="amber" note="akumulasi tiket selesai" />
        <StatCard label="Kepatuhan BAST" value={reportSummary.compliance} icon={ShieldCheck} tone="teal" note={`nilai buku ${formatCurrency(totalBookValue, { compact: true })}`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader
            title="Tren Amortisasi & Nilai Buku"
            subtitle="Proyeksi nilai buku bersih portofolio aset (dalam miliar rupiah)"
            action={
              <select value={period} onChange={(event) => setPeriod(event.target.value)} className="select h-8 w-auto px-2 pr-7 text-[11px]" aria-label="Periode laporan">
                <option value="all">Semua periode</option>
                <option value="history">Historis (2021–2025)</option>
                <option value="forecast">Proyeksi (2025–2028)</option>
              </select>
            }
          />
          <div className="flex flex-wrap items-center gap-4 px-5 pb-2">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] text-ink-500">
              <span className="h-2 w-2 rounded-sm bg-brand-500" /> Nilai buku bersih
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] text-ink-500">
              <span className="h-2 w-2 rounded-sm bg-amber-500" /> Proyeksi
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-red-600">
              <TrendingDown className="h-3 w-3" /> {amortizationStats.firstYear} → {amortizationStats.lastYear}: Rp {amortizationStats.first} M → Rp {amortizationStats.last} M
            </span>
          </div>
          <div className="h-[266px] px-2 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={amortizationView} margin={{ top: 10, right: 18, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="amortizationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#169e8d" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#169e8d" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} width={40} tickFormatter={(value) => `Rp ${value} M`} />
                <Tooltip content={<ReportTooltip />} cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="value" name="Nilai buku" stroke="#169e8d" strokeWidth={2.2} fill="url(#amortizationGradient)" activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-line px-5 py-3">
            <div>
              <p className="text-[9px] uppercase tracking-wide text-ink-400">Nilai buku {amortizationStats.firstYear}</p>
              <p className="text-[13px] font-semibold text-ink-900">Rp {amortizationStats.first} M</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-ink-400">Nilai buku {amortizationStats.lastYear}</p>
              <p className="text-[13px] font-semibold text-ink-900">Rp {amortizationStats.last} M</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-ink-400">Rata-rata / tahun</p>
              <p className="text-[13px] font-semibold text-ink-900">Rp {amortizationStats.average} M</p>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader title="Distribusi Portofolio" subtitle="Komposisi nilai aset per kelompok" action={<PieChartIcon className="h-4 w-4 text-ink-400" />} />
          <div className="relative mx-auto h-[190px] w-full max-w-[260px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={portfolioDistribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                  {portfolioDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} contentStyle={{ borderRadius: 10, border: '1px solid #e5e9f0', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[19px] font-semibold tracking-[-0.03em] text-ink-900">Rp 18,45 M</span>
              <span className="text-[9px] uppercase tracking-[0.08em] text-ink-400">Total portofolio</span>
            </div>
          </div>
          <div className="space-y-2.5 px-5 pb-5">
            {portfolioDistribution.map((item) => (
              <div key={item.name} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] font-medium text-ink-700">{item.name}</p>
                  <p className="truncate text-[9px] text-ink-400">{item.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-semibold text-ink-900">{item.amount}</p>
                  <p className="text-[9px] text-ink-400">{item.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader
            title="Proyeksi Depresiasi 5 Tahun"
            subtitle="Asumsi umur ekonomis garis lurus untuk aset baru"
            action={<Badge tone="info">PSAK 16</Badge>}
          />
          <div className="h-[218px] px-2 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depreciationProjection} margin={{ top: 10, right: 18, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} width={38} tickFormatter={(value) => `${value}%`} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e9f0', fontSize: 11 }} cursor={{ fill: 'rgba(15,23,42,0.03)' }} formatter={(value) => [`${value}% nilai sisa`, 'Nilai buku']} />
                <Bar dataKey="value" name="Nilai buku" fill="#17324d" radius={[5, 5, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-2.5 text-[10px] text-ink-500">
            <span>Metode: {`garis lurus`} · Tarif 20% per tahun</span>
            <span className="inline-flex items-center gap-1 font-medium text-red-600"><TrendingDown className="h-3 w-3" /> Nilai residu 10%</span>
          </div>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader title="Kesiapan Data & Audit" subtitle="Kualitas data sebelum publikasi laporan" action={<Database className="h-4 w-4 text-ink-400" />} />
          <div className="space-y-3.5 px-5 py-4">
            {[
              { label: 'Kelengkapan data aset', value: 96, tone: 'teal', detail: `${formatNumber(assetUnits)} unit dalam demo` },
              { label: 'Verifikasi BAST kustodian', value: 92, tone: 'blue', detail: '312 dari 339 dokumen' },
              { label: 'Rekonsiliasi inventaris', value: 88, tone: 'amber', detail: '2 SKU perlu penyesuaian' },
              { label: 'Kepatuhan audit fisik', value: 94, tone: 'navy', detail: 'audit terakhir 28 Okt 2025' },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-ink-600">{item.label}</span>
                  <span className="text-[10.5px] font-semibold text-ink-900">{item.value}%</span>
                </div>
                <Progress value={item.value} tone={item.tone} className="h-1.5" />
                <p className="mt-1 text-[9px] text-ink-400">{item.detail}</p>
              </div>
            ))}
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-2.5 text-[9.5px] leading-relaxed text-emerald-800">
              <BadgeCheck className="mr-1 inline h-3 w-3" />
              Semua laporan telah melewati validasi otomatis. Publikasi akhir memerlukan persetujuan Finance.
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Perpustakaan Laporan"
          subtitle="Pratinjau, unduh, atau cetak laporan siap pakai"
          action={<Badge tone="neutral">{seedReports.length} laporan</Badge>}
        />
        <div className="flex flex-col gap-2.5 border-t border-line px-5 py-3 lg:flex-row lg:items-center">
          <SearchInput
            value={table.query}
            onChange={table.setQuery}
            placeholder="Cari laporan, kode, pemilik, atau periode…"
            className="w-full lg:w-[340px]"
          />
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="select h-9 text-[11.5px]" aria-label="Filter kategori laporan">
              {categories.map((item) => (
                <option key={item} value={item}>{item === ALL ? 'Semua kategori' : item}</option>
              ))}
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="select h-9 text-[11.5px]" aria-label="Filter status laporan">
              {statuses.map((item) => (
                <option key={item} value={item}>{item === ALL ? 'Semua status' : item}</option>
              ))}
            </select>
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetFilters}>
              Reset filter
            </Button>
          </div>
          <span className="hidden text-[10px] text-ink-400 lg:block">{table.filteredCount} laporan tampil</span>
        </div>

        <DataTable
          className="rounded-none border-x-0 border-b-0"
          tableClassName="min-w-[880px]"
          columns={columns}
          rows={table.rows}
          sort={table.sort}
          onSort={table.toggleSort}
          empty={{
            title: 'Tidak ada laporan ditemukan',
            description: 'Coba ubah kategori, status, atau kata kunci pencarian.',
            action: (
              <Button size="sm" variant="secondary" icon={RotateCcw} onClick={resetFilters}>
                Reset filter
              </Button>
            ),
          }}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-ink-400">Laporan dibuat otomatis dari data demo lokal.</p>
              <Pagination
                page={table.page}
                pageSize={table.size}
                total={table.filteredCount}
                totalPages={table.totalPages}
                onPage={table.setPage}
                onPageSize={table.setSize}
                label="laporan"
              />
            </div>
          }
        />
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Distribusi Kondisi Aset" subtitle="Basis penilaian depresiasi dan afkir" action={<FileBarChart2 className="h-4 w-4 text-ink-400" />} />
          <div className="space-y-3 border-t border-line px-5 py-4">
            {conditionData.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[10.5px] text-ink-600">{item.name}</span>
                  <span className="shrink-0 text-[10px] font-semibold text-ink-900">{formatNumber(item.count)} <span className="font-normal text-ink-400">({item.value}%)</span></span>
                </div>
                <Progress value={item.value} tone={item.color === '#0E9384' ? 'teal' : item.color === '#2D5675' ? 'navy' : item.color === '#2E90FA' ? 'blue' : 'red'} className="mt-1 h-1.5" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Ringkasan Kepatuhan & Format" subtitle="Kesiapan publikasi laporan" action={<ShieldCheck className="h-4 w-4 text-ink-400" />} />
          <div className="border-t border-line px-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-line p-3">
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Laporan siap</p>
                <p className="mt-1 text-[20px] font-semibold text-ink-900">{seedReports.filter((item) => item.status === 'Siap').length}</p>
                <p className="text-[9px] text-ink-400">dari {seedReports.length} total</p>
              </div>
              <div className="rounded-lg border border-line p-3">
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Format tersedia</p>
                <p className="mt-1 text-[20px] font-semibold text-ink-900">{new Set(seedReports.flatMap((item) => item.formats)).size}</p>
                <p className="text-[9px] text-ink-400">XLSX & PDF</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {seedReports.slice(0, 3).map((report) => (
                <button
                  key={report.code}
                  type="button"
                  onClick={() => setPreview(report)}
                  className="flex w-full items-center gap-2 rounded-lg border border-line px-2.5 py-2 text-left transition hover:border-slate-300 hover:bg-slate-50/60"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                  <span className="min-w-0 flex-1 truncate text-[10.5px] font-medium text-ink-700">{report.title}</span>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-ink-400" />
                </button>
              ))}
            </div>
            <Button size="sm" variant="secondary" icon={CalendarDays} className="mt-3 w-full" onClick={() => setPreview(seedReports[0])}>
              Buka pratinjau terbaru
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title}
        description={preview ? `${preview.code} · ${preview.category} · ${preview.period}` : undefined}
        size="lg"
        icon={FileBarChart2}
        footer={
          <>
            <Button variant="secondary" icon={Printer} onClick={printSection}>
              Cetak
            </Button>
            <Button variant="secondary" icon={Download} onClick={() => preview && handleDownload(preview)}>
              Unduh CSV
            </Button>
            <Button variant="primary" onClick={() => setPreview(null)}>
              Tutup
            </Button>
          </>
        }
      >
        {preview ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={preview.status === 'Siap' ? 'success' : preview.status === 'Otomatis' ? 'info' : 'neutral'} dot>{preview.status}</Badge>
              {preview.formats.map((format) => (
                <Badge key={format} tone={format === 'XLSX' ? 'teal' : 'info'}>{format}</Badge>
              ))}
              <span className="ml-auto text-[10px] text-ink-400">Diperbarui {preview.updated}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-slate-50/60 p-3.5 sm:grid-cols-4">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Periode</p>
                <p className="mt-1 text-[10.5px] font-medium text-ink-800">{preview.period}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Cakupan</p>
                <p className="mt-1 text-[10.5px] font-medium text-ink-800">{preview.scope}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Pemilik</p>
                <p className="mt-1 text-[10.5px] font-medium text-ink-800">{preview.owner}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Kode</p>
                <p className="mt-1 text-[10.5px] font-medium text-ink-800">{preview.code}</p>
              </div>
            </div>

            <p className="text-[11.5px] leading-relaxed text-ink-600">{preview.desc}</p>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { label: 'CAPEX', value: reportSummary.capex },
                { label: 'Depresiasi', value: reportSummary.depreciation },
                { label: 'OPEX', value: reportSummary.opex },
                { label: 'Kepatuhan', value: reportSummary.compliance },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-line p-2.5">
                  <p className="text-[9px] uppercase tracking-wide text-ink-400">{item.label}</p>
                  <p className="mt-1 text-[12px] font-semibold text-ink-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-[12px] font-semibold text-ink-900">Rincian data laporan</h3>
                <span className="text-[9.5px] text-ink-400">{previewData.rows.length} baris contoh</span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[480px]">
                  <thead className="bg-slate-50/80">
                    <tr>
                      {previewData.columns.map((column) => (
                        <th key={column.key} className="px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {previewData.rows.map((row, index) => (
                      <tr key={row.code || row.id || row.year || row.name || index} className="transition hover:bg-slate-50/60">
                        {previewData.columns.map((column) => (
                          <td key={column.key} className={cn('px-3 py-2 text-[10.5px] text-ink-700', typeof row[column.key] === 'number' && 'font-semibold text-ink-900')}>
                            {row[column.key] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="rounded-lg border border-blue-100 bg-blue-50/60 p-2.5 text-[9.5px] leading-relaxed text-blue-800">
              Pratinjau menampilkan cuplikan data demo. Unduhan CSV memuat seluruh baris terkait untuk kategori laporan ini.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
