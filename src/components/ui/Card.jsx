import { cn } from '../../utils/format'

export default function Card({ children, className, padded = false, ...props }) {
  return (
    <div className={cn('card', padded && 'card-pad', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon, className, border = false }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 px-5 py-4',
        border && 'border-b border-line',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-ink-500">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="section-title truncate">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-500">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  )
}
