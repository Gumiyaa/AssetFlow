import { useMemo, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Download,
  FileSearch,
  Package,
  Plus,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useMasterData } from '../../hooks/useMasterData'
import { useTable } from '../../hooks/useTable'
import { cn, formatDate, formatNumber } from '../../utils/format'
import { downloadCSV } from '../../utils/export'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import SearchInput from '../../components/ui/SearchInput'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import StockMoveModal from '../../components/inventory/StockMoveModal'

const ALL = 'Semua'
const TYPE_TONES = { Masuk: 'success', Keluar: 'warning', Penyesuaian: 'info' }
const TYPE_ICONS = { Masuk: ArrowDownToLine, Keluar: ArrowUpFromLine, Penyesuaian: SlidersHorizontal }

export default function InventoryTransactions() {
  const { transactions, inventory, actions } = useData()
  const toast = useToast()
  const { departments } = useMasterData()
  const [type, setType] = useState(ALL)
  const [department, setDepartment] = useState(ALL)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [moveModal, setMoveModal] = useState({ open: false, type: 'Masuk' })
  const [detail, setDetail] = useState(null)
  const [busy, setBusy] = useState(false)

  const counts = useMemo(
    () => ({
      all: transactions.length,
      Masuk: transactions.filter((item) => item.type === 'Masuk').length,
      Keluar: transactions.filter((item) => item.type === 'Keluar').length,
      Penyesuaian: transactions.filter((item) => item.type === 'Penyesuaian').length,
    }),
    [transactions],
  )

  const stats = useMemo(() => {
    const inbound = transactions.filter((item) => item.type === 'Masuk').reduce((sum, item) => sum + item.qty, 0)
    const outbound = transactions.filter((item) => item.type === 'Keluar').reduce((sum, item) => sum + item.qty, 0)
    return { inbound, outbound, net: inbound - outbound }
  }, [transactions])

  const filtered = useMemo(
    () =>
      transactions.filter((item) => {
        if (type !== ALL && item.type !== type) return false
        if (department !== ALL && item.department !== department) return false
        const day = String(item.date).slice(0, 10)
        if (from && day < from) return false
        if (to && day > to) return false
        return true
      }),
    [transactions, type, department, from, to],
  )

  const table = useTable(filtered, {
    pageSize: 8,
    initialSort: { key: 'date', direction: 'desc' },
    searchFields: [
      'id',
      'ref',
      'type',
      'recipient',
      'department',
      'purpose',
      'note',
      (item) => inventory.find((entry) => entry.id === item.itemId)?.name,
      (item) => inventory.find((entry) => entry.id === item.itemId)?.sku,
    ],
  })

  const resetFilters = () => {
    setType(ALL)
    setDepartment(ALL)
    setFrom('')
    setTo('')
    table.setQuery('')
  }

  const itemOf = (trx) => inventory.find((entry) => entry.id === trx.itemId)

  const saveMutation = async (values) => {
    setBusy(true)
    try {
      const trx = await actions.createInventoryTransaction(values)
      toast.success('Mutasi baru tercatat', `${trx.id} · ${values.type} ${Math.abs(values.qty)} ${trx.unit || 'unit'}`)
      setMoveModal({ open: false, type: 'Masuk' })
    } catch (error) {
      toast.error('Mutasi gagal', error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleExport = () => {
    downloadCSV(
      'assetflow-mutasi-stok',
      [
        { label: 'ID Transaksi', key: 'id' },
        { label: 'Tipe', key: 'type' },
        { label: 'Tanggal', value: (row) => formatDate(row.date, { withTime: true }) },
        { label: 'Barang', value: (row) => itemOf(row)?.name || row.itemName || '' },
        { label: 'SKU', value: (row) => itemOf(row)?.sku || row.itemId },
        { label: 'Jumlah', key: 'qty' },
        { label: 'Stok Awal', key: 'before' },
        { label: 'Stok Akhir', key: 'after' },
        { label: 'Penerima', key: 'recipient' },
        { label: 'Departemen', key: 'department' },
        { label: 'Referensi', key: 'ref' },
        { label: 'Status', key: 'status' },
      ],
      table.all,
    )
    toast.success('Rekap mutasi diunduh', `${table.all.length} transaksi diekspor sebagai CSV.`)
  }

  const columns = [
    {
      key: 'id',
      header: 'Transaksi',
      sortKey: 'id',
      className: 'min-w-[170px]',
      render: (trx) => {
        const Icon = TYPE_ICONS[trx.type] || ArrowLeftRight
        return (
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                trx.type === 'Masuk' ? 'bg-emerald-50 text-emerald-600' : trx.type === 'Keluar' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600',
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-semibold text-ink-900">{trx.id}</p>
              <p className="mt-0.5 text-[10px] text-ink-400">{trx.ref}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'type',
      header: 'Tipe',
      sortKey: 'type',
      className: 'min-w-[120px]',
      render: (trx) => (
        <div>
          <Badge tone={TYPE_TONES[trx.type]} dot>{trx.type}</Badge>
          <p className="mt-1 text-[9.5px] text-ink-400">{formatDate(trx.date, { withTime: true })}</p>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Barang & SKU',
      className: 'min-w-[230px]',
      render: (trx) => {
        const item = itemOf(trx)
        return (
          <div>
            <p className="text-[11.5px] font-medium text-ink-800">{item?.name || trx.itemName || 'Barang tidak ditemukan'}</p>
            <p className="mt-0.5 text-[9.5px] text-ink-400">{item?.sku || trx.itemId} · {item?.unit || trx.unit || 'unit'}</p>
          </div>
        )
      },
    },
    {
      key: 'before',
      header: 'Perubahan Stok',
      align: 'center',
      className: 'min-w-[140px]',
      render: (trx) => (
        <div className="inline-flex items-center gap-1.5">
          <span className="text-[11px] text-ink-500">{trx.before}</span>
          <span className="text-ink-300">→</span>
          <span className="text-[12px] font-semibold text-ink-900">{trx.after}</span>
          <span
            className={cn(
              'ml-0.5 rounded px-1 py-0.5 text-[9.5px] font-semibold',
              trx.qty > 0 ? 'bg-emerald-50 text-emerald-700' : trx.qty < 0 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-ink-500',
            )}
          >
            {trx.qty > 0 ? '+' : ''}{trx.qty}
          </span>
        </div>
      ),
    },
    {
      key: 'recipient',
      header: 'Penerima / Divisi',
      sortKey: 'recipient',
      className: 'min-w-[170px]',
      render: (trx) => (
        <div>
          <p className="text-[11px] font-medium text-ink-800">{trx.recipient}</p>
          <p className="mt-0.5 text-[9.5px] text-ink-400">{trx.department}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'min-w-[110px]',
      render: (trx) => <StatusBadge status={trx.status} />,
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      className: 'w-[90px]',
      render: (trx) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setDetail(trx)
          }}
          className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10.5px] font-medium text-navy-700 transition hover:bg-slate-100"
        >
          <FileSearch className="h-3.5 w-3.5" /> Detail
        </button>
      ),
    },
  ]

  const selectClass = 'select h-9 text-[11.5px]'
  const typeTabs = [
    { key: ALL, label: 'Semua Transaksi', count: counts.all },
    { key: 'Masuk', label: 'Barang Masuk', count: counts.Masuk },
    { key: 'Keluar', label: 'Barang Keluar', count: counts.Keluar },
    { key: 'Penyesuaian', label: 'Penyesuaian', count: counts.Penyesuaian },
  ]

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Inventaris"
        title="Transaksi Stok Inventaris"
        description="Catat dan audit mutasi keluar masuk barang persediaan, pengadaan supplier, serta distribusi ke unit kerja."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Ekspor Rekap
            </Button>
            <Button variant="secondary" icon={Plus} onClick={() => setMoveModal({ open: true, type: 'Masuk' })}>
              Catat Barang Masuk
            </Button>
            <Button variant="primary" icon={ArrowUpFromLine} onClick={() => setMoveModal({ open: true, type: 'Keluar' })}>
              Catat Barang Keluar
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total Mutasi" value={formatNumber(transactions.length)} unit="transaksi" icon={ArrowLeftRight} tone="navy" note="jurnal stok demo" />
        <StatCard label="Barang Masuk" value={formatNumber(stats.inbound)} unit="unit" icon={ArrowDownToLine} tone="teal" note={`${counts.Masuk} transaksi penerimaan`} />
        <StatCard label="Distribusi Keluar" value={formatNumber(stats.outbound)} unit="unit" icon={ArrowUpFromLine} tone="amber" note={`${counts.Keluar} transaksi keluar`} />
        <StatCard label="Penyesuaian Opname" value={counts.Penyesuaian} unit="koreksi" icon={SlidersHorizontal} tone="purple" note="selisih stok fisik" />
      </div>

      <Card className="mt-4 p-3">
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          {typeTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setType(tab.key)}
              className={cn('filter-chip', type === tab.key && 'filter-chip-active')}
            >
              {tab.label}
              <span className={cn('rounded-full px-1.5 text-[9.5px]', type === tab.key ? 'bg-white/20' : 'bg-slate-100 text-ink-500')}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2.5 border-t border-line pt-2.5 xl:flex-row xl:items-center">
          <SearchInput
            value={table.query}
            onChange={table.setQuery}
            placeholder="Cari ID transaksi, barang, penerima, atau referensi…"
            className="w-full xl:w-[320px]"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex xl:flex-1">
            <select value={department} onChange={(event) => setDepartment(event.target.value)} className={selectClass} aria-label="Filter departemen">
              <option value={ALL}>Semua divisi</option>
              <option value="Procurement">Procurement</option>
              <option value="Warehouse">Warehouse</option>
              {departments.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className={selectClass} aria-label="Tanggal awal" />
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className={selectClass} aria-label="Tanggal akhir" />
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetFilters} className="justify-start xl:justify-center">
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <DataTable
        className="mt-3"
        tableClassName="min-w-[1050px]"
        columns={columns}
        rows={table.rows}
        sort={table.sort}
        onSort={table.toggleSort}
        onRowClick={(trx) => setDetail(trx)}
        empty={{
          title: 'Transaksi tidak ditemukan',
          description: 'Tidak ada mutasi stok yang sesuai dengan pencarian atau rentang tanggal saat ini.',
          action: (
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" variant="secondary" icon={RotateCcw} onClick={resetFilters}>Reset filter</Button>
              <Button size="sm" variant="primary" icon={Plus} onClick={() => setMoveModal({ open: true, type: 'Masuk' })}>Catat transaksi</Button>
            </div>
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
            label="transaksi"
          />
        }
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-ink-400">
        <span>Setiap transaksi memiliki pasangan surat jalan dan audit perubahan stok.</span>
        <span>Nilai bersih mutasi: {stats.net >= 0 ? '+' : ''}{formatNumber(stats.net)} unit</span>
      </div>

      <StockMoveModal
        open={moveModal.open}
        items={inventory}
        initialType={moveModal.type}
        onClose={() => setMoveModal({ open: false, type: 'Masuk' })}
        onSubmit={saveMutation}
        submitting={busy}
      />

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `Detail ${detail.id}` : 'Detail transaksi'}
        description={detail ? `${detail.type} · ${detail.ref}` : ''}
        size="lg"
        footer={<Button variant="secondary" onClick={() => setDetail(null)}>Tutup</Button>}
      >
        {detail ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-line bg-slate-50/60 p-4 sm:flex-row sm:items-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-navy-700 ring-1 ring-line">
                <Package className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink-900">{itemOf(detail)?.name || detail.itemName || 'Barang'}</p>
                <p className="text-[10.5px] text-ink-400">
                  {itemOf(detail)?.sku || detail.itemId} · {formatDate(detail.date, { withTime: true })} WIB
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={TYPE_TONES[detail.type]} dot>{detail.type}</Badge>
                <StatusBadge status={detail.status} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-line p-3">
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Stok awal</p>
                <p className="mt-1 text-[18px] font-semibold text-ink-900">{detail.before}</p>
              </div>
              <div className="rounded-lg border border-line p-3">
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Mutasi</p>
                <p className={cn('mt-1 text-[18px] font-semibold', detail.qty > 0 ? 'text-emerald-700' : detail.qty < 0 ? 'text-red-600' : 'text-ink-900')}>
                  {detail.qty > 0 ? '+' : ''}{detail.qty}
                </p>
              </div>
              <div className="rounded-lg border border-line p-3">
                <p className="text-[9px] uppercase tracking-wide text-ink-400">Stok akhir</p>
                <p className="mt-1 text-[18px] font-semibold text-ink-900">{detail.after}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Penerima / sumber', detail.recipient],
                ['Departemen', detail.department],
                ['Petugas gudang', detail.officer],
                ['Lokasi penyimpanan', detail.location],
                ['Nomor referensi', detail.ref],
                ['Catatan', detail.note],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
                  <p className="mt-0.5 text-[11.5px] font-medium leading-relaxed text-ink-800">{value || '—'}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-line p-3.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-400">Tujuan / keperluan</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-600">{detail.purpose || '—'}</p>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-[10px] text-ink-400">
              <span className="inline-flex items-center gap-1.5"><FileSearch className="h-3.5 w-3.5" /> Bukti digital terverifikasi</span>
              <button
                type="button"
                className="font-medium text-navy-700 hover:underline"
                onClick={() => toast.info('Bukti transaksi', 'Pada demo, surat jalan dan tanda tangan digital ditampilkan sebagai data contoh.')}
              >
                Lihat surat jalan
              </button>
            </div>
          </div>
        ) : (
          <EmptyState icon={FileSearch} title="Transaksi tidak ditemukan" />
        )}
      </Modal>
    </div>
  )
}
