import * as React from 'react'
import { cn } from '@/lib/utils'

// Shared dark-glass input styling so every form field across auth,
// registration, booking and dashboard looks identical.
export const luxInputClass =
  'w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-white placeholder-white/35 ' +
  'transition-colors focus:outline-none focus:border-gilt-400/60 focus:ring-2 focus:ring-gilt-500/15 ' +
  'disabled:opacity-50'

export const luxLabelClass = 'block text-sm font-medium text-white/70 mb-1.5'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(luxInputClass, className)} {...props} />,
)
Input.displayName = 'LuxInput'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(luxInputClass, className)} {...props} />,
)
Textarea.displayName = 'LuxTextarea'

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(luxInputClass, 'appearance-none', className)} {...props}>
      {children}
    </select>
  ),
)
Select.displayName = 'LuxSelect'

// Labelled wrapper: <Field label="Email">{children}</Field>, with optional
// error text shown below.
export default function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label?: string
  htmlFor?: string
  error?: string
  hint?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {(label || hint) && (
        <div className="flex items-center justify-between">
          {label && <label htmlFor={htmlFor} className={luxLabelClass}>{label}</label>}
          {hint}
        </div>
      )}
      {children}
      {error && <p className="mt-1.5 text-sm text-rose-400">{error}</p>}
    </div>
  )
}
