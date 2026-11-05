export const currentUser = {
  id: 'USR-001',
  name: 'Andi Pratama',
  email: 'andi.pratama@assetflow.id',
  username: 'andi.pratama',
  role: 'Super Admin',
  position: 'Super Administrator',
  department: 'Information Technology',
  phone: '+62 812-1900-4411',
  initials: 'AP',
  avatarColor: '#1B4B6B',
  joinDate: '2021-01-12',
  lastLogin: 'Hari ini, 10:42 WIB',
}

export const conditions = [
  'Sangat Baik (Grade A)',
  'Baik (Grade B)',
  'Rusak Ringan (Grade C)',
  'Rusak Berat (Grade D)',
]

export const departments = [
  { id: 'DEP-IT', code: 'IT', name: 'Information Technology', head: 'Fajar Anugrah', employees: 86, assets: 244 },
  { id: 'DEP-HR', code: 'HR', name: 'Human Resources', head: 'Rina Amelia', employees: 42, assets: 70 },
  { id: 'DEP-FIN', code: 'FIN', name: 'Finance', head: 'Budi Santoso', employees: 58, assets: 93 },
  { id: 'DEP-OPS', code: 'OPS', name: 'Operations', head: 'Rudi Hartono', employees: 112, assets: 140 },
  { id: 'DEP-ADM', code: 'ADM', name: 'Administration', head: 'Dewi Lestari', employees: 64, assets: 35 },
]

export const categories = [
  { id: 'CAT-IT', code: 'IT', name: 'Laptop & PC', count: 600, color: '#0E9384' },
  { id: 'CAT-NET', code: 'NET', name: 'Perangkat Jaringan', count: 314, color: '#2E90FA' },
  { id: 'CAT-OFF', code: 'OFF', name: 'Mesin Kantor', count: 257, color: '#F79009' },
  { id: 'CAT-VEH', code: 'VEH', name: 'Kendaraan Operasional', count: 171, color: '#7A5AF8' },
  { id: 'CAT-FUR', code: 'FUR', name: 'Furnitur & Fixture', count: 86, color: '#E5484D' },
]

export const locations = [
  { id: 'LOC-01', name: 'Kantor Pusat Lt. 3 - Divisi IT', building: 'Menara Sudirman', floor: 'Lantai 3', city: 'Jakarta' },
  { id: 'LOC-02', name: 'Kantor Pusat Lt. 2 - Keuangan', building: 'Menara Sudirman', floor: 'Lantai 2', city: 'Jakarta' },
  { id: 'LOC-03', name: 'Kantor Pusat Lt. 2 - HR & GA', building: 'Menara Sudirman', floor: 'Lantai 2', city: 'Jakarta' },
  { id: 'LOC-04', name: 'Ruang Server Lt. 2', building: 'Menara Sudirman', floor: 'Lantai 2', city: 'Jakarta' },
  { id: 'LOC-05', name: 'Pool Parkir Basement B2', building: 'Menara Sudirman', floor: 'Basement 2', city: 'Jakarta' },
  { id: 'LOC-06', name: 'R. Rapat Eksekutif Lt. 4', building: 'Menara Sudirman', floor: 'Lantai 4', city: 'Jakarta' },
  { id: 'LOC-07', name: 'Ruang Direksi Lt. 4', building: 'Menara Sudirman', floor: 'Lantai 4', city: 'Jakarta' },
  { id: 'LOC-08', name: 'Gudang Utama Lt. 1', building: 'Menara Sudirman', floor: 'Lantai 1', city: 'Jakarta' },
  { id: 'LOC-09', name: 'Gudang IT Lt. 3', building: 'Menara Sudirman', floor: 'Lantai 3', city: 'Jakarta' },
  { id: 'LOC-10', name: 'Kantor Cabang Bandung', building: 'Gedung Asia Afrika', floor: 'Lantai 5', city: 'Bandung' },
]

export const units = [
  { id: 'UNT-01', name: 'Unit', symbol: 'unit', description: 'Satuan untuk perangkat utuh' },
  { id: 'UNT-02', name: 'Pcs', symbol: 'pcs', description: 'Satuan barang satuan' },
  { id: 'UNT-03', name: 'Rim', symbol: 'rim', description: 'Satuan kertas 500 lembar' },
  { id: 'UNT-04', name: 'Botol', symbol: 'btl', description: 'Satuan tinta atau cairan' },
  { id: 'UNT-05', name: 'Pack', symbol: 'pack', description: 'Satuan kemasan' },
  { id: 'UNT-06', name: 'Box', symbol: 'box', description: 'Satuan kardus' },
]

export const employees = [
  {
    id: 'EMP-2022-094', name: 'Dimas Saputra', email: 'dimas.saputra@assetflow.id', phone: '+62 812-8890-4412',
    department: 'Information Technology', position: 'Lead DevOps & Field Systems Engineer', status: 'Aktif',
    joinDate: '2022-03-15', manager: 'Fajar Anugrah', location: 'Kantor Pusat Jakarta Lt. 3',
    initials: 'DS', avatarColor: '#1B4B6B', assets: 3, grade: 'Grade A', notes: 'Karyawan memiliki rekam jejak kepatuhan pemeliharaan perangkat yang sangat baik. Semua unit terawat dan tidak pernah tercatat denda atau kehilangan komponen.',
  },
  {
    id: 'EMP-2019-012', name: 'Siti Rahmawati', email: 'siti.rahmawati@assetflow.id', phone: '+62 813-1122-3344',
    department: 'Administration', position: 'Senior Marketing & Communications Lead', status: 'Aktif',
    joinDate: '2019-01-10', manager: 'Dewi Lestari', location: 'Kantor Pusat Jakarta Lt. 2',
    initials: 'SR', avatarColor: '#0F766E', assets: 2, grade: 'Grade A', notes: 'Pengguna aktif perangkat kreatif. Menjaga kelengkapan aksesori dan selalu mengembalikan aset tepat waktu.',
  },
  {
    id: 'EMP-2017-005', name: 'Rudi Hartono', email: 'rudi.hartono@assetflow.id', phone: '+62 815-9988-7766',
    department: 'Operations', position: 'Operations Supervisor', status: 'Aktif',
    joinDate: '2017-08-04', manager: 'Andi Pratama', location: 'Kantor Pusat Jakarta Lt. 1',
    initials: 'RH', avatarColor: '#7C3AED', assets: 2, grade: 'Grade B', notes: 'Koordinator operasional lapangan dengan mobilitas tinggi. Perlu pengingat berkala untuk inspeksi kendaraan.',
  },
  {
    id: 'EMP-2021-089', name: 'Budi Santoso', email: 'budi.santoso@assetflow.id', phone: '+62 818-4455-6677',
    department: 'Finance', position: 'Financial Controller', status: 'Aktif',
    joinDate: '2021-06-01', manager: 'Siti Rahmawati', location: 'Kantor Pusat Jakarta Lt. 2',
    initials: 'BS', avatarColor: '#1D4ED8', assets: 2, grade: 'Grade A', notes: 'Kustodian perangkat finance dengan dokumentasi BAST lengkap.',
  },
  {
    id: 'EMP-2020-067', name: 'Rina Amelia', email: 'rina.amelia@assetflow.id', phone: '+62 821-3344-5566',
    department: 'Human Resources', position: 'HR Specialist & Payroll', status: 'Aktif',
    joinDate: '2020-11-18', manager: 'Dewi Lestari', location: 'Kantor Pusat Jakarta Lt. 2',
    initials: 'RA', avatarColor: '#B45309', assets: 1, grade: 'Grade A', notes: 'Pengguna laptop kerja dengan tingkat kepatuhan audit 100%.',
  },
  {
    id: 'EMP-2023-015', name: 'Fajar Anugrah', email: 'fajar.anugrah@assetflow.id', phone: '+62 878-9900-1122',
    department: 'Information Technology', position: 'IT Infrastructure Lead', status: 'Aktif',
    joinDate: '2023-02-02', manager: 'Andi Pratama', location: 'Ruang Server Jakarta Lt. 2',
    initials: 'FA', avatarColor: '#0E7490', assets: 4, grade: 'Grade A', notes: 'Penanggung jawab infrastruktur server dan jaringan utama.',
  },
  {
    id: 'EMP-2024-033', name: 'Hendra Setiawan', email: 'hendra.setiawan@assetflow.id', phone: '+62 857-1234-5678',
    department: 'Information Technology', position: 'Junior Web Developer', status: 'Masa Percobaan',
    joinDate: '2024-01-14', manager: 'Fajar Anugrah', location: 'Kantor Pusat Jakarta Lt. 3',
    initials: 'HS', avatarColor: '#475569', assets: 2, grade: 'Grade A', notes: 'Onboarding aktif. Serah terima perangkat selesai, menunggu verifikasi BAST final.',
  },
  {
    id: 'EMP-2021-001', name: 'Andi Pratama', email: 'andi.pratama@assetflow.id', phone: '+62 812-1900-4411',
    department: 'Information Technology', position: 'Super Administrator & IT Governance', status: 'Aktif',
    joinDate: '2021-01-12', manager: 'Board of Directors', location: 'Kantor Pusat Jakarta Lt. 3',
    initials: 'AP', avatarColor: '#0B2239', assets: 1, grade: 'Grade A', notes: 'Pemilik otorisasi tertinggi sistem AssetFlow.',
  },
  {
    id: 'EMP-2018-022', name: 'Dewi Lestari', email: 'dewi.lestari@assetflow.id', phone: '+62 811-2233-4455',
    department: 'Administration', position: 'Administration Coordinator', status: 'Aktif',
    joinDate: '2018-04-09', manager: 'Rudi Hartono', location: 'Kantor Pusat Jakarta Lt. 2',
    initials: 'DL', avatarColor: '#BE185D', assets: 2, grade: 'Grade A', notes: 'Koordinator administrasi dan kustodian ruang rapat eksekutif.',
  },
  {
    id: 'EMP-2019-041', name: 'Agus Wijaya', email: 'agus.wijaya@assetflow.id', phone: '+62 856-7788-9900',
    department: 'Finance', position: 'Finance Staff', status: 'Aktif',
    joinDate: '2019-09-23', manager: 'Budi Santoso', location: 'Kantor Pusat Jakarta Lt. 2',
    initials: 'AW', avatarColor: '#4338CA', assets: 2, grade: 'Grade B', notes: 'Pengguna printer portabel untuk audit pajak lapangan.',
  },
  {
    id: 'EMP-2022-055', name: 'Maya Putri', email: 'maya.putri@assetflow.id', phone: '+62 813-5566-7788',
    department: 'Human Resources', position: 'HR Payroll Staff', status: 'Cuti',
    joinDate: '2022-07-11', manager: 'Rina Amelia', location: 'Kantor Pusat Jakarta Lt. 2',
    initials: 'MP', avatarColor: '#9D174D', assets: 1, grade: 'Grade B', notes: 'Sedang cuti panjang, aset dititipkan ke HR Operations.',
  },
  {
    id: 'EMP-2020-073', name: 'Riko Saputra', email: 'riko.saputra@assetflow.id', phone: '+62 811-9022-384',
    department: 'Information Technology', position: 'Sr. Power Infrastructure Specialist', status: 'Aktif',
    joinDate: '2020-02-17', manager: 'Fajar Anugrah', location: 'Ruang Server Jakarta Lt. 2',
    initials: 'RS', avatarColor: '#115E59', assets: 1, grade: 'Grade A', notes: 'Teknisi internal bersertifikasi untuk UPS, kelistrikan, dan pendingin ruang server.',
  },
]

