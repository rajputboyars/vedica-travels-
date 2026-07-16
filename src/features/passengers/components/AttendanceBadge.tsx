import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { Attendance } from '@/types'

const styles: Record<Attendance, string> = {
  present: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  absent: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  not_marked: 'bg-white/10 text-white/50 border-white/10',
}

export default function AttendanceBadge({ attendance }: { attendance?: Attendance }) {
  const value = attendance || 'not_marked'
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${styles[value]}`}>
      {value === 'present' ? <CheckCircle2 size={11} /> : value === 'absent' ? <XCircle size={11} /> : <Clock size={11} />}
      {value === 'not_marked' ? 'Not Marked' : value}
    </span>
  )
}
