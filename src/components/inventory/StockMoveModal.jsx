import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowDownToLine, ArrowUpFromLine, Save, SlidersHorizontal } from 'lucide-react'
import { useMasterData } from '../../hooks/useMasterData'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Field, { Input, Select, Textarea } from '../ui/Field'
import { cn } from '../../utils/format'

const TYPE_META = {
  Masuk: { icon: ArrowDownToLine, note: 'Penerimaan barang dari vendor atau pengadaan.' },
  Keluar: { icon: ArrowUpFromLine, note: 'Distribusi barang ke unit kerja atau karyawan.' },
  Penyesuaian: { icon: SlidersHorizontal, note: 'Koreksi hasil stock opname (boleh negatif).' },
}

export default function StockMoveModal({
  open,
  onClose,
  items,
  initialType = 'Masuk',
  initialItemId = '',
  onSubmit,
  submitting = false,
}) {
  const { departments } = useMasterData()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: initialType,
      itemId: initialItemId,
      qty: 1,
      recipient: '',
      department: 'Information Technology',
      purpose: '',
      note: '',
    },
  })

  useEffect(() => {
    if (!open) return
    const defaultItem = initialItemId || items[0]?.id || ''
    reset({
      type: initialType,
      itemId: defaultItem,
      qty: 1,
      recipient: '',
      department: 'Information Technology',
      purpose: '',
      note: '',
    })
  }, [open, initialType, initialItemId, items, reset])

  const type = watch('type')
  const itemId = watch('itemId')
  const qty = Number(watch('qty')) || 0

  const selected = useMemo(() => items.find((item) => item.id === itemId), [items, itemId])
  const after = selected ? selected.stock + (type === 'Masuk' ? qty : type === 'Keluar' ? -qty : qty) : 0
  const available = selected?.stock ?? 0
  const insufficient = type === 'Keluar' && qty > available
  const invalidNegative = type !== 'Penyesuaian' && qty <= 0

  useEffect(() => {
    if (type === 'Masuk') setValue('department', 'Procurement')
    if (type === 'Keluar') setValue('department', 'Information Technology')
  }, [type, setValue])

  const submit = handleSubmit(async (values) => {
    if (insufficient) return
    await onSubmit({
      ...values,
      qty: Number(values.qty),
      department: values.department,
    })
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Catat Mutasi Stok"
      description="Setiap mutasi langsung memperbarui stok fisik dan tercatat pada audit log."
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button variant="primary" icon={Save} onClick={submit} loading={submitting} disabled={insufficient || invalidNegative}>
            Simpan transaksi
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-[12px] font-medium text-ink-700">Jenis mutasi <span className="text-red-500">*</span></p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(TYPE_META).map(([key, meta]) => {
              const Icon = meta.icon
              const active = type === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue('type', key, { shouldValidate: true })}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition',
                    active
                      ? 'border-navy-800 bg-navy-900 text-white shadow-sm'
                      : 'border-line bg-white text-ink-600 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <Icon className={cn('h-4 w-4', active ? 'text-brand-300' : 'text-ink-400')} />
                  <span className="text-[11.5px] font-semibold">{key}</span>
                </button>
              )
            })}
          </div>
          <p className="mt-1.5 text-[10.5px] text-ink-400">{TYPE_META[type]?.note}</p>
        </div>

        <Field label="Barang inventaris" htmlFor="move-item" required error={errors.itemId?.message} className="sm:col-span-2">
          <Select
            id="move-item"
            {...register('itemId', { required: 'Barang wajib dipilih.' })}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.sku}
              </option>
            ))}
          </Select>
        </Field>

        {selected ? (
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-line bg-slate-50/70 p-3 sm:col-span-2">
            <div>
              <p className="text-[9px] uppercase tracking-wide text-ink-400">Stok awal</p>
              <p className="mt-0.5 text-[14px] font-semibold text-ink-900">{available} {selected.unit}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-ink-400">Mutasi</p>
              <p className={cn('mt-0.5 text-[14px] font-semibold', type === 'Masuk' ? 'text-emerald-700' : type === 'Keluar' ? 'text-amber-700' : 'text-violet-700')}>
                {type === 'Masuk' ? '+' : type === 'Keluar' ? '−' : '±'}{Math.abs(qty)} {selected.unit}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-ink-400">Stok akhir</p>
              <p className={cn('mt-0.5 text-[14px] font-semibold', after < 0 ? 'text-red-600' : 'text-ink-900')}>
                {after} {selected.unit}
              </p>
            </div>
          </div>
        ) : null}

        <Field
          label="Jumlah mutasi"
          htmlFor="move-qty"
          required
          error={insufficient ? `Stok tidak mencukupi. Tersedia ${available} ${selected?.unit || ''}.` : errors.qty?.message}
          hint={type === 'Penyesuaian' ? 'Gunakan nilai negatif untuk mengurangi stok.' : `Maksimal ${available} ${selected?.unit || 'unit'} untuk mutasi keluar.`}
        >
          <Input
            id="move-qty"
            type="number"
            step="1"
            {...register('qty', {
              required: 'Jumlah wajib diisi.',
              valueAsNumber: true,
              validate: (value) =>
                type === 'Penyesuaian'
                  ? Number(value) !== 0 || 'Nilai penyesuaian tidak boleh nol.'
                  : Number(value) > 0 || 'Jumlah harus lebih dari nol.',
            })}
          />
        </Field>

        <Field label={type === 'Masuk' ? 'Pemasok / sumber' : 'Penerima'} htmlFor="move-recipient" required error={errors.recipient?.message}>
          <Input
            id="move-recipient"
            placeholder={type === 'Masuk' ? 'Nama vendor / supplier' : 'Nama karyawan penerima'}
            {...register('recipient', { required: 'Kolom ini wajib diisi.' })}
          />
        </Field>

        <Field label="Departemen / unit" htmlFor="move-department" required error={errors.department?.message}>
          <Select id="move-department" {...register('department', { required: 'Departemen wajib dipilih.' })}>
            <option value="Procurement">Procurement</option>
            <option value="Warehouse">Warehouse</option>
            {departments.map((department) => (
              <option key={department.id} value={department.name}>
                {department.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tujuan / keperluan" htmlFor="move-purpose" required error={errors.purpose?.message} className="sm:col-span-2">
          <Textarea
            id="move-purpose"
            rows={2}
            placeholder="Contoh: Cetak berkas onboarding karyawan baru kuartal IV."
            {...register('purpose', { required: 'Keperluan wajib diisi.', minLength: { value: 5, message: 'Uraikan minimal 5 karakter.' } })}
          />
        </Field>

        <Field label="Catatan tambahan" htmlFor="move-note" error={errors.note?.message} className="sm:col-span-2">
          <Input id="move-note" placeholder="Opsional, misal nomor surat jalan atau kondisi barang." {...register('note')} />
        </Field>
      </form>
    </Modal>
  )
}
