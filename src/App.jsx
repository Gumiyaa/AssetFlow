import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AuthLayout from './components/layout/AuthLayout'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import ForgotPassword from './pages/auth/ForgotPassword'
import Login from './pages/auth/Login'
import AssetCreate from './pages/assets/AssetCreate'
import AssetDetail from './pages/assets/AssetDetail'
import AssetEdit from './pages/assets/AssetEdit'
import AssetList from './pages/assets/AssetList'
import BorrowingDetail from './pages/borrowings/BorrowingDetail'
import BorrowingList from './pages/borrowings/BorrowingList'
import EmployeeDetail from './pages/employees/EmployeeDetail'
import EmployeeList from './pages/employees/EmployeeList'
import InventoryList from './pages/inventory/InventoryList'
import InventoryTransactions from './pages/inventory/InventoryTransactions'
import MaintenanceDetail from './pages/maintenance/MaintenanceDetail'
import MaintenanceList from './pages/maintenance/MaintenanceList'
import Reports from './pages/reports/Reports'
import Settings from './pages/settings/Settings'
import UserList from './pages/users/UserList'

const ROUTE_TITLES = [
  { test: /^\/dashboard/, title: 'Dashboard' },
  { test: /^\/assets\/create/, title: 'Tambah Aset' },
  { test: /^\/assets\/[^/]+\/edit/, title: 'Ubah Aset' },
  { test: /^\/assets\/[^/]+/, title: 'Detail Aset' },
  { test: /^\/assets/, title: 'Data Aset' },
  { test: /^\/inventory\/transactions/, title: 'Transaksi Inventaris' },
  { test: /^\/inventory/, title: 'Inventaris' },
  { test: /^\/borrowings\/[^/]+/, title: 'Detail Peminjaman' },
  { test: /^\/borrowings/, title: 'Peminjaman' },
  { test: /^\/maintenance\/[^/]+/, title: 'Detail Pemeliharaan' },
  { test: /^\/maintenance/, title: 'Pemeliharaan' },
  { test: /^\/employees\/[^/]+/, title: 'Profil Karyawan' },
  { test: /^\/employees/, title: 'Data Karyawan' },
  { test: /^\/reports/, title: 'Laporan' },
  { test: /^\/users/, title: 'Manajemen Pengguna' },
  { test: /^\/settings/, title: 'Pengaturan' },
  { test: /^\/login/, title: 'Masuk' },
  { test: /^\/forgot-password/, title: 'Lupa Kata Sandi' },
]

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    const match = ROUTE_TITLES.find((route) => route.test.test(pathname))
    document.title = match ? `${match.title} · AssetFlow` : 'AssetFlow — Asset & Inventory Management'
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<AssetList />} />
            <Route path="/assets/create" element={<AssetCreate />} />
            <Route path="/assets/:id" element={<AssetDetail />} />
            <Route path="/assets/:id/edit" element={<AssetEdit />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/transactions" element={<InventoryTransactions />} />
            <Route path="/borrowings" element={<BorrowingList />} />
            <Route path="/borrowings/:id" element={<BorrowingDetail />} />
            <Route path="/maintenance" element={<MaintenanceList />} />
            <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}
