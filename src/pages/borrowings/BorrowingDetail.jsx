import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  Handshake,
  Mail,
  PackageCheck,
  Phone,
  Printer,
  RotateCcw,
  ShieldCheck,
  Undo2,
  X,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { cn, formatCurrency, formatDate, daysBetween } from '../../utils/format'
import { downloadCSV, downloadText } from '../../utils/export'
import PageHeader from '../../components/ui/PageHeader'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import AssetThumb from '../../components/ui/AssetThumb'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Field, { Select, Textarea } from '../../components/ui/Field'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'

const RETURN_CONDITIONS = [
  'Lengkap & kondisi baik',
  'Lengkap, ada lecet pemakaian wajar',
  'Kurang aksesori',
  'Rusak ringan — perlu pemeriksaan',
  'Rusak berat — eskalasi pemeliharaan',
]

const LEGAL_TERMS = [
  'Peminjam wajib menjaga aset sesuai standar pemakaian dan tidak mengalihkan aset kepada pihak lain tanpa persetujuan tertulis.',
  'Kerusakan akibat kelalaian, kehilangan, atau keterlambatan pengembalian menjadi tanggung jawab peminjam sesuai kebijakan perusahaan.',
  'Perpanjangan waktu pemakaian harus diajukan minimal 24 jam sebelum tenggat dan disetujui oleh atasan langsung.',
  'Aset harus dikembalikan lengkap dengan seluruh aksesori pada kondisi serah terima, kecuali keausan wajar.',
]

function overdueDays(item) {
  if (!['Sedang Dipinjam', 'Terlambat'].includes(item.status)) return 0
  return Math.max(0, Math.ceil((Date.now() - new Date(item.dueDate).getTime()) / 86400000))
}

