import PackageForm from '@/features/packages/components/PackageForm'
import { AdminHeader } from '@/features/admin/components/ui'

export default function NewPackagePage() {
  return (
    <div className="space-y-6">
      <AdminHeader title="Add New Package" description="Create a new tour package." />
      <div className="rounded-3xl bg-white text-gray-900 p-6 sm:p-8 ring-1 ring-gilt-500/20">
        <PackageForm />
      </div>
    </div>
  )
}
