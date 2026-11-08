import { api } from './api'

const READ_ONLY_MESSAGE =
  'Perubahan data pengguna belum tersedia di server. Fitur tambah, ubah, hapus, dan ubah status akan diaktifkan pada tahap berikutnya.'

export const userService = {
  async all() {
    const { data } = await api.get('/users')
    return data.data
  },

  async get(id) {
    const { data } = await api.get(`/users/${encodeURIComponent(id)}`)
    return data.data ?? null
  },

  async create() {
    throw new Error(READ_ONLY_MESSAGE)
  },

  async update() {
    throw new Error(READ_ONLY_MESSAGE)
  },

  async toggleStatus() {
    throw new Error(READ_ONLY_MESSAGE)
  },

  async remove() {
    throw new Error(READ_ONLY_MESSAGE)
  },
}
