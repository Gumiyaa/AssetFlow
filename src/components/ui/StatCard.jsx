import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '../../utils/format'

const TONES = {
  navy: { tile: 'bg-navy-700/8 text-navy-700', accent: '#17324d' },
  teal: { tile: 'bg-brand-50 text-brand-600', accent: '#0E9384' },
  blue: { tile: 'bg-blue-50 text-blue-600', accent: '#2E90FA' },
  amber: { tile: 'bg-amber-50 text-amber-600', accent: '#F79009' },
  red: { tile: 'bg-red-50 text-red-600', accent: '#E5484D' },
  purple: { tile: 'bg-violet-50 text-violet-600', accent: '#7A5AF8' },
}

export default function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'navy',
  delta,
  deltaLabel = 'dari bulan lalu',
  note,
  footer,
  className,
  onClick,
}) {
  const config = TONES[tone] || TONES.navy
  const positive = typeof delta === 'number' ? delta >= 0 : delta === 'up'
  const hasDelta = delta != null

  return (
    <div
      className={cn(
        'card relative overflow-hidden p-4',
        onClick && 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-16px_rgba(15,23,42,0.35)]',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => event.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow truncate">{label}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[24px] font-semibold leading-none tracking-[-0.03em] text-ink-900">{value}</span>
            {unit ? <span className="text-[11px] font-medium text-ink-400">{unit}</span> : null}
          </div>
        </div>
        {Icon ? (
          <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', config.tile)}>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex min-h-[18px] flex-wrap items-center gap-x-2 gap-y-1">
        {hasDelta ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-semibold',
              positive ? 'text-emerald-600' : 'text-red-600',
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {typeof delta === 'number' ? `${Math.abs(delta).toFixed(1).replace('.0', '')}%` : delta}
          </span>
        ) : null}
        {note ? <span className="truncate text-[10.5px] text-ink-400">{note}</span> : null}
        {hasDelta && deltaLabel ? <span className="text-[10.5px] text-ink-400">{deltaLabel}</span> : null}
      </div>
      {footer ? <div className="mt-3 border-t border-line/80 pt-2.5">{footer}</div> : null}
      <span className="absolute inset-x-0 bottom-0 h-[2px] opacity-70" style={{ background: config.accent }} />
    </div>
  )
}
