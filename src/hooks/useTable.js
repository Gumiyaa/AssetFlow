import { useEffect, useMemo, useState } from 'react'
import { getByPath } from '../utils/format'

export function useTable(items, { pageSize = 8, searchFields = [], initialSort = null } = {}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(initialSort)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(pageSize)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return items
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = typeof field === 'function' ? field(item) : getByPath(item, field)
        return String(value ?? '').toLowerCase().includes(needle)
      }),
    )
  }, [items, query, searchFields])

  const sorted = useMemo(() => {
    if (!sort?.key) return filtered
    const data = [...filtered]
    data.sort((a, b) => {
      const av = getByPath(a, sort.key)
      const bv = getByPath(b, sort.key)
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.direction === 'asc' ? av - bv : bv - av
      }
      return sort.direction === 'asc'
        ? String(av).localeCompare(String(bv), 'id')
        : String(bv).localeCompare(String(av), 'id')
    })
    return data
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / size))

  useEffect(() => {
    setPage(1)
  }, [query, size])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const toggleSort = (key) => {
    setSort((previous) =>
      previous?.key === key
        ? { key, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )
  }

  return {
    query,
    setQuery,
    sort,
    toggleSort,
    page,
    setPage,
    size,
    setSize,
    rows: sorted.slice((page - 1) * size, page * size),
    all: sorted,
    filteredCount: sorted.length,
    total: items.length,
    totalPages,
  }
}
