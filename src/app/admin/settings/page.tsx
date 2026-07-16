import Link from 'next/link'
import { Lock, User, Phone, Settings2, Layers, Building2, Image as ImageIcon, UserCircle, ChevronRight } from 'lucide-react'
import { AdminHeader, Panel, ghostBtn } from '@/features/admin/components/ui'
import { getSiteSettings } from '@/services/cms.service'

const quickLinks = [
  { href: '/admin/cms', label: 'Website CMS', icon: Layers },
  { href: '/admin/vendors', label: 'Vendors', icon: Building2 },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/admin/profile', label: 'Profile', icon: UserCircle },
]

// Phase 10 CMS -- Contact Information reads from SiteSettings (editable at
// /admin/cms/site-settings), so this card stays in sync with what the
// Navbar/Footer/Contact page display.
export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div className="space-y-6">
      <AdminHeader title="Settings" description="Manage your account and site settings." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Panel title={<span className="flex items-center gap-2"><User size={18} className="text-gilt-300" /> Admin Account</span>}>
          <div className="space-y-1">
            <div className="flex items-center justify-between py-2.5 border-b border-white/5">
              <span className="text-sm text-white/55">Email</span>
              <span className="text-sm font-medium text-white">{settings.contact.email}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-white/55">Password</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/70">Set via environment variables</span>
            </div>
            <p className="text-xs text-white/40 pt-2 leading-relaxed">
              Single-admin credentials today. A database-backed, multi-admin, role-based login is a natural next step once
              more than one person needs access — see the auth notes in src/lib/auth.ts before building that out.
            </p>
          </div>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><Phone size={18} className="text-gilt-300" /> Contact Information</span>}>
          <div className="space-y-1 text-sm">
            {settings.contact.phones.map((phone, i) => (
              <div key={phone} className="flex items-center justify-between py-2.5 border-b border-white/5">
                <span className="text-white/55">{i === 0 ? 'Primary Phone' : 'Secondary Phone'}</span>
                <span className="font-medium text-white">{phone}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-white/55">Contact Person</span>
              <span className="font-medium text-white">{settings.founder}</span>
            </div>
            <Link href="/admin/cms/site-settings" className={`${ghostBtn} mt-3`}>
              <Settings2 size={14} /> Edit Contact & Site Settings
            </Link>
            <p className="text-xs text-white/40 mt-3 leading-relaxed">
              Managed from the Website CMS, not src/config/site.ts — it drives the Navbar, Footer, and every contact link site-wide.
            </p>
          </div>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><Lock size={18} className="text-gilt-300" /> Environment Variables</span>}>
          <div className="bg-ink-950/60 border border-white/5 text-emerald-300 rounded-2xl p-4 text-xs font-mono space-y-1">
            <div>MONGODB_URI=mongodb://...</div>
            <div>NEXTAUTH_SECRET=your-secret</div>
            <div>ADMIN_EMAIL={settings.contact.email}</div>
            <div>ADMIN_PASSWORD=your-password</div>
          </div>
          <p className="text-xs text-white/40 mt-2">Update these in your .env.local file (see .env.example) to change credentials.</p>
        </Panel>

        <Panel title="Quick Links">
          <div className="space-y-1">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/5 hover:text-white transition-colors">
                <span className="grid place-items-center w-9 h-9 rounded-lg bg-white/[0.05] text-gilt-300 shrink-0"><link.icon size={16} /></span>
                <span className="flex-1">{link.label}</span>
                <ChevronRight size={15} className="text-white/25" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