const assetSeeds = [
  ['AST-IT-2023-001', 'Lenovo ThinkPad E14 Gen 4', 'Laptop & PC', 'Lenovo', 'ThinkPad E14 Gen 4 (21E30064ID)', 'LNV-2023-0941', 16850000, '2023-03-15', 'PT Tera Data Indonusa Tbk', 'PO-2023-03-0188', 36, 'Information Technology', 'Kantor Pusat Lt. 3 - Divisi IT', 'Dimas Saputra', 'Sangat Baik (Grade A)', 'Dipinjam', 'Core i7-1255U, 16GB DDR4, 512GB NVMe SSD, Layar 14" FHD IPS, charger 65W USB-C, Tas Targus Resmi.', 12200000, 'AST-IT-2023-001'],
  ['AST-IT-2022-048', 'Dell OptiPlex 7090 Micro Desktop', 'Laptop & PC', 'Dell', 'OptiPlex 7090 Micro', 'DLL-2022-4921', 14500000, '2022-06-10', 'PT Bhinneka Mentari Dimensi', 'INV/2022/BMD/0712', 36, 'Finance', 'Kantor Pusat Lt. 2 - Keuangan', 'Budi Santoso', 'Baik (Grade B)', 'Aktif', 'Core i5-11500T, 16GB RAM, 512GB NVMe, Dual 24" Monitor, Windows 11 Pro.', 8700000, 'AST-IT-2022-048'],
  ['AST-PR-2023-012', 'HP LaserJet Pro M404dn', 'Mesin Kantor', 'HP', 'LaserJet Pro M404dn', 'HP-LJ-8812-JKT', 5400000, '2023-01-20', 'PT Mitra Docucare', 'INV/2023/MDC/0088', 24, 'Human Resources', 'Kantor Pusat Lt. 2 - HR & GA', 'Rina Amelia', 'Rusak Ringan (Grade C)', 'Perbaikan', 'Monochrome laser printer, duplex, Gigabit Ethernet, 40 ppm, 350-sheet capacity.', 3100000, 'AST-PR-2023-012'],
  ['AST-NW-2021-005', 'Cisco Catalyst 2960-X 48-Port', 'Perangkat Jaringan', 'Cisco', 'Catalyst 2960-X 48-Port', 'CSC-SW-99120', 32000000, '2021-07-05', 'PT Tera Data Indonusa Tbk', 'PO-2021-07-0088', 60, 'Information Technology', 'Ruang Server Lt. 2', 'Fajar Anugrah', 'Sangat Baik (Grade A)', 'Aktif', 'PoE+, 4x 1G SFP, Managed Switch, IOS LAN Base, rack mount 1U.', 12800000, 'AST-NW-2021-005'],
  ['AST-VH-2022-003', 'Toyota Avanza Veloz 1.5 AT', 'Kendaraan Operasional', 'Toyota', 'Avanza Veloz 1.5 AT', 'ENG-2NR-774102', 245000000, '2022-08-12', 'Auto2000 Cilandak', 'INV/2022/AUTO/2210', 36, 'Operations', 'Pool Parkir Basement B2', 'Rudi Hartono', 'Baik (Grade B)', 'Dipinjam', 'Plat B 2145 KPO, Hitam Metalik, 7-seater, 32.450 km, servis rutin berkala.', 162000000, 'AST-VH-2022-003'],
  ['AST-AV-2022-019', 'Projector Epson EB-X500', 'Mesin Kantor', 'Epson', 'EB-X500', 'EPS-2022-8812', 8900000, '2022-02-18', 'PT Epson Indonesia', 'INV/2022/EPS/0412', 24, 'Administration', 'R. Rapat Eksekutif Lt. 4', 'Dewi Lestari', 'Sangat Baik (Grade A)', 'Tersedia', '3600 Lumens, HDMI, XGA Display, 3LCD, speaker built-in, remote original.', 3800000, 'AST-AV-2022-019'],
  ['AST-FN-2020-088', 'Herman Miller Aeron Chair', 'Furnitur & Fixture', 'Herman Miller', 'Aeron Size B', 'HM-AE-10294', 18500000, '2020-11-02', 'PT Ergonomics Nusantara', 'INV/2020/ERG/190', 60, 'Administration', 'Ruang Direksi Lt. 4', 'Andi Pratama', 'Baik (Grade B)', 'Aktif', 'Graphite Finish, Size B, PostureFit SL, adjustable armrest, 12-year warranty.', 5200000, 'AST-FN-2020-088'],
  ['AST-IT-2024-032', 'Apple MacBook Pro 14 M3', 'Laptop & PC', 'Apple', 'MacBook Pro 14 M3', 'AP-MBP-2024-1102', 34900000, '2024-04-11', 'iBox Indonesia', 'INV/2024/IBX/0991', 12, 'Information Technology', 'Kantor Pusat Lt. 3 - Divisi IT', 'Fajar Anugrah', 'Sangat Baik (Grade A)', 'Aktif', 'Apple M3 Pro, 18GB Unified Memory, 512GB SSD, 14.2" Liquid Retina XDR.', 28700000, 'AST-IT-2024-032'],
  ['AST-IT-2024-012', 'Apple iPad Pro 11-inch M2 256GB', 'Laptop & PC', 'Apple', 'iPad Pro 11 M2', 'AP-IPAD-9901M', 18900000, '2024-02-09', 'iBox Indonesia', 'INV/2024/IBX/0715', 12, 'Operations', 'Kantor Pusat Lt. 1 - Operasional', 'Rudi Hartono', 'Sangat Baik (Grade A)', 'Dipinjam', '11-inch Liquid Retina, M2, 256GB, Wi-Fi 6E, Apple Pencil Gen 2, Magic Keyboard.', 15200000, 'AST-IT-2024-012'],
  ['AST-MM-2024-019', 'Sony Alpha A7 IV Kit 28-70mm', 'Mesin Kantor', 'Sony', 'Alpha A7 IV', 'SNY-A7M4-8841', 42500000, '2024-03-22', 'Sony Indonesia', 'INV/2024/SON/1128', 24, 'Administration', 'Studio Kreatif Lt. 5', 'Siti Rahmawati', 'Sangat Baik (Grade A)', 'Dipinjam', '33MP full-frame, 4K60 video, FE 28-70mm kit lens, 2 batteries, cage, SD 128GB.', 34600000, 'AST-MM-2024-019'],
  ['AST-AO-2022-005', 'Printer Portable HP Officejet 200', 'Mesin Kantor', 'HP', 'Officejet 200', 'HP-OJ-20019', 4200000, '2022-09-13', 'PT Mitra Docucare', 'INV/2022/MDC/0451', 24, 'Finance', 'Kantor Pusat Lt. 2 - Keuangan', 'Agus Wijaya', 'Baik (Grade B)', 'Tersedia', 'Print/copy/scan portable, battery, Wi-Fi Direct, USB-C, travel case.', 1700000, 'AST-AO-2022-005'],
  ['AST-NW-2024-019', 'Fluke Networks CableIQ Gigabit Tester', 'Perangkat Jaringan', 'Fluke Networks', 'CableIQ Qualification Tester', 'FLK-2021-0034', 18500000, '2024-01-10', 'PT Tera Data Indonusa Tbk', 'INV/2024/TD/0034', 36, 'Information Technology', 'Gudang IT Lt. 3', 'Riko Saputra', 'Sangat Baik (Grade A)', 'Aktif', 'Gigabit qualification tester, copper/fiber, IntelliTone probe, hard case.', 13200000, 'AST-NW-2024-019'],
  ['AST-WH-2023-003', 'Toyota Innova Zenix V Q', 'Kendaraan Operasional', 'Toyota', 'Innova Zenix V Q', 'B 194 AFX', 412000000, '2023-05-18', 'Auto2000 Cilandak', 'INV/2023/AUTO/0772', 36, 'Operations', 'Pool Parkir Basement B2', 'Mulyadi', 'Sangat Baik (Grade A)', 'Dipinjam', 'Plat B 194 AFX, Hybrid, 7-seater, 18.900 km, servis rutin lengkap.', 348000000, 'AST-WH-2023-003'],
  ['AST-IT-2022-112', 'ASUS VivoBook 14 A416', 'Laptop & PC', 'ASUS', 'VivoBook A416JA', 'ASU-VB-2022-6612', 9800000, '2022-10-07', 'PT ASUS Indonesia', 'INV/2022/ASUS/881', 24, 'Human Resources', 'Kantor Pusat Lt. 2 - HR & GA', 'Maya Putri', 'Baik (Grade B)', 'Aktif', 'Core i5-1035G1, 8GB RAM, 512GB SSD, 14" FHD, Windows 11 Home.', 4700000, 'AST-IT-2022-112'],
  ['AST-PR-2021-034', 'Canon imageRUNNER 2206 Scanner', 'Mesin Kantor', 'Canon', 'imageRUNNER 2206', 'CN-IR-2206-4471', 11200000, '2021-12-01', 'PT Canon Indonesia', 'INV/2021/CN/2206', 24, 'Administration', 'Kantor Pusat Lt. 2 - HR & GA', 'Nabila Rahma', 'Rusak Ringan (Grade C)', 'Perbaikan', 'A3 monochrome multifunction, scan/print/copy, ADF, 22 ppm.', 3800000, 'AST-PR-2021-034'],
  ['AST-NW-2022-027', 'Ubiquiti UniFi Switch 24 PoE', 'Perangkat Jaringan', 'Ubiquiti', 'USW-24-POE', 'UBNT-SW-2401', 7800000, '2022-04-14', 'PT Datacomm Diangraha', 'INV/2022/DC/1440', 36, 'Information Technology', 'Ruang Server Lt. 2', 'Fajar Anugrah', 'Sangat Baik (Grade A)', 'Aktif', '24-port Gigabit PoE+, 2x SFP, 95W power budget, UniFi managed.', 4400000, 'AST-NW-2022-027'],
  ['AST-FN-2021-102', 'Ergotech Ergo Chair Pro', 'Furnitur & Fixture', 'Ergotech', 'Ergo Chair Pro', 'ERG-1021-559', 6200000, '2021-08-30', 'PT Ergonomics Nusantara', 'INV/2021/ERG/201', 48, 'Information Technology', 'Kantor Pusat Lt. 3 - Divisi IT', 'Dimas Saputra', 'Baik (Grade B)', 'Aktif', 'Mesh back, lumbar support, 4D armrest, aluminium base.', 2400000, 'AST-FN-2021-102'],
  ['AST-IT-2020-077', 'Lenovo ThinkCentre M720', 'Laptop & PC', 'Lenovo', 'ThinkCentre M720q', 'LNV-M720-7712', 10500000, '2020-06-15', 'PT Bhinneka Mentari Dimensi', 'INV/2020/BMD/0614', 36, 'Finance', 'Kantor Pusat Lt. 2 - Keuangan', 'Siti Rahmawati', 'Rusak Berat (Grade D)', 'Afkir', 'Core i5-8500T, 8GB RAM, 256GB SSD, Tiny form factor, unit usang.', 0, 'AST-IT-2020-077'],
  ['AST-AV-2023-022', 'BenQ MU613 Projector 4K', 'Mesin Kantor', 'BenQ', 'MU613', 'BNQ-MU613-1182', 15400000, '2023-09-08', 'PT BenQ Indonesia', 'INV/2023/BNQ/0918', 24, 'Administration', 'R. Rapat Eksekutif Lt. 4', 'Dewi Lestari', 'Sangat Baik (Grade A)', 'Tersedia', '4K UHD, 4000 lumens, HDR, HDMI 2.0, wireless presentation.', 11400000, 'AST-AV-2023-022'],
  ['AST-VH-2021-009', 'Isuzu Elf Blind Van', 'Kendaraan Operasional', 'Isuzu', 'Elf Blind Van', 'B 9021 TKN', 328000000, '2021-03-11', 'PT Isuzu Astra Motor', 'INV/2021/ISZ/0391', 36, 'Operations', 'Pool Parkir Basement B2', 'Mulyadi', 'Baik (Grade B)', 'Aktif', 'Plat B 9021 TKN, 4.2 ton, blind van logistik, 84.200 km.', 185000000, 'AST-VH-2021-009'],
  ['AST-IT-2023-051', 'HP EliteBook 840 G9', 'Laptop & PC', 'HP', 'EliteBook 840 G9', 'HP-EB-840-5512', 23400000, '2023-07-19', 'PT HP Indonesia', 'INV/2023/HP/0722', 36, 'Finance', 'Kantor Pusat Lt. 2 - Keuangan', 'Agus Wijaya', 'Sangat Baik (Grade A)', 'Aktif', 'Core i7-1255U, 16GB LPDDR5, 512GB NVMe, 14" WUXGA, Win 11 Pro.', 17400000, 'AST-IT-2023-051'],
  ['AST-NW-2023-031', 'MikroTik Cloud Router CCR2004', 'Perangkat Jaringan', 'MikroTik', 'CCR2004-1G-12S+2XS', 'MTK-CCR-2004', 12600000, '2023-02-27', 'PT Jaringan Prima', 'INV/2023/JP/2211', 36, 'Information Technology', 'Ruang Server Lt. 2', 'Fajar Anugrah', 'Sangat Baik (Grade A)', 'Aktif', '12x SFP+, 2x SFP28, 4GB RAM, RouterOS L6, rackmount.', 9200000, 'AST-NW-2023-031'],
  ['AST-FN-2020-112', 'Meja Kerja Ergonomis 160cm', 'Furnitur & Fixture', 'Ergotec', 'Desk 160', 'ERG-DSK-160-22', 4800000, '2020-09-05', 'PT Ergonomics Nusantara', 'INV/2020/ERG/512', 36, 'Operations', 'Kantor Pusat Lt. 1 - Operasional', 'Rudi Hartono', 'Baik (Grade B)', 'Aktif', 'Oak laminate, adjustable height, cable management, 160x80cm.', 900000, 'AST-FN-2020-112'],
  ['AST-AV-2021-041', 'Logitech Rally Bar Conference Cam', 'Mesin Kantor', 'Logitech', 'Rally Bar', 'LGT-RLY-4401', 28900000, '2021-11-23', 'PT Logitech Indonesia', 'INV/2021/LGT/8812', 24, 'Information Technology', 'R. Rapat Eksekutif Lt. 4', 'Andi Pratama', 'Sangat Baik (Grade A)', 'Aktif', '4K PTZ camera, integrated speakers, AI noise suppression, Teams/Zoom.', 12800000, 'AST-AV-2021-041'],
]

