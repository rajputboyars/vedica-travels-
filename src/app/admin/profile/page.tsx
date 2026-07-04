import ProfileEditor from '@/features/profile/components/ProfileEditor'
import { AdminHeader } from '@/features/admin/components/ui'

export default function AdminProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <AdminHeader title="Profile" description="View and manage your account." />
      {/* Light island keeps the shared (light-themed) editor legible on the dark panel */}
      <div className="rounded-3xl bg-white text-gray-900 p-6 sm:p-8 ring-1 ring-gilt-500/20">
        <ProfileEditor />
      </div>
    </div>
  )
}
