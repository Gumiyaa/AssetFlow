import { cn, initialsOf } from '../../utils/format'

const SIZES = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-9 w-9 text-[11px]',
  lg: 'h-12 w-12 text-[14px]',
  xl: 'h-16 w-16 text-[19px]',
}

export default function Avatar({
  name = '',
  initials,
  color = '#1B4B6B',
  size = 'md',
  className,
  status,
  square = false,
}) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center font-semibold text-white ring-1 ring-white/30',
          square ? 'rounded-lg' : 'rounded-full',
          SIZES[size] || SIZES.md,
        )}
        style={{ background: color }}
        aria-hidden="true"
      >
        {initials || initialsOf(name)}
      </span>
      {status ? (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white',
            status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400',
          )}
        />
      ) : null}
    </span>
  )
}
