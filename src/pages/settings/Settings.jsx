import { useMemo, useState } from 'react'
import {
  Bell,
  Building2,
  CheckCircle2,
  Database,
  Download,
  HardDrive,
  KeyRound,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { getDB } from '../../services/db'
import { STORAGE_KEYS } from '../../services/storage'
import { companyProfile, systemPreferences } from '../../data/mockData'
import { cn, formatNumber } from '../../utils/format'
import { downloadText } from '../../utils/export'
import PageHeader from '../../components/ui/PageHeader'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import Toggle from '../../components/ui/Toggle'
import Progress from '../../components/ui/Progress'
import Field, { Input, Select, Textarea } from '../../components/ui/Field'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const NOTIFICATION_DEFAULTS = {
  borrowApproval: true,
  overdueReminder: true,
  lowStockDigest: true,
  maintenanceSla: true,
  weeklyDigest: false,
}

const TABS = [
  { key: 'company', label: 'Profil Perusahaan', icon: Building2 },
  { key: 'preferences', label: 'Preferensi', icon: SlidersHorizontal },
  { key: 'notifications', label: 'Notifikasi', icon: Bell },
  { key: 'security', label: 'Keamanan', icon: ShieldCheck },
]

export default function Settings() {
  const { actions } = useData()
  const toast = useToast()
  const [tab, setTab] = useState('company')
  const [company, setCompany] = useLocalStorage(STORAGE_KEYS.settings, companyProfile)
  const [preferences, setPreferences] = useLocalStorage(STORAGE_KEYS.preferences, systemPreferences)
  const [companyDraft, setCompanyDraft] = useState(() => ({ ...companyProfile, ...company }))
  const [prefDraft, setPrefDraft] = useState(() => ({
    ...systemPreferences,
    ...NOTIFICATION_DEFAULTS,
    ...preferences,
  }))
  const [resetOpen, setResetOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const savedPrefs = useMemo(() => ({ ...systemPreferences, ...NOTIFICATION_DEFAULTS, ...preferences }), [preferences])
  const dirty = useMemo(
    () => JSON.stringify(companyDraft) !== JSON.stringify({ ...companyProfile, ...company }) || JSON.stringify(prefDraft) !== JSON.stringify(savedPrefs),
    [companyDraft, company, prefDraft, savedPrefs],
  )

  const storageUsed = useMemo(() => {
    if (typeof window === 'undefined') return 0
    let total = 0
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key?.startsWith('assetflow:')) total += (window.localStorage.getItem(key) || '').length
    }
    return total
  }, [dirty])

  const setCompanyField = (key) => (event) => {
    setCompanyDraft((previous) => ({ ...previous, [key]: event.target.value }))
  }

  const setPrefField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setPrefDraft((previous) => ({ ...previous, [key]: value }))
  }

  const setPrefToggle = (key) => (value) => {
    setPrefDraft((previous) => ({ ...previous, [key]: value }))
  }

  const handleSave = () => {
    if (!companyDraft.name.trim()) {
      toast.error('Nama perusahaan wajib diisi', 'Lengkapi profil perusahaan sebelum menyimpan.')
      setTab('company')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyDraft.email)) {
      toast.error('Email perusahaan tidak valid', 'Gunakan format email korporat yang benar.')
      setTab('company')
      return
    }
    if (!companyDraft.phone.trim()) {
      toast.error('Nomor telepon wajib diisi', 'Lengkapi nomor kontak perusahaan.')
      setTab('company')
      return
    }
    setCompany(companyDraft)
    setPreferences(prefDraft)
    toast.success('Pengaturan disimpan', 'Perubahan tersimpan di penyimpanan lokal peramban ini.')
  }

  const handleDiscard = () => {
    setCompanyDraft({ ...companyProfile, ...company })
    setPrefDraft(savedPrefs)
    toast.info('Perubahan dibatalkan', 'Formulir dikembalikan ke pengaturan tersimpan.')
  }

  const handleBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      company: companyDraft,
      preferences: prefDraft,
      database: getDB(),
    }
    downloadText(
      `assetflow-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      'application/json',
    )
    toast.success('Cadangan diunduh', 'Profil, preferensi, dan data demo disimpan sebagai berkas JSON.')
  }

  const handleReset = async () => {
    setBusy(true)
    try {
      await actions.resetDemoData()
      toast.success('Data demo direset', 'Aset, inventaris, peminjaman, dan pemeliharaan kembali ke data awal.')
      setResetOpen(false)
    } catch (error) {
      toast.error('Gagal mereset data', error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="animate-in">
      <PageHeader
        eyebrow="Manajemen Sistem"
        title="Pengaturan Sistem"
        description="Konfigurasi profil perusahaan, preferensi operasional, notifikasi, dan kebijakan keamanan AssetFlow."
        actions={
          <>
            {dirty ? <Badge tone="warning" dot>Perubahan belum disimpan</Badge> : <Badge tone="success" dot>Tersimpan</Badge>}
            <Button variant="secondary" icon={RotateCcw} onClick={handleDiscard} disabled={!dirty}>
              Batalkan
            </Button>
            <Button variant="primary" icon={Save} onClick={handleSave} disabled={!dirty}>
              Simpan Pengaturan
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <div className="px-5 pt-3">
              <Tabs items={TABS} value={tab} onChange={setTab} />
            </div>

            {tab === 'company' ? (
              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-slate-50/60 p-3.5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-[16px] font-semibold text-white">AF</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-ink-900">{companyDraft.name || 'Nama perusahaan'}</p>
                    <p className="mt-0.5 truncate text-[10.5px] text-ink-500">{companyDraft.legalName || 'Nama badan hukum'} · {companyDraft.taxId || 'NPWP'}</p>
                  </div>
                  <Badge tone="navy">Profil aktif</Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nama perusahaan" htmlFor="company-name" required className="sm:col-span-2">
                    <Input id="company-name" value={companyDraft.name} onChange={setCompanyField('name')} placeholder="PT AssetFlow Nusantara" />
                  </Field>
                  <Field label="Nama badan hukum" htmlFor="legal-name">
                    <Input id="legal-name" value={companyDraft.legalName} onChange={setCompanyField('legalName')} />
                  </Field>
                  <Field label="NPWP / Tax ID" htmlFor="tax-id">
                    <Input id="tax-id" value={companyDraft.taxId} onChange={setCompanyField('taxId')} />
                  </Field>
                  <Field label="Email korporat" htmlFor="company-email" required>
                    <Input id="company-email" type="email" value={companyDraft.email} onChange={setCompanyField('email')} />
                  </Field>
                  <Field label="Nomor telepon" htmlFor="company-phone" required>
                    <Input id="company-phone" value={companyDraft.phone} onChange={setCompanyField('phone')} />
                  </Field>
                  <Field label="Situs web" htmlFor="company-website">
                    <Input id="company-website" value={companyDraft.website} onChange={setCompanyField('website')} />
                  </Field>
                  <Field label="Industri" htmlFor="company-industry">
                    <Input id="company-industry" value={companyDraft.industry} onChange={setCompanyField('industry')} />
                  </Field>
                  <Field label="Zona waktu" htmlFor="company-timezone">
                    <Select id="company-timezone" value={companyDraft.timezone} onChange={setCompanyField('timezone')}>
                      <option value="Asia/Jakarta (WIB)">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar (WITA)">Asia/Makassar (WITA)</option>
                      <option value="Asia/Jayapura (WIT)">Asia/Jayapura (WIT)</option>
                    </Select>
                  </Field>
                  <Field label="Alamat kantor pusat" htmlFor="company-address" className="sm:col-span-2">
                    <Textarea id="company-address" rows={3} value={companyDraft.address} onChange={setCompanyField('address')} />
                  </Field>
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-[10px] leading-relaxed text-blue-800">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Profil perusahaan digunakan pada kop laporan, BAST, dan label aset yang dicetak dari sistem.
                </div>
              </div>
            ) : null}

            {tab === 'preferences' ? (
              <div className="space-y-5 p-5">
                <div>
                  <h3 className="text-[12px] font-semibold text-ink-900">Regional & tampilan</h3>
                  <p className="mt-0.5 text-[10.5px] text-ink-500">Format nilai, tanggal, dan bahasa antarmuka.</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <Field label="Bahasa" htmlFor="pref-language">
                      <Select id="pref-language" value={prefDraft.language} onChange={setPrefField('language')}>
                        <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                        <option value="English">English</option>
                      </Select>
                    </Field>
                    <Field label="Mata uang" htmlFor="pref-currency">
                      <Select id="pref-currency" value={prefDraft.currency} onChange={setPrefField('currency')}>
                        <option value="IDR">IDR — Rupiah Indonesia</option>
                        <option value="USD">USD — US Dollar</option>
                        <option value="SGD">SGD — Singapore Dollar</option>
                      </Select>
                    </Field>
                    <Field label="Format tanggal" htmlFor="pref-date">
                      <Select id="pref-date" value={prefDraft.dateFormat} onChange={setPrefField('dateFormat')}>
                        <option value="DD MMM YYYY">DD MMM YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </Select>
                    </Field>
                    <Field label="Zona waktu" htmlFor="pref-timezone">
                      <Select id="pref-timezone" value={prefDraft.timezone} onChange={setPrefField('timezone')}>
                        <option value="Asia/Jakarta">Asia/Jakarta</option>
                        <option value="Asia/Makassar">Asia/Makassar</option>
                        <option value="Asia/Jayapura">Asia/Jayapura</option>
                      </Select>
                    </Field>
                  </div>
                </div>

                <div className="border-t border-line pt-4">
                  <h3 className="text-[12px] font-semibold text-ink-900">Akuntansi & operasional</h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <Field label="Awal tahun fiskal" htmlFor="pref-fiscal">
                      <Select id="pref-fiscal" value={prefDraft.fiscalYearStart} onChange={setPrefField('fiscalYearStart')}>
                        {['Januari', 'April', 'Juli', 'Oktober'].map((month) => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Metode depresiasi" htmlFor="pref-depreciation">
                      <Select id="pref-depreciation" value={prefDraft.depreciationMethod} onChange={setPrefField('depreciationMethod')}>
                        <option value="Garis Lurus (Straight Line)">Garis Lurus (Straight Line)</option>
                        <option value="Saldo Menurun Ganda">Saldo Menurun Ganda</option>
                        <option value="Jumlah Angka Tahun">Jumlah Angka Tahun</option>
                      </Select>
                    </Field>
                  </div>
                </div>

                <div className="border-t border-line pt-4">
                  <h3 className="text-[12px] font-semibold text-ink-900">Otomatisasi</h3>
                  <div className="mt-3 space-y-3">
                    <Toggle
                      checked={prefDraft.lowStockAlert}
                      onChange={setPrefToggle('lowStockAlert')}
                      label="Peringatan stok minimum"
                      description="Kirim notifikasi saat stok inventaris berada di bawah ambang batas."
                    />
                    <Toggle
                      checked={prefDraft.maintenanceReminder}
                      onChange={setPrefToggle('maintenanceReminder')}
                      label="Pengingat pemeliharaan preventif"
                      description="Buat pengingat otomatis untuk jadwal servis berkala aset."
                    />
                    <Toggle
                      checked={prefDraft.autoBackup}
                      onChange={setPrefToggle('autoBackup')}
                      label="Cadangan otomatis harian"
                      description="Simpan salinan data demo ke penyimpanan lokal setiap hari."
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {tab === 'notifications' ? (
              <div className="space-y-5 p-5">
                <div>
                  <h3 className="text-[12px] font-semibold text-ink-900">Kanal notifikasi</h3>
                  <p className="mt-0.5 text-[10.5px] text-ink-500">Atur peristiwa yang dikirim ke email korporat pengguna.</p>
                  <div className="mt-3 space-y-3">
                    <Toggle
                      checked={prefDraft.emailNotification}
                      onChange={setPrefToggle('emailNotification')}
                      label="Notifikasi email"
                      description="Kirim ringkasan aktivitas penting ke email pengguna."
                    />
                    <Toggle
                      checked={prefDraft.borrowApproval}
                      onChange={setPrefToggle('borrowApproval')}
                      label="Persetujuan peminjaman"
                      description="Beri tahu approver saat ada pengajuan baru atau perubahan status."
                    />
                    <Toggle
                      checked={prefDraft.overdueReminder}
                      onChange={setPrefToggle('overdueReminder')}
                      label="Pengingat jatuh tempo"
                      description="Ingatkan peminjam 24 jam sebelum batas pengembalian."
                    />
                    <Toggle
                      checked={prefDraft.lowStockDigest}
                      onChange={setPrefToggle('lowStockDigest')}
                      label="Ringkasan stok kritis"
                      description="Kirim rekap SKU di bawah minimum setiap pagi."
                    />
                    <Toggle
                      checked={prefDraft.maintenanceSla}
                      onChange={setPrefToggle('maintenanceSla')}
                      label="Eskalasi SLA pemeliharaan"
                      description="Notifikasi saat tiket mendekati atau melewati target penyelesaian."
                    />
                    <Toggle
                      checked={prefDraft.weeklyDigest}
                      onChange={setPrefToggle('weeklyDigest')}
                      label="Digest mingguan manajemen"
                      description="Ringkasan KPI aset, peminjaman, dan pemeliharaan setiap Senin."
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-line bg-slate-50/60 p-3.5">
                  <p className="text-[10.5px] font-semibold text-ink-800">Pratinjau penerima</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-ink-500">
                    Notifikasi akan dikirim ke {companyDraft.email} dan seluruh pengguna dengan peran Super Admin / Asset Manager.
                    Pada demo ini, notifikasi hanya ditampilkan di dalam aplikasi.
                  </p>
                </div>
              </div>
            ) : null}

            {tab === 'security' ? (
              <div className="space-y-5 p-5">
                <div>
                  <h3 className="text-[12px] font-semibold text-ink-900">Kebijakan akses</h3>
                  <div className="mt-3 space-y-3">
                    <Toggle
                      checked={prefDraft.twoFactorRequired}
                      onChange={setPrefToggle('twoFactorRequired')}
                      label="Wajibkan autentikasi dua faktor"
                      description="Semua pengguna harus mengaktifkan 2FA sebelum mengakses modul sensitif."
                    />
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Batas waktu sesi (menit)" htmlFor="pref-session">
                      <Select id="pref-session" value={prefDraft.sessionTimeout} onChange={setPrefField('sessionTimeout')}>
                        {['15', '30', '60', '120'].map((minutes) => (
                          <option key={minutes} value={minutes}>{minutes} menit</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Metode 2FA default" htmlFor="pref-2fa">
                      <Select id="pref-2fa" defaultValue="Authenticator App">
                        <option value="Authenticator App">Authenticator App</option>
                        <option value="FIDO2 / Hardware Token">FIDO2 / Hardware Token</option>
                        <option value="SMS OTP + App">SMS OTP + App</option>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Kebijakan kata sandi" className="mt-4">
                    <div className="rounded-lg border border-line bg-slate-50/60 p-3 text-[10.5px] leading-relaxed text-ink-600">
                      Minimal 10 karakter, kombinasi huruf besar, angka, dan simbol. Rotasi wajib setiap 90 hari. Lima kata sandi
                      terakhir tidak boleh digunakan kembali.
                    </div>
                  </Field>
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3.5">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-blue-900">
                    <KeyRound className="h-3.5 w-3.5" /> Audit keamanan & sesi
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-blue-800">
                    Pantau peristiwa login, perubahan peran, dan status 2FA pada halaman Manajemen Pengguna.
                  </p>
                  <Button size="sm" variant="secondary" className="mt-2.5" to="/users">
                    Buka log audit
                  </Button>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-amber-900">
                    <ShieldCheck className="h-3.5 w-3.5" /> Catatan demo
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-amber-800">
                    Perubahan kebijakan keamanan disimpan secara lokal dan tidak memengaruhi autentikasi demo. Gunakan kredensial
                    demo pada halaman login.
                  </p>
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Informasi Sistem" subtitle="Ringkasan lingkungan demo" action={<Settings2 className="h-4 w-4 text-ink-400" />} />
            <div className="space-y-2.5 border-t border-line px-5 py-4 text-[10.5px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500">Versi aplikasi</span>
                <span className="font-semibold text-ink-800">AssetFlow 3.4.1</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500">Lingkungan</span>
                <Badge tone="info">Demo lokal</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500">Frontend</span>
                <span className="font-semibold text-ink-800">React 19 + Vite</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500">Penyimpanan</span>
                <span className="font-semibold text-ink-800">localStorage</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500">Zona waktu</span>
                <span className="font-semibold text-ink-800">{prefDraft.timezone}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Penyimpanan Lokal" subtitle="Data demo di peramban ini" action={<HardDrive className="h-4 w-4 text-ink-400" />} />
            <div className="border-t border-line px-5 py-4">
              <div className="flex items-end justify-between gap-2">
                <span className="text-[20px] font-semibold text-ink-900">{formatNumber(Math.round(storageUsed / 1024))} KB</span>
                <span className="text-[9.5px] text-ink-400">dari kuota ±5 MB</span>
              </div>
              <Progress value={Math.min(100, (storageUsed / (5 * 1024 * 1024)) * 100)} tone="teal" className="mt-2 h-2" />
              <p className="mt-2 text-[9.5px] leading-relaxed text-ink-400">
                Mencakup data aset, inventaris, transaksi, peminjaman, pemeliharaan, karyawan, pengguna, dan pengaturan.
              </p>
              <Button size="sm" variant="secondary" icon={Download} className="mt-3 w-full" onClick={handleBackup}>
                Unduh Cadangan JSON
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Ringkasan Konfigurasi" subtitle="Nilai yang akan disimpan" action={<Database className="h-4 w-4 text-ink-400" />} />
            <div className="space-y-2 border-t border-line px-5 py-4 text-[10.5px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500">Perusahaan</span>
                <span className="max-w-[150px] truncate font-semibold text-ink-800">{companyDraft.name}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500">Mata uang</span>
                <span className="font-semibold text-ink-800">{prefDraft.currency}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500">Bahasa</span>
                <span className="font-semibold text-ink-800">{prefDraft.language}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500">2FA wajib</span>
                <Badge tone={prefDraft.twoFactorRequired ? 'success' : 'neutral'}>{prefDraft.twoFactorRequired ? 'Aktif' : 'Nonaktif'}</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500">Batas sesi</span>
                <span className="font-semibold text-ink-800">{prefDraft.sessionTimeout} menit</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-500">Notifikasi email</span>
                <Badge tone={prefDraft.emailNotification ? 'success' : 'neutral'}>{prefDraft.emailNotification ? 'Aktif' : 'Nonaktif'}</Badge>
              </div>
            </div>
          </Card>

          <Card className="border-red-200">
            <CardHeader title="Zona Berbahaya" subtitle="Tindakan tidak dapat dibatalkan" action={<Trash2 className="h-4 w-4 text-red-500" />} />
            <div className="border-t border-red-100 px-5 py-4">
              <p className="text-[10.5px] leading-relaxed text-ink-500">
                Reset seluruh data demo ke kondisi awal. Profil perusahaan dan preferensi yang tersimpan tidak akan diubah.
              </p>
              <Button size="sm" variant="danger-soft" icon={RotateCcw} className="mt-3 w-full" onClick={() => setResetOpen(true)}>
                Reset Data Demo
              </Button>
            </div>
          </Card>

          <p className={cn('px-1 text-[9.5px] leading-relaxed', dirty ? 'text-amber-600' : 'text-ink-400')}>
            {dirty
              ? 'Ada perubahan yang belum disimpan. Klik Simpan Pengaturan untuk menerapkan.'
              : 'Semua perubahan telah tersimpan di penyimpanan lokal peramban.'}
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        loading={busy}
        title="Reset seluruh data demo?"
        description="Aset, inventaris, transaksi, peminjaman, pemeliharaan, karyawan, dan pengguna akan dikembalikan ke data awal."
        confirmLabel="Ya, reset data"
      >
        <div className="space-y-2 text-[11.5px] leading-relaxed text-ink-500">
          <p>Semua perubahan CRUD yang Anda lakukan pada sesi demo ini akan hilang. Profil perusahaan dan preferensi tetap tersimpan.</p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
            Pastikan Anda telah mengunduh cadangan JSON jika masih memerlukan data saat ini.
          </p>
        </div>
      </ConfirmDialog>
    </div>
  )
}