export const assets = assetSeeds.map((a, index) => {
  const [code, name, category, brand, model, serial, purchasePrice, purchaseDate, supplier, invoice, warrantyMonths, department, location, pic, condition, status, description, bookValue, barcode] = a
  return {
    id: `AST-${index + 1}`,
    code, name, category, brand, model, serial, description,
    purchaseDate, purchasePrice, supplier, invoice, warrantyMonths,
    department, location, pic, condition, status, bookValue, barcode,
    room: location.includes('Lt. 3') ? 'Ruang Engineering / Workstation 04' : location.includes('Lt. 2') ? 'Ruang Operasional / Desk 02' : 'Area Utama',
    supplierEmail: supplier.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12) + '@vendor.co.id',
    taxInvoice: `010.004-${23 + (index % 4)}.${99120000 + index}`,
    createdAt: purchaseDate,
    image: null,
  }
})

export const inventory = [
  { id: 'INV-ATK-001', sku: 'INV-ATK-001', name: 'Kertas HVS A4 70gr Sinar Dunia', category: 'Kertas & ATK', unit: 'Rim', stock: 12, minStock: 50, location: 'Gudang Utama Lt. 1', rack: 'Rak A-02', description: 'Konsumsi harian percetakan dokumen divisi.', status: 'Menipis' },
  { id: 'INV-IT-004', sku: 'INV-IT-004', name: 'Toner HP LaserJet 107a (W1107A)', category: 'Printer Consumable', unit: 'Pcs', stock: 2, minStock: 8, location: 'Gudang IT Lt. 3', rack: 'Lemari B-1', description: 'Cartridge hitam original untuk printer tim Finance.', status: 'Menipis' },
  { id: 'INV-NET-012', sku: 'INV-NET-012', name: 'Kabel UTP Cat6 Patch Cord 3m Belden', category: 'Kabel & Jaringan', unit: 'Pcs', stock: 5, minStock: 15, location: 'Gudang Utama Lt. 1', rack: 'Rak C-03', description: 'Kabel ethernet LAN RJ45 factory crimped biru.', status: 'Menipis' },
  { id: 'INV-IT-008', sku: 'INV-IT-008', name: 'Mouse Wireless Logitech M170', category: 'IT Peripherals', unit: 'Unit', stock: 34, minStock: 10, location: 'Gudang IT Lt. 3', rack: 'Rak B-02', description: 'Standard issue wireless mouse + baterai AA.', status: 'Aman' },
  { id: 'INV-IT-009', sku: 'INV-IT-009', name: 'Keyboard USB Logitech K120', category: 'IT Peripherals', unit: 'Unit', stock: 18, minStock: 10, location: 'Gudang IT Lt. 3', rack: 'Rak B-03', description: 'Standard full-size spill-resistant USB layout.', status: 'Aman' },
  { id: 'INV-STR-015', sku: 'INV-STR-015', name: 'Flashdisk SanDisk Cruzer Blade 32GB', category: 'IT Peripherals', unit: 'Pcs', stock: 0, minStock: 20, location: 'Gudang IT Lt. 3', rack: 'Rak D-01', description: 'Permintaan tertahan: menunggu distribusi.', status: 'Habis' },
  { id: 'INV-PRN-020', sku: 'INV-PRN-020', name: 'Tinta Botol Epson 003 Black Original', category: 'Printer Consumable', unit: 'Botol', stock: 28, minStock: 12, location: 'Gudang Utama Lt. 1', rack: 'Rak A-05', description: 'Untuk armada printer EcoTank L3110/L3210.', status: 'Aman' },
  { id: 'INV-ATK-009', sku: 'INV-ATK-009', name: 'Ballpoint Standard AE7 0.5mm Black (Pak/12)', category: 'Alat Tulis Kantor', unit: 'Pak', stock: 45, minStock: 15, location: 'Gudang Utama Lt. 1', rack: 'Rak A-01', description: 'Pulpen kantor standar administrasi dan resepsionis.', status: 'Aman' },
  { id: 'INV-ATK-014', sku: 'INV-ATK-014', name: 'Map Plastik Folder Snapshot', category: 'Alat Tulis Kantor', unit: 'Pak', stock: 22, minStock: 10, location: 'Gudang Utama Lt. 1', rack: 'Rak A-03', description: 'Map plastik untuk arsip dokumen internal.', status: 'Aman' },
  { id: 'INV-IT-021', sku: 'INV-IT-021', name: 'Kabel HDMI 2m Ugreen', category: 'IT Peripherals', unit: 'Pcs', stock: 7, minStock: 10, location: 'Gudang IT Lt. 3', rack: 'Rak E-02', description: 'Kabel HDMI 4K untuk ruang rapat dan proyektor.', status: 'Menipis' },
  { id: 'INV-ATK-020', sku: 'INV-ATK-020', name: 'Kertas Continuous Form 2 Ply', category: 'Kertas & ATK', unit: 'Box', stock: 4, minStock: 6, location: 'Gudang Utama Lt. 1', rack: 'Rak A-04', description: 'Formulir continuous untuk dokumen akuntansi.', status: 'Menipis' },
  { id: 'INV-PRN-012', sku: 'INV-PRN-012', name: 'Drum Unit HP 107A', category: 'Printer Consumable', unit: 'Pcs', stock: 0, minStock: 3, location: 'Gudang IT Lt. 3', rack: 'Lemari B-2', description: 'Drum unit pengganti untuk printer HP LaserJet seri 107.', status: 'Habis' },
  { id: 'INV-NET-018', sku: 'INV-NET-018', name: 'Konektor RJ45 Cat6', category: 'Kabel & Jaringan', unit: 'Pack', stock: 30, minStock: 10, location: 'Gudang Utama Lt. 1', rack: 'Rak C-04', description: 'Konektor RJ45 shielded untuk terminasi kabel jaringan.', status: 'Aman' },
  { id: 'INV-IT-030', sku: 'INV-IT-030', name: 'Webcam Logitech C920', category: 'IT Peripherals', unit: 'Unit', stock: 9, minStock: 5, location: 'Gudang IT Lt. 3', rack: 'Rak F-01', description: 'Webcam 1080p untuk kebutuhan meeting hybrid.', status: 'Aman' },
]

