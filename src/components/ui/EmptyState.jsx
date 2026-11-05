import { cn } from '../../utils/format'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-5 py-12 text-center', className)}>
      {Icon ? (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-ink-400">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <p className="mt-3 text-[13px] font-semibold text-ink-900">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-ink-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
