import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  History,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { cn, conditionTone, formatCurrency, formatDate, formatNumber } from '../../utils/format'
import { downloadCSV, downloadText } from '../../utils/export'
import PageHeader from '../../components/ui/PageHeader'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import AssetThumb from '../../components/ui/AssetThumb'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import Progress from '../../components/ui/Progress'
import EmptyState from '../../components/ui/EmptyState'
import EmployeeFormModal from '../../components/employees/EmployeeFormModal'

function gradeTone(grade) {
  if (grade === 'Grade A') return 'success'
  if (grade === 'Grade B') return 'info'
  return 'warning'
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

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export default function EmployeeDetail() {
  const { id } = useParams()
  const { employees, assets, borrowings, users, actions } = useData()
  const toast = useToast()
  const [tab, setTab] = useState('ringkasan')
  const [editOpen, setEditOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const employee = employees.find((item) => item.id === id)

  const assignedAssets = useMemo(
    () => (employee ? assets.filter((asset) => asset.pic === employee.name) : []),
    [assets, employee],
  )

  const employeeBorrowings = useMemo(
    () =>
      employee
        ? [...borrowings]
            .filter((item) => item.employeeId === employee.id)
            .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
        : [],
    [borrowings, employee],
  )

  const linkedUser = useMemo(
    () => (employee ? users.find((user) => user.employeeId === employee.id) : null),
    [users, employee],
  )

  const activity = useMemo(() => {
    if (!employee) return []
    const entries = [
      {
        key: `join-${employee.id}`,
        title: 'Bergabung dengan PT AssetFlow Nusantara',
        desc: `${employee.position} · ${employee.department}`,
        at: formatDate(employee.joinDate),
        sort: new Date(employee.joinDate).getTime(),
        by: 'Human Resources',
        tone: 'teal',
      },
      ...assignedAssets.map((asset) => ({
        key: `asset-${asset.id}`,
        title: `Penugasan aset ${asset.name}`,
        desc: `${asset.code} · ${asset.location} · Kondisi ${asset.condition}`,
        at: formatDate(asset.purchaseDate),
        sort: new Date(asset.purchaseDate).getTime(),
        by: 'Asset Manager',
        tone: 'blue',
      })),
      ...employeeBorrowings.map((item) => ({
        key: `loan-${item.id}`,
        title: `${item.code} · ${item.status}`,
        desc: item.purpose,
        at: formatDate(item.borrowDate),
        sort: new Date(item.borrowDate).getTime(),
        by: item.createdBy,
        tone: item.status === 'Ditolak' || item.status === 'Terlambat' ? 'danger' : 'navy',
      })),
    ]
    return entries.sort((a, b) => b.sort - a.sort)
  }, [employee, assignedAssets, employeeBorrowings])

  if (!employee) {
    return (
      <div className="animate-in">
        <PageHeader backTo="/employees" title="Detail Karyawan" />
        <Card>
          <EmptyState
            icon={Users}
            title="Karyawan tidak ditemukan"
            description="Data karyawan mungkin sudah dihapus atau tautan tidak valid."
            action={<Button to="/employees" variant="primary">Kembali ke direktori</Button>}
          />
        </Card>
      </div>
    )
  }

  const activeBorrowings = employeeBorrowings.filter((item) => ['Sedang Dipinjam', 'Terlambat', 'Disetujui', 'Menunggu Persetujuan'].includes(item.status))
  const returned = employeeBorrowings.filter((item) => item.status === 'Dikembalikan').length
  const late = employeeBorrowings.filter((item) => item.status === 'Terlambat').length
  const onTimeRate = returned + late ? Math.round((returned / (returned + late)) * 100) : 0
  const assetValue = assignedAssets.reduce((sum, asset) => sum + (Number(asset.bookValue) || 0), 0)
  const compliance = employee.grade === 'Grade A' ? 96 : employee.grade === 'Grade B' ? 82 : 68

  const documents = [
    {
      id: `DOC-HR-${employee.id}`,
      name: `Surat Penugasan Kustodian ${employee.name}`,
      type: 'Penetapan Kustodian',
      date: employee.joinDate,
      status: 'Terverifikasi',
    },
    ...employeeBorrowings.map((item) => ({
      id: `BAST/${item.code}`,
      name: `BAST ${item.code}`,
      type: 'Berita Acara Serah Terima',
      date: item.borrowDate,
      status: item.status === 'Menunggu Persetujuan' || item.status === 'Ditolak' ? 'Menunggu' : 'Terverifikasi',
      borrowing: item,
    })),
  ]

  const handleEdit = async (values) => {
    setBusy(true)
    try {
      await actions.updateEmployee(employee.id, values)
      toast.success('Profil diperbarui', `Data ${values.name} berhasil disimpan.`)
      setEditOpen(false)
    } catch (error) {
      toast.error('Gagal memperbarui profil', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleExportProfile = () => {
    downloadText(
      `profil-${employee.id}.txt`,
      [
        'PROFIL KARYAWAN & KUSTODIAN ASET',
        'PT AssetFlow Nusantara',
        '',
        `ID Karyawan: ${employee.id}`,
        `Nama: ${employee.name}`,
        `Email: ${employee.email}`,
        `Telepon: ${employee.phone}`,
        `Departemen: ${employee.department}`,
        `Jabatan: ${employee.position}`,
        `Status: ${employee.status}`,
        `Tanggal Bergabung: ${formatDate(employee.joinDate)}`,
        `Atasan Langsung: ${employee.manager}`,
        `Lokasi Kerja: ${employee.location}`,
        `Grade Kepatuhan: ${employee.grade}`,
        `Jumlah Aset: ${assignedAssets.length || employee.assets} unit`,
        `Nilai Buku Aset: ${formatCurrency(assetValue)}`,
        '',
        'CATATAN KUSTODIAN:',
        employee.notes,
        '',
        'ASET DITUGASKAN:',
        ...(assignedAssets.length
          ? assignedAssets.map((asset) => `- ${asset.code} · ${asset.name} · ${asset.condition}`)
          : ['- Belum ada aset tercatat atas nama karyawan.']),
        '',
        'RIWAYAT PEMINJAMAN:',
        ...(employeeBorrowings.length
          ? employeeBorrowings.map((item) => `- ${item.code} · ${item.status} · ${formatDate(item.borrowDate)}`)
          : ['- Belum ada riwayat peminjaman.']),
      ].join('\n'),
    )
    toast.success('Profil diunduh', `Ringkasan ${employee.name} disimpan sebagai berkas teks.`)
  }

  const handleExportAssets = () => {
    downloadCSV(
      `aset-${employee.id}`,
      [
        { label: 'Kode Aset', key: 'code' },
        { label: 'Nama Aset', key: 'name' },
        { label: 'Kategori', key: 'category' },
        { label: 'Lokasi', key: 'location' },
        { label: 'Kondisi', key: 'condition' },
        { label: 'Status', key: 'status' },
        { label: 'Tanggal Perolehan', value: (item) => formatDate(item.purchaseDate) },
        { label: 'Nilai Buku', key: 'bookValue' },
      ],
      assignedAssets,
    )
    toast.success('Ekspor selesai', `${assignedAssets.length} aset karyawan diunduh sebagai CSV.`)
  }

  const handleDownloadDocument = (document) => {
    downloadText(
      `${document.id.replaceAll('/', '-')}.txt`,
      [
        document.name.toUpperCase(),
        'PT AssetFlow Nusantara',
        '',
        `Nomor Dokumen: ${document.id}`,
        `Jenis: ${document.type}`,
        `Karyawan: ${employee.name} (${employee.id})`,
        `Departemen: ${employee.department}`,
        `Tanggal: ${formatDate(document.date)}`,
        `Status: ${document.status}`,
        '',
        document.borrowing
          ? `Aset: ${assets.find((asset) => asset.id === document.borrowing.assetId)?.name || '-'}\nKeperluan: ${document.borrowing.purpose}`
          : `Catatan: Karyawan ditetapkan sebagai kustodian aset perusahaan sesuai kebijakan internal.`,
        '',
        'Dokumen ini dihasilkan otomatis oleh sistem demo AssetFlow.',
      ].join('\n'),
    )
    toast.success('Dokumen diunduh', `${document.id} disimpan sebagai berkas teks.`)
  }

  const tabs = [
    { key: 'ringkasan', label: 'Ringkasan', icon: UserRound },
    { key: 'assets', label: 'Aset Ditugaskan', icon: Briefcase, count: assignedAssets.length },
    { key: 'borrowings', label: 'Peminjaman', icon: History, count: employeeBorrowings.length },
    { key: 'documents', label: 'Dokumen & BAST', icon: FileText, count: documents.length },
    { key: 'activity', label: 'Aktivitas', icon: Clock3, count: activity.length },
  ]

  return (
    <div className="animate-in">
      <PageHeader
        backTo="/employees"
        backLabel="Kembali ke direktori karyawan"
        eyebrow="Profil Karyawan"
        title={employee.name}
        description={`${employee.position} · ${employee.department} · ${employee.id}`}
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExportProfile}>
              Unduh Profil
            </Button>
            <Button variant="primary" icon={Pencil} onClick={() => setEditOpen(true)}>
              Edit Data
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.5fr_1fr]">
          <div className="p-5">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={employee.name} initials={employee.initials} color={employee.avatarColor} size="xl" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={employee.status} />
                  <Badge tone={gradeTone(employee.grade)} dot>{employee.grade}</Badge>
                  {linkedUser ? <Badge tone="navy">Akun {linkedUser.role}</Badge> : null}
                </div>
                <h2 className="mt-2 text-[19px] font-semibold tracking-[-0.025em] text-ink-900">{employee.name}</h2>
                <p className="mt-0.5 text-[11.5px] text-ink-500">{employee.position}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[10.5px] text-ink-500">
                  <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3 text-ink-400" />{employee.email}</span>
                  <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3 text-ink-400" />{employee.phone}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3 text-ink-400" />{employee.location}</span>
                </div>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-4">
              <DetailRow label="Departemen" value={employee.department} icon={Building2} />
              <DetailRow label="Bergabung" value={formatDate(employee.joinDate)} icon={CalendarDays} />
              <DetailRow label="Atasan langsung" value={employee.manager} icon={UserRound} />
              <DetailRow label="Akun sistem" value={linkedUser ? linkedUser.role : 'Belum memiliki akun'} icon={ShieldCheck} />
            </dl>
          </div>

          <div className="border-t border-line bg-slate-50/40 p-5 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between gap-2">
              <p className="eyebrow">Skor kepatuhan kustodian</p>
              <Badge tone={gradeTone(employee.grade)}>{employee.grade}</Badge>
            </div>
            <div className="mt-2 flex items-end gap-1.5">
              <span className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-ink-900">{compliance}</span>
              <span className="pb-0.5 text-[11px] font-medium text-ink-400">/ 100</span>
            </div>
            <Progress value={compliance} tone={employee.grade === 'Grade A' ? 'teal' : employee.grade === 'Grade B' ? 'blue' : 'amber'} className="mt-2 h-2" />
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Aset</p>
                <p className="text-[14px] font-semibold text-ink-900">{assignedAssets.length || employee.assets}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Pinjaman</p>
                <p className="text-[14px] font-semibold text-ink-900">{activeBorrowings.length}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Tepat waktu</p>
                <p className="text-[14px] font-semibold text-ink-900">{onTimeRate}%</p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[10.5px] text-ink-500">
              <p className="flex items-center gap-2"><BadgeCheck className="h-3 w-3 text-ink-400" />Nilai buku ditugaskan {formatCurrency(assetValue, { compact: true })}</p>
              <p className="flex items-center gap-2"><ClipboardCheck className="h-3 w-3 text-ink-400" />{documents.filter((doc) => doc.status === 'Terverifikasi').length} dokumen terverifikasi</p>
              <p className="flex items-center gap-2"><Users className="h-3 w-3 text-ink-400" />Melapor ke {employee.manager}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <div className="px-5 pt-3">
              <Tabs items={tabs} value={tab} onChange={setTab} />
            </div>

            {tab === 'ringkasan' ? (
              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-[12px] font-semibold text-ink-900">Informasi kepegawaian</h3>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-line bg-slate-50/50 p-3.5 sm:grid-cols-3">
                    <DetailRow label="ID Karyawan" value={employee.id} icon={BadgeCheck} />
                    <DetailRow label="Status" value={employee.status} icon={CheckCircle2} />
                    <DetailRow label="Grade" value={employee.grade} icon={ShieldCheck} />
                    <DetailRow label="Bergabung" value={formatDate(employee.joinDate)} icon={CalendarDays} />
                    <DetailRow label="Lokasi kerja" value={employee.location} icon={MapPin} />
                    <DetailRow label="Email" value={employee.email} icon={Mail} />
                  </dl>
                </div>

                <div className="rounded-lg border border-line bg-white p-3.5">
                  <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.07em] text-ink-400">
                    <ClipboardCheck className="h-3 w-3" /> Catatan kustodian
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-600">{employee.notes}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-line p-3.5">
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.07em] text-ink-400">Penugasan aktif</p>
                    <p className="mt-1.5 text-[20px] font-semibold text-ink-900">{assignedAssets.length || employee.assets} <span className="text-[11px] font-medium text-ink-400">unit</span></p>
                    <p className="mt-0.5 text-[10px] text-ink-400">Nilai buku {formatCurrency(assetValue, { compact: true })}</p>
                    <Button size="sm" variant="secondary" className="mt-2.5" onClick={() => setTab('assets')}>
                      Lihat aset
                    </Button>
                  </div>
                  <div className="rounded-lg border border-line p-3.5">
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.07em] text-ink-400">Riwayat peminjaman</p>
                    <p className="mt-1.5 text-[20px] font-semibold text-ink-900">{employeeBorrowings.length} <span className="text-[11px] font-medium text-ink-400">pengajuan</span></p>
                    <p className="mt-0.5 text-[10px] text-ink-400">{returned} dikembalikan · {late} terlambat</p>
                    <Button size="sm" variant="secondary" className="mt-2.5" onClick={() => setTab('borrowings')}>
                      Lihat riwayat
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === 'assets' ? (
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[12px] font-semibold text-ink-900">Aset atas nama karyawan</h3>
                    <p className="mt-0.5 text-[10.5px] text-ink-500">Daftar aset dengan PIC {employee.name}.</p>
                  </div>
                  <Button size="sm" variant="secondary" icon={Download} onClick={handleExportAssets} disabled={!assignedAssets.length}>
                    Ekspor
                  </Button>
                </div>
                {assignedAssets.length ? (
                  <div className="mt-3 overflow-x-auto rounded-lg border border-line">
                    <table className="w-full min-w-[620px]">
                      <thead className="bg-slate-50/80">
                        <tr>
                          <th className="px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">Aset</th>
                          <th className="px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">Kategori</th>
                          <th className="px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">Kondisi</th>
                          <th className="px-3 py-2 text-left text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">Status</th>
                          <th className="px-3 py-2 text-right text-[9.5px] font-semibold uppercase tracking-wide text-ink-400">Nilai Buku</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {assignedAssets.map((asset) => (
                          <tr key={asset.id} className="transition hover:bg-slate-50/70">
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <AssetThumb category={asset.category} size="sm" />
                                <div className="min-w-0">
                                  <Link to={`/assets/${asset.id}`} className="block truncate text-[11px] font-semibold text-ink-900 hover:underline">
                                    {asset.name}
                                  </Link>
                                  <p className="truncate text-[9px] text-ink-400">{asset.code} · {asset.location}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-[10.5px] text-ink-500">{asset.category}</td>
                            <td className="px-3 py-2.5"><Badge tone={conditionTone(asset.condition)}>{asset.condition?.split(' (')[0]}</Badge></td>
                            <td className="px-3 py-2.5"><StatusBadge status={asset.status} /></td>
                            <td className="px-3 py-2.5 text-right text-[10.5px] font-semibold text-ink-800">{formatCurrency(asset.bookValue, { compact: true })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title="Belum ada aset ditugaskan"
                    description="Aset akan muncul di sini setelah PIC diperbarui pada kartu aset."
                    className="py-10"
                    action={<Button size="sm" variant="secondary" to="/assets">Buka data aset</Button>}
                  />
                )}
                <p className="mt-3 text-[9.5px] leading-relaxed text-ink-400">
                  Jumlah aset pada direktori ({employee.assets} unit) dapat berbeda dengan daftar ini karena sebagian penugasan belum memiliki PIC yang dipetakan pada data demo.
                </p>
              </div>
            ) : null}

            {tab === 'borrowings' ? (
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[12px] font-semibold text-ink-900">Riwayat peminjaman</h3>
                    <p className="mt-0.5 text-[10.5px] text-ink-500">Seluruh pengajuan dan status pengembalian.</p>
                  </div>
                  <Button size="sm" variant="secondary" to="/borrowings">
                    Semua peminjaman
                  </Button>
                </div>
                {employeeBorrowings.length ? (
                  <div className="mt-3 space-y-2">
                    {employeeBorrowings.map((item) => {
                      const asset = assets.find((entry) => entry.id === item.assetId)
                      return (
                        <Link
                          key={item.id}
                          to={`/borrowings/${item.id}`}
                          className="flex flex-wrap items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 transition hover:border-slate-300 hover:bg-slate-50/60"
                        >
                          <AssetThumb category={asset?.category} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-semibold text-ink-900">{asset?.name || item.code}</p>
                            <p className="truncate text-[9.5px] text-ink-400">{item.code} · {formatDate(item.borrowDate)} → {formatDate(item.dueDate)}</p>
                          </div>
                          <StatusBadge status={item.status} />
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={History}
                    title="Belum ada riwayat peminjaman"
                    description="Pengajuan peminjaman karyawan akan tampil di sini."
                    className="py-10"
                    action={<Button size="sm" variant="secondary" to="/borrowings">Buat pengajuan</Button>}
                  />
                )}
              </div>
            ) : null}

            {tab === 'documents' ? (
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[12px] font-semibold text-ink-900">Dokumen kepatuhan & BAST</h3>
                    <p className="mt-0.5 text-[10.5px] text-ink-500">Berkas serah terima dan penetapan kustodian.</p>
                  </div>
                  <Badge tone="success">{documents.filter((doc) => doc.status === 'Terverifikasi').length} terverifikasi</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {documents.map((document) => (
                    <div key={document.id} className="flex flex-wrap items-center gap-2.5 rounded-lg border border-line px-3 py-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-ink-500">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-ink-900">{document.name}</p>
                        <p className="truncate text-[9.5px] text-ink-400">{document.id} · {document.type} · {formatDate(document.date)}</p>
                      </div>
                      <Badge tone={document.status === 'Terverifikasi' ? 'success' : 'warning'}>{document.status}</Badge>
                      <Button size="xs" variant="secondary" icon={Download} onClick={() => handleDownloadDocument(document)}>
                        Unduh
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[9.5px] leading-relaxed text-ink-400">
                  BAST digital wajib ditandatangani karyawan dan atasan sebelum aset diserahkan. Dokumen pada demo ini dihasilkan otomatis.
                </p>
              </div>
            ) : null}

            {tab === 'activity' ? (
              <div className="p-5">
                <h3 className="text-[12px] font-semibold text-ink-900">Linimasa aktivitas</h3>
                <p className="mt-0.5 text-[10.5px] text-ink-500">Rekam jejak kepegawaian, penugasan, dan peminjaman.</p>
                {activity.length ? (
                  <ol className="mt-4 space-y-0">
                    {activity.map((item, index) => (
                      <li key={item.key} className="relative flex gap-3 pb-4 last:pb-0">
                        {index < activity.length - 1 ? <span className="absolute left-[7px] top-4 h-full w-px bg-line" /> : null}
                        <span
                          className={cn(
                            'relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white ring-1 ring-line',
                            item.tone === 'teal' && 'bg-brand-500',
                            item.tone === 'blue' && 'bg-blue-500',
                            item.tone === 'danger' && 'bg-red-500',
                            item.tone === 'navy' && 'bg-navy-700',
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <p className="text-[11px] font-semibold text-ink-900">{item.title}</p>
                            <span className="text-[9px] text-ink-400">{item.at}</span>
                          </div>
                          <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-500">{item.desc}</p>
                          <p className="mt-0.5 text-[9px] text-ink-400">oleh {item.by}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <EmptyState icon={Clock3} title="Belum ada aktivitas" description="Aktivitas karyawan akan tercatat otomatis." className="py-10" />
                )}
              </div>
            ) : null}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Kontak & Atasan" subtitle="Informasi koordinasi internal" icon={Users} />
            <div className="space-y-3 border-t border-line px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Mail className="h-3.5 w-3.5" /></span>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wide text-ink-400">Email</p>
                  <p className="truncate text-[11px] font-medium text-ink-800">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Phone className="h-3.5 w-3.5" /></span>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wide text-ink-400">Telepon</p>
                  <p className="truncate text-[11px] font-medium text-ink-800">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><UserRound className="h-3.5 w-3.5" /></span>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wide text-ink-400">Atasan langsung</p>
                  <p className="truncate text-[11px] font-medium text-ink-800">{employee.manager}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><MapPin className="h-3.5 w-3.5" /></span>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wide text-ink-400">Lokasi kerja</p>
                  <p className="truncate text-[11px] font-medium text-ink-800">{employee.location}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Kepatuhan Kustodian" subtitle="Ringkasan audit aset karyawan" icon={ShieldCheck} />
            <div className="border-t border-line px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-ink-500">Skor kepatuhan</span>
                <span className="text-[15px] font-semibold text-ink-900">{compliance}%</span>
              </div>
              <Progress value={compliance} tone={employee.grade === 'Grade A' ? 'teal' : employee.grade === 'Grade B' ? 'blue' : 'amber'} className="mt-1.5 h-2" />
              <div className="mt-3 space-y-2 text-[10.5px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-500">Aset ditugaskan</span>
                  <span className="font-semibold text-ink-800">{assignedAssets.length || employee.assets} unit</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-500">Nilai buku</span>
                  <span className="font-semibold text-ink-800">{formatCurrency(assetValue, { compact: true })}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-500">BAST terverifikasi</span>
                  <span className="font-semibold text-ink-800">{documents.filter((doc) => doc.status === 'Terverifikasi').length}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-500">Keterlambatan</span>
                  <span className={cn('font-semibold', late ? 'text-red-600' : 'text-emerald-600')}>{late} kejadian</span>
                </div>
              </div>
              <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-[9.5px] leading-relaxed text-ink-500">
                Grade {employee.grade.split(' ')[1]} diberikan berdasarkan kelengkapan BAST, ketepatan pengembalian, dan hasil audit fisik terakhir.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Aksi Cepat" subtitle="Tautan terkait karyawan" />
            <div className="space-y-1.5 border-t border-line px-3 py-3">
              <Button variant="ghost" size="sm" className="w-full justify-start" icon={Pencil} onClick={() => setEditOpen(true)}>
                Edit data karyawan
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" icon={Briefcase} to={`/assets?search=${encodeURIComponent(employee.name)}`}>
                Cari aset di data aset
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" icon={History} to="/borrowings">
                Buka daftar peminjaman
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" icon={Download} onClick={handleExportProfile}>
                Unduh profil karyawan
              </Button>
            </div>
          </Card>

          <Card className="bg-navy-900 p-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-brand-200">Kebijakan kustodian</p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
              Setiap aset yang ditugaskan harus diverifikasi minimal setahun sekali. Perubahan PIC wajib melalui BAST dan
              persetujuan Asset Manager.
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-brand-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Terakhir diaudit {formatDate(employee.joinDate)}
            </p>
          </Card>

          <p className="px-1 text-[9.5px] leading-relaxed text-ink-400">
            {formatNumber(employee.assets || 0)} unit tercatat pada direktori · avatar {initials(employee.name)} · data demo lokal.
          </p>
        </div>
      </div>

      <EmployeeFormModal
        open={editOpen}
        employee={employee}
        employees={employees}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        submitting={busy}
      />
    </div>
  )
}
