import { delay, getDB, updateDB, logActivity } from './db'
import { currentUser } from '../data/mockData'
import { formatDate } from '../utils/format'

const nowLabel = () => `${formatDate(new Date(), { withTime: true })} WIB`

function addTimeline(item, entry) {
  item.timeline = [...(item.timeline || []), { at: nowLabel(), by: currentUser.name, ...entry }]
}

export const borrowingService = {
  async all() {
    await delay()
    return getDB().borrowings
  },

  async get(id) {
    await delay(70)
    return getDB().borrowings.find((item) => item.id === id) || null
  },

  async create(payload) {
    await delay(240)
    return updateDB((db) => {
      const employee = db.employees.find((item) => item.id === payload.employeeId)
      const asset = db.assets.find((item) => item.id === payload.assetId)
      if (!employee) throw new Error('Karyawan tidak ditemukan')
      if (!asset) throw new Error('Aset tidak ditemukan')
      if (!['Tersedia', 'Aktif'].includes(asset.status)) {
        throw new Error(`Aset berstatus ${asset.status} tidak dapat dipinjam saat ini.`)
      }
      const activeBorrowing = db.borrowings.some(
        (item) =>
          (item.assetId === asset.id || item.assetId === asset.code) &&
          ['Menunggu Persetujuan', 'Disetujui', 'Sedang Dipinjam', 'Terlambat'].includes(item.status),
      )
      if (activeBorrowing) {
        throw new Error('Aset masih memiliki peminjaman aktif yang belum selesai.')
      }

      const year = new Date().getFullYear()
      const highest = db.borrowings.reduce((max, item) => {
        const match = item.id.match(/(\d+)$/)
        return match ? Math.max(max, Number(match[1])) : max
      }, 0)
      const sequence = String(highest + 1).padStart(3, '0')
      const borrowing = {
        id: `BRW-${year}-${sequence}`,
        code: `REQ-LOAN-${year}-${sequence}`,
        employeeId: employee.id,
        assetId: asset.id,
        borrowDate: payload.borrowDate || new Date().toISOString(),
        dueDate: payload.dueDate,
        returnDate: null,
        status: 'Menunggu Persetujuan',
        priority: payload.priority || 'Regular / Kantor',
        purpose: payload.purpose,
        approvedBy: '-',
        department: employee.department,
        conditionOut: payload.conditionOut || 'Lengkap (sesuai checklist serah terima)',
        notes: payload.notes || '-',
        createdBy: employee.name,
        timeline: [
          {
            title: 'Pengajuan Peminjaman Dibuat',
            at: nowLabel(),
            by: employee.name,
            desc: payload.purpose,
          },
        ],
      }
      db.borrowings = [borrowing, ...db.borrowings]
      logActivity(db, {
        type: 'borrowing',
        title: `${employee.name} mengajukan peminjaman ${asset.name}`,
        desc: `Periode ${formatDate(borrowing.borrowDate)} – ${formatDate(borrowing.dueDate)} • Menunggu persetujuan`,
        actor: employee.name,
        color: '#2E90FA',
      })
      return borrowing
    })
  },

  async approve(id) {
    await delay(180)
    return updateDB((db) => {
      const item = db.borrowings.find((entry) => entry.id === id)
      if (!item) throw new Error('Peminjaman tidak ditemukan')
      item.status = 'Disetujui'
      item.approvedBy = currentUser.name
      addTimeline(item, {
        title: 'Pengajuan Disetujui',
        desc: 'Disetujui oleh administrator. Aset siap diambil di gudang IT.',
      })
      logActivity(db, {
        type: 'borrowing',
        title: `Peminjaman ${item.code} disetujui`,
        desc: `Disetujui oleh ${currentUser.name}`,
        color: '#0E9384',
      })
      return item
    })
  },

  async reject(id, reason = 'Tidak sesuai SOP peminjaman aset.') {
    await delay(160)
    return updateDB((db) => {
      const item = db.borrowings.find((entry) => entry.id === id)
      if (!item) throw new Error('Peminjaman tidak ditemukan')
      item.status = 'Ditolak'
      item.notes = reason
      addTimeline(item, { title: 'Pengajuan Ditolak', desc: reason })
      return item
    })
  },

  async handOver(id) {
    await delay(180)
    return updateDB((db) => {
      const item = db.borrowings.find((entry) => entry.id === id)
      if (!item) throw new Error('Peminjaman tidak ditemukan')
      item.status = 'Sedang Dipinjam'
      const asset = db.assets.find((entry) => entry.id === item.assetId)
      if (asset) asset.status = 'Dipinjam'
      addTimeline(item, {
        title: 'Aset Diserahkan',
        desc: 'Unit fisik dan aksesori telah diserahkan serta diverifikasi petugas gudang.',
      })
      return item
    })
  },

  async returnAsset(id, condition = 'Lengkap & kondisi baik') {
    await delay(200)
    return updateDB((db) => {
      const item = db.borrowings.find((entry) => entry.id === id)
      if (!item) throw new Error('Peminjaman tidak ditemukan')
      item.status = 'Dikembalikan'
      item.returnDate = new Date().toISOString()
      item.notes = `Dikembalikan: ${condition}`
      const asset = db.assets.find((entry) => entry.id === item.assetId)
      if (asset) {
        asset.status = 'Tersedia'
        if (condition.toLowerCase().includes('rusak')) asset.condition = 'Rusak Ringan (Grade C)'
      }
      addTimeline(item, {
        title: 'Aset Dikembalikan',
        desc: `Diterima petugas gudang. Kondisi: ${condition}.`,
      })
      logActivity(db, {
        type: 'borrowing',
        title: `Aset dari ${item.code} telah dikembalikan`,
        desc: condition,
        color: '#0E9384',
      })
      return item
    })
  },
}