export const transactions = [
  { id: 'TRX-OUT-2025-142', type: 'Keluar', date: '2025-10-28T10:15', itemId: 'INV-ATK-001', qty: 5, before: 17, after: 12, recipient: 'Rina Amelia', department: 'Human Resources', purpose: 'Cetak berkas Onboarding Karyawan Baru & Formulir Evaluasi Kinerja (KPI) Periode Q4 2025.', officer: 'Budi Santoso', location: 'Rak ATK B-04 (Lt. 1)', ref: 'SJ-OUT/2025/X/0142', note: 'Diserahkan langsung ke penerima.', status: 'Terverifikasi' },
  { id: 'TRX-IN-2025-089', type: 'Masuk', date: '2025-10-27T14:30', itemId: 'INV-IT-004', qty: 10, before: 2, after: 12, recipient: 'PT Mitra Docucare', department: 'Procurement', purpose: 'Restock toner printer Finance dari vendor kontrak.', officer: 'Budi Santoso', location: 'Rak IT B-1 (Lt. 3)', ref: 'SJ-IN/2025/X/0089', note: 'Faktur vendor terlampir.', status: 'Terverifikasi' },
  { id: 'TRX-OUT-2025-141', type: 'Keluar', date: '2025-10-27T11:00', itemId: 'INV-IT-008', qty: 2, before: 36, after: 34, recipient: 'Hendra Setiawan', department: 'Information Technology', purpose: 'Penggantian mouse workstation developer baru.', officer: 'Budi Santoso', location: 'Rak IT B-02 (Lt. 3)', ref: 'SJ-OUT/2025/X/0141', note: 'Unit lama rusak, masuk daftar disposal.', status: 'Terverifikasi' },
  { id: 'TRX-OUT-2025-140', type: 'Keluar', date: '2025-10-26T16:45', itemId: 'INV-NET-012', qty: 4, before: 9, after: 5, recipient: 'Fajar Anugrah', department: 'Information Technology', purpose: 'Instalasi kabel patch panel ruang server.', officer: 'Budi Santoso', location: 'Rak C-03 (Lt. 1)', ref: 'SJ-OUT/2025/X/0140', note: 'Terminasi oleh tim network.', status: 'Terverifikasi' },
  { id: 'TRX-IN-2025-088', type: 'Masuk', date: '2025-10-25T09:20', itemId: 'INV-PRN-020', qty: 20, before: 8, after: 28, recipient: 'PT Epson Indonesia', department: 'Procurement', purpose: 'Pengadaan tinta printer EcoTank kuartal IV.', officer: 'Budi Santoso', location: 'Rak A-05 (Lt. 1)', ref: 'SJ-IN/2025/X/0088', note: 'Barang diterima sesuai PO.', status: 'Terverifikasi' },
  { id: 'TRX-OUT-2025-139', type: 'Keluar', date: '2025-10-24T13:10', itemId: 'INV-STR-015', qty: 10, before: 10, after: 0, recipient: 'Dewi Lestari', department: 'Administration', purpose: 'Distribusi flashdisk untuk kegiatan pelatihan eksternal.', officer: 'Budi Santoso', location: 'Rak D-01 (Lt. 3)', ref: 'SJ-OUT/2025/X/0139', note: 'Stok habis, permintaan baru ditahan.', status: 'Terverifikasi' },
  { id: 'TRX-IN-2025-087', type: 'Masuk', date: '2025-10-22T10:00', itemId: 'INV-IT-009', qty: 15, before: 3, after: 18, recipient: 'PT Datacomm Diangraha', department: 'Procurement', purpose: 'Restock keyboard pengganti unit rusak.', officer: 'Budi Santoso', location: 'Rak B-03 (Lt. 3)', ref: 'SJ-IN/2025/X/0087', note: 'Kualitas barang sesuai spesifikasi.', status: 'Terverifikasi' },
  { id: 'TRX-OUT-2025-138', type: 'Keluar', date: '2025-10-21T15:20', itemId: 'INV-IT-021', qty: 3, before: 10, after: 7, recipient: 'Dewi Lestari', department: 'Administration', purpose: 'Pemasangan kabel HDMI ruang rapat eksekutif.', officer: 'Budi Santoso', location: 'Rak E-02 (Lt. 3)', ref: 'SJ-OUT/2025/X/0138', note: 'Instalasi oleh tim GA.', status: 'Terverifikasi' },
  { id: 'TRX-IN-2025-086', type: 'Masuk', date: '2025-10-20T09:10', itemId: 'INV-ATK-009', qty: 24, before: 21, after: 45, recipient: 'PT Sinar Dunia', department: 'Procurement', purpose: 'Pengadaan ATK bulanan seluruh departemen.', officer: 'Budi Santoso', location: 'Rak A-01 (Lt. 1)', ref: 'SJ-IN/2025/X/0086', note: 'Diterima lengkap 2 karton.', status: 'Terverifikasi' },
  { id: 'TRX-OUT-2025-137', type: 'Keluar', date: '2025-10-18T14:05', itemId: 'INV-ATK-001', qty: 6, before: 23, after: 17, recipient: 'Agus Wijaya', department: 'Finance', purpose: 'Cetak dokumen audit pajak kuartal III.', officer: 'Budi Santoso', location: 'Rak A-02 (Lt. 1)', ref: 'SJ-OUT/2025/X/0137', note: '-', status: 'Terverifikasi' },
  { id: 'TRX-ADJ-2025-018', type: 'Penyesuaian', date: '2025-10-17T16:30', itemId: 'INV-NET-018', qty: -2, before: 32, after: 30, recipient: 'Stock Opname', department: 'Warehouse', purpose: 'Koreksi hasil stock opname mingguan.', officer: 'Budi Santoso', location: 'Rak C-04 (Lt. 1)', ref: 'ADJ/2025/X/0018', note: 'Selisih 2 pack karena rusak.', status: 'Terverifikasi' },
]

