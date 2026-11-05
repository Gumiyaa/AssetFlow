import { delay, getDB, updateDB, logActivity } from './db'
import { currentUser } from '../data/mockData'
import { initialsOf } from '../utils/format'

const COLORS = ['#0B2239', '#0F766E', '#1B4B6B', '#1D4ED8', '#B45309', '#0E7490', '#115E59', '#4338CA']

export const userService = {
  async all() {
    await delay()
    return getDB().users
  },

  async get(id) {
    await delay(70)
    return getDB().users.find((item) => item.id === id) || null
  },

  async create(payload) {
    await delay(220)
    return updateDB((db) => {
      const email = String(payload.email || '').trim()
      if (email && db.users.some((item) => String(item.email || '').toLowerCase() === email.toLowerCase())) {
        throw new Error('Email sudah terdaftar pada pengguna lain.')
      }
      const highest = db.users.reduce((max, item) => {
        const match = String(item.id).match(/^USR-(\d+)$/)
        return match ? Math.max(max, Number(match[1])) : max
      }, 0)
      const user = {
        id: `USR-${String(highest + 1).padStart(3, '0')}`,
        employeeId: payload.employeeId || `EMP-${new Date().getFullYear()}-${String(db.users.length + 20).padStart(3, '0')}`,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        department: payload.department,
        status: payload.status || 'Aktif',
        twoFA: payload.twoFA || 'Belum Aktif',
        lastActive: 'Belum pernah login',
        device: '—',
        initials: initialsOf(payload.name),
        avatarColor: COLORS[db.users.length % COLORS.length],
        modules:
          payload.role === 'Super Admin'
            ? 'Semua Modul (Full Access)'
            : payload.role === 'Asset Manager'
              ? 'Aset | Pemeliharaan | Laporan'
              : payload.role === 'Administrator'
                ? 'Data Karyawan | Laporan'
                : 'Permohonan Pinjam (Request Only)',
      }
      db.users = [user, ...db.users]
      logActivity(db, {
        type: 'asset',
        title: `Pengguna baru ${user.name} ditambahkan`,
        desc: `Role ${user.role} • ${user.department}`,
        actor: currentUser.name,
        color: '#2E90FA',
      })
      return user
    })
  },

  async update(id, payload) {
    await delay(180)
    return updateDB((db) => {
      const index = db.users.findIndex((item) => item.id === id)
      if (index === -1) throw new Error('Pengguna tidak ditemukan')
      const email = String(payload.email || '').trim()
      if (
        email &&
        db.users.some(
          (item, itemIndex) => itemIndex !== index && String(item.email || '').toLowerCase() === email.toLowerCase(),
        )
      ) {
        throw new Error('Email sudah terdaftar pada pengguna lain.')
      }
      db.users[index] = {
        ...db.users[index],
        ...payload,
        initials: payload.name ? initialsOf(payload.name) : db.users[index].initials,
      }
      return db.users[index]
    })
  },

  async toggleStatus(id) {
    await delay(150)
    return updateDB((db) => {
      const user = db.users.find((item) => item.id === id)
      if (!user) throw new Error('Pengguna tidak ditemukan')
      user.status = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif'
      return user
    })
  },

  async remove(id) {
    await delay(160)
    return updateDB((db) => {
      db.users = db.users.filter((item) => item.id !== id)
      return true
    })
  },
}
