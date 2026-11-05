import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/format'

export default function Dropdown({ trigger, children, align = 'right', className, panelClassName, width = 'w-72' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handlePointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div onClick={() => setOpen((value) => !value)}>{trigger}</div>
      {open ? (
        <div
          className={cn(
            'animate-in absolute z-50 mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-[0_20px_48px_-18px_rgba(15,23,42,0.35)]',
            align === 'right' ? 'right-0' : 'left-0',
            width,
            panelClassName,
          )}
        >
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      ) : null}
    </div>
  )
}

export function DropdownItem({ icon: Icon, children, onClick, danger = false, active = false, suffix }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] transition',
        danger ? 'text-red-600 hover:bg-red-50' : 'text-ink-600 hover:bg-slate-50 hover:text-ink-900',
        active && 'bg-slate-50 font-medium text-ink-900',
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {suffix ? <span className="text-[10px] text-ink-400">{suffix}</span> : null}
    </button>
  )
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-line" />
}
