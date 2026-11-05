export const cn = (...classes) => classes.filter(Boolean).join(' ')

export function formatNumber(value, options = {}) {
  const number = Number(value || 0)
  return new Intl.NumberFormat('id-ID', options).format(number)
}

export function formatCurrency(value, { compact = false, decimals = 0 } = {}) {
  const number = Number(value || 0)
  if (compact) {
    if (Math.abs(number) >= 1_000_000_000) return `Rp ${formatNumber(number / 1_000_000_000, { maximumFractionDigits: 1 })} M`
    if (Math.abs(number) >= 1_000_000) return `Rp ${formatNumber(number / 1_000_000, { maximumFractionDigits: 1 })} Jt`
    if (Math.abs(number) >= 1_000) return `Rp ${formatNumber(number / 1_000, { maximumFractionDigits: 0 })} Rb`
  }
  return `Rp ${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)}`
}

export function formatCompact(value) {
  const number = Number(value || 0)
  if (Math.abs(number) >= 1_000_000_000) return `${formatNumber(number / 1_000_000_000, { maximumFractionDigits: 1 })} M`
  if (Math.abs(number) >= 1_000_000) return `${formatNumber(number / 1_000_000, { maximumFractionDigits: 1 })} Jt`
  if (Math.abs(number) >= 1_000) return `${formatNumber(number / 1_000, { maximumFractionDigits: 0 })} Rb`
  return formatNumber(number)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const MONTHS_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export function formatDate(value, { withTime = false, long = false } = {}) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const months = long ? MONTHS_LONG : MONTHS
  const base = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  if (!withTime) return base
  return `${base}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function formatDateInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function formatDateShort(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function daysBetween(start, end) {
  if (!start || !end) return 0
  const a = new Date(start)
  const b = new Date(end)
  return Math.max(0, Math.ceil((b - a) / (1000 * 60 * 60 * 24)))
}

export function relativeTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari lalu`
  return formatDateShort(value)
}

export function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function getByPath(object, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), object)
}

const STATUS_TONES = {
  aktif: 'success',
  tersedia: 'success',
  aman: 'success',
  selesai: 'success',
  terverifikasi: 'success',
  dikembalikan: 'success',
  disetujui: 'info',
  'sedang dipinjam': 'info',
  'dalam pengerjaan': 'info',
  'masa percobaan': 'warning',
  menipis: 'warning',
  'menunggu persetujuan': 'warning',
  menunggu: 'warning',
  'menunggu suku cadang': 'warning',
  cuti: 'warning',
  'rusak ringan (grade c)': 'warning',
  dipinjam: 'info',
  perbaikan: 'warning',
  terlambat: 'danger',
  ditolak: 'danger',
  habis: 'danger',
  nonaktif: 'danger',
  'rusak berat (grade d)': 'danger',
  afkir: 'neutral',
  'prioritas tinggi': 'danger',
  'prioritas sedang': 'warning',
  'prioritas rendah': 'neutral',
}

export function statusTone(status = '') {
  return STATUS_TONES[String(status).toLowerCase()] || 'neutral'
}

export function statusDot(status = '') {
  const tone = statusTone(status)
  const map = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-400',
  }
  return map[tone] || map.neutral
}

export function conditionTone(condition = '') {
  if (condition.includes('Sangat Baik')) return 'teal'
  if (condition.includes('Baik')) return 'info'
  if (condition.includes('Rusak Ringan')) return 'warning'
  if (condition.includes('Rusak Berat')) return 'danger'
  return 'neutral'
}

export function truncate(text = '', length = 80) {
  return text.length > length ? `${text.slice(0, length).trim()}…` : text
}

export function pctChange(current, previous) {
  if (!previous) return 0
  return ((current - previous) / previous) * 100
}
