import { delay, getDB, updateDB, logActivity } from './db'
import { currentUser } from '../data/mockData'
import { formatDate } from '../utils/format'

const nowLabel = () => `${formatDate(new Date(), { withTime: true })} WIB`

const DEFAULT_CHECKLIST = [
  { label: 'Verifikasi kelengkapan unit & aksesori', done: true },
  { label: 'Uji fungsi dasar setelah perbaikan', done: false },
  { label: 'Pembersihan & quality check akhir', done: false },
  { label: 'Serah terima kembali ke pengguna', done: false },
]

export const maintenanceService = {
  async all() {
    await delay()
    return getDB().maintenance
  },

  async get(id) {
    await delay(70)
    return getDB().maintenance.find((item) => item.id === id) || null
  },

  async create(payload) {
    await delay(240)
    return updateDB((db) => {
      const asset = db.assets.find((item) => item.id === payload.assetId)
      if (!asset) throw new Error('Aset tidak ditemukan')
      const year = new Date().getFullYear()
      const highest = db.maintenance.reduce((max, item) => {
        const match = item.id.match(/(\d+)$/)
        return match ? Math.max(max, Number(match[1])) : max
      }, 0)
      const sequence = String(highest + 1).padStart(3, '0')
      const record = {
        id: `MNT-${year}-${sequence}`,
        code: `TCK-MNT-${year}-${sequence}`,
        assetId: asset.id,
        type: payload.type,
        priority: payload.priority,
        submittedDate: new Date().toISOString(),
        targetDate: payload.targetDate,
        completedDate: null,
        technician: payload.technician || 'Tim Teknisi Internal',
        vendor: payload.vendor || 'Internal IT Hub',
        estimate: Number(payload.estimate) || 0,
        actual: 0,
        status: 'Menunggu',
        progress: 5,
        problem: payload.problem,
        diagnosis: 'Menunggu pemeriksaan teknis oleh tim pemeliharaan.',
        parts: [],
        costs: [],
        checklist: DEFAULT_CHECKLIST.map((item) => ({ ...item, done: false })),
        notes: payload.notes || '-',
        photos: [],
        timeline: [
          {
            title: 'Tiket Dibuat',
            at: nowLabel(),
            by: currentUser.name,
            desc: payload.problem,
          },
        ],
      }
      db.maintenance = [record, ...db.maintenance]
      asset.status = 'Perbaikan'
      logActivity(db, {
        type: 'maintenance',
        title: `Tiket pemeliharaan ${record.code} dibuat`,
        desc: `${asset.name} • Prioritas ${record.priority}`,
        color: record.priority === 'Tinggi' ? '#E5484D' : '#F79009',
      })
      return record
    })
  },

  async updateProgress(id, payload) {
    await delay(200)
    return updateDB((db) => {
      const item = db.maintenance.find((entry) => entry.id === id)
      if (!item) throw new Error('Tiket pemeliharaan tidak ditemukan')
      const previousStatus = item.status
      item.progress = Number(payload.progress)
      item.status = payload.status || (item.progress >= 100 ? 'Selesai' : 'Dalam Pengerjaan')
      item.actual = payload.actual != null ? Number(payload.actual) : item.actual
      item.notes = payload.notes ?? item.notes
      if (payload.diagnosis) item.diagnosis = payload.diagnosis
      if (item.status === 'Selesai' && !item.completedDate) {
        item.completedDate = new Date().toISOString()
        const asset = db.assets.find((entry) => entry.id === item.assetId)
        if (asset) asset.status = 'Aktif'
      }
      item.timeline = [
        ...(item.timeline || []),
        {
          title: `Progres diperbarui menjadi ${item.progress}%`,
          at: nowLabel(),
          by: currentUser.name,
          desc: payload.notes || `Status tiket: ${item.status}.`,
          current: item.status !== 'Selesai',
        },
      ]
      logActivity(db, {
        type: 'maintenance',
        title: `Tiket ${item.code} diperbarui`,
        desc: `Progres ${item.progress}% • ${previousStatus} → ${item.status}`,
        color: '#0E9384',
      })
      return item
    })
  },

  async toggleChecklist(id, index) {
    await delay(90)
    return updateDB((db) => {
      const item = db.maintenance.find((entry) => entry.id === id)
      if (!item || !item.checklist?.[index]) return item
      item.checklist[index].done = !item.checklist[index].done
      return item
    })
  },
}
