import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import Reveal from '@/features/home/components/Reveal'

const AUTH_BG = 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1400&q=80&auto=format&fit=crop'

// Shared luxury authentication layout: full-height dark cinematic
// background + centered frosted glass card. Login / register / forgot /
// reset / verify all render their form inside this so they're identical.
export default function AuthShell({
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="lux relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-28">
      <Image src={AUTH_BG} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/85 via-ink-900/80 to-ink-900" />
      <div className="aura absolute inset-0" />

      <Reveal className="relative w-full max-w-md">
        <div className="glass-strong gilt-border rounded-3xl p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
          <div className="text-center mb-8">
            <span className="grid place-items-center w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gilt-300 to-gilt-600 text-ink-900 shadow-[0_10px_30px_-8px_rgba(212,175,55,0.6)]">
              <Icon size={26} />
            </span>
            <h1 className="mt-5 font-display text-2xl font-semibold text-white">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-white/55">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="mt-6 text-center text-sm text-white/55">{footer}</div>}
        </div>
      </Reveal>
    </div>
  )
}

// Shared gold submit button for forms.
export function SubmitButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gilt-300 to-gilt-500 px-6 py-3.5 text-sm font-semibold text-ink-900 gilt-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}
