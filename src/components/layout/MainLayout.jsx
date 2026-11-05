import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-[255px]">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1560px] flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <Outlet />
        </main>
        <footer className="mx-auto flex w-full max-w-[1560px] flex-wrap items-center justify-between gap-2 px-4 py-4 text-[10px] text-ink-400 sm:px-6">
          <span>© 2026 AssetFlow Nusantara · Seluruh hak dilindungi.</span>
          <span className="flex items-center gap-3">
            <span>Kebijakan Privasi</span>
            <span className="h-2.5 w-px bg-line" />
            <span>Syarat Layanan</span>
            <span className="h-2.5 w-px bg-line" />
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Sistem normal
            </span>
          </span>
        </footer>
      </div>
    </div>
  )
}
