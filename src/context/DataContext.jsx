import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ensureSeeded, getDB, resetDB, saveDB } from '../services/db'
import { assetService } from '../services/assetService'
import { inventoryService } from '../services/inventoryService'
import { borrowingService } from '../services/borrowingService'
import { maintenanceService } from '../services/maintenanceService'
import { employeeService } from '../services/employeeService'
import { userService } from '../services/userService'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    ensureSeeded()
    return getDB()
  })
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    setData(getDB())
  }, [])

  useEffect(() => {
    const handleUpdate = () => setData(getDB())
    window.addEventListener('assetflow:db-updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('assetflow:db-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const run = useCallback(async (operation) => {
    setLoading(true)
    try {
      const result = await operation()
      setData(getDB())
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  const actions = useMemo(
    () => ({
      refresh,
      createAsset: (payload) => run(() => assetService.create(payload)),
      updateAsset: (id, payload) => run(() => assetService.update(id, payload)),
      deleteAsset: (id) => run(() => assetService.remove(id)),

      createInventoryItem: (payload) => run(() => inventoryService.create(payload)),
      updateInventoryItem: (id, payload) => run(() => inventoryService.update(id, payload)),
      deleteInventoryItem: (id) => run(() => inventoryService.remove(id)),
      createInventoryTransaction: (payload) => run(() => inventoryService.createTransaction(payload)),

      createBorrowing: (payload) => run(() => borrowingService.create(payload)),
      approveBorrowing: (id) => run(() => borrowingService.approve(id)),
      rejectBorrowing: (id, reason) => run(() => borrowingService.reject(id, reason)),
      handOverBorrowing: (id) => run(() => borrowingService.handOver(id)),
      returnBorrowing: (id, condition) => run(() => borrowingService.returnAsset(id, condition)),

      createMaintenance: (payload) => run(() => maintenanceService.create(payload)),
      updateMaintenanceProgress: (id, payload) => run(() => maintenanceService.updateProgress(id, payload)),
      toggleMaintenanceChecklist: (id, index) => run(() => maintenanceService.toggleChecklist(id, index)),

      createEmployee: (payload) => run(() => employeeService.create(payload)),
      updateEmployee: (id, payload) => run(() => employeeService.update(id, payload)),
      deleteEmployee: (id) => run(() => employeeService.remove(id)),

      createUser: (payload) => run(() => userService.create(payload)),
      updateUser: (id, payload) => run(() => userService.update(id, payload)),
      toggleUserStatus: (id) => run(() => userService.toggleStatus(id)),
      deleteUser: (id) => run(() => userService.remove(id)),

      markNotificationRead: (id) => {
        const db = getDB()
        const next = {
          ...db,
          notifications: db.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
        }
        saveDB(next)
        setData(next)
      },
      markAllNotificationsRead: () => {
        const db = getDB()
        const next = {
          ...db,
          notifications: db.notifications.map((item) => ({ ...item, read: true })),
        }
        saveDB(next)
        setData(next)
      },
      resetDemoData: () => {
        const next = resetDB()
        setData(next)
      },
    }),
    [refresh, run],
  )

  const value = useMemo(
    () => ({
      ...data,
      loading,
      actions,
      counts: {
        pendingBorrowings: data.borrowings.filter((item) => item.status === 'Menunggu Persetujuan').length,
        activeMaintenance: data.maintenance.filter((item) => !['Selesai'].includes(item.status)).length,
        lowStock: data.inventory.filter((item) => item.status !== 'Aman').length,
        overdue: data.borrowings.filter((item) => item.status === 'Terlambat').length,
        unread: data.notifications.filter((item) => !item.read).length,
      },
    }),
    [data, loading, actions],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used inside DataProvider')
  return context
}