export const borrowings = [
  {
    id: 'BRW-2025-084', code: 'REQ-LOAN-2025-084', employeeId: 'EMP-2022-094', assetId: 'AST-IT-2023-001',
    borrowDate: '2025-10-24T09:15', dueDate: '2025-10-28T17:00', returnDate: null, status: 'Sedang Dipinjam', priority: 'Prioritas Tinggi',
    purpose: 'Expo & Roadshow Teknologi Jakarta Barat (ICC Senayan Hall B) selama 4 hari, memerlukan akses konfigurasi Docker lokal dan testing load balancing.',
    approvedBy: 'Andi Pratama', department: 'Information Technology', conditionOut: 'Lengkap (Laptop + Charger 65W + Sleeve Case)', notes: 'Konfirmasi perpanjangan minimal 24 jam sebelum jatuh tempo.', createdBy: 'Dimas Saputra',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '24 Okt 2025, 08:30 WIB', by: 'Dimas Saputra', desc: 'Mengisi formulir peminjaman online untuk keperluan proyek eksternal JCC Expo.' },
      { title: 'Rekomendasi Atasan Disetujui', at: '24 Okt 2025, 09:00 WIB', by: 'Fajar Anugrah', desc: 'Memverifikasi urgensi keperluan & beban kerja teknis.' },
      { title: 'Otorisasi Admin Selesai', at: '24 Okt 2025, 09:15 WIB', by: 'Andi Pratama', desc: 'Menandatangani pelepasan aset dengan sertifikat digital internal.' },
      { title: 'Aset Diserahkan di Gudang IT', at: '24 Okt 2025, 09:40 WIB', by: 'Budi Santoso', desc: 'Menerima unit fisik, checklist kelengkapan dan scan barcode nomor seri.' },
      { title: 'Sedang Digunakan', at: 'Sekarang', by: 'Sistem', desc: 'Target pengembalian paling lambat 28 Okt 2025, 17:00 WIB di Meja Layanan Gudang IT.' },
    ],
  },
  {
    id: 'BRW-2025-085', code: 'REQ-LOAN-2025-085', employeeId: 'EMP-2019-012', assetId: 'AST-MM-2024-019',
    borrowDate: '2025-10-15T14:00', dueDate: '2025-10-21T17:00', returnDate: null, status: 'Terlambat', priority: 'Proyek Luar Kota',
    purpose: 'Produksi konten kampanye brand untuk kantor cabang Bandung.', approvedBy: 'Dewi Lestari', department: 'Administration',
    conditionOut: 'Lengkap (Kamera + 2 Baterai + Kit Lens + Cage)', notes: 'Terlambat 3 hari. Denda keterlambatan berlaku.',
    createdBy: 'Siti Rahmawati',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '14 Okt 2025, 10:10 WIB', by: 'Siti Rahmawati', desc: 'Pengajuan peminjaman kamera untuk produksi konten cabang.' },
      { title: 'Disetujui Atasan', at: '14 Okt 2025, 13:20 WIB', by: 'Dewi Lestari', desc: 'Disetujui untuk kebutuhan kampanye kuartal IV.' },
      { title: 'Aset Diserahkan', at: '15 Okt 2025, 14:00 WIB', by: 'Budi Santoso', desc: 'Unit kamera dan aksesori lengkap diserahkan.' },
      { title: 'Melewati Batas Pengembalian', at: '22 Okt 2025, 08:00 WIB', by: 'Sistem', desc: 'Sistem menandai keterlambatan 3 hari dan mengirim notifikasi.' },
    ],
  },
  {
    id: 'BRW-2025-082', code: 'REQ-LOAN-2025-082', employeeId: 'EMP-2017-005', assetId: 'AST-AV-2022-019',
    borrowDate: '2025-10-22T08:30', dueDate: '2025-10-25T17:00', returnDate: null, status: 'Sedang Dipinjam', priority: 'Meeting Klien',
    purpose: 'Presentasi proposal proyek di ruang meeting kantor pusat.', approvedBy: 'Andi Pratama', department: 'Operations',
    conditionOut: 'Lengkap (Proyektor + Remote + Kabel HDMI)', notes: '-', createdBy: 'Rudi Hartono',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '21 Okt 2025, 16:00 WIB', by: 'Rudi Hartono', desc: 'Permintaan proyektor untuk meeting klien.' },
      { title: 'Disetujui Admin', at: '21 Okt 2025, 16:30 WIB', by: 'Andi Pratama', desc: 'Disetujui, aset tersedia.' },
      { title: 'Aset Diserahkan', at: '22 Okt 2025, 08:30 WIB', by: 'Budi Santoso', desc: 'Proyektor dan aksesori diserahkan.' },
    ],
  },
  {
    id: 'BRW-2025-081', code: 'REQ-LOAN-2025-081', employeeId: 'EMP-2021-089', assetId: 'AST-IT-2022-048',
    borrowDate: '2025-10-24T11:00', dueDate: '2025-10-30T17:00', returnDate: null, status: 'Disetujui', priority: 'Workshop Karyawan',
    purpose: 'Workshop akuntansi dan audit internal di ruang pelatihan.', approvedBy: 'Andi Pratama', department: 'Finance',
    conditionOut: 'Lengkap (Desktop + Keyboard + Mouse)', notes: 'Menunggu pengambilan di Gudang IT.', createdBy: 'Budi Santoso',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '24 Okt 2025, 09:10 WIB', by: 'Budi Santoso', desc: 'Permintaan desktop untuk workshop internal.' },
      { title: 'Disetujui Admin', at: '24 Okt 2025, 10:30 WIB', by: 'Andi Pratama', desc: 'Disetujui. Menunggu serah terima fisik.' },
    ],
  },
  {
    id: 'BRW-2025-080', code: 'REQ-LOAN-2025-080', employeeId: 'EMP-2019-041', assetId: 'AST-AO-2022-005',
    borrowDate: '2025-10-18T10:00', dueDate: '2025-10-23T17:00', returnDate: '2025-10-23T15:30', status: 'Dikembalikan', priority: 'Audit Pajak Lapangan',
    purpose: 'Audit pajak lapangan di kantor cabang Bandung.', approvedBy: 'Andi Pratama', department: 'Finance',
    conditionOut: 'Lengkap (Printer + Charger + Case)', notes: 'Dikembalikan tepat waktu, kondisi baik.', createdBy: 'Agus Wijaya',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '17 Okt 2025, 14:20 WIB', by: 'Agus Wijaya', desc: 'Permintaan printer portabel untuk audit lapangan.' },
      { title: 'Disetujui Admin', at: '17 Okt 2025, 15:00 WIB', by: 'Andi Pratama', desc: 'Disetujui.' },
      { title: 'Aset Diserahkan', at: '18 Okt 2025, 10:00 WIB', by: 'Budi Santoso', desc: 'Printer dan charger diserahkan.' },
      { title: 'Aset Dikembalikan', at: '23 Okt 2025, 15:30 WIB', by: 'Budi Santoso', desc: 'Dikembalikan lengkap dan lolos inspeksi.' },
    ],
  },
  {
    id: 'BRW-2025-079', code: 'REQ-LOAN-2025-079', employeeId: 'EMP-2020-067', assetId: 'AST-WH-2023-003',
    borrowDate: '2025-10-21T16:45', dueDate: '2025-10-25T17:00', returnDate: null, status: 'Ditolak', priority: 'Keperluan Pribadi',
    purpose: 'Permintaan penggunaan kendaraan operasional untuk keperluan pribadi di luar SOP.', approvedBy: '-', department: 'Human Resources',
    conditionOut: '-', notes: 'Ditolak: di luar SOP penggunaan kendaraan operasional.', createdBy: 'Rina Amelia',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '21 Okt 2025, 16:45 WIB', by: 'Rina Amelia', desc: 'Permintaan kendaraan operasional di luar keperluan dinas.' },
      { title: 'Pengajuan Ditolak', at: '21 Okt 2025, 17:10 WIB', by: 'Andi Pratama', desc: 'Tidak sesuai SOP penggunaan kendaraan operasional.' },
    ],
  },
  {
    id: 'BRW-2025-078', code: 'REQ-LOAN-2025-078', employeeId: 'EMP-2021-001', assetId: 'AST-IT-2024-012',
    borrowDate: '2025-10-20T13:10', dueDate: '2025-10-27T17:00', returnDate: null, status: 'Sedang Dipinjam', priority: 'Presentasi Direktur',
    purpose: 'Presentasi direksi dan demo dashboard eksekutif.', approvedBy: 'Board of Directors', department: 'Information Technology',
    conditionOut: 'Lengkap (iPad + Apple Pencil + Magic Keyboard)', notes: '-', createdBy: 'Andi Pratama',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '20 Okt 2025, 10:00 WIB', by: 'Andi Pratama', desc: 'Permintaan iPad untuk presentasi direksi.' },
      { title: 'Disetujui Atasan', at: '20 Okt 2025, 11:00 WIB', by: 'Board of Directors', desc: 'Disetujui.' },
      { title: 'Aset Diserahkan', at: '20 Okt 2025, 13:10 WIB', by: 'Budi Santoso', desc: 'Unit dan aksesori diserahkan.' },
    ],
  },
  {
    id: 'BRW-2025-077', code: 'REQ-LOAN-2025-077', employeeId: 'EMP-2022-055', assetId: 'AST-IT-2022-112',
    borrowDate: '2025-10-29T09:00', dueDate: '2025-11-05T17:00', returnDate: null, status: 'Menunggu Persetujuan', priority: 'Regular / Kantor',
    purpose: 'Penggantian sementara laptop HR selama perbaikan unit utama.', approvedBy: '-', department: 'Human Resources',
    conditionOut: '-', notes: 'Menunggu verifikasi ketersediaan aset.', createdBy: 'Maya Putri',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '28 Okt 2025, 14:20 WIB', by: 'Maya Putri', desc: 'Permintaan laptop pengganti sementara.' },
    ],
  },
  {
    id: 'BRW-2025-076', code: 'REQ-LOAN-2025-076', employeeId: 'EMP-2023-015', assetId: 'AST-IT-2024-032',
    borrowDate: '2025-10-26T09:00', dueDate: '2025-11-02T17:00', returnDate: null, status: 'Disetujui', priority: 'Proyek Internal',
    purpose: 'Pengembangan aplikasi internal dan testing performa.', approvedBy: 'Fajar Anugrah', department: 'Information Technology',
    conditionOut: 'Lengkap (MacBook + Charger 96W)', notes: 'Menunggu pengambilan.', createdBy: 'Hendra Setiawan',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '25 Okt 2025, 15:30 WIB', by: 'Hendra Setiawan', desc: 'Permintaan MacBook untuk pengembangan aplikasi.' },
      { title: 'Disetujui Atasan', at: '25 Okt 2025, 16:00 WIB', by: 'Fajar Anugrah', desc: 'Disetujui untuk kebutuhan proyek internal.' },
    ],
  },
  {
    id: 'BRW-2025-075', code: 'REQ-LOAN-2025-075', employeeId: 'EMP-2018-022', assetId: 'AST-AV-2023-022',
    borrowDate: '2025-10-19T08:30', dueDate: '2025-10-26T17:00', returnDate: '2025-10-22T16:00', status: 'Dikembalikan', priority: 'Meeting Eksekutif',
    purpose: 'Presentasi tahunan direksi di ruang rapat eksekutif.', approvedBy: 'Andi Pratama', department: 'Administration',
    conditionOut: 'Lengkap (Proyektor + Remote + Kabel HDMI)', notes: 'Dikembalikan lebih awal, kondisi prima.', createdBy: 'Dewi Lestari',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '18 Okt 2025, 10:00 WIB', by: 'Dewi Lestari', desc: 'Permintaan proyektor 4K.' },
      { title: 'Disetujui Admin', at: '18 Okt 2025, 11:00 WIB', by: 'Andi Pratama', desc: 'Disetujui.' },
      { title: 'Aset Diserahkan', at: '19 Okt 2025, 08:30 WIB', by: 'Budi Santoso', desc: 'Proyektor diserahkan.' },
      { title: 'Aset Dikembalikan', at: '22 Okt 2025, 16:00 WIB', by: 'Budi Santoso', desc: 'Dikembalikan lebih awal, kondisi prima.' },
    ],
  },
  {
    id: 'BRW-2025-074', code: 'REQ-LOAN-2025-074', employeeId: 'EMP-2016-009', assetId: 'AST-VH-2021-009',
    borrowDate: '2025-10-24T07:30', dueDate: '2025-10-31T17:00', returnDate: null, status: 'Sedang Dipinjam', priority: 'Distribusi Logistik',
    purpose: 'Distribusi perangkat dan dokumen ke kantor cabang Bandung.', approvedBy: 'Rudi Hartono', department: 'Operations',
    conditionOut: 'Lengkap (Kendaraan + STNK + Kunci Cadangan)', notes: 'Rute Jakarta - Bandung - Jakarta.', createdBy: 'Mulyadi',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '23 Okt 2025, 13:00 WIB', by: 'Mulyadi', desc: 'Permintaan blind van untuk distribusi logistik.' },
      { title: 'Disetujui Atasan', at: '23 Okt 2025, 14:00 WIB', by: 'Rudi Hartono', desc: 'Disetujui.' },
      { title: 'Kendaraan Diserahkan', at: '24 Okt 2025, 07:30 WIB', by: 'Budi Santoso', desc: 'Kendaraan dan dokumen lengkap.' },
    ],
  },
  {
    id: 'BRW-2025-073', code: 'REQ-LOAN-2025-073', employeeId: 'EMP-2020-073', assetId: 'AST-NW-2024-019',
    borrowDate: '2025-10-29T09:00', dueDate: '2025-10-30T17:00', returnDate: null, status: 'Menunggu Persetujuan', priority: 'Inspeksi Jaringan',
    purpose: 'Pengujian kualitas kabel jaringan gedung baru lantai 6.', approvedBy: '-', department: 'Information Technology',
    conditionOut: '-', notes: 'Menunggu persetujuan admin.', createdBy: 'Riko Saputra',
    timeline: [
      { title: 'Pengajuan Peminjaman Dibuat', at: '28 Okt 2025, 11:00 WIB', by: 'Riko Saputra', desc: 'Permintaan cable tester untuk inspeksi jaringan.' },
    ],
  },
]

