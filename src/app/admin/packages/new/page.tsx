import PackageForm from '@/features/packages/components/PackageForm'

export default function NewPackagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Add New Package</h1>
        <p className="text-gray-500 text-sm">Create a new tour package</p>
      </div>
      <PackageForm />
    </div>
  )
}
