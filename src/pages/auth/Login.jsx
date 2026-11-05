import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { authService } from '../../services/authService'

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [remember, setRemember] = useState(true)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: authService.demoAccount.email,
      password: authService.demoAccount.password,
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from || '/dashboard', { replace: true })
    }
  }, [isAuthenticated, location.state, navigate])

  const onSubmit = async (values) => {
    setFormError('')
    try {
      await login({ ...values, remember })
      toast.success('Selamat datang kembali', 'Anda masuk sebagai Super Admin.')
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (error) {
      setFormError(error.message)
    }
  }

  const fillDemo = () => {
    setValue('email', authService.demoAccount.email, { shouldValidate: true })
    setValue('password', authService.demoAccount.password, { shouldValidate: true })
    setFormError('')
    toast.info('Akun demo terisi', 'Tekan tombol Masuk untuk melanjutkan.')
  }

  return (
    <div className="animate-in">
      <span className="eyebrow">Portal Internal</span>
      <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-0.03em] text-ink-900">Masuk ke AssetFlow</h2>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">
        Gunakan akun perusahaan Anda untuk mengelola aset, inventaris, dan alur persetujuan.
      </p>

      <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/60 p-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-brand-700">Akun demo siap pakai</p>
            <p className="mt-0.5 break-all text-[10.5px] leading-relaxed text-brand-700/80">
              andi.pratama@assetflow.id · assetflow123
            </p>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="shrink-0 rounded-md border border-brand-200 bg-white px-2 py-1 text-[9.5px] font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Isi otomatis
          </button>
        </div>
      </div>

      {formError ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11.5px] text-red-700" role="alert">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="email" className="field-label">Email perusahaan</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`input h-11 pl-9 ${errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
              placeholder="nama@assetflow.id"
              {...register('email', {
                required: 'Email wajib diisi.',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid.' },
              })}
            />
          </div>
          {errors.email ? <p className="mt-1 text-[11px] font-medium text-red-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-[12px] font-medium text-ink-700">Kata sandi</label>
            <Link to="/forgot-password" className="text-[10.5px] font-medium text-brand-700 hover:underline">
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`input h-11 pl-9 pr-10 ${errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
              placeholder="Masukkan kata sandi"
              {...register('password', {
                required: 'Kata sandi wajib diisi.',
                minLength: { value: 6, message: 'Kata sandi minimal 6 karakter.' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-ink-400 transition hover:bg-slate-100 hover:text-ink-700"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {errors.password ? <p className="mt-1 text-[11px] font-medium text-red-600">{errors.password.message}</p> : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[11.5px] text-ink-600">
            <button
              type="button"
              role="checkbox"
              aria-checked={remember}
              onClick={() => setRemember((value) => !value)}
              className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                remember ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-white'
              }`}
            >
              {remember ? <Check className="h-3 w-3" /> : null}
            </button>
            Ingat perangkat ini
          </label>
          <span className="inline-flex items-center gap-1 text-[10px] text-ink-400">
            <KeyRound className="h-3 w-3" /> SSO tersedia
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary h-11 w-full text-[13px]"
        >
          {loading ? 'Memverifikasi…' : 'Masuk ke dashboard'}
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </form>

      <p className="mt-6 text-center text-[10.5px] leading-relaxed text-ink-400">
        Dengan masuk, Anda menyetujui kebijakan akses internal perusahaan.
        <br />
        Butuh bantuan? <a className="font-medium text-ink-600 hover:underline" href="mailto:support@assetflow.id">support@assetflow.id</a>
      </p>
    </div>
  )
}
