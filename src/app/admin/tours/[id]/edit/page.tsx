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
      <div className="rounded-3xl bg-white text-gray-900 p-6 sm:p-8 ring-1 ring-gilt-500/20">
        <TourForm initialData={tour} tourId={id} />
      </div>
    </div>
  )
}
