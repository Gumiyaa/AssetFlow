import { Link, Outlet } from 'react-router-dom'
import { Boxes, CheckCircle2, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'

const FEATURES = [
  'Registrasi aset, kustodian, dan riwayat pemeliharaan terpusat.',
  'Alur persetujuan peminjaman dengan jejak audit lengkap.',
  'Laporan nilai buku, depresiasi, dan kepatuhan siap ekspor.',
]

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative hidden w-[52%] flex-col justify-between overflow-hidden bg-navy-900 p-10 text-white lg:flex xl:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-800 to-[#0c4a44]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-brand-400/20 blur-[100px]" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[110px]" />

        <div className="relative z-10">
          <Link to="/login" className="inline-flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-brand-500 shadow-[0_10px_30px_-10px_rgba(14,147,132,0.9)]">
              <Boxes className="h-6 w-6" strokeWidth={2} />
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-white/10" />
            </span>
            <span>
              <span className="block text-[20px] font-semibold leading-tight tracking-[-0.02em]">AssetFlow</span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Enterprise Asset OS
              </span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-brand-200">
            <Sparkles className="h-3 w-3" /> Platform manajemen aset terpadu
          </span>
          <h1 className="mt-5 text-[38px] font-semibold leading-[1.08] tracking-[-0.035em] xl:text-[44px]">
            Kendali penuh atas setiap aset dan inventaris perusahaan.
          </h1>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-slate-300/90">
            Satu ruang kerja untuk siklus hidup aset — dari pengadaan, penempatan, peminjaman,
            pemeliharaan, hingga penyusutan nilai buku.
          </p>

          <ul className="mt-7 space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-[12px] leading-relaxed text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-9 grid grid-cols-3 gap-3">
            {[
              ['1.428', 'Aset terdaftar'],
              ['Rp 24,7 M', 'Nilai perolehan'],
              ['94,6%', 'Kepatuhan audit'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 backdrop-blur-sm">
                <p className="text-[16px] font-semibold tracking-[-0.02em] text-white">{value}</p>
                <p className="mt-0.5 text-[9.5px] leading-tight text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-300" />
            ISO 27001 aligned · Data terenkripsi
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <LockKeyhole className="h-3 w-3" />
            Sesi aman
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen w-full flex-col lg:w-[48%]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
          <Link to="/login" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Boxes className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold leading-tight text-ink-900">AssetFlow</span>
              <span className="block text-[8px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                Asset Management
              </span>
            </span>
          </Link>
          <span className="text-[10px] text-ink-400">v3.4.1</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </div>

        <div className="border-t border-line px-5 py-4 text-center text-[10px] text-ink-400">
          © 2026 PT AssetFlow Nusantara · Kebijakan Privasi · Syarat Layanan
        </div>
      </main>
    </div>
  )
}
