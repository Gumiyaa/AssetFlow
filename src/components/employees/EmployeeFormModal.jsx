import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { UserPlus } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Field, { Input, Select, Textarea } from '../ui/Field'
import { useMasterData } from '../../hooks/useMasterData'
import { formatDateInput } from '../../utils/format'

const STATUSES = ['Aktif', 'Masa Percobaan', 'Cuti', 'Nonaktif']
const GRADES = ['Grade A', 'Grade B', 'Grade C']

function buildValues(employee) {
  return {
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    department: employee?.department || 'Information Technology',
    position: employee?.position || '',
    status: employee?.status || 'Aktif',
    joinDate: formatDateInput(employee?.joinDate) || formatDateInput(new Date()),
    manager: employee?.manager || '',
    location: employee?.location || 'Kantor Pusat Jakarta Lt. 3',
    grade: employee?.grade || 'Grade B',
    notes: employee?.notes || '',
  }
}

export default function EmployeeFormModal({ open, employee, employees = [], onClose, onSubmit, submitting }) {
  const { departments } = useMasterData()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: buildValues(employee) })

  useEffect(() => {
    if (open) reset(buildValues(employee))
  }, [open, employee, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={employee ? 'Edit Data Karyawan' : 'Tambah Karyawan'}
      description={
        employee
          ? 'Perbarui data kepegawaian, penempatan, dan status kustodian aset.'
          : 'Daftarkan karyawan baru ke direktori dan siapkan penugasan aset.'
      }
      size="lg"
      icon={UserPlus}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button variant="primary" type="submit" form="employee-form" loading={submitting}>
            {employee ? 'Simpan perubahan' : 'Tambah karyawan'}
          </Button>
        </>
      }
    >
      <form id="employee-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama lengkap" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
          <Input
            id="name"
            placeholder="Nama sesuai dokumen kepegawaian"
            className={errors.name && 'border-red-300'}
            {...register('name', { required: 'Nama karyawan wajib diisi.', minLength: { value: 3, message: 'Minimal 3 karakter.' } })}
          />
        </Field>

        <Field label="Email korporat" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="nama@assetflow.id"
            className={errors.email && 'border-red-300'}
            {...register('email', {
              required: 'Email wajib diisi.',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid.' },
              validate: (value) =>
                employees.filter((item) => item.id !== employee?.id).every((item) => item.email.toLowerCase() !== value.toLowerCase()) ||
                'Email sudah digunakan karyawan lain.',
            })}
          />
        </Field>

        <Field label="Nomor telepon" htmlFor="phone" required error={errors.phone?.message}>
          <Input
            id="phone"
            placeholder="+62 812-0000-0000"
            className={errors.phone && 'border-red-300'}
            {...register('phone', {
              required: 'Nomor telepon wajib diisi.',
              minLength: { value: 8, message: 'Nomor telepon terlalu pendek.' },
            })}
          />
        </Field>

        <Field label="Departemen" htmlFor="department" required error={errors.department?.message}>
          <Select id="department" {...register('department', { required: 'Departemen wajib dipilih.' })}>
            {departments.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Jabatan" htmlFor="position" required error={errors.position?.message}>
          <Input
            id="position"
            placeholder="Contoh: IT Support Specialist"
            className={errors.position && 'border-red-300'}
            {...register('position', { required: 'Jabatan wajib diisi.' })}
          />
        </Field>

        <Field label="Status kepegawaian" htmlFor="status" required error={errors.status?.message}>
          <Select id="status" {...register('status', { required: 'Status wajib dipilih.' })}>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tanggal bergabung" htmlFor="joinDate" required error={errors.joinDate?.message}>
          <Input
            id="joinDate"
            type="date"
            className={errors.joinDate && 'border-red-300'}
            {...register('joinDate', { required: 'Tanggal bergabung wajib diisi.' })}
          />
        </Field>

        <Field label="Atasan langsung" htmlFor="manager" error={errors.manager?.message}>
          <Input id="manager" placeholder="Nama atasan" {...register('manager')} />
        </Field>

        <Field label="Tingkat kepatuhan" htmlFor="grade" error={errors.grade?.message}>
          <Select id="grade" {...register('grade')}>
            {GRADES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Lokasi kerja" htmlFor="location" error={errors.location?.message} className="sm:col-span-2">
          <Input id="location" placeholder="Kantor Pusat Jakarta Lt. 3" {...register('location')} />
        </Field>

        <Field label="Catatan kustodian" htmlFor="notes" className="sm:col-span-2">
          <Textarea id="notes" rows={3} placeholder="Catatan kepatuhan, riwayat audit, atau informasi penugasan khusus…" {...register('notes')} />
        </Field>
      </form>
    </Modal>
  )
}
