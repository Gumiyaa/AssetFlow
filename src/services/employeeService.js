import { api } from './api'

const READ_ONLY_MESSAGE =
  'Perubahan data karyawan belum tersedia di server. Fitur tambah, ubah, dan hapus akan diaktifkan pada tahap berikutnya.'

export const employeeService = {
  async all() {
    const { data } = await api.get('/employees')
    return data.data
  },

  async get(id) {
    const { data } = await api.get(`/employees/${encodeURIComponent(id)}`)
    return data.data ?? null
  },

  async create() {
    throw new Error(READ_ONLY_MESSAGE)
  },

  async update() {
    throw new Error(READ_ONLY_MESSAGE)
  },

  async remove() {
    throw new Error(READ_ONLY_MESSAGE)
  },
}
