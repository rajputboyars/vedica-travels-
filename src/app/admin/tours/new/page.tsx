import TourForm from '@/features/tours/components/TourForm'
import { AdminHeader } from '@/features/admin/components/ui'

export default function NewTourPage() {
  return (
    <div className="space-y-6">
      <AdminHeader title="Add New Tour" description="Create a new yatra listing." />
      <TourForm />
    </div>
  )
}
