import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react'
import { authService } from '../../services/authService'

export default function ForgotPassword() {
  const [sent, setSent] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } })

  const onSubmit = async ({ email }) => {
    setError('')
    setLoading(true)
    try {
      const result = await authService.forgotPassword(email)
      setSent(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="animate-in">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-ink-900">Tautan telah dikirim</h2>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
          Instruksi pengaturan ulang kata sandi telah dikirim ke{' '}
          <span className="font-medium text-ink-900">{sent.email}</span>. Tautan berlaku selama 30 menit.
        </p>
        <div className="mt-5 rounded-lg border border-line bg-slate-50 p-3 text-[11px] leading-relaxed text-ink-500">
          Tidak menerima email? Periksa folder spam atau hubungi administrator IT di
          <span className="font-medium text-ink-700"> support@assetflow.id</span>. Mode demo tidak
          mengirim email sungguhan.
        </div>
        <Link to="/login" className="btn btn-primary mt-6 w-full">
          <ArrowLeft className="h-4 w-4" /> Kembali ke halaman masuk
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-in">
      <Link to="/login" className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-500 transition hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke halaman masuk
      </Link>

      <span className="eyebrow">Pemulihan akun</span>
      <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-0.03em] text-ink-900">Lupa kata sandi?</h2>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">
        Masukkan email perusahaan terdaftar. Kami akan mengirim tautan untuk mengatur ulang kata sandi Anda.
      </p>

      {error ? (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11.5px] text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="forgot-email" className="field-label">Email perusahaan</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
            <input
              id="forgot-email"
              type="email"
              placeholder="nama@assetflow.id"
              className={`input h-11 pl-9 ${errors.email ? 'border-red-300' : ''}`}
              {...register('email', {
                required: 'Email wajib diisi.',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid.' },
              })}
            />
          </div>
          {errors.email ? <p className="mt-1 text-[11px] font-medium text-red-600">{errors.email.message}</p> : null}
        </div>

        <button type="submit" className="btn btn-primary h-11 w-full text-[13px]" disabled={loading}>
          {loading ? 'Mengirim tautan…' : 'Kirim tautan pemulihan'}
          {!loading ? <Send className="h-4 w-4" /> : null}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-line bg-slate-50/70 p-3.5">
        <p className="text-[10.5px] font-semibold text-ink-700">Akun demo</p>
        <p className="mt-1 text-[10.5px] leading-relaxed text-ink-500">
          Gunakan <span className="font-medium text-ink-700">andi.pratama@assetflow.id</span> untuk mencoba alur
          pemulihan. Tidak ada email yang benar-benar dikirim pada versi demo.
        </p>
      </div>
    </div>
  )
}
