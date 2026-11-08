import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { CalendarDays, Handshake, UserRound } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Field, { Input, Select, Textarea } from '../ui/Field'
import Avatar from '../ui/Avatar'
import AssetThumb from '../ui/AssetThumb'
import Badge from '../ui/Badge'
import { formatDateInput } from '../../utils/format'

const PRIORITIES = [
  'Regular / Kantor',
  'Prioritas Tinggi',
  'Proyek Luar Kota',
  'Meeting Klien',
  'Workshop Karyawan',
  'Audit Pajak Lapangan',
  'Presentasi Direktur',
  'Proyek Internal',
  'Inspeksi Jaringan',
  'Distribusi Logistik',
]

function offsetDate(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDateInput(date)
}

const emptyValues = {
  employeeId: '',
  assetId: '',
  borrowDate: offsetDate(0),
  dueDate: offsetDate(3),
  priority: 'Regular / Kantor',
  purpose: '',
  conditionOut: 'Lengkap (sesuai checklist serah terima)',
  notes: '',
}

export default function BorrowingFormModal({ open, onClose, onSubmit, submitting, employees, assets, borrowings = [] }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: emptyValues })

  useEffect(() => {
    if (open) reset(emptyValues)
  }, [open, reset])

  const employeeId = watch('employeeId')
  const assetId = watch('assetId')
  const borrowDate = watch('borrowDate')

  const employee = useMemo(() => employees.find((item) => item.id === employeeId), [employees, employeeId])
  const asset = useMemo(() => assets.find((item) => item.id === assetId), [assets, assetId])
  const availableAssets = useMemo(() => {
    const activeStatuses = ['Menunggu Persetujuan', 'Disetujui', 'Sedang Dipinjam', 'Terlambat']
    const busyAssetIds = new Set(
      borrowings.filter((item) => activeStatuses.includes(item.status)).map((item) => item.assetId),
    )
    return assets.filter(
      (item) =>
        ['Tersedia', 'Aktif'].includes(item.status) &&
        !busyAssetIds.has(item.id) &&
        !busyAssetIds.has(item.code),
    )
  }, [assets, borrowings])

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      borrowDate: new Date(`${values.borrowDate}T09:00:00`).toISOString(),
      dueDate: new Date(`${values.dueDate}T17:00:00`).toISOString(),
    })
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajukan Peminjaman Baru"
      description="Lengkapi data pemohon, aset, dan periode pemakaian. Pengajuan akan masuk ke antrean persetujuan."
      size="lg"
      icon={Handshake}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button variant="primary" type="submit" form="borrowing-form" loading={submitting}>
            Kirim pengajuan
          </Button>
        </>
      }
    >
      <form id="borrowing-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Karyawan pemohon" htmlFor="employeeId" required error={errors.employeeId?.message} className="sm:col-span-2">
          <Select
            id="employeeId"
            className={errors.employeeId && 'border-red-300'}
            {...register('employeeId', { required: 'Pilih karyawan pemohon.' })}
          >
            <option value="">Pilih karyawan…</option>
            {employees.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.id} · {item.department}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Aset yang dipinjam" htmlFor="assetId" required error={errors.assetId?.message} className="sm:col-span-2">
          <Select
            id="assetId"
            className={errors.assetId && 'border-red-300'}
            {...register('assetId', { required: 'Pilih aset yang akan dipinjam.' })}
          >
            <option value="">Pilih aset…</option>
            {availableAssets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.code} · {item.status}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tanggal pinjam" htmlFor="borrowDate" required error={errors.borrowDate?.message}>
          <Input
            id="borrowDate"
            type="date"
            className={errors.borrowDate && 'border-red-300'}
            {...register('borrowDate', { required: 'Tanggal pinjam wajib diisi.' })}
          />
        </Field>

        <Field
          label="Target pengembalian"
          htmlFor="dueDate"
          required
          error={errors.dueDate?.message}
          hint="Minimal satu hari setelah tanggal pinjam."
        >
          <Input
            id="dueDate"
            type="date"
            className={errors.dueDate && 'border-red-300'}
            {...register('dueDate', {
              required: 'Target pengembalian wajib diisi.',
              validate: (value) =>
                !borrowDate || value >= borrowDate || 'Target pengembalian harus setelah tanggal pinjam.',
            })}
          />
        </Field>

        <Field label="Prioritas / jenis keperluan" htmlFor="priority" required error={errors.priority?.message}>
          <Select id="priority" {...register('priority', { required: 'Prioritas wajib dipilih.' })}>
            {PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Kondisi serah terima" htmlFor="conditionOut" error={errors.conditionOut?.message}>
          <Input id="conditionOut" placeholder="Lengkap (unit + charger + tas)" {...register('conditionOut')} />
        </Field>

        <Field
          label="Justifikasi & keperluan"
          htmlFor="purpose"
          required
          error={errors.purpose?.message}
          className="sm:col-span-2"
          hint="Jelaskan tujuan pemakaian, lokasi, dan durasi kebutuhan aset."
        >
          <Textarea
            id="purpose"
            rows={3}
            placeholder="Contoh: Presentasi proposal proyek di kantor cabang Bandung selama 2 hari kerja…"
            className={errors.purpose && 'border-red-300'}
            {...register('purpose', {
              required: 'Justifikasi peminjaman wajib diisi.',
              minLength: { value: 15, message: 'Mohon tuliskan minimal 15 karakter.' },
            })}
          />
        </Field>

        <Field label="Catatan tambahan" htmlFor="notes" className="sm:col-span-2">
          <Textarea id="notes" rows={2} placeholder="Opsional — aksesori khusus, kebutuhan pengiriman, atau catatan atasan…" {...register('notes')} />
        </Field>

        {employee || asset ? (
          <div className="grid gap-3 rounded-xl border border-line bg-slate-50/70 p-3 sm:col-span-2 sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              {employee ? (
                <>
                  <Avatar name={employee.name} initials={employee.initials} color={employee.avatarColor} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] font-semibold text-ink-900">{employee.name}</p>
                    <p className="truncate text-[10px] text-ink-500">
                      {employee.position} · {employee.department}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-ink-400">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <p className="text-[10.5px] text-ink-400">Pemohon belum dipilih</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              {asset ? (
                <>
                  <AssetThumb category={asset.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-semibold text-ink-900">{asset.name}</p>
                    <p className="truncate text-[10px] text-ink-500">
                      {asset.code} · {asset.location}
                    </p>
                  </div>
                  <Badge tone={asset.status === 'Tersedia' ? 'success' : 'info'}>{asset.status}</Badge>
                </>
              ) : (
                <>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-ink-400">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <p className="text-[10.5px] text-ink-400">Aset belum dipilih</p>
                </>
              )}
            </div>
          </div>
        ) : null}
      </form>
    </Modal>
  )
}
