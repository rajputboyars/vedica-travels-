import ProfileEditor from '@/features/profile/components/ProfileEditor'
import { AdminHeader } from '@/features/admin/components/ui'

export default function AdminProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <AdminHeader title="Profile" description="View and manage your account." />
      <ProfileEditor />
    </div>
  )
}