export const maintenance = [
  {
    id: 'MNT-2025-042', code: 'TCK-MNT-2025-042', assetId: 'AST-NW-2021-005', type: 'Korektif Hardware', priority: 'Tinggi',
    submittedDate: '2025-10-26', targetDate: '2025-10-29', completedDate: null, technician: 'Riko Saputra', vendor: 'PT Tera Data Indonusa',
    estimate: 7500000, actual: 7200000, status: 'Dalam Pengerjaan', progress: 42,
    problem: 'Indikasi baterai mengalami drop drastis saat beban puncak terjadi pada server produksi utama cluster B. Alarm audible overload berbunyi interval 15 menit dan sistem bypass aktif secara otomatis, berisiko tinggi mematikan mesin basis data saat terjadi pemadaman mendadak.',
    diagnosis: 'Hasil diagnosa uji debit baterai menunjukkan 4 cell pack baterai timbal-asam (lead-acid) mengalami degradasi kapasitas parah (<30% remaining state-of-health). Inverter board & rectifier sirkuit masih bekerja normal dalam batas toleransi. Diperlukan penggantian segera 1 set battery cartridge kit original serta kalibrasi ulang terhadap charging output DC.',
    parts: [
      { name: 'APC Replacement Battery Cartridge #140', qty: '1 Unit Cartridge Kit', price: 6250000, note: 'Tersedia di Gudang IT (GUD-02)' },
      { name: 'Cleaning Dust & Thermal Re-greasing', qty: 'Paket Servis & Kalibrasi', price: 950000, note: 'Pengerjaan langsung di rak' },
    ],
    costs: [
      { label: 'APC Battery Replacement', value: 6250000 },
      { label: 'Jasa Kalibrasi & Preventive Check', value: 750000 },
      { label: 'Biaya Pengujian Daya & QC Load', value: 200000 },
    ],
    checklist: [
      { label: 'Pengecekan visual konektor kabel daya & pembumian (grounding)', done: true },
      { label: 'Beban baterai stabil pada simulasi blackout listrik PLN', done: true },
      { label: 'Uji coba sinkronisasi switch otomatis (ATS transfer normal)', done: false },
      { label: 'Pembersihan menyeluruh rangka chassis & kipas pendingin UPS', done: false },
    ],
    notes: 'Uji simulasi beban 50% menunjukkan temperatur transformator berada di 41°C (normal aman). Pemantauan dilanjutkan hingga siklus burn-in selesai.',
    timeline: [
      { title: 'Tiket Dibuat', at: '26 Okt 2025, 08:30 WIB', by: 'Fajar Anugrah (IT Lead)', desc: 'Laporan insiden daya darurat dibuat dengan kode prioritas tinggi atas penurunan kapasitas baterai backup ruang server.' },
      { title: 'Disetujui oleh Andi Pratama', at: '26 Okt 2025, 10:15 WIB', by: 'Andi Pratama (Super Admin)', desc: 'Persetujuan otorisasi darurat untuk inspeksi teknis lapangan langsung serta disposisi vendor support SLA-MNT.' },
      { title: 'Inspeksi Fisik & Diagnosa', at: '26 Okt 2025, 13:40 WIB', by: 'Riko Saputra', desc: 'Pengecekan voltase internal cell baterai, tercatat degradasi kapasitas di bawah batas ambang normal. Rekomendasi penggantian RBC140 diserahkan.' },
      { title: 'Pengeluaran Suku Cadang dari Gudang IT', at: '27 Okt 2025, 09:00 WIB', by: 'Budi Santoso', desc: 'Barang logistik resmi dikeluarkan dari Gudang IT via bukti transfer transaksi TRX-OUT-2025-143.' },
      { title: 'Tahap Sekarang: Pengujian Beban & Burn-in Test', at: '27 Okt 2025, 14:20 WIB', by: 'Riko Saputra', desc: 'Penggantian cartridge baterai selesai dipasang. Saat ini sistem berada pada tahap load testing 50% selama 12 jam untuk verifikasi kestabilan inverter.', current: true },
    ],
    photos: [
      { label: 'Sebelum Perbaikan (26 Okt)', caption: 'Indikator Alarm LCD & Battery Pack Lama', desc: 'Cell baterai menunjukkan pembengkakan fisik minor dan kode error Replace Battery Now.' },
      { label: 'Pemasangan Suku Cadang (27 Okt)', caption: 'Cartridge Baterai Baru Terpasang & Segel QC', desc: 'Modul cartridge resmi RBC140 terpasang kokoh dengan stempel uji fisik teknisi vendor.' },
    ],
  },
  {
    id: 'MNT-2025-041', code: 'TCK-MNT-2025-041', assetId: 'AST-VH-2022-003', type: 'Preventif', priority: 'Sedang',
    submittedDate: '2025-10-25', targetDate: '2025-10-27', completedDate: '2025-10-27', technician: 'Auto2000 Cilandak', vendor: 'Auto2000 Cilandak',
    estimate: 3850000, actual: 3850000, status: 'Selesai', progress: 100,
    problem: 'Servis rutin berkala 40.000 km, inspeksi rem depan, dan pengecekan sistem pendingin.', diagnosis: 'Penggantian oli mesin, filter oli, filter udara, dan pengecekan rem depan. Semua komponen dalam kondisi normal.', parts: [], costs: [], checklist: [], notes: 'Servis selesai sesuai jadwal. Garansi bengkel 3 bulan.', timeline: [], photos: [],
  },
  {
    id: 'MNT-2025-040', code: 'TCK-MNT-2025-040', assetId: 'AST-NW-2022-027', type: 'Korektif Hardware', priority: 'Tinggi',
    submittedDate: '2025-10-24', targetDate: '2025-10-30', completedDate: null, technician: 'PT Tera Data Indonusa', vendor: 'PT Tera Data Indonusa',
    estimate: 7200000, actual: 7500000, status: 'Dalam Pengerjaan', progress: 65,
    problem: 'Port PoE pada switch tidak mengalirkan daya ke 4 access point lantai 3.', diagnosis: 'Modul power supply internal mengalami penurunan kapasitas. Perlu penggantian modul PSU dan pengujian beban.', parts: [], costs: [], checklist: [], notes: 'Menunggu suku cadang PSU dari vendor.', timeline: [], photos: [],
  },
  {
    id: 'MNT-2025-039', code: 'TCK-MNT-2025-039', assetId: 'AST-PR-2023-012', type: 'Mekanis', priority: 'Rendah',
    submittedDate: '2025-10-23', targetDate: '2025-10-28', completedDate: null, technician: 'PT Mitra Docucare', vendor: 'PT Mitra Docucare',
    estimate: 350000, actual: 350000, status: 'Menunggu Suku Cadang', progress: 35,
    problem: 'Paper jam berulang pada tray 2 dan hasil cetak bergaris.', diagnosis: 'Roller pengumpan kertas aus. Perlu penggantian pickup roller kit.', parts: [], costs: [], checklist: [], notes: 'Suku cadang dipesan, estimasi tiba 29 Okt 2025.', timeline: [], photos: [],
  },
  {
    id: 'MNT-2025-038', code: 'TCK-MNT-2025-038', assetId: 'AST-AV-2022-019', type: 'Kalibrasi', priority: 'Preventif',
    submittedDate: '2025-10-21', targetDate: '2025-10-24', completedDate: '2025-10-24', technician: 'Riko Saputra', vendor: 'Internal IT Hub',
    estimate: 180000, actual: 180000, status: 'Selesai', progress: 100,
    problem: 'Kalibrasi warna dan fokus proyektor ruang rapat eksekutif.', diagnosis: 'Kalibrasi selesai, warna dan fokus kembali optimal.', parts: [], costs: [], checklist: [], notes: 'Hasil kalibrasi sesuai standar.', timeline: [], photos: [],
  },
  {
    id: 'MNT-2025-037', code: 'TCK-MNT-2025-037', assetId: 'AST-PR-2021-034', type: 'Korektif Hardware', priority: 'Tinggi',
    submittedDate: '2025-10-20', targetDate: '2025-10-26', completedDate: null, technician: 'PT Canon Indonesia', vendor: 'PT Canon Indonesia',
    estimate: 2400000, actual: 2550000, status: 'Dalam Pengerjaan', progress: 55,
    problem: 'Mesin scanner mengeluarkan suara kasar dan hasil scan bergaris vertikal.', diagnosis: 'Unit ADF kotor dan lampu scanner mulai melemah. Perlu pembersihan menyeluruh dan penggantian lampu.', parts: [], costs: [], checklist: [], notes: 'Menunggu lampu scanner original.', timeline: [], photos: [],
  },
  {
    id: 'MNT-2025-036', code: 'TCK-MNT-2025-036', assetId: 'AST-IT-2022-048', type: 'Preventif', priority: 'Rendah',
    submittedDate: '2025-10-18', targetDate: '2025-10-21', completedDate: '2025-10-21', technician: 'Riko Saputra', vendor: 'Internal IT Hub',
    estimate: 250000, actual: 250000, status: 'Selesai', progress: 100,
    problem: 'Pembersihan debu dan pengecekan thermal desktop Finance.', diagnosis: 'Thermal paste diganti, suhu operasional turun 8°C.', parts: [], costs: [], checklist: [], notes: 'Unit kembali normal.', timeline: [], photos: [],
  },
  {
    id: 'MNT-2025-035', code: 'TCK-MNT-2025-035', assetId: 'AST-IT-2024-032', type: 'Korektif Hardware', priority: 'Sedang',
    submittedDate: '2025-10-17', targetDate: '2025-10-25', completedDate: null, technician: 'iBox Indonesia', vendor: 'iBox Indonesia',
    estimate: 4800000, actual: 0, status: 'Menunggu', progress: 10,
    problem: 'Baterai MacBook cepat habis dan trackpad tidak responsif.', diagnosis: 'Menunggu pemeriksaan vendor resmi.', parts: [], costs: [], checklist: [], notes: 'Unit dikirim ke service center.', timeline: [], photos: [],
  },
  {
    id: 'MNT-2025-034', code: 'TCK-MNT-2025-034', assetId: 'AST-NW-2023-031', type: 'Preventif', priority: 'Rendah',
    submittedDate: '2025-10-12', targetDate: '2025-10-15', completedDate: '2025-10-15', technician: 'Fajar Anugrah', vendor: 'Internal IT Hub',
    estimate: 150000, actual: 150000, status: 'Selesai', progress: 100,
    problem: 'Pemeriksaan firmware dan backup konfigurasi router.', diagnosis: 'Firmware diperbarui ke versi stabil terbaru.', parts: [], costs: [], checklist: [], notes: 'Backup konfigurasi tersimpan.', timeline: [], photos: [],
  },
  {
    id: 'MNT-2025-033', code: 'TCK-MNT-2025-033', assetId: 'AST-WH-2023-003', type: 'Preventif', priority: 'Sedang',
    submittedDate: '2025-10-10', targetDate: '2025-10-15', completedDate: '2025-10-15', technician: 'Auto2000 Cilandak', vendor: 'Auto2000 Cilandak',
    estimate: 2750000, actual: 2750000, status: 'Selesai', progress: 100,
    problem: 'Servis berkala 20.000 km Toyota Innova Zenix.', diagnosis: 'Servis rutin selesai, semua komponen normal.', parts: [], costs: [], checklist: [], notes: 'Garansi bengkel 3 bulan.', timeline: [], photos: [],
  },
]

