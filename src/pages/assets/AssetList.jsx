import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Archive,
  Boxes,
  Download,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Wallet,
  Wrench,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { conditions } from '../../data/mockData'
import { useMasterData } from '../../hooks/useMasterData'
import { useTable } from '../../hooks/useTable'
import { conditionTone, formatCompact, formatCurrency, formatDate, formatNumber } from '../../utils/format'
import { downloadCSV } from '../../utils/export'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import SearchInput from '../../components/ui/SearchInput'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import AssetThumb from '../../components/ui/AssetThumb'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const ALL = 'Semua'

export default function AssetList() {
  const { assets, actions } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const { categories, departments, locations } = useMasterData()
  const [category, setCategory] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [department, setDepartment] = useState(ALL)
  const [location, setLocation] = useState(ALL)
  const [condition, setCondition] = useState(ALL)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(
    () =>
      assets.filter(
        (asset) =>
          (category === ALL || asset.category === category) &&
          (status === ALL || asset.status === status) &&
          (department === ALL || asset.department === department) &&
          (location === ALL || asset.location === location) &&
          (condition === ALL || asset.condition === condition),
      ),
    [assets, category, status, department, location, condition],
  )

  const table = useTable(filtered, {
    pageSize: 8,
    initialSort: { key: 'purchaseDate', direction: 'desc' },
    searchFields: ['name', 'code', 'serial', 'brand', 'model', 'pic', 'department', 'location'],
  })

  const stats = useMemo(() => {
    const totalValue = assets.reduce((sum, asset) => sum + Number(asset.purchasePrice || 0), 0)
    return {
      total: assets.length,
      value: totalValue,
      repair: assets.filter((asset) => asset.status === 'Perbaikan').length,
      inactive: assets.filter((asset) => ['Afkir', 'Tidak Aktif'].includes(asset.status)).length,
    }
  }, [assets])

  const activeFilters = [category, status, department, location, condition].filter((value) => value !== ALL).length

  const resetFilters = () => {
    setCategory(ALL)
    setStatus(ALL)
    setDepartment(ALL)
    setLocation(ALL)
    setCondition(ALL)
    table.setQuery('')
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await actions.deleteAsset(pendingDelete.id)
      toast.success('Aset dihapus', `${pendingDelete.name} telah dihapus dari daftar aktif.`)
      setPendingDelete(null)
    } catch (error) {
      toast.error('Gagal menghapus aset', error.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = () => {
    downloadCSV(
      'assetflow-daftar-aset',
      [
        { label: 'Kode Aset', key: 'code' },
        { label: 'Nama Aset', key: 'name' },
        { label: 'Kategori', key: 'category' },
        { label: 'Merek', key: 'brand' },
        { label: 'Model', key: 'model' },
        { label: 'Nomor Seri', key: 'serial' },
        { label: 'Departemen', key: 'department' },
        { label: 'Penanggung Jawab', key: 'pic' },
        { label: 'Lokasi', key: 'location' },
        { label: 'Kondisi', key: 'condition' },
        { label: 'Status', key: 'status' },
        { label: 'Tanggal Perolehan', value: (row) => formatDate(row.purchaseDate) },
        { label: 'Harga Perolehan', key: 'purchasePrice' },
      ],
      table.all,
    )
    toast.success('Ekspor selesai', `${table.all.length} baris aset diunduh sebagai CSV.`)
  }

  const columns = [
    {
      key: 'name',
      header: 'Aset',
      sortKey: 'name',
      className: 'min-w-[250px]',
      render: (asset) => (
        <div className="flex items-center gap-2.5">
          <AssetThumb category={asset.category} size="md" />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-ink-900">{asset.name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-ink-400">
              <span className="font-medium text-ink-500">{asset.code}</span>
              <span className="h-2 w-px bg-line" />
              <span className="truncate">{asset.serial}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      sortKey: 'category',
      className: 'min-w-[140px]',
      render: (asset) => <span className="text-[11.5px] text-ink-600">{asset.category}</span>,
    },
    {
      key: 'department',
      header: 'Departemen / PIC',
      sortKey: 'department',
      className: 'min-w-[180px]',
      render: (asset) => (
        <div>
          <p className="text-[11.5px] font-medium text-ink-800">{asset.department}</p>
          <p className="mt-0.5 text-[10px] text-ink-400">{asset.pic}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Lokasi',
      className: 'min-w-[170px]',
      render: (asset) => <span className="line-clamp-2 text-[11px] leading-relaxed text-ink-500">{asset.location}</span>,
    },
    {
      key: 'condition',
      header: 'Kondisi',
      className: 'min-w-[120px]',
      render: (asset) => <Badge tone={conditionTone(asset.condition)}>{asset.condition?.split(' (')[0]}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      className: 'min-w-[110px]',
      render: (asset) => <StatusBadge status={asset.status} />,
    },
    {
      key: 'purchasePrice',
      header: 'Nilai Perolehan',
      sortKey: 'purchasePrice',
      align: 'right',
      className: 'min-w-[130px]',
      render: (asset) => (
        <div>
          <p className="text-[11.5px] font-semibold text-ink-900">{formatCurrency(asset.purchasePrice)}</p>
          <p className="mt-0.5 text-[9.5px] text-ink-400">NBV {formatCurrency(asset.bookValue, { compact: true })}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      className: 'w-[110px]',
      render: (asset) => (
        <div className="flex items-center justify-end gap-0.5" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={() => navigate(`/assets/${asset.id}`)}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-navy-700"
            aria-label={`Lihat detail ${asset.name}`}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/assets/${asset.id}/edit`)}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-blue-600"
            aria-label={`Edit ${asset.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(asset)}
            className="rounded p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Hapus ${asset.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  const selectClass = 'select h-9 text-[11.5px]'

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Manajemen Aset"
        title="Data Aset"
        description="Kelola seluruh aset perusahaan: identitas, nilai perolehan, penempatan, kondisi, dan status kustodian."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Ekspor CSV
            </Button>
            <Button variant="primary" icon={Plus} to="/assets/create">
              Registrasi Aset
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total Aset" value={formatNumber(stats.total)} unit="unit" icon={Boxes} tone="navy" note="terdaftar pada demo ini" />
        <StatCard label="Nilai Perolehan" value={formatCurrency(stats.value, { compact: true })} icon={Wallet} tone="teal" delta={2.4} note="akumulasi seluruh unit" />
        <StatCard label="Dalam Perbaikan" value={stats.repair} unit="unit" icon={Wrench} tone="amber" note="menunggu penyelesaian teknisi" />
        <StatCard label="Afkir / Tidak Aktif" value={stats.inactive} unit="unit" icon={Archive} tone="red" note="perlu proses disposal" />
      </div>

      <Card className="mt-4 p-3">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center">
          <div className="flex items-center gap-2">
            <SearchInput
              value={table.query}
              onChange={table.setQuery}
              placeholder="Cari nama, kode, seri, atau PIC…"
              className="w-full xl:w-[290px]"
            />
            {activeFilters > 0 ? <Badge tone="teal">{activeFilters} filter</Badge> : null}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex xl:flex-1">
            <select value={category} onChange={(event) => setCategory(event.target.value)} className={selectClass} aria-label="Filter kategori">
              <option value={ALL}>Semua kategori</option>
              {categories.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className={selectClass} aria-label="Filter status">
              <option value={ALL}>Semua status</option>
              {['Aktif', 'Tersedia', 'Dipinjam', 'Perbaikan', 'Afkir'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={department} onChange={(event) => setDepartment(event.target.value)} className={selectClass} aria-label="Filter departemen">
              <option value={ALL}>Semua departemen</option>
              {departments.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
            <select value={location} onChange={(event) => setLocation(event.target.value)} className={selectClass} aria-label="Filter lokasi">
              <option value={ALL}>Semua lokasi</option>
              {locations.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
            <select value={condition} onChange={(event) => setCondition(event.target.value)} className={selectClass} aria-label="Filter kondisi">
              <option value={ALL}>Semua kondisi</option>
              {conditions.map((item) => (
                <option key={item.id ?? item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetFilters} className="justify-start xl:justify-center">
            Reset
          </Button>
        </div>
      </Card>

      <DataTable
        className="mt-3"
        tableClassName="min-w-[1120px]"
        columns={columns}
        rows={table.rows}
        sort={table.sort}
        onSort={table.toggleSort}
        onRowClick={(asset) => navigate(`/assets/${asset.id}`)}
        empty={{
          title: 'Aset tidak ditemukan',
          description: 'Tidak ada aset yang sesuai dengan pencarian atau kombinasi filter saat ini.',
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
            label="aset"
          />
        }
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-ink-400">
        <span>Menampilkan {formatNumber(filtered.length)} dari {formatNumber(assets.length)} aset pada penyimpanan demo.</span>
        <span>Klik baris untuk membuka detail aset · Gunakan ikon pensil untuk mengubah data.</span>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus aset dari daftar?"
        description={pendingDelete ? `${pendingDelete.name} (${pendingDelete.code}) akan dihapus. Riwayat transaksi terkait tetap tersimpan pada log demo.` : ''}
        confirmLabel="Hapus aset"
      >
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-800">
          <Archive className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Untuk aset yang sudah tidak digunakan, pertimbangkan mengubah status menjadi “Afkir” agar jejak audit tetap utuh.
        </div>
      </ConfirmDialog>
    </div>
  )
}
