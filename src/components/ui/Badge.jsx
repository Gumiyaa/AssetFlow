import { cn, statusTone } from '../../utils/format'

const TONES = {
  neutral: 'badge-neutral',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  teal: 'badge-teal',
  navy: 'badge-navy',
}

export default function Badge({ tone = 'neutral', dot = false, children, className }) {
  return (
    <span className={cn('badge', TONES[tone] || TONES.neutral, className)}>
      {dot ? <span className={cn('h-1.5 w-1.5 rounded-full', dotColor(tone))} /> : null}
      {children}
    </span>
  )
}

function dotColor(tone) {
  if (tone === 'success') return 'bg-emerald-500'
  if (tone === 'warning') return 'bg-amber-500'
  if (tone === 'danger') return 'bg-red-500'
  if (tone === 'info') return 'bg-blue-500'
  if (tone === 'teal') return 'bg-brand-500'
  return 'bg-slate-400'
}

export function StatusBadge({ status, dot = true, className }) {
  return (
    <Badge tone={statusTone(status)} dot={dot} className={className}>
      {status}
    </Badge>
  )
}