export const users = [
  { id: 'USR-001', employeeId: 'EMP-2021-001', name: 'Andi Pratama', email: 'andi.pratama@assetflow.id', role: 'Super Admin', department: 'Information Technology', status: 'Aktif', twoFA: 'FIDO2 / Hardware Token', lastActive: 'Hari ini, 10:42 WIB', device: 'macOS • Chrome • 10.12.84.15', initials: 'AP', avatarColor: '#0B2239', modules: 'Semua Modul (Full Access)' },
  { id: 'USR-002', employeeId: 'EMP-2019-012', name: 'Siti Rahmawati', email: 'siti.rahmawati@assetflow.id', role: 'Asset Manager', department: 'Administration', status: 'Aktif', twoFA: 'Google Authenticator', lastActive: '28 Okt 2025, 09:15 WIB', device: 'Win 11 • Chrome • 10.12.84.112', initials: 'SR', avatarColor: '#0F766E', modules: 'Aset | Inventaris | Peminjaman | Laporan' },
  { id: 'USR-003', employeeId: 'EMP-2022-094', name: 'Dimas Saputra', email: 'dimas.saputra@assetflow.id', role: 'Asset Manager', department: 'Information Technology', status: 'Aktif', twoFA: 'Authenticator App', lastActive: 'Kemarin, 16:30 WIB', device: 'Ubuntu • Firefox • 10.12.84.44', initials: 'DS', avatarColor: '#1B4B6B', modules: 'Aset | Peminjaman | Pemeliharaan' },
  { id: 'USR-004', employeeId: 'EMP-2021-089', name: 'Budi Santoso', email: 'budi.santoso@assetflow.id', role: 'Warehouse Staff', department: 'Finance', status: 'Aktif', twoFA: 'SMS OTP + App', lastActive: '27 Okt 2025, 14:02 WIB', device: 'Win 10 • Edge • 192.168.10.8', initials: 'BS', avatarColor: '#1D4ED8', modules: 'Inventaris | Mutasi Stok' },
  { id: 'USR-005', employeeId: 'EMP-2020-067', name: 'Rina Amelia', email: 'rina.amelia@assetflow.id', role: 'Administrator', department: 'Human Resources', status: 'Aktif', twoFA: 'Authenticator App', lastActive: '26 Okt 2025, 11:20 WIB', device: 'macOS • Safari • 10.12.84.19', initials: 'RA', avatarColor: '#B45309', modules: 'Data Karyawan | Laporan' },
  { id: 'USR-006', employeeId: 'EMP-2023-015', name: 'Fajar Anugrah', email: 'fajar.anugrah@assetflow.id', role: 'Asset Manager', department: 'Information Technology', status: 'Aktif', twoFA: 'Hardware Key', lastActive: '25 Okt 2025, 18:45 WIB', device: 'Linux • Brave • 10.12.84.3', initials: 'FA', avatarColor: '#0E7490', modules: 'Aset IT | Pemeliharaan | Sistem' },
  { id: 'USR-007', employeeId: 'EMP-2024-033', name: 'Hendra Setiawan', email: 'hendra.setiawan@assetflow.id', role: 'Employee', department: 'Information Technology', status: 'Nonaktif', twoFA: 'Belum Aktif', lastActive: '24 Okt 2025, 08:30 WIB', device: 'Win 11 • Chrome • 10.12.84.102', initials: 'HS', avatarColor: '#475569', modules: 'Permohonan Pinjam (Request Only)' },
  { id: 'USR-008', employeeId: 'EMP-2020-073', name: 'Riko Saputra', email: 'riko.saputra@assetflow.id', role: 'Employee', department: 'Information Technology', status: 'Aktif', twoFA: 'Authenticator App', lastActive: '25 Okt 2025, 09:20 WIB', device: 'Android • Chrome • 10.12.84.71', initials: 'RS', avatarColor: '#115E59', modules: 'Pemeliharaan (Teknisi)' },
]

export const activities = [
  { id: 'ACT-01', type: 'borrowing', title: 'Budi Santoso meminjamkan Dell OptiPlex 7090', desc: 'Disetujui oleh Andi Pratama • Durasi 3 hari (Proyek Audit Lapangan)', time: '12 menit yang lalu', actor: 'Budi Santoso', color: '#2E90FA' },
  { id: 'ACT-02', type: 'maintenance', title: 'Teknisi Riko S. menyelesaikan servis berkala HP LaserJet Pro M404dn', desc: 'Hasil: Prima, thermal paste diperbarui • WO #WO-MNT-2025-041', time: '48 menit yang lalu', actor: 'Riko Saputra', color: '#0E9384' },
  { id: 'ACT-03', type: 'inventory', title: 'Pengeluaran stok Kertas HVS A4 70gr', desc: '5 Rim untuk HR & GA • Surat Jalan SJ-OUT/2025/X/0142', time: '1 jam yang lalu', actor: 'Budi Santoso', color: '#F79009' },
  { id: 'ACT-04', type: 'asset', title: 'Registrasi aset baru Lenovo ThinkPad P15s Gen 2', desc: 'Kode AST-IT-2025-0143 • Kategori Laptop & PC', time: '2 jam yang lalu', actor: 'Andi Pratama', color: '#7A5AF8' },
  { id: 'ACT-05', type: 'borrowing', title: 'Permohonan peminjaman baru menunggu persetujuan', desc: 'Maya Putri • ASUS VivoBook 14 • 29 Okt - 05 Nov 2025', time: '3 jam yang lalu', actor: 'Maya Putri', color: '#E5484D' },
  { id: 'ACT-06', type: 'maintenance', title: 'Tiket darurat dibuka: UPS APC Smart-UPS 3000VA', desc: 'Prioritas tinggi • Server Room Lt. 2 • Teknisi Riko Saputra', time: '5 jam yang lalu', actor: 'Fajar Anugrah', color: '#E5484D' },
]

