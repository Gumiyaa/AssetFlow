import { delay, getDB, updateDB, logActivity, nextSequence } from './db'
import { currentUser } from '../data/mockData'

function stockStatus(stock, minStock) {
  if (Number(stock) <= 0) return 'Habis'
  if (Number(stock) < Number(minStock)) return 'Menipis'
  return 'Aman'
}

function logTransaction(db, transaction) {
  db.transactions = [transaction, ...db.transactions]
  logActivity(db, {
    type: 'inventory',
    title: `${transaction.type === 'Masuk' ? 'Penerimaan' : transaction.type === 'Keluar' ? 'Pengeluaran' : 'Penyesuaian'} stok ${transaction.itemName}`,
    desc: `${Math.abs(transaction.qty)} ${transaction.unit} • ${transaction.ref}`,
    color: transaction.type === 'Masuk' ? '#0E9384' : transaction.type === 'Keluar' ? '#F79009' : '#7A5AF8',
  })
}

export const inventoryService = {
  async all() {
    await delay()
    return getDB().inventory
  },

  async get(id) {
    await delay(70)
    return getDB().inventory.find((item) => item.id === id) || null
  },

  async create(payload) {
    await delay(200)
    return updateDB((db) => {
      const sku = String(payload.sku || '').trim()
      if (sku && db.inventory.some((entry) => String(entry.sku || '').toLowerCase() === sku.toLowerCase())) {
        throw new Error('Kode SKU sudah digunakan oleh barang lain.')
      }
      const generatedSku = `INV-${Date.now().toString(36).toUpperCase()}`
      const item = {
        id: sku || generatedSku,
        sku: sku || generatedSku,
        name: payload.name,
        category: payload.category,
        unit: payload.unit,
        stock: Number(payload.stock) || 0,
        minStock: Number(payload.minStock) || 0,
        location: payload.location,
        rack: payload.rack || '-',
        description: payload.description || '',
        status: stockStatus(payload.stock, payload.minStock),
        createdAt: new Date().toISOString(),
      }
      db.inventory = [item, ...db.inventory]
      return item
    })
  },

  async update(id, payload) {
    await delay(180)
    return updateDB((db) => {
      const index = db.inventory.findIndex((item) => item.id === id)
      if (index === -1) throw new Error('Barang inventaris tidak ditemukan')
      const sku = String(payload.sku || '').trim()
      if (
        sku &&
        db.inventory.some(
          (entry, entryIndex) => entryIndex !== index && String(entry.sku || '').toLowerCase() === sku.toLowerCase(),
        )
      ) {
        throw new Error('Kode SKU sudah digunakan oleh barang lain.')
      }
      const stock = payload.stock != null ? Number(payload.stock) : db.inventory[index].stock
      const minStock = payload.minStock != null ? Number(payload.minStock) : db.inventory[index].minStock
      db.inventory[index] = {
        ...db.inventory[index],
        ...payload,
        stock,
        minStock,
        status: stockStatus(stock, minStock),
      }
      return db.inventory[index]
    })
  },

  async remove(id) {
    await delay(160)
    return updateDB((db) => {
      db.inventory = db.inventory.filter((item) => item.id !== id)
      return true
    })
  },

  async transactions() {
    await delay()
    return getDB().transactions
  },

  async createTransaction(payload) {
    await delay(220)
    return updateDB((db) => {
      const item = db.inventory.find((entry) => entry.id === payload.itemId)
      if (!item) throw new Error('Barang inventaris tidak ditemukan')
      const before = item.stock
      const type = payload.type
      const quantity = Math.abs(Number(payload.qty) || 0)
      let delta = quantity
      if (type === 'Keluar') delta = -quantity
      if (type === 'Penyesuaian') delta = Number(payload.qty) || 0

      const after = before + delta
      if (after < 0) throw new Error(`Stok tidak mencukupi. Stok tersedia ${before} ${item.unit}.`)

      const year = new Date().getFullYear()
      const prefix = type === 'Masuk' ? 'TRX-IN' : type === 'Keluar' ? 'TRX-OUT' : 'TRX-ADJ'
      const sequence = nextSequence(
        db.transactions
          .filter((trx) => trx.id.startsWith(prefix))
          .map((trx) => ({ id: trx.id.split('-').pop() })),
        1,
      )
      const code = `${prefix}-${year}-${String(sequence).padStart(3, '0')}`

      const transaction = {
        id: code,
        type,
        date: new Date().toISOString(),
        itemId: item.id,
        itemName: item.name,
        unit: item.unit,
        qty: type === 'Penyesuaian' ? delta : quantity,
        before,
        after,
        recipient: payload.recipient || (type === 'Masuk' ? 'Procurement' : '-'),
        department: payload.department || (type === 'Masuk' ? 'Procurement' : item.category),
        purpose: payload.purpose,
        officer: currentUser.name,
        location: item.rack ? `${item.rack} • ${item.location}` : item.location,
        ref: `${type === 'Masuk' ? 'SJ-IN' : type === 'Keluar' ? 'SJ-OUT' : 'ADJ'}/${year}/${String(sequence).padStart(4, '0')}`,
        note: payload.note || '-',
        status: 'Terverifikasi',
      }

      item.stock = after
      item.status = stockStatus(after, item.minStock)
      logTransaction(db, transaction)
      return transaction
    })
  },
}

export { stockStatus }
