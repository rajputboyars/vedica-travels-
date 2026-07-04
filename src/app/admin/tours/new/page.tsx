import TourForm from '@/features/tours/components/TourForm'
import { AdminHeader } from '@/features/admin/components/ui'

export default function NewTourPage() {
  return (
    <div className="space-y-6">
      <AdminHeader title="Add New Tour" description="Create a new yatra listing." />
      <div className="rounded-3xl bg-white text-gray-900 p-6 sm:p-8 ring-1 ring-gilt-500/20">
        <TourForm />
      </div>
    </div>
  )
}
