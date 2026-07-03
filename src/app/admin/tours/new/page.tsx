import TourForm from '@/components/admin/TourForm'

export default function NewTourPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Add New Tour</h1>
        <p className="text-gray-500 text-sm">Create a new yatra listing</p>
      </div>
      <TourForm />
    </div>
  )
}
