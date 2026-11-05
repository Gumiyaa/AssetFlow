import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { PackagePlus, Save } from 'lucide-react'
import { useMasterData } from '../../hooks/useMasterData'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Field, { Input, Select, Textarea } from '../ui/Field'

const CATEGORIES = [
  'Kertas & ATK',
  'Alat Tulis Kantor',
  'Printer Consumable',
  'Kabel & Jaringan',
  'IT Peripherals',
  'Perlengkapan Kebersihan',
  'Konsumsi & Pantry',
]

export default function ItemFormModal({ open, onClose, item, items = [], onSubmit, submitting = false }) {
  const { locations, units } = useMasterData()
  const warehouses = useMemo(
    () => locations.filter((location) => location.name.includes('Gudang')),
    [locations],
  )
  const defaultWarehouse = warehouses[0]?.name || locations[0]?.name || 'Gudang Utama Lt. 1'
  const defaultUnit = units.some((unit) => unit.name === 'Pcs') ? 'Pcs' : units[0]?.name || 'Pcs'

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      sku: '',
      category: 'Kertas & ATK',
      unit: defaultUnit,
      stock: 0,
      minStock: 10,
      location: defaultWarehouse,
      rack: '',
      description: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: item?.name || '',
      sku: item?.sku || '',
      category: item?.category || 'Kertas & ATK',
      unit: item?.unit || defaultUnit,
      stock: item?.stock ?? 0,
      minStock: item?.minStock ?? 10,
      location: item?.location || defaultWarehouse,
      rack: item?.rack || '',
      description: item?.description || '',
    })
  }, [open, item, reset, defaultUnit, defaultWarehouse])

  const stock = Number(watch('stock')) || 0
  const minStock = Number(watch('minStock')) || 0
  const statusPreview = stock <= 0 ? 'Habis' : stock < minStock ? 'Menipis' : 'Aman'

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? 'Ubah Data Barang' : 'Tambah Barang Inventaris'}
      description={item ? 'Perbarui identitas, satuan, dan batas minimum stok barang.' : 'Daftarkan jenis barang habis pakai baru ke katalog gudang.'}
      icon={PackagePlus}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button variant="primary" icon={Save} onClick={submit} loading={submitting}>
            {item ? 'Simpan perubahan' : 'Simpan barang'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama barang" htmlFor="item-name" required error={errors.name?.message} className="sm:col-span-2">
          <Input
            id="item-name"
            placeholder="Contoh: Kertas HVS A4 70gr Sinar Dunia"
            {...register('name', { required: 'Nama barang wajib diisi.', minLength: { value: 3, message: 'Minimal 3 karakter.' } })}
          />
        </Field>

        <Field label="Kode SKU" htmlFor="item-sku" hint="Kosongkan untuk dibuat otomatis." error={errors.sku?.message}>
          <Input
            id="item-sku"
            placeholder="INV-ATK-021"
            className={errors.sku && 'border-red-300'}
            {...register('sku', {
              validate: (value) => {
                const code = String(value || '').trim().toLowerCase()
                if (!code) return true
                return (
                  items
                    .filter((entry) => entry.id !== item?.id)
                    .every((entry) => String(entry.sku || '').trim().toLowerCase() !== code) ||
                  'Kode SKU sudah digunakan oleh barang lain.'
                )
              },
            })}
          />
        </Field>

        <Field label="Kategori" htmlFor="item-category" required error={errors.category?.message}>
          <Select id="item-category" {...register('category', { required: 'Kategori wajib dipilih.' })}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Satuan" htmlFor="item-unit" required error={errors.unit?.message}>
          <Select id="item-unit" {...register('unit', { required: 'Satuan wajib dipilih.' })}>
            {units.map((unit) => (
              <option key={unit.id} value={unit.name}>
                {unit.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Gudang penyimpanan" htmlFor="item-location" required error={errors.location?.message}>
          <Select id="item-location" {...register('location', { required: 'Gudang wajib dipilih.' })}>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.name}>
                {warehouse.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Stok saat ini"
          htmlFor="item-stock"
          required
          error={errors.stock?.message}
          hint={`Status otomatis: ${statusPreview}.`}
        >
          <Input
            id="item-stock"
            type="number"
            min="0"
            {...register('stock', {
              required: 'Stok wajib diisi.',
              min: { value: 0, message: 'Stok tidak boleh negatif.' },
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field label="Batas minimum stok" htmlFor="item-min" required error={errors.minStock?.message}>
          <Input
            id="item-min"
            type="number"
            min="0"
            {...register('minStock', {
              required: 'Batas minimum wajib diisi.',
              min: { value: 0, message: 'Batas minimum tidak boleh negatif.' },
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field label="Rak / posisi" htmlFor="item-rack" hint="Contoh: Rak A-02 atau Lemari B-1." error={errors.rack?.message}>
          <Input id="item-rack" placeholder="Rak A-02" {...register('rack')} />
        </Field>

        <Field label="Deskripsi" htmlFor="item-description" className="sm:col-span-2" error={errors.description?.message}>
          <Textarea
            id="item-description"
            rows={3}
            placeholder="Keterangan penggunaan, spesifikasi, atau catatan pengadaan."
            {...register('description')}
          />
        </Field>
      </form>
    </Modal>
  )
}