export const notifications = [
  { id: 'NTF-01', title: '4 permintaan peminjaman menunggu persetujuan', desc: 'Diperlukan otorisasi Super Admin sebelum batas waktu.', time: '5 menit lalu', read: false, type: 'borrowing' },
  { id: 'NTF-02', title: 'Stok kritis: Kertas HVS A4 tersisa 12 rim', desc: 'Di bawah batas minimum 50 rim. Segera buat permintaan pembelian.', time: '42 menit lalu', read: false, type: 'inventory' },
  { id: 'NTF-03', title: 'Tiket pemeliharaan TCK-MNT-2025-042 diperbarui', desc: 'Teknisi menambahkan progres burn-in test 42%.', time: '2 jam lalu', read: true, type: 'maintenance' },
  { id: 'NTF-04', title: 'Peminjaman REQ-LOAN-2025-085 terlambat 3 hari', desc: 'Siti Rahmawati belum mengembalikan Sony Alpha A7 IV.', time: '3 jam lalu', read: true, type: 'overdue' },
]

export const reports = [
  { code: 'RPT-FIN-01', title: 'Laporan Depresiasi Fiskal & Komersial', desc: 'Kalkulasi amortisasi PSAK 16 vs tabel penyusutan pajak UU HPP.', category: 'Keuangan & Depresiasi', period: 'Bulanan Okt 2025', formats: ['XLSX', 'PDF'], updated: '28 Okt 2025', status: 'Siap', owner: 'Andi Pratama', scope: '1.428 Unit' },
  { code: 'RPT-FIN-02', title: 'Rekapitulasi Nilai Buku Bersih (NBV) per Departemen', desc: 'Breakdown nilai perolehan versus nilai pasar wajar per cost center.', category: 'Keuangan & Depresiasi', period: 'Q3 2025', formats: ['XLSX', 'PDF'], updated: '16 Okt 2025', status: 'Otomatis', owner: 'Sistem', scope: '5 Departemen' },
  { code: 'RPT-AUD-03', title: 'Audit Fisik & Rekonsiliasi Aset Hilang/Rusak', desc: 'Stock opname aset periodik, verifikasi barcode RFID, selisih fisik.', category: 'Audit & Inventaris', period: 'Semester II 2025', formats: ['PDF'], updated: '30 Jun 2025', status: 'Terarsip', owner: 'BAST Auditor Internal', scope: '1.428 Unit' },
  { code: 'RPT-OPS-03', title: 'Analisis Biaya Pemeliharaan & Kinerja SLA', desc: 'Audit tiket preventif/korektif dan realisasi SLA vendor garansi.', category: 'Operasional & Servis', period: 'Sep - Okt 2025', formats: ['XLSX', 'PDF'], updated: '25 Okt 2025', status: 'Siap', owner: 'Andi Pratama', scope: '86 Tiket' },
  { code: 'RPT-OPS-05', title: 'Laporan Tingkat Utilisasi & Sirkulasi Peminjaman', desc: 'Statistik pool perangkat kerja dinas, durasi pinjam dan overdue aset.', category: 'Operasional & Servis', period: 'Bulanan (Okt 2025)', formats: ['XLSX'], updated: '27 Okt 2025', status: 'Siap', owner: 'Fajar Anugrah', scope: '248 Transaksi' },
  { code: 'RPT-LEG-01', title: 'Matriks Kepatuhan Kustodian & Penandatanganan BAST', desc: 'Audit Berita Acara Serah Terima kustodian karyawan (e-Sign Privy).', category: 'Kepatuhan BAST', period: 'YTD 2025', formats: ['PDF'], updated: '20 Okt 2025', status: 'Siap', owner: 'HR & Legal', scope: '312 Kustodian' },
  { code: 'RPT-INV-02', title: 'Rekapitulasi Mutasi Stok Inventaris', desc: 'Rekap barang masuk, keluar, dan penyesuaian stok gudang.', category: 'Audit & Inventaris', period: 'Bulanan Okt 2025', formats: ['XLSX', 'PDF'], updated: '28 Okt 2025', status: 'Otomatis', owner: 'Budi Santoso', scope: '1.248 Transaksi' },
  { code: 'RPT-FIN-04', title: 'Proyeksi Nilai Buku & Peremajaan Aset 2026', desc: 'Prediksi nilai sisa aset dan rekomendasi alokasi CAPEX 2026.', category: 'Keuangan & Depresiasi', period: 'Tahunan 2025', formats: ['XLSX'], updated: '22 Okt 2025', status: 'Siap', owner: 'Finance', scope: '1.428 Unit' },
]

export const companyProfile = {
  name: 'PT AssetFlow Nusantara',
  legalName: 'PT AssetFlow Nusantara Tbk',
  taxId: '01.234.567.8-091.000',
  email: 'corporate@assetflow.id',
  phone: '+62 21 5089 4400',
  website: 'www.assetflow.id',
  address: 'Menara Sudirman Lt. 14, Jl. Jend. Sudirman Kav. 60, Jakarta Selatan 12190',
  industry: 'Technology & Enterprise Services',
  timezone: 'Asia/Jakarta (WIB)',
}

export const systemPreferences = {
  currency: 'IDR',
  dateFormat: 'DD MMM YYYY',
  language: 'Bahasa Indonesia',
  timezone: 'Asia/Jakarta',
  lowStockAlert: true,
  maintenanceReminder: true,
  emailNotification: true,
  autoBackup: true,
  twoFactorRequired: true,
  sessionTimeout: '30',
  depreciationMethod: 'Garis Lurus (Straight Line)',
  fiscalYearStart: 'Januari',
}

export const assetGrowth = [
  { month: 'Mei', units: 42, value: 1.2 },
  { month: 'Jun', units: 58, value: 1.8 },
  { month: 'Jul', units: 75, value: 2.4 },
  { month: 'Agu', units: 48, value: 1.6 },
  { month: 'Sep', units: 92, value: 3.1 },
  { month: 'Okt', units: 64, value: 2.2 },
]

export const categoryDistribution = [
  { name: 'Laptop & PC', value: 600, pct: 42, color: '#0E9384' },
  { name: 'Perangkat Jaringan', value: 314, pct: 22, color: '#2E90FA' },
  { name: 'Mesin Kantor', value: 257, pct: 18, color: '#F79009' },
  { name: 'Kendaraan Operasional', value: 171, pct: 12, color: '#7A5AF8' },
  { name: 'Furnitur & Fixture', value: 86, pct: 6, color: '#E5484D' },
]

export const conditionData = [
  { name: 'Sangat Baik (Grade A)', value: 68, count: 971, color: '#0E9384' },
  { name: 'Baik / Normal (Grade B)', value: 24, count: 343, color: '#2D5675' },
  { name: 'Rusak Ringan (Grade C)', value: 6, count: 86, color: '#2E90FA' },
  { name: 'Rusak Berat / Afkir (Grade D)', value: 2, count: 28, color: '#E5484D' },
]

export const weeklyOperations = [
  { week: 'Minggu I', borrow: 34, returned: 28 },
  { week: 'Minggu II', borrow: 48, returned: 42 },
  { week: 'Minggu III', borrow: 52, returned: 39 },
  { week: 'Minggu IV', borrow: 29, returned: 33 },
]

export const amortizationSeries = [
  { year: '2021', value: 18.1 },
  { year: '2022', value: 16.8 },
  { year: '2023', value: 15.2 },
  { year: '2024', value: 13.9 },
  { year: '2025', value: 12.6 },
  { year: '2026F', value: 10.9 },
  { year: '2027F', value: 9.1 },
  { year: '2028F', value: 7.4 },
]

export const portfolioDistribution = [
  { name: 'Komputasi & IT Enterprise', value: 44, amount: 'Rp 8,12 M', detail: 'Laptop, Workstation, Tablet • 612 Unit', color: '#0E9384' },
  { name: 'Jaringan & Infrastruktur Server', value: 27, amount: 'Rp 4,98 M', detail: 'Rack Blade, Switch, Firewall • 184 Unit', color: '#2E90FA' },
  { name: 'Kendaraan Operasional & Dinas', value: 17.6, amount: 'Rp 3,25 M', detail: 'MPV Eksekutif, Blind Van Logistik • 18 Unit', color: '#7A5AF8' },
  { name: 'Mesin & Peralatan Kantor', value: 7.8, amount: 'Rp 1,45 M', detail: 'Printer Produksi, Scanner, Proyektor • 290 Unit', color: '#F79009' },
  { name: 'Furnitur & Interior Ruang', value: 3.6, amount: 'Rp 650 Jt', detail: 'Workstation Desk, Kursi Ergonomis • 324 Unit', color: '#E5484D' },
]

export const depreciationProjection = [
  { year: 'Thn 0', value: 100 },
  { year: 'Thn 1', value: 77.5 },
  { year: 'Thn 2', value: 55 },
  { year: 'Thn 3', value: 32.5 },
  { year: 'Thn 4', value: 10 },
]

export const reportSummary = {
  capex: 'Rp 18,45 M',
  depreciation: 'Rp 5,82 M',
  opex: 'Rp 342,85 Jt',
  compliance: '94,6%',
}
