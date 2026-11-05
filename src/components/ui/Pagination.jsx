import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatNumber } from '../../utils/format'

function getPages(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages]
  if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  return [1, '…', page - 1, page, page + 1, '…', totalPages]
}

export default function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPage,
  onPageSize,
  pageSizeOptions = [8, 12, 20, 50],
  label = 'data',
  className,
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[11.5px] text-ink-500">
          Menampilkan <span className="font-semibold text-ink-900">{formatNumber(start)}</span>–
          <span className="font-semibold text-ink-900">{formatNumber(end)}</span> dari{' '}
          <span className="font-semibold text-ink-900">{formatNumber(total)}</span> {label}
        </p>
        {onPageSize ? (
          <label className="flex items-center gap-1.5 text-[11px] text-ink-500">
            <span className="hidden sm:inline">Baris</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSize(Number(event.target.value))}
              className="h-7 rounded-md border border-line bg-white px-1.5 text-[11px] text-ink-700 outline-none focus:border-navy-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-ink-500 transition hover:bg-slate-50 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        {getPages(page, totalPages).map((item, index) =>
          item === '…' ? (
            <span key={`ellipsis-${index}`} className="flex h-7 w-6 items-center justify-center text-[11px] text-ink-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPage(item)}
              className={cn(
                'flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-[11px] font-medium transition',
                item === page
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-line bg-white text-ink-600 hover:bg-slate-50 hover:text-ink-900',
              )}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-ink-500 transition hover:bg-slate-50 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
