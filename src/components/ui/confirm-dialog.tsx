'use client'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Dark-glass confirmation modal, used across the admin panel.
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Yes, delete',
  cancelText = 'No, cancel',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]" onClick={onCancel} />
      <div className="relative glass-strong gilt-border rounded-3xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] w-full max-w-sm p-6 animate-[popIn_0.18s_ease-out]">
        <div className="flex items-start gap-3">
          <div className={`grid place-items-center w-10 h-10 rounded-full shrink-0 ${danger ? 'bg-rose-500/15 text-rose-300' : 'bg-gilt-400/15 text-gilt-300'}`}>
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="text-sm text-white/55 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-full glass gilt-border px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60 transition-colors ${danger ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-gradient-to-r from-gilt-300 to-gilt-500 text-ink-900'}`}
          >
            {loading ? 'Working…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
