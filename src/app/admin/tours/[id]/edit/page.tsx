import { notFound } from 'next/navigation'
import TourForm from '@/features/tours/components/TourForm'
import { AdminHeader } from '@/features/admin/components/ui'
import { getTour } from '@/services/tour.service'

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tour = await getTour(id)
  if (!tour) notFound()

  return (
    <div className="space-y-6">
      <AdminHeader title="Edit Tour" description="Update tour details." />
      <TourForm initialData={tour} tourId={id} />
    </div>
  )
}
