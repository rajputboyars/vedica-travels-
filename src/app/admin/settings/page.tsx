import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lock, User, Phone, Settings2 } from 'lucide-react'
import { getSiteSettings } from '@/services/cms.service'

// Phase 10 CMS -- Contact Information now reads from SiteSettings
// (editable at /admin/cms/site-settings) instead of the frozen
// config/site.ts constants, so this card stays in sync with what the
// Navbar/Footer/Contact page actually display.
export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and site settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User size={18} className="text-orange-600" /> Admin Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium">{settings.contact.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Password</span>
            <Badge variant="secondary">Set via environment variables</Badge>
          </div>
          <p className="text-xs text-gray-400 pt-2">
            Single-admin credentials today. A database-backed, multi-admin, role-based login is a
            natural next step once more than one person needs access — see the auth notes in
            src/lib/auth.ts before building that out.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone size={18} className="text-orange-600" /> Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {settings.contact.phones.map((phone, i) => (
            <div key={phone} className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">{i === 0 ? 'Primary Phone' : 'Secondary Phone'}</span>
              <span className="font-medium">{phone}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Contact Person</span>
            <span className="font-medium">{settings.founder}</span>
          </div>
          <Link href="/admin/cms/site-settings">
            <Button variant="outline" size="sm" className="mt-2">
              <Settings2 size={14} className="mr-2" /> Edit Contact & Site Settings
            </Button>
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            This is now managed from the Website CMS, not src/config/site.ts — it drives the Navbar, Footer, and every contact link site-wide.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock size={18} className="text-orange-600" /> Environment Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs font-mono space-y-1">
            <div>MONGODB_URI=mongodb://...</div>
            <div>NEXTAUTH_SECRET=your-secret</div>
            <div>ADMIN_EMAIL={settings.contact.email}</div>
            <div>ADMIN_PASSWORD=your-password</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Update these in your .env.local file (see .env.example) to change credentials.</p>
        </CardContent>
      </Card>
    </div>
  )
}