function DetailItem({ label, value, icon: Icon }) {
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

function WorkflowStep({ label, description, state }) {
  const tone =
    state === 'done'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
      : state === 'current'
        ? 'border-blue-200 bg-blue-50 text-blue-600'
        : 'border-line bg-slate-50 text-ink-400'
  return (
    <div className="flex gap-2.5">
      <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', tone)}>
        {state === 'done' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>
      <div className="min-w-0">
        <p className={cn('text-[11px] font-semibold', state === 'pending' ? 'text-ink-400' : 'text-ink-900')}>{label}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-ink-400">{description}</p>
      </div>
    </div>
  )
}

export default function BorrowingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { borrowings, assets, employees, actions } = useData()
  const toast = useToast()
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [handoverOpen, setHandoverOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [returnCondition, setReturnCondition] = useState(RETURN_CONDITIONS[0])
  const [bastOpen, setBastOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const borrowing = borrowings.find((item) => item.id === id || item.code === id)
  const asset = assets.find((item) => item.id === borrowing?.assetId)
  const employee = employees.find((item) => item.id === borrowing?.employeeId)
  const lateDays = borrowing ? overdueDays(borrowing) : 0
  const duration = borrowing ? Math.max(1, daysBetween(borrowing.borrowDate, borrowing.dueDate)) : 0
  const progressPct = borrowing ? Math.min(100, Math.round((daysBetween(borrowing.borrowDate, new Date()) / Math.max(duration, 1)) * 100)) : 0

  const checklist = useMemo(() => {
    if (!borrowing) return []
    const match = String(borrowing.conditionOut || '').match(/\(([^)]+)\)/)
    const accessories = match ? match[1].split('+').map((part) => part.trim()).filter(Boolean) : []
    return [
      { label: `Unit utama · ${asset?.code || 'kode aset'}`, done: true },
      ...accessories.map((item) => ({ label: item, done: true })),
      { label: 'Uji fungsi singkat sebelum diserahkan', done: true },
      { label: 'Foto kondisi & scan barcode tercatat', done: true },
    ]
  }, [borrowing, asset])

  if (!borrowing) {
    return (
      <div className="animate-in">
        <PageHeader backTo="/borrowings" title="Detail Peminjaman" />
        <Card>
          <EmptyState
            icon={Handshake}
            title="Peminjaman tidak ditemukan"
            description="Data peminjaman mungkin sudah dihapus atau tautan tidak valid."
            action={<Button to="/borrowings" variant="primary">Kembali ke daftar</Button>}
          />
        </Card>
      </div>
    )
  }

  const done = ['Dikembalikan'].includes(borrowing.status)
  const declined = borrowing.status === 'Ditolak'
  const activeBorrow = ['Sedang Dipinjam', 'Terlambat'].includes(borrowing.status)

  const handleApprove = async () => {
    setBusy(true)
    try {
      await actions.approveBorrowing(borrowing.id)
      toast.success('Peminjaman disetujui', `${borrowing.code} siap masuk proses serah terima.`)
      setApproveOpen(false)
    } catch (error) {
      toast.error('Gagal menyetujui', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleReject = async () => {
    if (rejectReason.trim().length < 10) {
      toast.warning('Alasan terlalu singkat', 'Tuliskan alasan penolakan minimal 10 karakter.')
      return
    }
    setBusy(true)
    try {
      await actions.rejectBorrowing(borrowing.id, rejectReason.trim())
      toast.warning('Pengajuan ditolak', `${borrowing.code} ditolak dengan catatan.`)
      setRejectOpen(false)
      setRejectReason('')
    } catch (error) {
      toast.error('Gagal menolak', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleHandover = async () => {
    setBusy(true)
    try {
      await actions.handOverBorrowing(borrowing.id)
      toast.success('Aset diserahkan', `${borrowing.code} kini berstatus sedang dipinjam.`)
      setHandoverOpen(false)
    } catch (error) {
      toast.error('Gagal menyerahkan aset', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleReturn = async () => {
    setBusy(true)
    try {
      await actions.returnBorrowing(borrowing.id, returnCondition)
      toast.success('Pengembalian tercatat', `${borrowing.code} · ${returnCondition}`)
      setReturnOpen(false)
    } catch (error) {
      toast.error('Gagal mencatat pengembalian', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleExport = () => {
    downloadCSV(
      `assetflow-${borrowing.code}`,
      [
        { label: 'Kode Peminjaman', key: 'code' },
        { label: 'Pemohon', value: () => employee?.name || borrowing.createdBy },
        { label: 'NIP', key: 'employeeId' },
        { label: 'Departemen', key: 'department' },
        { label: 'Aset', value: () => asset?.name || '-' },
        { label: 'Kode Aset', value: () => asset?.code || '-' },
        { label: 'Tanggal Pinjam', value: () => formatDate(borrowing.borrowDate) },
        { label: 'Target Kembali', value: () => formatDate(borrowing.dueDate) },
        { label: 'Tanggal Kembali', value: () => (borrowing.returnDate ? formatDate(borrowing.returnDate) : '-') },
        { label: 'Status', key: 'status' },
        { label: 'Prioritas', key: 'priority' },
        { label: 'Disetujui Oleh', key: 'approvedBy' },
        { label: 'Keperluan', key: 'purpose' },
      ],
      [borrowing],
    )
    toast.success('Data diunduh', `${borrowing.code} diekspor sebagai CSV.`)
  }

  const downloadBast = () => {
    downloadText(
      `BAST-${borrowing.code}.txt`,
      [
        'BERITA ACARA SERAH TERIMA ASET',
        'PT AssetFlow Nusantara',
        '',
        `Nomor: BAST/${borrowing.code}/2025`,
        `Tanggal: ${formatDate(borrowing.borrowDate, { long: true })}`,
        '',
        `Peminjam: ${employee?.name || borrowing.createdBy} (${borrowing.employeeId})`,
        `Departemen: ${borrowing.department}`,
        `Aset: ${asset?.name || '-'} (${asset?.code || '-'})`,
        `Nomor Seri: ${asset?.serial || '-'}`,
        `Kondisi Serah Terima: ${borrowing.conditionOut}`,
        `Periode: ${formatDate(borrowing.borrowDate)} s.d. ${formatDate(borrowing.dueDate)}`,
        `Keperluan: ${borrowing.purpose}`,
        '',
        'Dokumen ini merupakan berita acara serah terima aset perusahaan dan dibuat',
        'secara digital melalui sistem AssetFlow untuk keperluan audit internal.',
        '',
        `Disetujui oleh: ${borrowing.approvedBy || '-'}`,
      ].join('\n'),
    )
    toast.success('BAST diunduh', 'Dokumen serah terima disimpan sebagai berkas teks.')
  }

  const workflow = [
    {
      label: 'Pengajuan dibuat',
      description: `Diajukan oleh ${borrowing.createdBy}`,
      state: 'done',
    },
    {
      label: 'Persetujuan administrator',
      description: declined ? 'Pengajuan ditolak' : borrowing.approvedBy !== '-' ? `Disetujui ${borrowing.approvedBy}` : 'Menunggu keputusan admin',
      state: declined ? 'done' : borrowing.approvedBy !== '-' ? 'done' : 'current',
    },
    {
      label: 'Serah terima aset',
      description: ['Sedang Dipinjam', 'Terlambat', 'Dikembalikan'].includes(borrowing.status)
        ? 'Unit telah diserahkan & diverifikasi'
        : borrowing.status === 'Disetujui'
          ? 'Siap diambil di Gudang IT'
          : 'Menunggu persetujuan',
      state: ['Sedang Dipinjam', 'Terlambat', 'Dikembalikan'].includes(borrowing.status)
        ? 'done'
        : borrowing.status === 'Disetujui'
          ? 'current'
          : 'pending',
    },
    {
      label: 'Pengembalian aset',
      description:
        borrowing.status === 'Dikembalikan'
          ? `Diterima ${formatDate(borrowing.returnDate)}`
          : borrowing.status === 'Terlambat'
            ? `Terlambat ${lateDays} hari`
            : 'Menunggu pengembalian',
      state: borrowing.status === 'Dikembalikan' ? 'done' : activeBorrow ? 'current' : 'pending',
    },
  ]

  return (
    <div className="animate-in">
      <PageHeader
        backTo="/borrowings"
        backLabel="Kembali ke daftar peminjaman"
        eyebrow="Detail Transaksi Peminjaman"
        title={borrowing.code}
        description={`${employee?.name || borrowing.createdBy} · ${asset?.name || 'Aset tidak ditemukan'} · ${borrowing.priority}`}
        actions={
          <>
            <Button variant="secondary" icon={Printer} onClick={() => setBastOpen(true)}>
              Cetak BAST
            </Button>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Unduh Data
            </Button>
            {borrowing.status === 'Menunggu Persetujuan' ? (
              <Button variant="primary" icon={ShieldCheck} onClick={() => setApproveOpen(true)}>
                Tinjau pengajuan
              </Button>
            ) : null}
            {borrowing.status === 'Disetujui' ? (
              <Button variant="teal" icon={PackageCheck} onClick={() => setHandoverOpen(true)}>
                Serah terima
              </Button>
            ) : null}
            {activeBorrow ? (
              <Button variant="primary" icon={Undo2} onClick={() => setReturnOpen(true)}>
                Catat pengembalian
              </Button>
            ) : null}
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_1fr]">
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={borrowing.status} />
              <Badge tone="neutral">{borrowing.priority}</Badge>
              {lateDays > 0 ? <Badge tone="danger">Terlambat {lateDays} hari</Badge> : null}
            </div>
            <h2 className="mt-2 text-[19px] font-semibold tracking-[-0.025em] text-ink-900">
              {asset?.name || 'Aset tidak ditemukan'}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-ink-500">
              {asset?.code || '—'} · SN {asset?.serial || '—'} · {asset?.category || '—'}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-4">
              <DetailItem label="Tanggal pinjam" value={formatDate(borrowing.borrowDate)} icon={CalendarDays} />
              <DetailItem label="Target kembali" value={formatDate(borrowing.dueDate)} icon={CalendarClock} />
              <DetailItem label="Durasi" value={`${duration} hari`} icon={Clock3} />
              <DetailItem label="Prioritas" value={borrowing.priority} icon={AlertTriangle} />
            </dl>

            <div className="mt-4 rounded-lg border border-line bg-slate-50/60 p-3.5">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.07em] text-ink-400">Justifikasi pemakaian</p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-600">{borrowing.purpose}</p>
            </div>
          </div>

          <div className="border-t border-line bg-slate-50/40 p-5 lg:border-l lg:border-t-0">
            <div className="flex items-start gap-3">
              <Avatar name={employee?.name || borrowing.createdBy} initials={employee?.initials} color={employee?.avatarColor} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-semibold text-ink-900">{employee?.name || borrowing.createdBy}</p>
                <p className="truncate text-[10.5px] text-ink-500">{employee?.position || borrowing.department}</p>
                <p className="truncate text-[9.5px] text-ink-400">{borrowing.employeeId} · {borrowing.department}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[10.5px]">
              <p className="flex items-center gap-2 text-ink-500">
                <Mail className="h-3 w-3 text-ink-400" /> {employee?.email || '—'}
              </p>
              <p className="flex items-center gap-2 text-ink-500">
                <Phone className="h-3 w-3 text-ink-400" /> {employee?.phone || '—'}
              </p>
              <p className="flex items-center gap-2 text-ink-500">
                <Building2 className="h-3 w-3 text-ink-400" /> {employee?.location || asset?.location || '—'}
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              {employee ? (
                <Button size="sm" variant="secondary" className="flex-1" to={`/employees/${employee.id}`}>
                  Profil karyawan
                </Button>
              ) : null}
              {asset ? (
                <Button size="sm" variant="secondary" className="flex-1" to={`/assets/${asset.id}`}>
                  Detail aset
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {activeBorrow ? (
        <div
          className={cn(
            'mt-4 flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center',
            lateDays > 0 ? 'border-red-200 bg-red-50/70' : 'border-blue-200 bg-blue-50/70',
          )}
        >
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              lateDays > 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600',
            )}
          >
            {lateDays > 0 ? <AlertTriangle className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn('text-[11.5px] font-semibold', lateDays > 0 ? 'text-red-900' : 'text-blue-900')}>
              {lateDays > 0 ? `Pengembalian terlambat ${lateDays} hari` : 'Aset sedang digunakan peminjam'}
            </p>
            <p className={cn('text-[10.5px]', lateDays > 0 ? 'text-red-700/80' : 'text-blue-700/80')}>
              {lateDays > 0
                ? 'Segera koordinasikan pengembalian. Denda keterlambatan berlaku sesuai kebijakan perusahaan.'
                : `Batas pengembalian ${formatDate(borrowing.dueDate)} di Meja Layanan Gudang IT.`}
            </p>
          </div>
          <Button size="sm" variant={lateDays > 0 ? 'danger-soft' : 'secondary'} icon={RotateCcw} onClick={() => setReturnOpen(true)}>
            Catat kembali
          </Button>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader
              title="Checklist Serah Terima"
              subtitle="Kelengkapan unit & aksesori yang diverifikasi petugas gudang"
              action={<Badge tone={checklist.every((item) => item.done) ? 'success' : 'warning'}>{checklist.filter((item) => item.done).length}/{checklist.length} lengkap</Badge>}
            />
            <div className="border-t border-line px-5 py-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-start gap-2 rounded-lg border border-line bg-slate-50/50 px-3 py-2.5">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span className="text-[11px] leading-relaxed text-ink-700">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50/60 px-3 py-2.5 text-[10.5px] leading-relaxed text-blue-800">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Kondisi keluar: <span className="font-semibold">{borrowing.conditionOut || '—'}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Syarat & Ketentuan Peminjaman" subtitle="Dokumen legal yang disetujui peminjam" action={<FileText className="h-4 w-4 text-ink-400" />} />
            <div className="border-t border-line px-5 py-4">
              <ol className="space-y-2.5">
                {LEGAL_TERMS.map((term, index) => (
                  <li key={term} className="flex gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9.5px] font-semibold text-ink-500">
                      {index + 1}
                    </span>
                    <p className="text-[11px] leading-relaxed text-ink-600">{term}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-4 grid gap-2 border-t border-dashed border-line pt-4 sm:grid-cols-3">
                {[
                  { role: 'Pemohon', name: employee?.name || borrowing.createdBy, meta: 'Tanda tangan digital' },
                  { role: 'Atasan langsung', name: employee?.manager || 'Fajar Anugrah', meta: 'Rekomendasi' },
                  { role: 'Administrator', name: borrowing.approvedBy !== '-' ? borrowing.approvedBy : 'Belum disetujui', meta: 'Otorisasi' },
                ].map((signature) => (
                  <div key={signature.role} className="rounded-lg border border-line px-3 py-2.5">
                    <p className="text-[9px] uppercase tracking-wide text-ink-400">{signature.role}</p>
                    <p className="mt-1.5 truncate text-[11px] font-semibold text-ink-800">{signature.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[9px] text-emerald-600">
                      <BadgeCheck className="h-3 w-3" /> {signature.meta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Linimasa Peminjaman" subtitle="Jejak audit setiap tahapan" action={<Badge tone="info">{borrowing.timeline?.length || 0} entri</Badge>} />
            <div className="border-t border-line px-5 py-4">
              {borrowing.timeline?.length ? (
                <ol className="relative ml-1.5 border-l border-line">
                  {borrowing.timeline.map((entry, index) => {
                    const current = index === borrowing.timeline.length - 1
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
              ) : (
                <EmptyState icon={Clock3} title="Belum ada aktivitas" description="Linimasa akan tercatat setelah pengajuan diproses." className="py-8" />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Status Alur Kerja"
              subtitle="Posisi transaksi saat ini"
              action={<Badge tone={done ? 'success' : declined ? 'danger' : activeBorrow ? 'info' : 'warning'}>{borrowing.status}</Badge>}
            />
            <div className="space-y-3.5 border-t border-line px-5 py-4">
              {workflow.map((step) => (
                <WorkflowStep key={step.label} {...step} />
              ))}
            </div>
            <div className="border-t border-line px-5 py-3">
              {borrowing.status === 'Menunggu Persetujuan' ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="danger-soft"
                    className="flex-1"
                    icon={X}
                    onClick={() => {
                      setRejectOpen(true)
                      setRejectReason('')
                    }}
                  >
                    Tolak
                  </Button>
                  <Button size="sm" variant="primary" className="flex-1" icon={CheckCircle2} onClick={() => setApproveOpen(true)}>
                    Setujui
                  </Button>
                </div>
              ) : borrowing.status === 'Disetujui' ? (
                <Button size="sm" variant="teal" className="w-full" icon={PackageCheck} onClick={() => setHandoverOpen(true)}>
                  Konfirmasi serah terima
                </Button>
              ) : activeBorrow ? (
                <Button size="sm" variant="primary" className="w-full" icon={Undo2} onClick={() => setReturnOpen(true)}>
                  Proses pengembalian
                </Button>
              ) : (
                <Button size="sm" variant="secondary" className="w-full" to="/borrowings">
                  Kembali ke daftar
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Aset Terkait" subtitle="Identitas unit yang dipinjam" />
            <div className="px-5 pb-5">
              {asset ? (
                <>
                  <div className="flex items-center gap-3">
                    <AssetThumb category={asset.category} size="md" />
                    <div className="min-w-0">
                      <Link to={`/assets/${asset.id}`} className="block truncate text-[11.5px] font-semibold text-ink-900 hover:underline">
                        {asset.name}
                      </Link>
                      <p className="truncate text-[9.5px] text-ink-400">{asset.code} · SN {asset.serial}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[10.5px]">
                    <p className="flex items-center justify-between gap-2">
                      <span className="text-ink-400">Kategori</span>
                      <span className="font-medium text-ink-700">{asset.category}</span>
                    </p>
                    <p className="flex items-center justify-between gap-2">
                      <span className="text-ink-400">Lokasi</span>
                      <span className="max-w-[60%] truncate text-right font-medium text-ink-700">{asset.location}</span>
                    </p>
                    <p className="flex items-center justify-between gap-2">
                      <span className="text-ink-400">Nilai buku</span>
                      <span className="font-medium text-ink-700">{formatCurrency(asset.bookValue, { compact: true })}</span>
                    </p>
                    <p className="flex items-center justify-between gap-2">
                      <span className="text-ink-400">Kondisi</span>
                      <StatusBadge status={asset.condition?.split(' (')[0]} />
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-ink-500">Aset tidak ditemukan.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Dokumen" subtitle="Berkas pendukung transaksi" action={<ClipboardCheck className="h-4 w-4 text-ink-400" />} />
            <div className="space-y-2 px-5 pb-5">
              {[
                { name: 'Berita Acara Serah Terima', type: 'BAST', ready: true },
                { name: 'Formulir Pengajuan Peminjaman', type: 'PDF', ready: true },
                { name: 'Checklist Inspeksi Gudang', type: 'XLSX', ready: borrowing.status !== 'Menunggu Persetujuan' },
              ].map((document) => (
                <div key={document.name} className="flex items-center gap-2.5 rounded-lg border border-line px-2.5 py-2">
                  <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-100 text-ink-500', !document.ready && 'opacity-50')}>
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-medium text-ink-800">{document.name}</p>
                    <p className="text-[9px] text-ink-400">{document.type} · {document.ready ? 'Tersedia' : 'Menunggu proses'}</p>
                  </div>
                  <Button size="xs" variant="ghost" disabled={!document.ready} onClick={downloadBast}>
                    Unduh
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApprove}
        loading={busy}
        destructive={false}
        title="Setujui permohonan peminjaman?"
        description={`${borrowing.code} akan disetujui dan siap masuk ke proses serah terima aset.`}
        confirmLabel="Setujui peminjaman"
      />

      <ConfirmDialog
        open={handoverOpen}
        onClose={() => setHandoverOpen(false)}
        onConfirm={handleHandover}
        loading={busy}
        destructive={false}
        title="Konfirmasi serah terima aset"
        description="Pastikan unit fisik, aksesori, dan checklist inspeksi telah diperiksa sebelum aset diserahkan."
        confirmLabel="Serahkan aset"
      />

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Tolak permohonan peminjaman"
        description="Alasan penolakan akan dicatat pada linimasa dan notifikasi pemohon."
        icon={X}
        tone="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectOpen(false)} disabled={busy}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleReject} loading={busy}>
              Tolak pengajuan
            </Button>
          </>
        }
      >
        <Field label="Alasan penolakan" htmlFor="detail-reject-reason" required hint="Minimal 10 karakter, jelaskan kebijakan atau kendala yang relevan.">
          <Textarea
            id="detail-reject-reason"
            rows={4}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Contoh: Aset dialokasikan untuk kebutuhan operasional lain pada periode yang sama."
          />
        </Field>
      </Modal>

      <Modal
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        title="Catat pengembalian aset"
        description="Pilih kondisi unit setelah inspeksi fisik oleh petugas gudang."
        icon={RotateCcw}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReturnOpen(false)} disabled={busy}>
              Batal
            </Button>
            <Button variant="teal" onClick={handleReturn} loading={busy}>
              Simpan pengembalian
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Kondisi saat dikembalikan" htmlFor="detail-return-condition" required>
            <Select id="detail-return-condition" value={returnCondition} onChange={(event) => setReturnCondition(event.target.value)}>
              {RETURN_CONDITIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <div className="rounded-lg border border-line bg-slate-50/70 p-3 text-[10.5px] leading-relaxed text-ink-500">
            Pengembalian mengubah status aset menjadi <span className="font-semibold text-ink-700">Tersedia</span>.
            Kondisi rusak akan tercatat pada grade aset dan dapat memicu tiket pemeliharaan baru.
          </div>
        </div>
      </Modal>

      <Modal
        open={bastOpen}
        onClose={() => setBastOpen(false)}
        title="Berita Acara Serah Terima"
        description="Pratinjau dokumen BAST digital. Gunakan tombol cetak untuk mengirim ke printer."
        icon={FileText}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={downloadBast} icon={Download}>
              Unduh file
            </Button>
            <Button variant="secondary" onClick={() => setBastOpen(false)}>
              Tutup
            </Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>
              Cetak BAST
            </Button>
          </>
        }
      >
        <div className="print-label-target rounded-xl border border-line bg-white p-5">
          <div className="flex items-start justify-between gap-3 border-b border-dashed border-line pb-3">
            <div>
              <p className="text-[13px] font-semibold tracking-[-0.01em] text-ink-900">PT AssetFlow Nusantara</p>
              <p className="text-[9px] uppercase tracking-[0.12em] text-ink-400">Berita Acara Serah Terima Aset</p>
            </div>
            <span className="rounded border border-line px-2 py-1 text-[8.5px] font-semibold text-ink-500">
              BAST/{borrowing.code}
            </span>
          </div>

          <p className="mt-3 text-[10.5px] leading-relaxed text-ink-600">
            Pada hari ini, {formatDate(borrowing.borrowDate, { long: true })}, telah dilakukan serah terima aset
            perusahaan dari unit Asset Management kepada karyawan berikut:
          </p>

          <div className="mt-3 grid gap-2 text-[10px] sm:grid-cols-2">
            {[
              ['Nama peminjam', employee?.name || borrowing.createdBy],
              ['NIP', borrowing.employeeId],
              ['Departemen', borrowing.department],
              ['Jabatan', employee?.position || '—'],
              ['Aset', asset?.name || '—'],
              ['Kode aset', asset?.code || '—'],
              ['Nomor seri', asset?.serial || '—'],
              ['Kondisi keluar', borrowing.conditionOut],
              ['Tanggal pinjam', formatDate(borrowing.borrowDate)],
              ['Target kembali', formatDate(borrowing.dueDate)],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2 border-b border-line/70 pb-1.5">
                <span className="w-24 shrink-0 text-ink-400">{label}</span>
                <span className="min-w-0 flex-1 font-medium text-ink-800">{value}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[10px] leading-relaxed text-ink-600">
            Peminjam menyetujui seluruh syarat peminjaman dan bertanggung jawab penuh atas keutuhan aset selama
            periode pemakaian sampai dengan tanggal pengembalian yang disepakati.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-[9px] text-ink-500">
            {[
              ['Pemohon', employee?.name || borrowing.createdBy],
              ['Atasan', employee?.manager || 'Fajar Anugrah'],
              ['Administrator', borrowing.approvedBy !== '-' ? borrowing.approvedBy : 'Andi Pratama'],
            ].map(([role, name]) => (
              <div key={role}>
                <p className="font-medium text-ink-700">{role}</p>
                <div className="mx-auto mt-6 border-t border-dashed border-ink-300 pt-1">
                  <p className="truncate font-semibold text-ink-800">{name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-center text-[9.5px] text-ink-400">Dokumen demo · Dicetak {formatDate(new Date(), { withTime: true })} WIB</p>
      </Modal>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[10px] text-ink-400">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" /> Transaksi tercatat pada log audit AssetFlow
        </span>
        <span className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/borrowings')} className="font-medium text-navy-700 hover:underline">
            Kembali ke daftar
          </button>
          <span className="h-2.5 w-px bg-line" />
          <button type="button" onClick={handleExport} className="font-medium text-navy-700 hover:underline">
            Ekspor CSV
          </button>
        </span>
      </div>
    </div>
  )
}
