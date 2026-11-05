import { cn } from '../../utils/format'

const TONES = {
  teal: 'bg-brand-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  navy: 'bg-navy-700',
  purple: 'bg-violet-500',
  emerald: 'bg-emerald-500',
}

export default function Progress({ value = 0, tone = 'teal', className, barClassName, height = 'h-1.5' }) {
  const safe = Math.min(100, Math.max(0, Number(value) || 0))
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-slate-100', height, className)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', TONES[tone] || TONES.teal, barClassName)}
        style={{ width: `${safe}%` }}
      />
    </div>
  )
}
