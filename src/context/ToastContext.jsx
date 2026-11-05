import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

const TONES = {
  success: { icon: CheckCircle2, ring: 'border-emerald-200', iconColor: 'text-emerald-600', bar: 'bg-emerald-500' },
  error: { icon: XCircle, ring: 'border-red-200', iconColor: 'text-red-600', bar: 'bg-red-500' },
  warning: { icon: AlertTriangle, ring: 'border-amber-200', iconColor: 'text-amber-600', bar: 'bg-amber-500' },
  info: { icon: Info, ring: 'border-blue-200', iconColor: 'text-blue-600', bar: 'bg-blue-500' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (input, tone = 'success') => {
      const toast =
        typeof input === 'string'
          ? { id: `toast-${Date.now()}-${Math.random()}`, title: input, tone }
          : { id: `toast-${Date.now()}-${Math.random()}`, tone: 'success', ...input }
      setToasts((current) => [...current.slice(-3), toast])
      const timer = setTimeout(() => dismiss(toast.id), toast.duration || 4200)
      timers.current.set(toast.id, timer)
      return toast.id
    },
    [dismiss],
  )

  useEffect(() => () => timers.current.forEach((timer) => clearTimeout(timer)), [])

  const toast = {
    push,
    success: (title, message) => push({ title, message, tone: 'success' }),
    error: (title, message) => push({ title, message, tone: 'error' }),
    warning: (title, message) => push({ title, message, tone: 'warning' }),
    info: (title, message) => push({ title, message, tone: 'info' }),
    dismiss,
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6">
        {toasts.map((item) => {
          const config = TONES[item.tone] || TONES.success
          const Icon = config.icon
          return (
            <div
              key={item.id}
              className={`animate-in pointer-events-auto relative w-full overflow-hidden rounded-xl border bg-white p-3.5 pr-9 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.28)] sm:w-[360px] ${config.ring}`}
              role="status"
            >
              <div className="flex items-start gap-2.5">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconColor}`} />
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold leading-snug text-ink-900">{item.title}</p>
                  {item.message ? (
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-500">{item.message}</p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="absolute right-2 top-2 rounded p-1 text-ink-400 transition hover:bg-slate-100 hover:text-ink-700"
                aria-label="Tutup notifikasi"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <span className={`absolute bottom-0 left-0 h-0.5 w-full opacity-60 ${config.bar}`} />
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
