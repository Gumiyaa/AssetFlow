import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Handshake,
  Wrench,
  Users,
  FileBarChart2,
  ShieldCheck,
  Settings,
} from 'lucide-react'

export const mainNavigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Data Aset', to: '/assets', icon: Boxes },
  { label: 'Inventaris', to: '/inventory', icon: ClipboardList },
  { label: 'Peminjaman', to: '/borrowings', icon: Handshake },
  { label: 'Pemeliharaan', to: '/maintenance', icon: Wrench },
  { label: 'Data Karyawan', to: '/employees', icon: Users },
  { label: 'Laporan', to: '/reports', icon: FileBarChart2 },
]

export const systemNavigation = [
  { label: 'Manajemen Pengguna', to: '/users', icon: ShieldCheck },
  { label: 'Pengaturan', to: '/settings', icon: Settings },
]

export const breadcrumbMap = [
  { test: /^\/dashboard/, items: ['AssetFlow', 'Sistem Operasional', 'Dashboard'] },
  { test: /^\/assets\/create/, items: ['AssetFlow', 'Data Aset', 'Registrasi Aset Baru'] },
  { test: /^\/assets\/[^/]+\/edit/, items: ['AssetFlow', 'Data Aset', 'Edit Data'] },
  { test: /^\/assets\/[^/]+/, items: ['AssetFlow', 'Data Aset', 'Detail Aset'] },
  { test: /^\/assets/, items: ['AssetFlow', 'Data Aset', 'Daftar Aset'] },
  { test: /^\/inventory\/transactions/, items: ['AssetFlow', 'Inventaris', 'Transaksi Stok'] },
  { test: /^\/inventory/, items: ['AssetFlow', 'Inventaris', 'Daftar Inventaris'] },
  { test: /^\/borrowings\/[^/]+/, items: ['AssetFlow', 'Peminjaman', 'Detail Peminjaman'] },
  { test: /^\/borrowings/, items: ['AssetFlow', 'Peminjaman', 'Daftar Peminjaman'] },
  { test: /^\/maintenance\/[^/]+/, items: ['AssetFlow', 'Pemeliharaan', 'Detail Pemeliharaan'] },
  { test: /^\/maintenance/, items: ['AssetFlow', 'Pemeliharaan', 'Daftar Pemeliharaan'] },
  { test: /^\/employees\/[^/]+/, items: ['AssetFlow', 'Data Karyawan', 'Detail Karyawan'] },
  { test: /^\/employees/, items: ['AssetFlow', 'Data Karyawan', 'Direktori Karyawan'] },
  { test: /^\/reports/, items: ['AssetFlow', 'Laporan', 'Pusat Laporan & Analitik'] },
  { test: /^\/users/, items: ['AssetFlow', 'Manajemen Sistem', 'Manajemen Pengguna'] },
  { test: /^\/settings/, items: ['AssetFlow', 'Manajemen Sistem', 'Pengaturan'] },
]
