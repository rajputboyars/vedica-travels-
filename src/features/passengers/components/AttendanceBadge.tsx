import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { Attendance } from '@/types'

const styles: Record<Attendance, string> = {
  present: 'bg-green-100 text-green-700 border-green-200',
  absent: 'bg-red-100 text-red-700 border-red-200',
  not_marked: 'bg-gray-100 text-gray-500 border-gray-200',
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
