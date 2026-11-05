import { cn } from '../../utils/format'

export default function Field({ label, htmlFor, error, hint, required, children, className, action }) {
  return (
    <div className={cn('min-w-0', className)}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label htmlFor={htmlFor} className="text-[12px] font-medium text-ink-700">
            {label}
            {required ? <span className="ml-0.5 text-red-500">*</span> : null}
          </label>
          {action}
        </div>
      ) : null}
      {children}
      {error ? <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p> : null}
      {!error && hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  )
}

export function Input({ className, ...props }) {
  return <input className={cn('input', className)} {...props} />
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn('select', className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn('textarea', className)} {...props} />
}
