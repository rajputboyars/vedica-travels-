import ProfileEditor from '@/features/profile/components/ProfileEditor'

// Phase 9 — "View Profile"/"Edit Profile". Same component the Admin Profile
// page uses. Wrapped in a light island card so the shared (light-themed)
// editor stays legible on the dark dashboard canvas.
export default function CustomerProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Profile</h1>
        <p className="mt-1 text-white/55">View and manage your account.</p>
      </div>
      <div className="rounded-3xl bg-white text-gray-900 p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-gilt-500/20">
        <ProfileEditor />
      </div>
    </div>
  )
}
