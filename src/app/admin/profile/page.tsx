import ProfileEditor from '@/features/profile/components/ProfileEditor'

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <p className="text-gray-500 text-sm">View and manage your account</p>
      </div>
      <ProfileEditor />
    </div>
  )
}
