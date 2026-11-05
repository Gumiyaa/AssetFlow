import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeftRight,
  Boxes,
  ClipboardList,
  Download,
  History,
  PackageCheck,
  PackageMinus,
  PackagePlus,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useMasterData } from '../../hooks/useMasterData'
import { useTable } from '../../hooks/useTable'
import { cn, formatNumber } from '../../utils/format'
import { downloadCSV } from '../../utils/export'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card, { CardHeader } from '../../components/ui/Card'
import SearchInput from '../../components/ui/SearchInput'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Progress from '../../components/ui/Progress'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ItemFormModal from '../../components/inventory/ItemFormModal'
import StockMoveModal from '../../components/inventory/StockMoveModal'

const ALL = 'Semua'

export default function InventoryList() {
  const { inventory, actions } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const { locations } = useMasterData()
  const [category, setCategory] = useState(ALL)
  const [warehouse, setWarehouse] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [quick, setQuick] = useState(ALL)
  const [itemModal, setItemModal] = useState({ open: false, item: null })
  const [moveModal, setMoveModal] = useState({ open: false, type: 'Masuk', itemId: '' })
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const categories = useMemo(() => [...new Set(inventory.map((item) => item.category))], [inventory])
  const warehouses = useMemo(() => [...new Set(inventory.map((item) => item.location))], [inventory])

  const stats = useMemo(
    () => ({
      sku: inventory.length,
      totalStock: inventory.reduce((sum, item) => sum + item.stock, 0),
      low: inventory.filter((item) => item.status === 'Menipis').length,
      empty: inventory.filter((item) => item.status === 'Habis').length,
    }),
    [inventory],
  )

  const filtered = useMemo(
    () =>
      inventory.filter(
        (item) =>
          (category === ALL || item.category === category) &&
          (warehouse === ALL || item.location === warehouse) &&
          (status === ALL || item.status === status) &&
          (quick === ALL || item.status === quick),
      ),
    [inventory, category, warehouse, status, quick],
  )

  const table = useTable(filtered, {
    pageSize: 8,
    initialSort: { key: 'status', direction: 'asc' },
    searchFields: ['name', 'sku', 'category', 'location', 'rack', 'description'],
  })

  const resetFilters = () => {
    setCategory(ALL)
    setWarehouse(ALL)
    setStatus(ALL)
    setQuick(ALL)
    table.setQuery('')
  }

  const saveItem = async (values) => {
    setBusy(true)
    try {
      if (itemModal.item) {
        await actions.updateInventoryItem(itemModal.item.id, values)
        toast.success('Barang diperbarui', `${values.name} berhasil disimpan.`)
      } else {
        await actions.createInventoryItem(values)
        toast.success('Barang ditambahkan', `${values.name} masuk ke katalog inventaris.`)
      }
      setItemModal({ open: false, item: null })
    } catch (error) {
      toast.error('Gagal menyimpan barang', error.message)
    } finally {
      setBusy(false)
    }
  }

  const saveMutation = async (values) => {
    setBusy(true)
    try {
      const trx = await actions.createInventoryTransaction(values)
      toast.success(
        'Mutasi stok tercatat',
        `${values.type} ${Math.abs(values.qty)} ${trx.unit || ''} · ${trx.ref}`,
      )
      setMoveModal({ open: false, type: 'Masuk', itemId: '' })
    } catch (error) {
      toast.error('Mutasi gagal', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    setBusy(true)
    try {
      await actions.deleteInventoryItem(pendingDelete.id)
      toast.success('Barang dihapus', `${pendingDelete.name} telah dikeluarkan dari katalog.`)
      setPendingDelete(null)
    } catch (error) {
      toast.error('Gagal menghapus', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleExport = () => {
    downloadCSV(
      'assetflow-inventaris',
      [
        { label: 'SKU', key: 'sku' },
        { label: 'Nama Barang', key: 'name' },
        { label: 'Kategori', key: 'category' },
        { label: 'Satuan', key: 'unit' },
        { label: 'Stok', key: 'stock' },
        { label: 'Minimum', key: 'minStock' },
        { label: 'Gudang', key: 'location' },
        { label: 'Rak', key: 'rack' },
        { label: 'Status', key: 'status' },
      ],
      table.all,
    )
    toast.success('Ekspor selesai', `${table.all.length} baris inventaris diunduh sebagai CSV.`)
  }

  const columns = [
    {
      key: 'name',
      header: 'Barang',
      sortKey: 'name',
      className: 'min-w-[280px]',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              item.status === 'Habis' ? 'bg-red-50 text-red-600' : item.status === 'Menipis' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-ink-500',
            )}
          >
            {item.status === 'Habis' ? <PackageMinus className="h-4 w-4" /> : item.status === 'Menipis' ? <AlertTriangle className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-ink-900">{item.name}</p>
            <p className="mt-0.5 truncate text-[10px] text-ink-400">
              <span className="font-medium text-ink-500">{item.sku}</span> · {item.category}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stok vs Minimum',
      sortKey: 'stock',
      className: 'min-w-[165px]',
      render: (item) => {
        const pct = Math.min(100, Math.round((item.stock / Math.max(item.minStock, 1)) * 100))
        return (
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className={cn('text-[12px] font-semibold', item.stock === 0 ? 'text-red-600' : item.stock < item.minStock ? 'text-amber-600' : 'text-ink-900')}>
                {formatNumber(item.stock)} {item.unit}
              </span>
              <span className="text-[9.5px] text-ink-400">min. {item.minStock}</span>
            </div>
            <Progress
              value={item.stock === 0 ? 0 : pct}
              tone={item.stock === 0 ? 'red' : item.stock < item.minStock ? 'amber' : 'teal'}
              className="mt-1.5 h-1"
            />
          </div>
        )
      },
    },
    {
      key: 'location',
      header: 'Gudang / Rak',
      sortKey: 'location',
      className: 'min-w-[170px]',
      render: (item) => (
        <div>
          <p className="text-[11.5px] font-medium text-ink-700">{item.location}</p>
          <p className="mt-0.5 text-[10px] text-ink-400">{item.rack || 'Tanpa rak'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      className: 'min-w-[100px]',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      className: 'w-[120px]',
      render: (item) => (
        <div className="flex items-center justify-end gap-0.5" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMoveModal({ open: true, type: item.status === 'Aman' ? 'Keluar' : 'Masuk', itemId: item.id })}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-navy-700"
            aria-label={`Mutasi stok ${item.name}`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setItemModal({ open: true, item })}
            className="rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-blue-600"
            aria-label={`Ubah ${item.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(item)}
            className="rounded p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Hapus ${item.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ]

  const selectClass = 'select h-9 text-[11.5px]'
  const quickFilters = [
    { key: ALL, label: 'Semua barang', count: inventory.length },
    { key: 'Menipis', label: 'Stok menipis', count: stats.low },
    { key: 'Habis', label: 'Stok habis', count: stats.empty },
  ]

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Inventaris"
        title="Inventaris & Stok Barang"
        description="Pantau ketersediaan stok perlengkapan operasional, batas minimum, dan alokasi gudang penyimpanan secara real-time."
        actions={
          <>
            <Button variant="secondary" icon={History} to="/inventory/transactions">
              Riwayat Transaksi
            </Button>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Ekspor Data
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setItemModal({ open: true, item: null })}>
              Tambah Barang
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total Jenis Barang" value={formatNumber(stats.sku)} unit="SKU" icon={Boxes} tone="navy" note="kategori aktif" />
        <StatCard label="Total Stok Fisik" value={formatNumber(stats.totalStock)} unit="unit" icon={ClipboardList} tone="teal" note="akumulasi seluruh gudang" />
        <StatCard label="Stok Menipis" value={stats.low} unit="SKU" icon={AlertTriangle} tone="amber" note="di bawah batas minimum" />
        <StatCard label="Stok Habis" value={stats.empty} unit="SKU" icon={PackageMinus} tone="red" note="perlu restock segera" />
      </div>

      <Card className="mt-4 p-3">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center">
          <SearchInput
            value={table.query}
            onChange={table.setQuery}
            placeholder="Cari nama barang, SKU, atau gudang…"
            className="w-full xl:w-[290px]"
          />
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 xl:flex">
            <select value={category} onChange={(event) => setCategory(event.target.value)} className={selectClass} aria-label="Filter kategori">
              <option value={ALL}>Semua kategori</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={warehouse} onChange={(event) => setWarehouse(event.target.value)} className={selectClass} aria-label="Filter gudang">
              <option value={ALL}>Semua gudang</option>
              {warehouses.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className={selectClass} aria-label="Filter status">
              <option value={ALL}>Semua status</option>
              {['Aman', 'Menipis', 'Habis'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetFilters}>
            Reset
          </Button>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-line pt-2.5">
          <span className="mr-1 text-[10px] font-medium uppercase tracking-wide text-ink-400">Filter populer</span>
          {quickFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setQuick(filter.key)}
              className={cn('filter-chip', quick === filter.key && 'filter-chip-active')}
            >
              {filter.label}
              <span className={cn('rounded-full px-1.5 text-[9.5px]', quick === filter.key ? 'bg-white/20' : 'bg-slate-100 text-ink-500')}>
                {filter.count}
              </span>
            </button>
          ))}
          <span className="ml-auto text-[10px] text-ink-400">
            {locations.filter((location) => location.name.includes('Gudang')).length} fasilitas penyimpanan aktif
          </span>
        </div>
      </Card>

      <DataTable
        className="mt-3"
        tableClassName="min-w-[880px]"
        columns={columns}
        rows={table.rows}
        sort={table.sort}
        onSort={table.toggleSort}
        empty={{
          title: 'Barang tidak ditemukan',
          description: 'Tidak ada barang inventaris yang sesuai dengan pencarian atau filter saat ini.',
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
            label="barang"
          />
        }
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Barang Perlu Tindakan"
            subtitle="Prioritas pembelian ulang berdasarkan stok kritis"
            action={<Badge tone="warning">{stats.low + stats.empty} SKU</Badge>}
          />
          <div className="divide-y divide-line border-t border-line">
            {inventory
              .filter((item) => item.status !== 'Aman')
              .slice(0, 4)
              .map((item) => (
                <div key={item.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-semibold text-ink-900">{item.name}</p>
                    <p className="mt-0.5 text-[10px] text-ink-400">
                      {item.sku} · {item.location} · {item.rack}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:shrink-0">
                    <div className="w-24">
                      <Progress
                        value={(item.stock / Math.max(item.minStock, 1)) * 100}
                        tone={item.stock === 0 ? 'red' : 'amber'}
                        className="h-1.5"
                      />
                    </div>
                    <span className="w-20 text-right text-[11px] font-semibold text-ink-900">
                      {item.stock} / {item.minStock} {item.unit}
                    </span>
                    <Button
                      size="xs"
                      variant="secondary"
                      icon={PackagePlus}
                      onClick={() => setMoveModal({ open: true, type: 'Masuk', itemId: item.id })}
                    >
                      Restock
                    </Button>
                  </div>
                </div>
              ))}
            {stats.low + stats.empty === 0 ? (
              <p className="px-5 py-8 text-center text-[11.5px] text-ink-500">Seluruh stok berada di atas batas minimum.</p>
            ) : null}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="section-title">Ringkasan Pergudangan</h3>
          <div className="mt-3 space-y-3">
            {warehouses.map((location) => {
              const items = inventory.filter((item) => item.location === location)
              const units = items.reduce((sum, item) => sum + item.stock, 0)
              return (
                <div key={location}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[11px] text-ink-600">{location}</span>
                    <span className="shrink-0 text-[10.5px] font-semibold text-ink-900">{formatNumber(units)} unit</span>
                  </div>
                  <Progress value={(units / Math.max(stats.totalStock, 1)) * 100} tone="navy" className="mt-1 h-1" />
                </div>
              )
            })}
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={ClipboardList}
            className="mt-4 w-full"
            onClick={() => navigate('/inventory/transactions')}
          >
            Buka jurnal mutasi
          </Button>
        </Card>
      </div>

      <ItemFormModal
        open={itemModal.open}
        item={itemModal.item}
        items={inventory}
        onClose={() => setItemModal({ open: false, item: null })}
        onSubmit={saveItem}
        submitting={busy}
      />

      <StockMoveModal
        open={moveModal.open}
        items={inventory}
        initialType={moveModal.type}
        initialItemId={moveModal.itemId}
        onClose={() => setMoveModal({ open: false, type: 'Masuk', itemId: '' })}
        onSubmit={saveMutation}
        submitting={busy}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={busy}
        title="Hapus barang inventaris?"
        description={pendingDelete ? `${pendingDelete.name} (${pendingDelete.sku}) akan dihapus dari katalog. Mutasi lama tetap tersimpan pada jurnal.` : ''}
        confirmLabel="Hapus barang"
      />
    </div>
  )
}
