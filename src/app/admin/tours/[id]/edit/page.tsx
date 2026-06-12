import TourForm from '@/components/admin/TourForm'
import connectDB from '@/lib/mongodb'
import Tour from '@/models/Tour'

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const tour = await Tour.findById(id).lean()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Edit Tour</h1>
        <p className="text-gray-500 text-sm">Update tour details</p>
      </div>
      <TourForm initialData={JSON.parse(JSON.stringify(tour))} tourId={id} />
    </div>
  )
}
