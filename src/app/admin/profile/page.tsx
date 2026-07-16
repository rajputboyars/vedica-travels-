import { ShieldCheck } from 'lucide-react'
import ProfileEditor from '@/features/profile/components/ProfileEditor'
import { AdminHeader, Panel } from '@/features/admin/components/ui'

const tips = [
  'Use a password combining letters, numbers, and symbols — at least 8 characters.',
  'This admin identity is shared across the team — avoid sending your password over chat or email.',
  'Env-var-managed accounts (no name/password fields here) change credentials via Settings instead.',
]

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <AdminHeader title="Profile" description="View and manage your account." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ProfileEditor />
        </div>
        <div className="lg:sticky lg:top-24">
          <Panel title={<span className="flex items-center gap-2"><ShieldCheck size={16} className="text-gilt-300" /> Account Security</span>}>
            <ul className="space-y-2.5">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/55 leading-relaxed">
                  <span className="h-1 w-1 rounded-full bg-gilt-400 mt-1.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
