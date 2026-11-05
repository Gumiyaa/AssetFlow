import { delay } from './db'
import { reports as seedReports } from '../data/mockData'

export const reportService = {
  async all() {
    await delay(120)
    return seedReports
  },

  async byCategory(category) {
    await delay(90)
    return category === 'Semua Kategori'
      ? seedReports
      : seedReports.filter((report) => report.category === category)
  },

  async download(code) {
    await delay(320)
    const report = seedReports.find((item) => item.code === code)
    if (!report) throw new Error('Laporan tidak ditemukan')
    return { ...report, downloadedAt: new Date().toISOString() }
  },
}
