import ProfileEditor from '@/features/profile/components/ProfileEditor'

// Phase 9 — "View Profile"/"Edit Profile". Same component the Admin
// Profile page (Phase 8) uses — see ProfileEditor.tsx's doc comment on
// why this is shared rather than duplicated.
export default function CustomerProfilePage() {
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
