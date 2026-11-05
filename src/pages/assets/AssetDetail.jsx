import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowUpRight,
  BadgeCheck,
  Barcode,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Copy,
  Download,
  FileText,
  History,
  MapPin,
  PackageSearch,
  Pencil,
  Phone,
  Printer,
  QrCode,
  ShieldCheck,
  Tag,
  UserRound,
  Wallet,
  Wrench,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import {
  cn,
  conditionTone,
  formatCurrency,
  formatDate,
  formatDateShort,
  formatNumber,
  statusTone,
} from '../../utils/format'
import { downloadCSV, downloadText } from '../../utils/export'
import PageHeader from '../../components/ui/PageHeader'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import AssetThumb from '../../components/ui/AssetThumb'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import Progress from '../../components/ui/Progress'

const DOCUMENTS = [
  { name: 'Berita Acara Serah Terima (BAST)', type: 'PDF', updated: '15 Mar 2023', size: '284 KB', signed: true },
  { name: 'Invoice & Faktur Pajak Pengadaan', type: 'PDF', updated: '15 Mar 2023', size: '512 KB', signed: true },
  { name: 'Kartu Garansi Resmi', type: 'PDF', updated: '15 Mar 2023', size: '126 KB', signed: false },
]

function BarcodeGraphic({ value = '', className }) {
  const bars = useMemo(() => {
    const text = value || 'ASSETFLOW'
    return Array.from({ length: 38 }, (_, index) => {
      const code = text.charCodeAt(index % text.length)
      return ((code + index * 7) % 3) + 1
    })
  }, [value])
  return (
    <div className={cn('flex h-10 items-end gap-[2px]', className)} aria-hidden="true">
      {bars.map((width, index) => (
        <span
          key={index}
          className="bg-navy-900"
          style={{ width: `${width}px`, height: `${index % 5 === 0 ? 100 : 82}%` }}
        />
      ))}
    </div>
  )
}

function QRPattern({ value = '' }) {
  const cells = useMemo(() => {
    const text = value || 'ASSETFLOW'
    return Array.from({ length: 81 }, (_, index) => {
      const char = text.charCodeAt(index % text.length)
      return (char + index * 13) % 3 !== 0
    })
  }, [value])
  return (
    <div className="grid h-24 w-24 grid-cols-9 gap-[2px] rounded bg-white p-1.5 ring-1 ring-line" aria-hidden="true">
      {cells.map((filled, index) => {
        const row = Math.floor(index / 9)
        const col = index % 9
        const finder =
          (row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3)
        return <span key={index} className={cn('rounded-[1px]', filled || finder ? 'bg-navy-900' : 'bg-transparent')} />
      })}
    </div>
  )
}

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

