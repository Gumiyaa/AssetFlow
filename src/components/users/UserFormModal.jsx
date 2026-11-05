import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ShieldCheck } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Field, { Input, Select } from '../ui/Field'
import { useMasterData } from '../../hooks/useMasterData'

const ROLES = ['Super Admin', 'Asset Manager', 'Administrator', 'Warehouse Staff', 'Employee']
const STATUSES = ['Aktif', 'Nonaktif']
const TWO_FA = ['FIDO2 / Hardware Token', 'Google Authenticator', 'Authenticator App', 'SMS OTP + App', 'Hardware Key', 'Belum Aktif']

function buildValues(user) {
  return {
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Employee',
    department: user?.department || 'Information Technology',
    status: user?.status || 'Aktif',
    twoFA: user?.twoFA || 'Belum Aktif',
  }
}

export default function UserFormModal({ open, user, users = [], onClose, onSubmit, submitting }) {
  const { departments } = useMasterData()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: buildValues(user) })

  useEffect(() => {
    if (open) reset(buildValues(user))
  }, [open, user, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
      description={
        user
          ? 'Perbarui identitas, peran RBAC, dan metode autentikasi pengguna.'
          : 'Buat akun internal baru dan tentukan hak akses sesuai peran.'
      }
      size="md"
      icon={ShieldCheck}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button variant="primary" type="submit" form="user-form" loading={submitting}>
            {user ? 'Simpan perubahan' : 'Buat pengguna'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama lengkap" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
          <Input
            id="name"
            placeholder="Nama pengguna"
            className={errors.name && 'border-red-300'}
            {...register('name', { required: 'Nama wajib diisi.', minLength: { value: 3, message: 'Minimal 3 karakter.' } })}
          />
        </Field>

        <Field label="Email korporat" htmlFor="email" required error={errors.email?.message} className="sm:col-span-2">
          <Input
            id="email"
            type="email"
            placeholder="nama@assetflow.id"
            className={errors.email && 'border-red-300'}
            {...register('email', {
              required: 'Email wajib diisi.',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid.' },
              validate: (value) =>
                users.filter((item) => item.id !== user?.id).every((item) => item.email.toLowerCase() !== value.toLowerCase()) ||
                'Email sudah terdaftar pada pengguna lain.',
            })}
          />
        </Field>

        <Field label="Peran sistem (RBAC)" htmlFor="role" required error={errors.role?.message}>
          <Select id="role" {...register('role', { required: 'Peran wajib dipilih.' })}>
            {ROLES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
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

        <Field label="Status akun" htmlFor="status" required error={errors.status?.message}>
          <Select id="status" {...register('status', { required: 'Status wajib dipilih.' })}>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Metode 2FA" htmlFor="twoFA" required error={errors.twoFA?.message}>
          <Select id="twoFA" {...register('twoFA', { required: 'Metode 2FA wajib dipilih.' })}>
            {TWO_FA.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <div className="rounded-lg border border-line bg-slate-50/70 p-3 text-[10.5px] leading-relaxed text-ink-500 sm:col-span-2">
          Hak akses modul ditentukan otomatis dari peran yang dipilih. Super Admin memperoleh akses penuh ke seluruh
          modul, sedangkan Employee hanya dapat mengajukan permohonan peminjaman.
        </div>
      </form>
    </Modal>
  )
}
