'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { SessionProvider, useSession, signOut } from 'next-auth/react'
import { LogOut, Menu, X, PanelLeftClose, PanelLeft, Search, Plus, Bell, ChevronDown, ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import { adminNavItems } from '@/config/nav'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </SessionProvider>
  )
}

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { status, data } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isLogin = pathname === '/admin/login'

  // Client-side guard: redirect to login when not authenticated.
  //
  // This is deliberately NOT done via Next.js middleware. An earlier
  // version gated /admin routes with edge middleware checking the NextAuth
  // JWT, and it was flaky in production on Vercel (edge runtime +
  // NEXTAUTH_SECRET propagation issues caused false "unauthenticated"
  // redirects). Client-side redirect trades a brief loading flash for
  // reliability — worth it until there's a concrete reason to revisit.
  useEffect(() => {
    if (!isLogin && status === 'unauthenticated') {
      router.replace('/admin/login')
    }
  }, [isLogin, status, router])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (isLogin) return <>{children}</>

  if (status !== 'authenticated') {
    return <div className="lux min-h-screen flex items-center justify-center text-white/40 text-sm">Loading…</div>
  }

  const adminName = data?.user?.name || 'Admin'
  const adminEmail = data?.user?.email || siteConfig.contact.email
  const active = adminNavItems.find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)))
  const pageTitle = active?.label ?? 'Admin'

  return (
    <div className="admin-shell lux flex h-screen overflow-hidden bg-ink-900">
      {sidebarOpen && <div className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        'admin-sidebar fixed inset-y-0 left-0 z-50 flex flex-col glass-strong border-r border-gilt-500/10 transform transition-all duration-300 md:relative md:translate-x-0',
        collapsed ? 'md:w-[76px]' : 'md:w-64',
        'w-64',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className={cn('flex items-center gap-3 border-b border-white/5 px-5 h-16', collapsed && 'md:justify-center md:px-0')}>
          <Link href="/admin" className="flex items-center gap-3 min-w-0">
            <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-gilt-300 to-gilt-600 text-ink-900"><span>🛕</span></span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block font-semibold text-sm text-white truncate">{siteConfig.shortName}</span>
                <span className="block text-[10px] uppercase tracking-[0.24em] text-gilt-400">Admin</span>
              </span>
            )}
          </Link>
          <button className="ml-auto md:hidden text-white/60" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors',
                  collapsed && 'md:justify-center md:px-0',
                  isActive ? 'bg-gilt-400 text-ink-900 font-medium' : 'text-white/65 hover:bg-white/5 hover:text-white',
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/5 p-3">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            title={collapsed ? 'Logout' : undefined}
            className={cn('flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/65 hover:bg-white/5 hover:text-white transition-colors', collapsed && 'md:justify-center md:px-0')}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 glass-strong px-4 sm:px-6 h-16 shrink-0">
          <button className="md:hidden text-white/70" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <button className="hidden md:grid place-items-center w-9 h-9 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar">
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>

          <h1 className="text-base font-semibold text-white md:hidden">{pageTitle}</h1>

          <div className="relative ml-1 hidden md:flex items-center flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 text-white/35" />
            <input
              placeholder="Search…"
              className="w-full rounded-full bg-white/[0.04] border border-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder-white/35 focus:outline-none focus:border-gilt-400/50 focus:ring-2 focus:ring-gilt-500/15"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/admin/packages/new" className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-4 py-2 text-sm font-semibold text-ink-900 gilt-glow">
              <Plus size={15} /> Quick Add
            </Link>
            <Link href="/admin/registrations" className="grid place-items-center w-9 h-9 rounded-full glass gilt-border text-white/70 hover:text-white" aria-label="Notifications"><Bell size={16} /></Link>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-full glass gilt-border pl-1.5 pr-2.5 py-1.5 text-sm text-white hover:bg-white/5 transition-colors">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br from-gilt-300 to-gilt-600 text-ink-900 text-xs font-bold">{adminName.charAt(0).toUpperCase()}</span>
                <span className="hidden sm:block max-w-[120px] truncate">{adminName.split(' ')[0]}</span>
                <ChevronDown size={14} className="text-white/40" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-strong gilt-border p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
                  <div className="px-3 py-2 border-b border-white/5">
                    <div className="text-sm font-medium text-white truncate">{adminName}</div>
                    <div className="text-xs text-white/45 truncate">{adminEmail}</div>
                  </div>
                  <Link href="/admin/profile" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-white/75 hover:bg-white/5">Profile</Link>
                  <Link href="/admin/settings" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-white/75 hover:bg-white/5">Settings</Link>
                  <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/75 hover:bg-white/5">View Site <ExternalLink size={12} /></Link>
                  <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full text-left rounded-xl px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10">Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
