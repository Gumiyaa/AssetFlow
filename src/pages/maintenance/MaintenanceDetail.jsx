import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Download,
  FileImage,
  FileText,
  ListChecks,
  MapPin,
  PackageSearch,
  Phone,
  Printer,
  RefreshCw,
  ShieldCheck,
  Timer,
  TrendingUp,
  UserRound,
  Wrench,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { cn, conditionTone, formatCurrency, formatDate, formatDateShort } from '../../utils/format'
import { downloadCSV, downloadText } from '../../utils/export'
import PageHeader from '../../components/ui/PageHeader'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import AssetThumb from '../../components/ui/AssetThumb'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import Field, { Input, Select, Textarea } from '../../components/ui/Field'
import Progress from '../../components/ui/Progress'
import EmptyState from '../../components/ui/EmptyState'

const STATUSES = ['Menunggu', 'Dalam Pengerjaan', 'Menunggu Suku Cadang', 'Selesai']

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[0.06em] text-ink-400">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </dt>
      <dd className="mt-1 break-words text-[11.5px] font-medium leading-relaxed text-ink-800">{value || '—'}</dd>
    </div>
  )
}

function priorityTone(priority) {
  if (priority === 'Tinggi') return 'danger'
  if (priority === 'Sedang') return 'warning'
  if (priority === 'Preventif') return 'info'
  return 'neutral'
}

function buildFallbackTimeline(ticket) {
  if (!ticket) return []
  return [
    { title: 'Tiket Dibuat', at: formatDate(ticket.submittedDate), by: 'Sistem', desc: ticket.problem },
    ...(ticket.status !== 'Menunggu'
      ? [{ title: 'Diagnosa Teknis', at: formatDate(ticket.submittedDate), by: ticket.technician, desc: ticket.diagnosis }]
      : []),
    ...(ticket.status === 'Selesai'
      ? [{ title: 'Pekerjaan Selesai', at: formatDate(ticket.completedDate || ticket.targetDate), by: ticket.technician, desc: ticket.notes, current: true }]
      : [{ title: `Status saat ini: ${ticket.status}`, at: 'Sekarang', by: ticket.technician, desc: ticket.diagnosis, current: true }]),
  ]
}

