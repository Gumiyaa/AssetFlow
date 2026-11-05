import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/format'

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  soft: 'btn-soft',
  teal: 'btn-teal',
  danger: 'btn-danger',
  'danger-soft': 'btn-danger-soft',
  ghost: 'btn-ghost',
}

const SIZES = {
  md: '',
  sm: 'btn-sm',
  xs: 'btn-xs',
  icon: 'h-9 w-9 px-0',
  'icon-sm': 'h-8 w-8 px-0',
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  to,
  href,
  children,
  className,
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  type = 'button',
  ...props
}) {
  const classes = cn('btn', VARIANTS[variant], SIZES[size], className)
  const content = (
    <>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
      {IconRight ? <IconRight className="h-3.5 w-3.5" /> : null}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  )
}
