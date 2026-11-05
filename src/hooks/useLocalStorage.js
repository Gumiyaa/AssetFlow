import { useCallback, useEffect, useState } from 'react'
import { readStore, writeStore } from '../services/storage'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStore(key, initialValue))

  useEffect(() => {
    writeStore(key, value)
  }, [key, value])

  const update = useCallback((next) => {
    setValue((previous) => (typeof next === 'function' ? next(previous) : next))
  }, [])

  return [value, update]
}
