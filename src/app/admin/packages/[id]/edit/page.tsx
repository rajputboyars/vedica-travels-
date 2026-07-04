import { notFound } from 'next/navigation'
import PackageForm from '@/features/packages/components/PackageForm'
import { getPackage } from '@/services/package.service'

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pkg = await getPackage(id)
  if (!pkg) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Edit Package</h1>
        <p className="text-gray-500 text-sm">Update package details</p>
      </div>
      <PackageForm initialData={pkg} packageId={id} />
    </div>
  )
}
