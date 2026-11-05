import { Boxes, Compass, Home, SearchX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const SUGGESTIONS = [
  { label: 'Dashboard', description: 'Ringkasan aset, stok, dan aktivitas', to: '/dashboard', icon: Home },
  { label: 'Data Aset', description: 'Telusuri seluruh registry aset', to: '/assets', icon: Boxes },
  { label: 'Laporan', description: 'Unduh laporan portofolio & depresiasi', to: '/reports', icon: Compass },
]

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-6">
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden">
          <div className="relative border-b border-line bg-gradient-to-br from-navy-900 via-navy-800 to-[#0c4a44] px-6 py-10 text-white sm:px-10 sm:py-12">
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-200">
                  <SearchX className="h-3 w-3" /> Halaman tidak ditemukan
                </span>
                <p className="mt-4 text-[54px] font-semibold leading-none tracking-[-0.05em]">404</p>
                <h1 className="mt-2 text-[20px] font-semibold tracking-[-0.025em]">
                  Rute yang Anda tuju tidak tersedia
                </h1>
                <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-slate-300/90">
                  Tautan mungkin sudah dipindahkan, dihapus, atau Anda tidak memiliki akses ke halaman tersebut.
                  Gunakan salah satu pintasan di bawah untuk melanjutkan.
                </p>
              </div>
              <span className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] sm:flex">
                <Compass className="h-9 w-9 text-brand-300" strokeWidth={1.6} />
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-2.5 sm:grid-cols-3">
              {SUGGESTIONS.map(({ label, description, to, icon: Icon }) => (
                <Button
                  key={to}
                  to={to}
                  variant="secondary"
                  className="h-auto flex-col items-start gap-1.5 px-3.5 py-3 text-left"
                >
                  <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-900">
                    <Icon className="h-3.5 w-3.5 text-brand-600" />
                    {label}
                  </span>
                  <span className="text-[10.5px] font-normal leading-snug text-ink-500">{description}</span>
                </Button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-[11px] text-ink-500">
                Kode referensi: <span className="font-mono text-[10.5px] text-ink-700">ERR-404-ROUTE</span>
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                  Kembali
                </Button>
                <Button variant="primary" size="sm" icon={Home} to="/dashboard">
                  Ke Dashboard
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
