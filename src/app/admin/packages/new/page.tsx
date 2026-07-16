import PackageForm from '@/features/packages/components/PackageForm'
import { AdminHeader } from '@/features/admin/components/ui'

export default function NewPackagePage() {
  return (
    <div className="space-y-6">
      <AdminHeader title="Add New Package" description="Create a new tour package." />
      <PackageForm />
    </div>
  )
}
