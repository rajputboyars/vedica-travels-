'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, ClipboardList, UserCircle, LogOut, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import { useAuth } from '@/hooks/useAuth'

// Customer Dashboard shell (Phase 9). Deliberately its own lightweight
// shell rather than reusing AdminShell — that component is wired
// specifically to the NextAuth admin session (see its own doc comment),
// while this one guards on the Phase 2 JWT customer session via useAuth().
// Same "redirect client-side, not via middleware" precedent as AdminShell,
// for the same production-flakiness reason noted there.
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <div className="dashboard-shell flex min-h-screen bg-gray-100">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 md:relative md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{siteConfig.emoji}</span>
            <div>
              <div className="font-bold leading-tight">{siteConfig.shortName}</div>
              <div className="text-xs text-gray-400 leading-tight">My Account</div>
            </div>
          </div>
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 w-full mt-2"
          >
            <LogOut size={17} />
            Log Out
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between bg-white shadow-sm px-4 py-3">
          <span className="font-bold text-gray-800">{siteConfig.shortName} — My Account</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
