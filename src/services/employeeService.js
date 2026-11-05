import { delay, getDB, updateDB, logActivity } from './db'
import { initialsOf } from '../utils/format'

const COLORS = ['#1B4B6B', '#0F766E', '#7C3AED', '#1D4ED8', '#B45309', '#BE185D', '#0E7490', '#4338CA']

export const employeeService = {
  async all() {
    await delay()
    return getDB().employees
  },

  async get(id) {
    await delay(70)
    return getDB().employees.find((item) => item.id === id) || null
  },

  async create(payload) {
    await delay(200)
    return updateDB((db) => {
      const email = String(payload.email || '').trim()
      if (email && db.employees.some((item) => String(item.email || '').toLowerCase() === email.toLowerCase())) {
        throw new Error('Email sudah terdaftar pada karyawan lain.')
      }
      const year = new Date().getFullYear()
      const prefix = `EMP-${year}-`
      const highest = db.employees.reduce((max, item) => {
        if (!String(item.id).startsWith(prefix)) return max
        return Math.max(max, Number(String(item.id).slice(prefix.length)) || 0)
      }, 0)
      const count = db.employees.length + 1
      const employee = {
        id: payload.id || `${prefix}${String(highest + 1).padStart(3, '0')}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        department: payload.department,
        position: payload.position,
        status: payload.status || 'Aktif',
        joinDate: payload.joinDate,
        manager: payload.manager || '-',
        location: payload.location || 'Kantor Pusat Jakarta',
        initials: initialsOf(payload.name),
        avatarColor: COLORS[count % COLORS.length],
        assets: 0,
        grade: payload.grade || 'Grade B',
        notes: payload.notes || '-',
      }
      db.employees = [employee, ...db.employees]
      return employee
    })
  },

  async update(id, payload) {
    await delay(180)
    return updateDB((db) => {
      const index = db.employees.findIndex((item) => item.id === id)
      if (index === -1) throw new Error('Karyawan tidak ditemukan')
      const email = String(payload.email || '').trim()
      if (
        email &&
        db.employees.some(
          (item, itemIndex) => itemIndex !== index && String(item.email || '').toLowerCase() === email.toLowerCase(),
        )
      ) {
        throw new Error('Email sudah terdaftar pada karyawan lain.')
      }
      db.employees[index] = {
        ...db.employees[index],
        ...payload,
        initials: payload.name ? initialsOf(payload.name) : db.employees[index].initials,
      }
      return db.employees[index]
    })
  },

  async remove(id) {
    await delay(160)
    return updateDB((db) => {
      db.employees = db.employees.filter((item) => item.id !== id)
      logActivity(db, {
        type: 'asset',
        title: 'Data karyawan dihapus dari direktori',
        desc: `ID ${id} telah dinonaktifkan`,
        color: '#E5484D',
      })
      return true
    })
  },
}
