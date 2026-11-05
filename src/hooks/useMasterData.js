import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS } from '../services/storage'
import {
  categories as seedCategories,
  departments as seedDepartments,
  locations as seedLocations,
  units as seedUnits,
} from '../data/mockData'

export const MASTER_DATA_DEFAULTS = {
  categories: seedCategories,
  departments: seedDepartments,
  locations: seedLocations,
  units: seedUnits,
}

const COLLECTIONS = Object.keys(MASTER_DATA_DEFAULTS)

export function useMasterData() {
  const [stored, setStored] = useLocalStorage(STORAGE_KEYS.master, MASTER_DATA_DEFAULTS)

  const master = useMemo(() => {
    const next = {}
    for (const key of COLLECTIONS) {
      const value = stored?.[key]
      next[key] = Array.isArray(value) ? value : MASTER_DATA_DEFAULTS[key]
    }
    return next
  }, [stored])

  const updateCollection = useCallback(
    (key, updater) => {
      setStored((previous) => {
        const current = previous?.[key]
        const base = Array.isArray(current) ? current : MASTER_DATA_DEFAULTS[key]
        return {
          ...MASTER_DATA_DEFAULTS,
          ...previous,
          [key]: updater(base),
        }
      })
    },
    [setStored],
  )

  return { ...master, updateCollection, setStored }
}
