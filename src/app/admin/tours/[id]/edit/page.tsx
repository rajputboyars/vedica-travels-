import { notFound } from 'next/navigation'
import TourForm from '@/features/tours/components/TourForm'
import { getTour } from '@/services/tour.service'

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tour = await getTour(id)
  if (!tour) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Edit Tour</h1>
        <p className="text-gray-500 text-sm">Update tour details</p>
      </div>
      <TourForm initialData={tour} tourId={id} />
    </div>
  )
}
