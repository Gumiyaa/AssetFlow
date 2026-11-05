import { cn } from '../../utils/format'

export default function Tabs({ items, value, onChange, variant = 'underline', className }) {
  if (variant === 'pill') {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {items.map((item) => {
          const active = item.key === value
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={cn('filter-chip', active && 'filter-chip-active')}
            >
              {item.label}
              {item.count != null ? (
                <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', active ? 'bg-white/15' : 'bg-slate-100 text-ink-500')}>
                  {item.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('flex gap-6 overflow-x-auto border-b border-line no-scrollbar', className)}>
      {items.map((item) => {
        const active = item.key === value
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={cn('tab', active && 'tab-active')}
          >
            {item.icon ? <item.icon className="h-3.5 w-3.5" /> : null}
            {item.label}
            {item.count != null ? (
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', active ? 'bg-navy-900 text-white' : 'bg-slate-100 text-ink-500')}>
                {item.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
