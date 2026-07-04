'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, ClipboardList, UserCircle, LogOut, Menu, X, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import { useAuth } from '@/hooks/useAuth'

// Customer Dashboard shell (Phase 9). Deliberately its own lightweight
// shell rather than reusing AdminShell — that component is wired
// specifically to the NextAuth admin session, while this one guards on the
// Phase 2 JWT customer session via useAuth().
const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: ClipboardList },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [loading, user, pathname, router])

  if (loading || !user) {
    return <div className="lux min-h-screen flex items-center justify-center text-white/40 text-sm">Loading…</div>
  }

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <div className="dashboard-shell lux flex min-h-screen bg-ink-900">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 glass-strong border-r border-gilt-500/10 transform transition-transform duration-300 md:relative md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-gilt-300 to-gilt-600 text-ink-900"><span className="text-lg">🛕</span></span>
            <div>
              <div className="font-display font-semibold text-white leading-tight">{siteConfig.shortName}</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-gilt-400 leading-tight">My Account</div>
            </div>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active ? 'bg-gilt-400 text-ink-900' : 'text-white/70 hover:bg-white/5'
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            )
          })}
          <div className="my-2 h-px bg-white/5" />
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5">
            <Home size={17} /> Back to Site
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 w-full">
            <LogOut size={17} /> Log Out
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between glass-strong border-b border-white/5 px-4 py-3">
          <span className="font-display font-semibold text-white">{siteConfig.shortName}</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu" className="text-white">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
