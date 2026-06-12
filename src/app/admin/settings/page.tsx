import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, User, Phone } from 'lucide-react'

export default function AdminSettingsPage() {
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
            <span className="text-sm font-medium">admin@vedica.com</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Password</span>
            <Badge variant="secondary">Set via environment variables</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone size={18} className="text-orange-600" /> Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Primary Phone</span>
            <span className="font-medium">9773834051</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Secondary Phone</span>
            <span className="font-medium">8864910917</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Contact Person</span>
            <span className="font-medium">YOGESH THAKUR</span>
          </div>
          <p className="text-xs text-gray-400 mt-3">To update contact info, modify the Footer and Navbar components in the source code.</p>
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
            <div>ADMIN_EMAIL=admin@vedica.com</div>
            <div>ADMIN_PASSWORD=admin123</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Update these in your .env.local file to change credentials.</p>
        </CardContent>
      </Card>
    </div>
  )
}
