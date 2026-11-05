import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Wrench } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Field, { Input, Select, Textarea } from '../ui/Field'
import AssetThumb from '../ui/AssetThumb'
import Badge from '../ui/Badge'
import { formatCurrency, formatDateInput } from '../../utils/format'

const TYPES = ['Korektif Hardware', 'Korektif Software', 'Preventif', 'Mekanis', 'Kalibrasi']
const PRIORITIES = ['Tinggi', 'Sedang', 'Rendah', 'Preventif']
const TECHNICIANS = ['Riko Saputra', 'Fajar Anugrah', 'Tim Teknisi Internal', 'PT Tera Data Indonusa', 'PT Mitra Docucare', 'Auto2000 Cilandak']
const VENDORS = ['Internal IT Hub', 'PT Tera Data Indonusa', 'PT Mitra Docucare', 'PT Canon Indonesia', 'Auto2000 Cilandak', 'iBox Indonesia']

function offsetDate(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDateInput(date)
}

const emptyValues = {
  assetId: '',
  type: 'Korektif Hardware',
  priority: 'Sedang',
  targetDate: offsetDate(5),
  technician: 'Tim Teknisi Internal',
  vendor: 'Internal IT Hub',
  estimate: '',
  problem: '',
  notes: '',
}

export default function MaintenanceFormModal({ open, onClose, onSubmit, submitting, assets }) {
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

  const assetId = watch('assetId')
  const estimate = Number(watch('estimate')) || 0
  const asset = useMemo(() => assets.find((item) => item.id === assetId), [assets, assetId])

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      targetDate: new Date(`${values.targetDate}T17:00:00`).toISOString(),
    })
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Buat Tiket Pemeliharaan"
      description="Catat keluhan, pilih jenis perbaikan, dan tugaskan teknisi atau vendor rekanan."
      size="lg"
      icon={Wrench}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button variant="primary" type="submit" form="maintenance-form" loading={submitting}>
            Buat tiket
          </Button>
        </>
      }
    >
      <form id="maintenance-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Aset yang diperbaiki" htmlFor="assetId" required error={errors.assetId?.message} className="sm:col-span-2">
          <Select
            id="assetId"
            className={errors.assetId && 'border-red-300'}
            {...register('assetId', { required: 'Pilih aset yang memerlukan perbaikan.' })}
          >
            <option value="">Pilih aset…</option>
            {assets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.code} · {item.status}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Jenis perbaikan" htmlFor="type" required error={errors.type?.message}>
          <Select id="type" {...register('type', { required: 'Jenis perbaikan wajib dipilih.' })}>
            {TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Prioritas" htmlFor="priority" required error={errors.priority?.message}>
          <Select id="priority" {...register('priority', { required: 'Prioritas wajib dipilih.' })}>
            {PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Target selesai" htmlFor="targetDate" required error={errors.targetDate?.message}>
          <Input
            id="targetDate"
            type="date"
            className={errors.targetDate && 'border-red-300'}
            {...register('targetDate', { required: 'Target selesai wajib diisi.' })}
          />
        </Field>

        <Field
          label="Estimasi biaya (Rp)"
          htmlFor="estimate"
          error={errors.estimate?.message}
          hint={estimate > 0 ? `Terbaca: ${formatCurrency(estimate)}` : 'Masukkan angka tanpa pemisah ribuan.'}
        >
          <Input
            id="estimate"
            type="number"
            min="0"
            step="1000"
            placeholder="Contoh: 750000"
            {...register('estimate', {
              validate: (value) => value === '' || Number(value) >= 0 || 'Estimasi tidak boleh negatif.',
            })}
          />
        </Field>

        <Field label="Teknisi / pelaksana" htmlFor="technician" required error={errors.technician?.message}>
          <Select id="technician" {...register('technician', { required: 'Teknisi wajib dipilih.' })}>
            {TECHNICIANS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Vendor / rekanan" htmlFor="vendor" required error={errors.vendor?.message}>
          <Select id="vendor" {...register('vendor', { required: 'Vendor wajib dipilih.' })}>
            {VENDORS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Deskripsi masalah"
          htmlFor="problem"
          required
          error={errors.problem?.message}
          className="sm:col-span-2"
          hint="Sertakan gejala, kapan terjadi, dan dampak terhadap operasional."
        >
          <Textarea
            id="problem"
            rows={4}
            placeholder="Contoh: Unit mengeluarkan suara kasar dan hasil cetak bergaris sejak dua hari terakhir…"
            className={errors.problem && 'border-red-300'}
            {...register('problem', {
              required: 'Deskripsi masalah wajib diisi.',
              minLength: { value: 20, message: 'Mohon jelaskan minimal 20 karakter.' },
            })}
          />
        </Field>

        <Field label="Catatan tambahan" htmlFor="notes" className="sm:col-span-2">
          <Textarea id="notes" rows={2} placeholder="Opsional — riwayat servis, nomor kontrak SLA, atau permintaan khusus…" {...register('notes')} />
        </Field>

        {asset ? (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-slate-50/70 p-3 sm:col-span-2">
            <AssetThumb category={asset.category} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-semibold text-ink-900">{asset.name}</p>
              <p className="truncate text-[10px] text-ink-500">
                {asset.code} · {asset.location} · PIC {asset.pic}
              </p>
            </div>
            <Badge tone={asset.status === 'Perbaikan' ? 'warning' : 'neutral'}>{asset.status}</Badge>
          </div>
        ) : null}
      </form>
    </Modal>
  )
}
