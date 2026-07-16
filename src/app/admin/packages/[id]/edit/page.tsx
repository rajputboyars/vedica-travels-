import { notFound } from 'next/navigation'
import PackageForm from '@/features/packages/components/PackageForm'
import { AdminHeader } from '@/features/admin/components/ui'
import { getPackage } from '@/services/package.service'

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pkg = await getPackage(id)
  if (!pkg) notFound()

  return (
    <div className="space-y-6">
      <AdminHeader title="Edit Package" description="Update package details." />
      <PackageForm initialData={pkg} packageId={id} />
    </div>
  )
}
