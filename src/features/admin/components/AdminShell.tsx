'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { SessionProvider, useSession, signOut } from 'next-auth/react'
import { LogOut, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
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
  const { status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isLogin = pathname === '/admin/login'

  // Client-side guard: redirect to login when not authenticated.
  //
  // This is deliberately NOT done via Next.js middleware. An earlier
  // version gated /admin routes with edge middleware checking the
  // NextAuth JWT, and it was flaky in production on Vercel (edge runtime +
  // NEXTAUTH_SECRET propagation issues caused false "unauthenticated"
  // redirects). Client-side redirect trades a brief loading flash for
  // reliability — worth it until there's a concrete reason to revisit.
  useEffect(() => {
    if (!isLogin && status === 'unauthenticated') {
      router.replace('/admin/login')
    }
  }, [isLogin, status, router])

  if (isLogin) return <>{children}</>

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="admin-shell flex h-screen bg-gray-100">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 md:relative md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{siteConfig.emoji}</span>
            <div>
              <div className="font-bold text-sm">{siteConfig.shortName}</div>
              <div className="text-xs text-gray-400">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {adminNavItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors',
                  isActive ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon size={18} />{item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg text-sm transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={22} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
          <div className="ml-auto text-sm text-gray-500">{siteConfig.name}</div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
