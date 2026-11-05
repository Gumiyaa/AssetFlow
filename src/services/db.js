import * as seed from '../data/mockData'
import { readStore, writeStore, STORAGE_KEYS } from './storage'

const clone = (value) => JSON.parse(JSON.stringify(value))

export function buildSeed() {
  return {
    version: 1,
    seededAt: new Date().toISOString(),
    assets: clone(seed.assets),
    inventory: clone(seed.inventory),
    transactions: clone(seed.transactions),
    borrowings: clone(seed.borrowings),
    maintenance: clone(seed.maintenance),
    employees: clone(seed.employees),
    users: clone(seed.users),
    activities: clone(seed.activities),
    notifications: clone(seed.notifications),
  }
}

export function ensureSeeded(force = false) {
  const existing = readStore(STORAGE_KEYS.db)
  if (existing && !force && existing.version === 1) return existing
  const fresh = buildSeed()
  writeStore(STORAGE_KEYS.db, fresh)
  return fresh
}

export function getDB() {
  return ensureSeeded()
}

export function saveDB(db) {
  writeStore(STORAGE_KEYS.db, db)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('assetflow:db-updated'))
  }
  return db
}

export function updateDB(mutator) {
  const db = getDB()
  const result = mutator(db)
  saveDB(db)
  return result
}

export function resetDB() {
  return saveDB(buildSeed())
}

export const delay = (ms = 140) => new Promise((resolve) => window.setTimeout(resolve, ms))

export function nextSequence(items, start = 1) {
  const highest = items.reduce((max, item) => {
    const match = String(item.id || item.code || '').match(/(\d+)$/)
    if (!match) return max
    return Math.max(max, Number(match[1]))
  }, 0)
  return Math.max(highest + 1, start)
}

export function logActivity(db, activity) {
  const entry = {
    id: `ACT-${Date.now()}`,
    time: 'Baru saja',
    actor: 'Andi Pratama',
    color: '#0E9384',
    type: 'asset',
    ...activity,
  }
  db.activities = [entry, ...(db.activities || [])].slice(0, 40)
  return entry
}

export function findAsset(db, assetId) {
  return db.assets.find((asset) => asset.id === assetId || asset.code === assetId)
}

export function findEmployee(db, employeeId) {
  return db.employees.find((employee) => employee.id === employeeId)
}