export default function AssetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { assets, employees, borrowings, maintenance } = useData()
  const toast = useToast()
  const [tab, setTab] = useState('ringkasan')
  const [labelOpen, setLabelOpen] = useState(false)

  const asset = assets.find((item) => item.id === id || item.code === id)
  const relatedBorrowings = borrowings.filter((item) => item.assetId === asset?.id)
  const relatedMaintenance = maintenance.filter((item) => item.assetId === asset?.id)
  const custodian = employees.find((employee) => employee.name === asset?.pic)
  const conditionPct = asset?.condition?.includes('Sangat Baik')
    ? 96
    : asset?.condition?.includes('Baik')
      ? 78
      : asset?.condition?.includes('Rusak Ringan')
        ? 52
        : 18

  if (!asset) {
    return (
      <div className="animate-in">
        <PageHeader backTo="/assets" title="Detail Aset" />
        <Card>
          <EmptyState
            icon={PackageSearch}
            title="Aset tidak ditemukan"
            description="Data aset mungkin sudah dihapus atau tautan tidak valid."
            action={<Button to="/assets" variant="primary">Kembali ke daftar</Button>}
          />
        </Card>
      </div>
    )
  }

  const copyBarcode = async () => {
    try {
      await navigator.clipboard.writeText(asset.barcode || asset.code)
      toast.success('Kode disalin', 'Nomor barcode aset disalin ke clipboard.')
    } catch {
      toast.error('Gagal menyalin', 'Browser tidak mengizinkan akses clipboard.')
    }
  }

  const handleDownload = () => {
    downloadCSV(
      `assetflow-${asset.code}`,
      [
        { label: 'Kode', key: 'code' },
        { label: 'Nama', key: 'name' },
        { label: 'Kategori', key: 'category' },
        { label: 'Merek', key: 'brand' },
        { label: 'Model', key: 'model' },
        { label: 'Nomor Seri', key: 'serial' },
        { label: 'Departemen', key: 'department' },
        { label: 'PIC', key: 'pic' },
        { label: 'Lokasi', key: 'location' },
        { label: 'Kondisi', key: 'condition' },
        { label: 'Status', key: 'status' },
        { label: 'Harga', key: 'purchasePrice' },
        { label: 'Nilai Buku', key: 'bookValue' },
      ],
      [asset],
    )
    toast.success('Data aset diunduh', `${asset.code} diekspor sebagai CSV.`)
  }

  const downloadDocument = (document) => {
    downloadText(
      `${asset.code}-${document.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`,
      `ASSETFLOW — ${document.name}\n\nAset: ${asset.name}\nKode: ${asset.code}\nNomor Seri: ${asset.serial}\nDepartemen: ${asset.department}\nPenanggung Jawab: ${asset.pic}\nLokasi: ${asset.location}\n\nDokumen ini dihasilkan dari data demo AssetFlow pada ${formatDate(new Date(), { withTime: true })}.`,
    )
    toast.success('Dokumen diunduh', document.name)
  }

  const tabs = [
    { key: 'ringkasan', label: 'Ringkasan', icon: ClipboardCheck },
    { key: 'peminjaman', label: 'Riwayat Peminjaman', icon: History, count: relatedBorrowings.length },
    { key: 'pemeliharaan', label: 'Pemeliharaan', icon: Wrench, count: relatedMaintenance.length },
    { key: 'dokumen', label: 'Dokumen', icon: FileText, count: DOCUMENTS.length },
  ]

  const tableHead = 'whitespace-nowrap px-3 py-2.5 text-left text-[9.5px] font-semibold uppercase tracking-[0.06em] text-ink-400'
  const tableCell = 'px-3 py-2.5 align-middle text-[11px]'

  return (
    <div className="animate-in">
      <PageHeader
        backTo="/assets"
        backLabel="Kembali ke daftar aset"
        eyebrow="Kartu Inventaris Aset"
        title={asset.name}
        description={`${asset.code} · ${asset.serial} · ${asset.category}`}
        actions={
          <>
            <Button variant="secondary" icon={Printer} onClick={() => setLabelOpen(true)}>
              Cetak Label
            </Button>
            <Button variant="secondary" icon={Download} onClick={handleDownload}>
              Unduh Data
            </Button>
            <Button variant="primary" icon={Pencil} to={`/assets/${asset.id}/edit`}>
              Edit Aset
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[300px_1fr]">
          <div className="relative flex min-h-[210px] items-center justify-center overflow-hidden border-b border-line bg-gradient-to-br from-slate-100 via-slate-50 to-white p-6 lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:15px_15px]" />
            <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[8.5px] font-semibold uppercase tracking-wide text-ink-500 ring-1 ring-line backdrop-blur">
              <ShieldCheck className="h-2.5 w-2.5 text-brand-500" /> Verified asset
            </div>
            <AssetThumb category={asset.category} size="lg" className="h-32 w-32 rounded-2xl shadow-[0_20px_40px_-18px_rgba(15,23,42,0.5)]" iconSize="h-14 w-14" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[9px] text-ink-400">
              <span className="truncate">{asset.brand}</span>
              <span className="shrink-0">ID {asset.id}</span>
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={asset.status} />
                  <Badge tone={conditionTone(asset.condition)}>{asset.condition?.split(' (')[0]}</Badge>
                  <Badge tone="neutral">{asset.category}</Badge>
                </div>
                <h2 className="mt-2 text-[19px] font-semibold tracking-[-0.025em] text-ink-900">{asset.name}</h2>
                <p className="mt-0.5 text-[11.5px] text-ink-500">
                  {asset.brand} · {asset.model}
                </p>
              </div>
              <div className="rounded-lg border border-line bg-slate-50/70 px-3 py-2 text-right">
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Nilai buku</p>
                <p className="text-[14px] font-semibold tracking-[-0.02em] text-ink-900">{formatCurrency(asset.bookValue)}</p>
                <p className="text-[9px] text-ink-400">dari {formatCurrency(asset.purchasePrice, { compact: true })}</p>
              </div>
            </div>

            <p className="mt-3 line-clamp-2 max-w-3xl text-[11.5px] leading-relaxed text-ink-500">{asset.description || 'Belum ada deskripsi aset.'}</p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-4">
              <DetailRow label="Kustodian" value={asset.pic} icon={UserRound} />
              <DetailRow label="Departemen" value={asset.department} icon={Building2} />
              <DetailRow label="Lokasi" value={asset.location} icon={MapPin} />
              <DetailRow label="Perolehan" value={formatDate(asset.purchaseDate)} icon={CalendarDays} />
            </dl>
          </div>
        </div>
      </Card>

      {asset.status === 'Dipinjam' ? (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 sm:flex-row sm:items-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <ArrowUpRight className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold text-blue-900">Aset sedang dipinjam</p>
            <p className="text-[10.5px] text-blue-700/80">
              {relatedBorrowings.find((item) => item.status === 'Sedang Dipinjam')?.code || 'Lihat riwayat peminjaman'} · pastikan pengembalian sesuai jatuh tempo.
            </p>
          </div>
          <Link to="/borrowings" className="text-[10.5px] font-semibold text-blue-800 hover:underline">
            Kelola peminjaman
          </Link>
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
                <h3 className="text-[12px] font-semibold text-ink-900">Informasi lengkap aset</h3>
                <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
                  <DetailRow label="Kode aset" value={asset.code} icon={Tag} />
                  <DetailRow label="Nomor seri" value={asset.serial} icon={Barcode} />
                  <DetailRow label="Kategori" value={asset.category} />
                  <DetailRow label="Merek" value={asset.brand} />
                  <DetailRow label="Model / tipe" value={asset.model} />
                  <DetailRow label="Kondisi" value={asset.condition} icon={BadgeCheck} />
                  <DetailRow label="Status" value={asset.status} />
                  <DetailRow label="Tanggal perolehan" value={formatDate(asset.purchaseDate)} icon={CalendarDays} />
                  <DetailRow label="Masa garansi" value={`${asset.warrantyMonths} bulan`} icon={ShieldCheck} />
                  <DetailRow label="Supplier" value={asset.supplier} icon={Building2} />
                  <DetailRow label="Invoice / PO" value={asset.invoice} icon={FileText} />
                  <DetailRow label="Faktur pajak" value={asset.taxInvoice} icon={FileText} />
                  <DetailRow label="Lokasi" value={asset.location} icon={MapPin} />
                  <DetailRow label="Ruang / area" value={asset.room} icon={MapPin} />
                  <DetailRow label="Penanggung jawab" value={asset.pic} icon={UserRound} />
                </dl>

                <div className="mt-5 rounded-lg border border-line bg-slate-50/60 p-3.5">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.07em] text-ink-400">Spesifikasi & kelengkapan</p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-600">{asset.description || 'Belum ada catatan spesifikasi.'}</p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-line p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-ink-700">
                      <UserRound className="h-3.5 w-3.5 text-ink-400" /> Informasi kustodian
                    </p>
                    <p className="mt-1.5 text-[11px] text-ink-500">
                      {asset.pic} · {asset.department}
                    </p>
                    <p className="text-[10px] text-ink-400">Terakhir diperbarui {formatDate(asset.updatedAt || asset.createdAt)}</p>
                  </div>
                  <div className="rounded-lg border border-line p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-ink-700">
                      <ClipboardCheck className="h-3.5 w-3.5 text-ink-400" /> Status kepatuhan
                    </p>
                    <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> BAST lengkap & terverifikasi
                    </p>
                    <p className="text-[10px] text-ink-400">Tidak ada temuan audit pada siklus terakhir.</p>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === 'peminjaman' ? (
              <div className="p-5">
                {relatedBorrowings.length === 0 ? (
                  <EmptyState icon={History} title="Belum ada riwayat peminjaman" description="Aset ini belum pernah masuk ke alur peminjaman." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <thead className="border-b border-line">
                        <tr>
                          <th className={tableHead}>Pengaju</th>
                          <th className={tableHead}>Kode</th>
                          <th className={tableHead}>Periode</th>
                          <th className={tableHead}>Status</th>
                          <th className={cn(tableHead, 'text-right')}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {relatedBorrowings.map((item) => {
                          const employee = employees.find((entry) => entry.id === item.employeeId)
                          return (
                            <tr key={item.id} className="row-hover">
                              <td className={tableCell}>
                                <div className="flex items-center gap-2">
                                  <Avatar name={employee?.name} initials={employee?.initials} color={employee?.avatarColor} size="xs" />
                                  <span className="font-medium text-ink-800">{employee?.name || item.createdBy}</span>
                                </div>
                              </td>
                              <td className={cn(tableCell, 'font-medium text-ink-600')}>{item.code}</td>
                              <td className={cn(tableCell, 'text-ink-500')}>
                                {formatDateShort(item.borrowDate)} – {formatDateShort(item.dueDate)}
                              </td>
                              <td className={tableCell}><StatusBadge status={item.status} /></td>
                              <td className={cn(tableCell, 'text-right')}>
                                <Link to={`/borrowings/${item.id}`} className="text-[10.5px] font-medium text-navy-700 hover:underline">
                                  Detail
                                </Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}

            {tab === 'pemeliharaan' ? (
              <div className="p-5">
                {relatedMaintenance.length === 0 ? (
                  <EmptyState icon={Wrench} title="Belum ada riwayat pemeliharaan" description="Belum ada tiket pemeliharaan yang tercatat untuk aset ini." />
                ) : (
                  <div className="space-y-2.5">
                    {relatedMaintenance.map((item) => (
                      <Link
                        key={item.id}
                        to={`/maintenance/${item.id}`}
                        className="flex flex-col gap-2 rounded-lg border border-line p-3 transition hover:border-slate-300 hover:bg-slate-50/60 sm:flex-row sm:items-center"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                          <Wrench className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11.5px] font-semibold text-ink-900">{item.code} · {item.type}</p>
                          <p className="mt-0.5 line-clamp-1 text-[10.5px] text-ink-500">{item.problem}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:shrink-0">
                          <div className="w-20"><Progress value={item.progress} tone={item.status === 'Selesai' ? 'teal' : 'amber'} /></div>
                          <StatusBadge status={item.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {tab === 'dokumen' ? (
              <div className="p-5">
                <div className="space-y-2.5">
                  {DOCUMENTS.map((document) => (
                    <div key={document.name} className="flex flex-col gap-2 rounded-lg border border-line p-3 sm:flex-row sm:items-center">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11.5px] font-semibold text-ink-900">{document.name}</p>
                        <p className="mt-0.5 text-[10px] text-ink-400">
                          {document.type} · {document.size} · Diperbarui {document.updated}
                          {document.signed ? ' · Ditandatangani digital' : ''}
                        </p>
                      </div>
                      <Button size="sm" variant="secondary" icon={Download} onClick={() => downloadDocument(document)}>
                        Unduh
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-dashed border-line bg-slate-50/50 px-4 py-5 text-center">
                  <p className="text-[11px] font-medium text-ink-700">Tambah dokumen pendukung</p>
                  <p className="mt-0.5 text-[10px] text-ink-400">Unggah foto aset, invoice, atau berita acara tambahan.</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                    onClick={() => toast.info('Unggah dokumen', 'Pada versi demo, dokumen diunduh dari data contoh yang tersedia.')}
                  >
                    Pilih file
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[10px] text-ink-400">
            <span>Terakhir disinkronkan {formatDate(new Date(), { withTime: true })} WIB</span>
            <span className="flex items-center gap-2">
              <button type="button" onClick={copyBarcode} className="inline-flex items-center gap-1 font-medium text-navy-700 hover:underline">
                <Copy className="h-3 w-3" /> Salin barcode
              </button>
              <span className="h-2.5 w-px bg-line" />
              <button type="button" onClick={handleDownload} className="inline-flex items-center gap-1 font-medium text-navy-700 hover:underline">
                <Download className="h-3 w-3" /> Ekspor data
              </button>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Identitas & Label" subtitle="Pindai untuk audit fisik" />
            <div className="px-5 pb-5">
              <div className="flex items-center gap-3">
                <QRPattern value={asset.serial} />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Kode inventaris</p>
                  <p className="mt-0.5 text-[13px] font-semibold tracking-[-0.02em] text-ink-900">{asset.code}</p>
                  <p className="mt-0.5 break-all text-[9.5px] text-ink-400">SN {asset.serial}</p>
                  <button type="button" onClick={copyBarcode} className="mt-1.5 inline-flex items-center gap-1 text-[9.5px] font-medium text-navy-700 hover:underline">
                    <Copy className="h-2.5 w-2.5" /> Salin barcode
                  </button>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-line bg-white p-2.5">
                <BarcodeGraphic value={asset.barcode || asset.code} />
                <p className="mt-1 text-center text-[8.5px] tracking-[0.2em] text-ink-500">{asset.barcode || asset.code}</p>
              </div>
              <Button size="sm" variant="secondary" icon={Printer} className="mt-3 w-full" onClick={() => setLabelOpen(true)}>
                Cetak label aset
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Kustodian" subtitle="Penanggung jawab aset" action={<Badge tone="teal">Aktif</Badge>} />
            <div className="px-5 pb-5">
              <div className="flex items-center gap-3">
                <Avatar name={custodian?.name || asset.pic} initials={custodian?.initials} color={custodian?.avatarColor} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-ink-900">{custodian?.name || asset.pic}</p>
                  <p className="truncate text-[10.5px] text-ink-500">{custodian?.position || asset.department}</p>
                  <p className="truncate text-[9.5px] text-ink-400">{custodian?.department || asset.department}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[10.5px]">
                <p className="flex items-center gap-2 text-ink-500">
                  <Phone className="h-3 w-3 text-ink-400" /> {custodian?.phone || '+62 812-1900-4411'}
                </p>
                <p className="flex items-center gap-2 text-ink-500">
                  <MapPin className="h-3 w-3 text-ink-400" /> {asset.location}
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                {custodian ? (
                  <Button size="sm" variant="secondary" className="flex-1" to={`/employees/${custodian.id}`}>
                    Lihat profil
                  </Button>
                ) : null}
                <Button size="sm" variant="secondary" className="flex-1" to="/borrowings">
                  Peminjaman
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Nilai & Penyusutan" subtitle="Ringkasan finansial" action={<Wallet className="h-4 w-4 text-ink-400" />} />
            <div className="space-y-3 px-5 pb-5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10.5px] text-ink-500">Harga perolehan</span>
                <span className="text-[11.5px] font-semibold text-ink-900">{formatCurrency(asset.purchasePrice)}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10.5px] text-ink-500">Nilai buku saat ini</span>
                <span className="text-[11.5px] font-semibold text-emerald-700">{formatCurrency(asset.bookValue)}</span>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-[9.5px] text-ink-400">
                  <span>Penyusutan {formatNumber(((1 - asset.bookValue / Math.max(asset.purchasePrice, 1)) * 100).toFixed(0))}%</span>
                  <span>Umur ekonomis 4 tahun</span>
                </div>
                <Progress value={(1 - asset.bookValue / Math.max(asset.purchasePrice, 1)) * 100} tone="navy" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                  <p className="text-[8.5px] uppercase tracking-wide text-ink-400">Supplier</p>
                  <p className="mt-0.5 truncate text-[10px] font-medium text-ink-700">{asset.supplier || '—'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                  <p className="text-[8.5px] uppercase tracking-wide text-ink-400">Garansi</p>
                  <p className="mt-0.5 text-[10px] font-medium text-ink-700">{asset.warrantyMonths} bulan</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Kondisi Fisik" subtitle="Hasil inspeksi terakhir" />
            <div className="px-5 pb-5">
              <div className="flex items-center justify-between gap-2">
                <Badge tone={conditionTone(asset.condition)}>{asset.condition}</Badge>
                <span className="text-[11px] font-semibold text-ink-900">{conditionPct}%</span>
              </div>
              <Progress value={conditionPct} tone={conditionPct > 80 ? 'teal' : conditionPct > 50 ? 'amber' : 'red'} className="mt-2 h-2" />
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-[10px] leading-relaxed text-ink-500">
                <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-ink-400" />
                Inspeksi terakhir 28 Okt 2025 oleh tim IT Asset Management. Tidak ada kerusakan kritis.
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={labelOpen}
        onClose={() => setLabelOpen(false)}
        title="Cetak Label Aset"
        description="Pratinjau label inventaris. Gunakan tombol cetak untuk mengirim ke printer."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLabelOpen(false)}>Tutup</Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>Cetak label</Button>
          </>
        }
      >
        <div className="print-label-target mx-auto max-w-md rounded-xl border border-line bg-white p-5">
          <div className="flex items-center justify-between border-b border-dashed border-line pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-white">
                <PackageSearch className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[12px] font-semibold leading-tight text-ink-900">AssetFlow</p>
                <p className="text-[8px] uppercase tracking-[0.14em] text-ink-400">Asset Identification Label</p>
              </div>
            </div>
            <QrCode className="h-8 w-8 text-navy-900" />
          </div>
          <div className="mt-3 flex gap-4">
            <QRPattern value={asset.serial} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-ink-900">{asset.name}</p>
              <p className="mt-0.5 text-[10px] text-ink-500">{asset.brand} · {asset.model}</p>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
                <p className="text-ink-400">Kode</p>
                <p className="text-right font-semibold text-ink-800">{asset.code}</p>
                <p className="text-ink-400">Serial</p>
                <p className="text-right font-medium text-ink-700">{asset.serial}</p>
                <p className="text-ink-400">Dept.</p>
                <p className="text-right font-medium text-ink-700">{asset.department}</p>
                <p className="text-ink-400">Lokasi</p>
                <p className="text-right font-medium text-ink-700">{asset.location}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-dashed border-line pt-3">
            <BarcodeGraphic value={asset.barcode || asset.code} className="justify-center" />
            <p className="mt-1 text-center text-[8px] tracking-[0.22em] text-ink-500">{asset.barcode || asset.code}</p>
          </div>
          <div className="mt-2 flex items-center justify-between text-[8px] text-ink-400">
            <span>PT AssetFlow Nusantara</span>
            <span>Dicetak {formatDate(new Date())}</span>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-ink-400">Label 90 × 55 mm · Kompatibel dengan printer thermal & laser.</p>
      </Modal>
    </div>
  )
}
