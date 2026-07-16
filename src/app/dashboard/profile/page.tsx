import Link from 'next/link'
import { HeartHandshake, ClipboardList } from 'lucide-react'
import ProfileEditor from '@/features/profile/components/ProfileEditor'

const tips = [
  'Keep your name accurate — it\'s used on booking confirmations and receipts.',
  'Use a strong password with letters, numbers, and symbols.',
  'Update your contact number with us directly if it changes, so we can reach you about your trip.',
]

// Phase 9 — "View Profile"/"Edit Profile". Same component the Admin Profile
// page uses.
export default function CustomerProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Profile</h1>
        <p className="mt-1 text-white/55">View and manage your account.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ProfileEditor />
        </div>
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="rounded-3xl glass gilt-border p-6">
            <h2 className="text-base font-medium text-white flex items-center gap-2 mb-5">
              <HeartHandshake size={18} className="text-gilt-300" /> Good to Know
            </h2>
            <ul className="space-y-2.5">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/55 leading-relaxed">
                  <span className="h-1 w-1 rounded-full bg-gilt-400 mt-1.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/dashboard/bookings" className="flex items-center gap-3 rounded-3xl glass gilt-border p-5 hover:bg-white/5 transition-colors">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-gilt-400/15 text-gilt-300 shrink-0"><ClipboardList size={18} /></span>
            <div>
              <div className="text-sm font-medium text-white">My Bookings</div>
              <div className="text-xs text-white/45">View trips & payment status</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
