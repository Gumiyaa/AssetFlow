import { Search, X } from 'lucide-react'
import { cn } from '../../utils/format'

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Cari…',
  className,
  inputClassName,
  onFocus,
  autoFocus,
  inputRef,
  onKeyDown,
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={cn('input h-9 pl-9 pr-8 text-[12px] [&::-webkit-search-cancel-button]:hidden', inputClassName)}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-400 transition hover:bg-slate-100 hover:text-ink-700"
          aria-label="Bersihkan pencarian"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
}
