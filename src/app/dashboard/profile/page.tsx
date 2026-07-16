import ProfileEditor from '@/features/profile/components/ProfileEditor'

// Phase 9 — "View Profile"/"Edit Profile". Same component the Admin Profile
// page uses.
export default function CustomerProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Profile</h1>
        <p className="mt-1 text-white/55">View and manage your account.</p>
      </div>
      <ProfileEditor />
    </div>
  )
}