export default function MaintenanceDetail() {
  const { id } = useParams()
  const { maintenance, assets, actions } = useData()
  const toast = useToast()
  const [tab, setTab] = useState('ringkasan')
  const [progressOpen, setProgressOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [checklistBusy, setChecklistBusy] = useState(null)
  const [form, setForm] = useState({ status: 'Dalam Pengerjaan', progress: 0, actual: '', notes: '', diagnosis: '' })

  const ticket = maintenance.find((item) => item.id === id || item.code === id)
  const asset = assets.find((item) => item.id === ticket?.assetId)

  useEffect(() => {
    if (ticket) {
      setForm({
        status: ticket.status,
        progress: ticket.progress,
        actual: String(ticket.actual || ''),
        notes: ticket.notes || '',
        diagnosis: ticket.diagnosis || '',
      })
    }
  }, [ticket])

  const totalParts = useMemo(
    () => (ticket?.parts || []).reduce((sum, part) => sum + (Number(part.price) || 0), 0),
    [ticket],
  )
  const totalCosts = useMemo(
    () => (ticket?.costs || []).reduce((sum, cost) => sum + (Number(cost.value) || 0), 0),
    [ticket],
  )
  const timeline = ticket?.timeline?.length ? ticket.timeline : buildFallbackTimeline(ticket)
  const checklistDone = (ticket?.checklist || []).filter((item) => item.done).length
  const checklistTotal = (ticket?.checklist || []).length

  if (!ticket) {
    return (
      <div className="animate-in">
        <PageHeader backTo="/maintenance" title="Detail Pemeliharaan" />
        <Card>
          <EmptyState
            icon={Wrench}
            title="Tiket tidak ditemukan"
            description="Data tiket pemeliharaan mungkin sudah dihapus atau tautan tidak valid."
            action={<Button to="/maintenance" variant="primary">Kembali ke daftar</Button>}
          />
        </Card>
      </div>
    )
  }

  const handleOpenProgress = () => {
    setForm({
      status: ticket.status,
      progress: ticket.progress,
      actual: String(ticket.actual || ''),
      notes: ticket.notes || '',
      diagnosis: ticket.diagnosis || '',
    })
    setProgressOpen(true)
  }

  const handleUpdateProgress = async () => {
    const progress = Number(form.progress)
    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      toast.warning('Progres tidak valid', 'Masukkan angka antara 0 dan 100.')
      return
    }
    if (form.actual !== '' && Number(form.actual) < 0) {
      toast.warning('Biaya tidak valid', 'Realisasi biaya tidak boleh negatif.')
      return
    }
    if (!form.notes.trim()) {
      toast.warning('Catatan wajib diisi', 'Tuliskan ringkasan pekerjaan yang telah dilakukan.')
      return
    }
    setBusy(true)
    try {
      await actions.updateMaintenanceProgress(ticket.id, {
        progress,
        status: progress >= 100 ? 'Selesai' : form.status,
        actual: form.actual === '' ? ticket.actual : Number(form.actual),
        notes: form.notes.trim(),
        diagnosis: form.diagnosis.trim(),
      })
      toast.success('Progres diperbarui', `${ticket.code} kini ${progress}% · ${progress >= 100 ? 'Selesai' : form.status}.`)
      setProgressOpen(false)
    } catch (error) {
      toast.error('Gagal memperbarui progres', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleToggleChecklist = async (index) => {
    setChecklistBusy(index)
    try {
      await actions.toggleMaintenanceChecklist(ticket.id, index)
      toast.success('Checklist diperbarui', ticket.checklist[index].done ? 'Item ditandai belum selesai.' : 'Item ditandai selesai.')
    } catch (error) {
      toast.error('Gagal memperbarui checklist', error.message)
    } finally {
      setChecklistBusy(null)
    }
  }

  const handleExport = () => {
    downloadCSV(
      `assetflow-${ticket.code}`,
      [
        { label: 'Kode Tiket', key: 'code' },
        { label: 'Aset', value: () => asset?.name || '-' },
        { label: 'Kode Aset', value: () => asset?.code || '-' },
        { label: 'Jenis', key: 'type' },
        { label: 'Prioritas', key: 'priority' },
        { label: 'Status', key: 'status' },
        { label: 'Progres', value: (item) => `${item.progress}%` },
        { label: 'Teknisi', key: 'technician' },
        { label: 'Vendor', key: 'vendor' },
        { label: 'Masalah', key: 'problem' },
        { label: 'Diagnosa', key: 'diagnosis' },
        { label: 'Estimasi', key: 'estimate' },
        { label: 'Realisasi', key: 'actual' },
        { label: 'Target', value: () => formatDate(ticket.targetDate) },
        { label: 'Selesai', value: () => (ticket.completedDate ? formatDate(ticket.completedDate) : '-') },
      ],
      [ticket],
    )
    toast.success('Data diunduh', `${ticket.code} diekspor sebagai CSV.`)
  }

  const handlePrintReport = () => {
    downloadText(
      `WO-${ticket.code}.txt`,
      [
        'WORK ORDER PEMELIHARAAN ASET',
        'PT AssetFlow Nusantara',
        '',
        `Kode Tiket: ${ticket.code}`,
        `Aset: ${asset?.name || '-'} (${asset?.code || '-'})`,
        `Nomor Seri: ${asset?.serial || '-'}`,
        `Lokasi: ${asset?.location || '-'}`,
        `Jenis: ${ticket.type}`,
        `Prioritas: ${ticket.priority}`,
        `Status: ${ticket.status} (${ticket.progress}%)`,
        `Teknisi: ${ticket.technician}`,
        `Vendor: ${ticket.vendor}`,
        `Tanggal Masuk: ${formatDate(ticket.submittedDate)}`,
        `Target Selesai: ${formatDate(ticket.targetDate)}`,
        `Estimasi Biaya: ${formatCurrency(ticket.estimate)}`,
        `Realisasi Biaya: ${formatCurrency(ticket.actual)}`,
        '',
        'Masalah:',
        ticket.problem,
        '',
        'Diagnosa:',
        ticket.diagnosis,
        '',
        'Catatan:',
        ticket.notes,
      ].join('\n'),
    )
    toast.success('Work order diunduh', 'Dokumen ringkasan pemeliharaan disimpan sebagai berkas teks.')
  }

  const tabs = [
    { key: 'ringkasan', label: 'Ringkasan', icon: ClipboardCheck },
    { key: 'progres', label: 'Progres & Checklist', icon: ListChecks, count: checklistTotal || undefined },
    { key: 'dokumentasi', label: 'Dokumentasi', icon: ImageIcon, count: ticket.photos?.length || undefined },
    { key: 'linimasa', label: 'Linimasa', icon: Clock3, count: timeline.length },
  ]

  return (
    <div className="animate-in">
      <PageHeader
        backTo="/maintenance"
        backLabel="Kembali ke daftar pemeliharaan"
        eyebrow="Work Order Pemeliharaan"
        title={ticket.code}
        description={`${asset?.name || 'Aset'} · ${ticket.type} · ${ticket.technician}`}
        actions={
          <>
            <Button variant="secondary" icon={Printer} onClick={handlePrintReport}>
              Unduh Work Order
            </Button>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Ekspor Data
            </Button>
            <Button variant="primary" icon={RefreshCw} onClick={handleOpenProgress}>
              Perbarui Progres
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={ticket.status} />
              <Badge tone={priorityTone(ticket.priority)} dot>Prioritas {ticket.priority}</Badge>
              <Badge tone="neutral">{ticket.type}</Badge>
              {ticket.completedDate ? <Badge tone="success">Selesai {formatDateShort(ticket.completedDate)}</Badge> : null}
            </div>
            <h2 className="mt-2 text-[19px] font-semibold tracking-[-0.025em] text-ink-900">{asset?.name || 'Aset tidak ditemukan'}</h2>
            <p className="mt-0.5 text-[11.5px] text-ink-500">
              {asset?.code || '—'} · SN {asset?.serial || '—'} · {asset?.category || '—'}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-4">
              <DetailRow label="Tanggal masuk" value={formatDate(ticket.submittedDate)} icon={CalendarDays} />
              <DetailRow label="Target selesai" value={formatDate(ticket.targetDate)} icon={CalendarClock} />
              <DetailRow label="Teknisi" value={ticket.technician} icon={UserRound} />
              <DetailRow label="Vendor" value={ticket.vendor} icon={Building2} />
            </dl>

            <div className="mt-4">
              <div className="mb-1.5 flex items-end justify-between gap-2">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.07em] text-ink-400">Progres pekerjaan</p>
                <span className="text-[13px] font-semibold text-ink-900">{ticket.progress}%</span>
              </div>
              <Progress
                value={ticket.progress}
                tone={ticket.status === 'Selesai' ? 'teal' : ticket.priority === 'Tinggi' ? 'red' : 'amber'}
                className="h-2"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-ink-400">
                <span className="inline-flex items-center gap-1">
                  <Timer className="h-3 w-3" /> Estimasi {formatCurrency(ticket.estimate, { compact: true })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CircleDollarSign className="h-3 w-3" /> Realisasi {formatCurrency(ticket.actual, { compact: true })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" /> {checklistTotal ? `${checklistDone}/${checklistTotal} checklist` : 'Checklist belum tersedia'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-line bg-slate-50/40 p-5 lg:border-l lg:border-t-0">
            {asset ? (
              <>
                <div className="flex items-center gap-3">
                  <AssetThumb category={asset.category} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-semibold text-ink-900">{asset.name}</p>
                    <p className="truncate text-[10px] text-ink-500">{asset.code} · {asset.brand}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <StatusBadge status={asset.status} />
                      <Badge tone={conditionTone(asset.condition)}>{asset.condition?.split(' (')[0]}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[10.5px]">
                  <p className="flex items-center gap-2 text-ink-500">
                    <MapPin className="h-3 w-3 text-ink-400" /> {asset.location}
                  </p>
                  <p className="flex items-center gap-2 text-ink-500">
                    <Building2 className="h-3 w-3 text-ink-400" /> {asset.department}
                  </p>
                  <p className="flex items-center gap-2 text-ink-500">
                    <UserRound className="h-3 w-3 text-ink-400" /> PIC {asset.pic}
                  </p>
                  <p className="flex items-center gap-2 text-ink-500">
                    <ShieldCheck className="h-3 w-3 text-ink-400" /> Garansi {asset.warrantyMonths} bulan
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" to={`/assets/${asset.id}`}>
                    Kartu aset
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" to={`/borrowings?asset=${asset.id}`}>
                    Peminjaman
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-ink-500">Informasi aset tidak tersedia.</p>
            )}
          </div>
        </div>
      </Card>

      {ticket.status === 'Menunggu Suku Cadang' ? (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 sm:flex-row sm:items-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <PackageSearch className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold text-amber-900">Pekerjaan tertahan menunggu suku cadang</p>
            <p className="text-[10.5px] text-amber-700/80">
              Koordinasikan dengan tim procurement dan vendor untuk memastikan estimasi kedatangan komponen.
            </p>
          </div>
          <Badge tone="warning">{ticket.vendor}</Badge>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <div className="px-5 pt-3">
              <Tabs items={tabs} value={tab} onChange={setTab} />
            </div>

            {tab === 'ringkasan' ? (
              <div className="p-5">
                <div className="rounded-lg border border-red-100 bg-red-50/50 p-3.5">
                  <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.07em] text-red-500">
                    <AlertTriangle className="h-3 w-3" /> Keluhan & masalah
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-700">{ticket.problem}</p>
                </div>

                <div className="mt-3 rounded-lg border border-line bg-slate-50/60 p-3.5">
                  <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.07em] text-ink-400">
                    <Wrench className="h-3 w-3" /> Diagnosa teknisi
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-700">{ticket.diagnosis}</p>
                </div>

                {ticket.notes && ticket.notes !== '-' ? (
                  <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3.5">
                    <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.07em] text-blue-500">
                      <ClipboardCheck className="h-3 w-3" /> Catatan pekerjaan
                    </p>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-700">{ticket.notes}</p>
                  </div>
                ) : null}

                <h3 className="mt-5 text-[12px] font-semibold text-ink-900">Suku cadang & komponen</h3>
                {ticket.parts?.length ? (
                  <div className="mt-2 overflow-x-auto rounded-lg border border-line">
                    <table className="w-full min-w-[480px]">
                      <thead className="bg-slate-50/80">
                        <tr>
                          <th className="px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">Komponen</th>
                          <th className="px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">Jumlah</th>
                          <th className="px-3 py-2 text-right text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">Harga</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {ticket.parts.map((part) => (
                          <tr key={part.name}>
                            <td className="px-3 py-2.5">
                              <p className="text-[11px] font-medium text-ink-800">{part.name}</p>
                              <p className="text-[9.5px] text-ink-400">{part.note}</p>
                            </td>
                            <td className="px-3 py-2.5 text-[10.5px] text-ink-500">{part.qty}</td>
                            <td className="px-3 py-2.5 text-right text-[11px] font-semibold text-ink-800">{formatCurrency(part.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-2 rounded-lg border border-dashed border-line bg-slate-50/50 px-3 py-4 text-center text-[10.5px] text-ink-400">
                    {ticket.status === 'Selesai'
                      ? 'Tidak ada penggantian suku cadang pada tiket ini.'
                      : 'Suku cadang belum dicatat. Perbarui progres setelah diagnosa selesai.'}
                  </p>
                )}

                <h3 className="mt-5 text-[12px] font-semibold text-ink-900">Rincian biaya</h3>
                <div className="mt-2 rounded-lg border border-line">
                  {(ticket.costs?.length ? ticket.costs : [
                    { label: 'Estimasi awal pekerjaan', value: ticket.estimate },
                    { label: 'Realisasi biaya saat ini', value: ticket.actual },
                  ]).map((cost) => (
                    <div key={cost.label} className="flex items-center justify-between gap-2 border-b border-line/70 px-3 py-2.5 last:border-0">
                      <span className="text-[11px] text-ink-500">{cost.label}</span>
                      <span className="text-[11px] font-semibold text-ink-800">{formatCurrency(cost.value)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-2 bg-slate-50/70 px-3 py-2.5">
                    <span className="text-[11px] font-semibold text-ink-700">Total tercatat</span>
                    <span className="text-[12px] font-semibold text-ink-900">
                      {formatCurrency(totalParts || totalCosts || ticket.actual || ticket.estimate)}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === 'progres' ? (
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[12px] font-semibold text-ink-900">Checklist penyelesaian</h3>
                    <p className="mt-0.5 text-[10.5px] text-ink-500">Tandai setiap langkah setelah diverifikasi teknisi.</p>
                  </div>
                  <Badge tone={checklistTotal && checklistDone === checklistTotal ? 'success' : 'warning'}>
                    {checklistDone}/{checklistTotal} selesai
                  </Badge>
                </div>

                <Progress value={checklistTotal ? (checklistDone / checklistTotal) * 100 : 0} tone="teal" className="mt-3 h-2" />

                {checklistTotal ? (
                  <div className="mt-3 space-y-2">
                    {ticket.checklist.map((item, index) => (
                      <button
                        key={item.label}
                        type="button"
                        disabled={checklistBusy === index}
                        onClick={() => handleToggleChecklist(index)}
                        className={cn(
                          'flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition disabled:opacity-60',
                          item.done ? 'border-emerald-200 bg-emerald-50/60' : 'border-line bg-white hover:bg-slate-50',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                            item.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white',
                          )}
                        >
                          {item.done ? <Check className="h-3 w-3" /> : null}
                        </span>
                        <span className={cn('text-[11px] leading-relaxed', item.done ? 'text-ink-500 line-through' : 'text-ink-700')}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={ListChecks}
                    title="Checklist belum tersedia"
                    description="Checklist akan dibuat saat tiket masuk tahap pengerjaan teknis."
                    className="py-8"
                  />
                )}

                <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-line bg-slate-50/60 px-3 py-2.5">
                  <p className="text-[10.5px] text-ink-500">Perbarui persentase dan status pekerjaan secara berkala.</p>
                  <Button size="sm" variant="primary" icon={RefreshCw} onClick={handleOpenProgress}>
                    Perbarui
                  </Button>
                </div>
              </div>
            ) : null}

            {tab === 'dokumentasi' ? (
              <div className="p-5">
                {ticket.photos?.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ticket.photos.map((photo) => (
                      <div key={photo.label} className="overflow-hidden rounded-lg border border-line">
                        <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
                          <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:14px_14px]" />
                          <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 text-ink-400 ring-1 ring-line backdrop-blur">
                            <Camera className="h-6 w-6" />
                          </span>
                          <span className="absolute left-2 top-2 rounded bg-white/80 px-1.5 py-0.5 text-[8.5px] font-semibold text-ink-500 ring-1 ring-line">
                            {photo.label}
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="text-[11px] font-semibold text-ink-900">{photo.caption}</p>
                          <p className="mt-0.5 text-[10px] leading-relaxed text-ink-500">{photo.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FileImage}
                    title="Belum ada dokumentasi foto"
                    description="Foto sebelum, saat, dan sesudah perbaikan akan ditampilkan di sini."
                    className="py-8"
                  />
                )}

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {['Sebelum perbaikan', 'Proses pengerjaan', 'Setelah perbaikan'].map((label) => (
                    <div key={label} className="rounded-lg border border-dashed border-line bg-slate-50/50 px-3 py-4 text-center">
                      <Camera className="mx-auto h-4 w-4 text-ink-300" />
                      <p className="mt-1.5 text-[10px] font-medium text-ink-500">{label}</p>
                      <p className="text-[9px] text-ink-400">Slot dokumentasi</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {tab === 'linimasa' ? (
              <div className="p-5">
                <ol className="relative ml-1.5 border-l border-line">
                  {timeline.map((entry, index) => {
                    const current = entry.current || index === timeline.length - 1
                    return (
                      <li key={`${entry.title}-${index}`} className="relative pb-4 pl-4 last:pb-0">
                        <span
                          className={cn(
                            'absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white',
                            current ? 'bg-brand-500' : 'bg-slate-300',
                          )}
                        />
                        <div className="flex flex-wrap items-start justify-between gap-1">
                          <p className={cn('text-[11.5px] font-semibold', current ? 'text-ink-900' : 'text-ink-700')}>{entry.title}</p>
                          <span className="text-[9px] text-ink-400">{entry.at}</span>
                        </div>
                        <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-500">{entry.desc}</p>
                        <p className="mt-0.5 text-[9px] text-ink-400">oleh {entry.by}</p>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Pelaksana Teknis" subtitle="Teknisi & vendor penanggung jawab" />
            <div className="px-5 pb-5">
              <div className="flex items-center gap-3">
                <Avatar name={ticket.technician} size="lg" color="#0E7490" />
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-ink-900">{ticket.technician}</p>
                  <p className="truncate text-[10px] text-ink-500">{ticket.vendor}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-ink-600">
                    <BadgeCheck className="h-2.5 w-2.5" /> Teknisi terverifikasi
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[10.5px]">
                <p className="flex items-center gap-2 text-ink-500">
                  <Phone className="h-3 w-3 text-ink-400" /> +62 21 5089 4400 ext. 214
                </p>
                <p className="flex items-center gap-2 text-ink-500">
                  <MapPin className="h-3 w-3 text-ink-400" /> {asset?.location || 'Kantor Pusat Jakarta'}
                </p>
                <p className="flex items-center gap-2 text-ink-500">
                  <CalendarDays className="h-3 w-3 text-ink-400" /> Ditugaskan {formatDate(ticket.submittedDate)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Ringkasan Biaya" subtitle="Estimasi vs realisasi" action={<CircleDollarSign className="h-4 w-4 text-ink-400" />} />
            <div className="space-y-3 px-5 pb-5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10.5px] text-ink-500">Estimasi awal</span>
                <span className="text-[11.5px] font-semibold text-ink-900">{formatCurrency(ticket.estimate)}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10.5px] text-ink-500">Realisasi tercatat</span>
                <span className="text-[11.5px] font-semibold text-emerald-700">{formatCurrency(ticket.actual)}</span>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-[9.5px] text-ink-400">
                  <span>Serapan anggaran</span>
                  <span>{ticket.estimate ? Math.round((ticket.actual / ticket.estimate) * 100) : 0}%</span>
                </div>
                <Progress
                  value={ticket.estimate ? (ticket.actual / ticket.estimate) * 100 : 0}
                  tone={ticket.actual > ticket.estimate ? 'red' : 'teal'}
                  className="h-2"
                />
              </div>
              <div className="rounded-lg bg-slate-50 px-2.5 py-2 text-[9.5px] leading-relaxed text-ink-500">
                {ticket.actual > ticket.estimate
                  ? 'Realisasi melebihi estimasi. Perubahan biaya perlu persetujuan tambahan.'
                  : 'Realisasi masih dalam batas estimasi yang disetujui.'}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Detail Tiket" subtitle="Metadata work order" />
            <div className="px-5 pb-5">
              <dl className="grid grid-cols-2 gap-x-3 gap-y-3">
                <DetailRow label="Kode tiket" value={ticket.code} />
                <DetailRow label="ID sistem" value={ticket.id} />
                <DetailRow label="Jenis" value={ticket.type} />
                <DetailRow label="Prioritas" value={ticket.priority} />
                <DetailRow label="Masuk" value={formatDate(ticket.submittedDate)} />
                <DetailRow label="Target" value={formatDate(ticket.targetDate)} />
                <DetailRow label="Selesai" value={ticket.completedDate ? formatDate(ticket.completedDate) : 'Belum selesai'} />
                <DetailRow label="Status SLA" value={ticket.status === 'Selesai' ? 'Terpenuhi' : 'Dalam pemantauan'} />
              </dl>
              <Button size="sm" variant="primary" icon={RefreshCw} className="mt-4 w-full" onClick={handleOpenProgress}>
                Perbarui progres pekerjaan
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Dokumen Terkait" subtitle="Work order & bukti pendukung" />
            <div className="space-y-2 px-5 pb-5">
              {[
                { name: 'Work order pemeliharaan', size: 'PDF · 112 KB' },
                { name: 'Kwitansi & invoice vendor', size: 'PDF · 268 KB' },
                { name: 'Checklist inspeksi teknis', size: 'XLSX · 48 KB' },
              ].map((document) => (
                <div key={document.name} className="flex items-center gap-2.5 rounded-lg border border-line px-2.5 py-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-100 text-ink-500">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-medium text-ink-800">{document.name}</p>
                    <p className="text-[9px] text-ink-400">{document.size}</p>
                  </div>
                  <Button size="xs" variant="ghost" onClick={handlePrintReport}>Unduh</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={progressOpen}
        onClose={() => setProgressOpen(false)}
        title="Perbarui Progres Pemeliharaan"
        description="Catat kemajuan pekerjaan, realisasi biaya, dan catatan teknisi."
        icon={RefreshCw}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setProgressOpen(false)} disabled={busy}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleUpdateProgress} loading={busy}>
              Simpan progres
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status pekerjaan" htmlFor="progress-status" required>
              <Select
                id="progress-status"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </Field>
            <Field label="Realisasi biaya (Rp)" htmlFor="progress-actual" hint="Kosongkan jika belum ada realisasi.">
              <Input
                id="progress-actual"
                type="number"
                min="0"
                step="1000"
                value={form.actual}
                onChange={(event) => setForm((current) => ({ ...current, actual: event.target.value }))}
                placeholder="0"
              />
            </Field>
          </div>

          <Field
            label={`Persentase progres · ${form.progress}%`}
            htmlFor="progress-range"
            required
            hint={Number(form.progress) >= 100 ? 'Progres 100% akan menutup tiket dan mengembalikan status aset menjadi aktif.' : 'Geser untuk memperbarui persentase pekerjaan.'}
          >
            <div className="flex items-center gap-3">
              <input
                id="progress-range"
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.progress}
                onChange={(event) => setForm((current) => ({ ...current, progress: Number(event.target.value) }))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-navy-900"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={form.progress}
                onChange={(event) => setForm((current) => ({ ...current, progress: Number(event.target.value) }))}
                className="input h-9 w-20 text-center text-[12px]"
                aria-label="Persentase progres"
              />
            </div>
          </Field>

          <Field label="Diagnosa / temuan teknis" htmlFor="progress-diagnosis">
            <Textarea
              id="progress-diagnosis"
              rows={3}
              value={form.diagnosis}
              onChange={(event) => setForm((current) => ({ ...current, diagnosis: event.target.value }))}
              placeholder="Ringkasan temuan teknis terbaru…"
            />
          </Field>

          <Field label="Catatan pekerjaan" htmlFor="progress-notes" required hint="Wajib diisi — akan dicatat pada linimasa tiket.">
            <Textarea
              id="progress-notes"
              rows={3}
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Contoh: Penggantian baterai selesai, dilanjutkan uji beban 12 jam."
            />
          </Field>
        </div>
      </Modal>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[10px] text-ink-400">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" /> Work order tercatat pada log audit AssetFlow
        </span>
        <span className="flex items-center gap-3">
          <Link to="/maintenance" className="font-medium text-navy-700 hover:underline">Kembali ke daftar</Link>
          <span className="h-2.5 w-px bg-line" />
          <button type="button" onClick={handleExport} className="font-medium text-navy-700 hover:underline">Ekspor CSV</button>
        </span>
      </div>
    </div>
  )
}

function ImageIcon(props) {
  return <FileImage {...props} />
}
