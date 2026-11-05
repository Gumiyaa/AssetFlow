import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowLeft, BookOpen, Check, ChevronRight, Info, Save, Sparkles } from 'lucide-react'
import { conditions } from '../../data/mockData'
import { useMasterData } from '../../hooks/useMasterData'
import { useData } from '../../context/DataContext'
import { formatCurrency, formatDate } from '../../utils/format'
import Card, { CardHeader } from '../../components/ui/Card'
import Field, { Input, Select, Textarea } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import AssetThumb from '../../components/ui/AssetThumb'
import Badge from '../../components/ui/Badge'

const STATUS_OPTIONS = ['Aktif', 'Tersedia', 'Dipinjam', 'Perbaikan', 'Afkir']

export default function AssetForm({ mode = 'create', asset, onSubmit, onCancel }) {
  const { assets, employees } = useData()
  const { categories, departments, locations } = useMasterData()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: asset?.name || '',
      category: asset?.category || 'Laptop & PC',
      brand: asset?.brand || '',
      model: asset?.model || '',
      serial: asset?.serial || '',
      description: asset?.description || '',
      purchaseDate: asset?.purchaseDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      purchasePrice: asset?.purchasePrice ?? '',
      supplier: asset?.supplier || '',
      invoice: asset?.invoice || '',
      warrantyMonths: asset?.warrantyMonths ?? 24,
      department: asset?.department || 'Information Technology',
      location: asset?.location || locations[0]?.name || '',
      pic: asset?.pic || '',
      condition: asset?.condition || 'Baik (Grade B)',
      status: asset?.status || 'Tersedia',
    },
  })

  const values = watch()
  const price = Number(values.purchasePrice) || 0
  const bookValue = Math.round(price * 0.8)
  const employeeNames = useMemo(() => employees.map((employee) => employee.name), [employees])

  const submit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader
              title="Informasi Utama Aset"
              subtitle="Identitas aset yang akan dicatat pada kartu inventaris."
              icon={Sparkles}
              border
            />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Nama aset" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
                <Input
                  id="name"
                  placeholder="Contoh: Lenovo ThinkPad E14 Gen 4"
                  className={errors.name && 'border-red-300 focus:border-red-400 focus:ring-red-100'}
                  {...register('name', { required: 'Nama aset wajib diisi.', minLength: { value: 3, message: 'Minimal 3 karakter.' } })}
                />
              </Field>

              <Field label="Kategori" htmlFor="category" required error={errors.category?.message}>
                <Select id="category" {...register('category', { required: 'Kategori wajib dipilih.' })}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Status aset" htmlFor="status" required error={errors.status?.message}>
                <Select id="status" {...register('status', { required: 'Status wajib dipilih.' })}>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Merek" htmlFor="brand" required error={errors.brand?.message}>
                <Input
                  id="brand"
                  placeholder="Contoh: Lenovo"
                  className={errors.brand && 'border-red-300'}
                  {...register('brand', { required: 'Merek wajib diisi.' })}
                />
              </Field>

              <Field label="Model / Tipe" htmlFor="model" required error={errors.model?.message}>
                <Input
                  id="model"
                  placeholder="Contoh: ThinkPad E14 Gen 4"
                  className={errors.model && 'border-red-300'}
                  {...register('model', { required: 'Model wajib diisi.' })}
                />
              </Field>

              <Field
                label="Nomor seri"
                htmlFor="serial"
                required
                error={errors.serial?.message}
                hint="Pastikan nomor seri unik dan sesuai label pabrikan."
              >
                <Input
                  id="serial"
                  placeholder="Contoh: LNV-2023-0941"
                  className={errors.serial && 'border-red-300'}
                  {...register('serial', {
                    required: 'Nomor seri wajib diisi.',
                    validate: (value) =>
                      [...assets.filter((item) => item.id !== asset?.id)].every(
                        (item) => item.serial.toLowerCase() !== value.toLowerCase(),
                      ) || 'Nomor seri sudah digunakan aset lain.',
                  })}
                />
              </Field>

              <Field
                label="Kondisi fisik"
                htmlFor="condition"
                required
                error={errors.condition?.message}
              >
                <Select id="condition" {...register('condition', { required: 'Kondisi wajib dipilih.' })}>
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Deskripsi & spesifikasi"
                htmlFor="description"
                className="sm:col-span-2"
                hint="Catat spesifikasi teknis, kelengkapan aksesori, atau catatan penting lainnya."
              >
                <Textarea id="description" rows={4} placeholder="Tuliskan spesifikasi singkat dan kelengkapan unit…" {...register('description')} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Data Perolehan & Garansi"
              subtitle="Informasi pengadaan untuk perhitungan nilai buku dan depresiasi."
              icon={BookOpen}
              border
            />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Tanggal perolehan" htmlFor="purchaseDate" required error={errors.purchaseDate?.message}>
                <Input
                  id="purchaseDate"
                  type="date"
                  className={errors.purchaseDate && 'border-red-300'}
                  {...register('purchaseDate', { required: 'Tanggal perolehan wajib diisi.' })}
                />
              </Field>

              <Field
                label="Harga perolehan (Rp)"
                htmlFor="purchasePrice"
                required
                error={errors.purchasePrice?.message}
                hint={price > 0 ? `Terbaca: ${formatCurrency(price)}` : 'Masukkan angka tanpa pemisah ribuan.'}
              >
                <Input
                  id="purchasePrice"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="16850000"
                  className={errors.purchasePrice && 'border-red-300'}
                  {...register('purchasePrice', {
                    required: 'Harga perolehan wajib diisi.',
                    min: { value: 1, message: 'Harga harus lebih dari nol.' },
                  })}
                />
              </Field>

              <Field label="Supplier / vendor" htmlFor="supplier">
                <Input id="supplier" placeholder="Contoh: PT Tera Data Indonusa Tbk" {...register('supplier')} />
              </Field>

              <Field label="Nomor invoice / PO" htmlFor="invoice">
                <Input id="invoice" placeholder="Contoh: PO-2023-03-0188" {...register('invoice')} />
              </Field>

              <Field label="Masa garansi" htmlFor="warrantyMonths">
                <Select id="warrantyMonths" {...register('warrantyMonths')}>
                  {[0, 6, 12, 24, 36, 48, 60].map((month) => (
                    <option key={month} value={month}>
                      {month === 0 ? 'Tanpa garansi' : `${month} bulan`}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Penempatan & Penanggung Jawab"
              subtitle="Tentukan lokasi fisik dan kustodian yang bertanggung jawab."
              icon={Check}
              border
            />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Departemen" htmlFor="department" required error={errors.department?.message}>
                <Select id="department" {...register('department', { required: 'Departemen wajib dipilih.' })}>
                  {departments.map((department) => (
                    <option key={department.id} value={department.name}>
                      {department.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Penanggung jawab (PIC)" htmlFor="pic" required error={errors.pic?.message}>
                <Input
                  id="pic"
                  list="employee-names"
                  placeholder="Ketik atau pilih nama karyawan"
                  className={errors.pic && 'border-red-300'}
                  {...register('pic', { required: 'Penanggung jawab wajib diisi.' })}
                />
                <datalist id="employee-names">
                  {employeeNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Field>

              <Field label="Lokasi penyimpanan" htmlFor="location" required error={errors.location?.message} className="sm:col-span-2">
                <Select id="location" {...register('location', { required: 'Lokasi wajib dipilih.' })}>
                  {locations.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name} · {location.building}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <div className="flex flex-col-reverse items-stretch justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3 sm:flex-row sm:items-center">
            <Button variant="ghost" icon={ArrowLeft} onClick={onCancel} type="button">
              Batal & kembali
            </Button>
            <Button variant="primary" icon={Save} type="submit" loading={isSubmitting}>
              {mode === 'edit' ? 'Simpan perubahan' : 'Simpan aset'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader title="Pratinjau Aset" subtitle="Tampilan kartu inventaris" />
            <div className="px-5 pb-5">
              <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-50">
                <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:14px_14px]" />
                <AssetThumb category={values.category} size="lg" className="h-24 w-24 rounded-2xl shadow-lg" iconSize="h-11 w-11" />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink-900">{values.name || 'Nama aset belum diisi'}</p>
                  <p className="mt-0.5 text-[10.5px] text-ink-400">
                    {values.brand || 'Merek'} · {values.model || 'Model'}
                  </p>
                </div>
                <Badge tone="info">{values.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="neutral">{values.category}</Badge>
                <Badge tone="teal">{values.condition?.split(' (')[0]}</Badge>
              </div>
              <dl className="mt-4 space-y-2 border-t border-line pt-3 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-400">Kode aset</dt>
                  <dd className="font-medium text-ink-800">{asset?.code || 'Dibuat otomatis'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-400">Lokasi</dt>
                  <dd className="max-w-[160px] truncate text-right font-medium text-ink-800">{values.location}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-400">Kustodian</dt>
                  <dd className="max-w-[160px] truncate text-right font-medium text-ink-800">{values.pic || '—'}</dd>
                </div>
              </dl>
            </div>
          </Card>

          <Card>
            <CardHeader title="Ringkasan Nilai" subtitle="Estimasi otomatis" />
            <div className="space-y-3 px-5 pb-5">
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-[9.5px] uppercase tracking-wide text-ink-400">Harga perolehan</p>
                <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.02em] text-ink-900">
                  {price ? formatCurrency(price) : 'Rp 0'}
                </p>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-ink-500">Nilai buku estimasi (80%)</span>
                <span className="font-medium text-ink-900">{formatCurrency(bookValue)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-ink-500">Masa garansi</span>
                <span className="font-medium text-ink-900">{values.warrantyMonths} bulan</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-ink-500">Tanggal perolehan</span>
                <span className="font-medium text-ink-900">{values.purchaseDate ? formatDate(values.purchaseDate) : '—'}</span>
              </div>
              <div className="flex gap-2 rounded-lg border border-brand-100 bg-brand-50/60 px-3 py-2 text-[10px] leading-relaxed text-brand-700">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Nilai buku final dihitung otomatis oleh modul depresiasi setelah aset disimpan.
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Panduan Pengisian" />
            <ul className="space-y-2.5 px-5 pb-5">
              {[
                'Gunakan nomor seri yang tertera pada label fisik aset.',
                'Lengkapi kategori agar perhitungan depresiasi akurat.',
                'Tetapkan kustodian agar alur serah terima tercatat.',
                'Unggah foto dan dokumen melalui halaman detail aset.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-500">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-5 py-3">
              <a href="mailto:support@assetflow.id" className="inline-flex items-center gap-1 text-[10.5px] font-medium text-navy-700 hover:underline">
                Butuh bantuan? Hubungi admin <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          </Card>

          {errors.name || errors.serial ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10.5px] leading-relaxed text-red-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Periksa kembali kolom bertanda merah sebelum menyimpan.
            </div>
          ) : null}
        </div>
      </div>
    </form>
  )
}
