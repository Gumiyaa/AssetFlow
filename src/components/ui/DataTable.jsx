import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from 'lucide-react'
import { cn } from '../../utils/format'

export default function DataTable({
  columns,
  rows,
  keyField = 'id',
  empty,
  sort,
  onSort,
  className,
  tableClassName,
  onRowClick,
  footer,
  loading = false,
}) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-white', className)}>
      <div className="overflow-x-auto">
        <table className={cn('w-full text-left', tableClassName)}>
          <thead className="border-b border-line bg-slate-50/80">
            <tr>
              {columns.map((column) => {
                const active = sort?.key === column.sortKey
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn('th', column.align === 'right' && 'text-right', column.align === 'center' && 'text-center', column.headerClassName)}
                  >
                    {column.sortKey && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(column.sortKey)}
                        className={cn(
                          'inline-flex items-center gap-1 uppercase tracking-[0.065em] transition hover:text-ink-900',
                          active && 'text-ink-900',
                        )}
                      >
                        {column.header}
                        {active ? (
                          sort.direction === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-14 text-center">
                  <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-navy-700" />
                    <span className="text-[12px] text-ink-500">Memuat data…</span>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-ink-400">
                      <Inbox className="h-5 w-5" />
                    </span>
                    <p className="mt-3 text-[13px] font-semibold text-ink-900">{empty?.title || 'Tidak ada data'}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
                      {empty?.description || 'Coba sesuaikan kata kunci pencarian atau filter yang dipilih.'}
                    </p>
                    {empty?.action ? <div className="mt-3">{empty.action}</div> : null}
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row[keyField] ?? index}
                  className={cn('row-hover', onRowClick && 'cursor-pointer')}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'td',
                        column.align === 'right' && 'text-right',
                        column.align === 'center' && 'text-center',
                        column.className,
                      )}
                    >
                      {column.render ? column.render(row, index) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer ? <div className="border-t border-line bg-slate-50/50 px-4 py-3">{footer}</div> : null}
    </div>
  )
}
