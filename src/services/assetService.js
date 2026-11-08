import { delay, getDB, updateDB, logActivity, nextSequence } from './db'
import { currentUser } from '../data/mockData'

const CATEGORY_CODES = {
  'Laptop & PC': 'IT',
  'Perangkat Jaringan': 'NW',
  'Mesin Kantor': 'OF',
  'Kendaraan Operasional': 'VH',
  'Furnitur & Fixture': 'FN',
}

function makeAssetCode(assets, category) {
  const prefix = CATEGORY_CODES[category] || 'GEN'
  const year = new Date().getFullYear()
  const sameFamily = assets.filter((asset) => asset.code?.startsWith(`AST-${prefix}-`))
  const sequence = nextSequence(sameFamily.map((asset) => ({ id: asset.code?.split('-').pop() })), 1)
  return `AST-${prefix}-${year}-${String(sequence).padStart(3, '0')}`
}

export const assetService = {
  async all() {
    await delay()
    return getDB().assets
  },

  async get(id) {
    await delay(80)
    return getDB().assets.find((asset) => asset.id === id || asset.code === id) || null
  },

  async create(payload) {
    await delay(240)
    return updateDB((db) => {
      const serial = String(payload.serial || '').trim()
      if (serial && db.assets.some((item) => String(item.serial || '').toLowerCase() === serial.toLowerCase())) {
        throw new Error('Nomor seri sudah terdaftar pada aset lain.')
      }
      const asset = {
        id: `AST-${Date.now().toString(36).toUpperCase()}`,
        code: payload.code || makeAssetCode(db.assets, payload.category),
        name: payload.name,
        category: payload.category,
        brand: payload.brand,
        model: payload.model,
        serial: payload.serial,
        description: payload.description || '',
        purchaseDate: payload.purchaseDate,
        purchasePrice: Number(payload.purchasePrice) || 0,
        supplier: payload.supplier || '',
        invoice: payload.invoice || '',
        warrantyMonths: Number(payload.warrantyMonths) || 0,
        department: payload.department,
        location: payload.location,
        pic: payload.pic,
        condition: payload.condition,
        status: payload.status,
        bookValue: Math.round((Number(payload.purchasePrice) || 0) * 0.8),
        barcode: payload.serial || `AF-${Date.now().toString().slice(-8)}`,
        room: payload.room || payload.location,
        supplierEmail: payload.supplierEmail || '',
        taxInvoice: payload.taxInvoice || '',
        createdAt: new Date().toISOString(),
        image: null,
      }
      db.assets = [asset, ...db.assets]
      logActivity(db, {
        type: 'asset',
        title: `Registrasi aset baru ${asset.name}`,
        desc: `Kode ${asset.code} • Kategori ${asset.category}`,
        actor: currentUser.name,
        color: '#7A5AF8',
      })
      return asset
    })
  },

  async update(id, payload) {
    await delay(220)
    return updateDB((db) => {
      const index = db.assets.findIndex((asset) => asset.id === id || asset.code === id)
      if (index === -1) throw new Error('Aset tidak ditemukan')
      const serial = String(payload.serial || '').trim()
      if (
        serial &&
        db.assets.some(
          (item, itemIndex) => itemIndex !== index && String(item.serial || '').toLowerCase() === serial.toLowerCase(),
        )
      ) {
        throw new Error('Nomor seri sudah terdaftar pada aset lain.')
      }
      db.assets[index] = {
        ...db.assets[index],
        ...payload,
        purchasePrice: payload.purchasePrice != null ? Number(payload.purchasePrice) : db.assets[index].purchasePrice,
        warrantyMonths: payload.warrantyMonths != null ? Number(payload.warrantyMonths) : db.assets[index].warrantyMonths,
        updatedAt: new Date().toISOString(),
      }
      logActivity(db, {
        type: 'asset',
        title: `Pembaruan data aset ${db.assets[index].name}`,
        desc: `Kode ${db.assets[index].code} • Diperbarui oleh ${currentUser.name}`,
        color: '#2E90FA',
      })
      return db.assets[index]
    })
  },

  async remove(id) {
    await delay(180)
    return updateDB((db) => {
      const asset = db.assets.find((item) => item.id === id || item.code === id)
      const matchesAsset = (item) =>
        asset && (item.assetId === asset.id || item.assetId === asset.code)
      const activeBorrowing = db.borrowings.some(
        (item) =>
          matchesAsset(item) &&
          ['Menunggu Persetujuan', 'Disetujui', 'Sedang Dipinjam', 'Terlambat'].includes(item.status),
      )
      if (activeBorrowing) {
        throw new Error('Aset masih terkait peminjaman aktif. Selesaikan peminjaman sebelum menghapus aset.')
      }
      const activeMaintenance = db.maintenance.some(
        (item) => matchesAsset(item) && item.status !== 'Selesai',
      )
      if (activeMaintenance) {
        throw new Error('Aset masih memiliki tiket pemeliharaan aktif. Selesaikan tiket sebelum menghapus aset.')
      }
      db.assets = db.assets.filter((item) => item.id !== id && item.code !== id)
      if (asset) {
        logActivity(db, {
          type: 'asset',
          title: `Aset ${asset.name} dinonaktifkan`,
          desc: `Kode ${asset.code} dihapus dari daftar aktif`,
          color: '#E5484D',
        })
      }
      return true
    })
  },
}
