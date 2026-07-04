'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Archive, ArchiveRestore, Package as PackageIcon } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import type { Package, PackageStatus } from '@/types'
import { packageCategoryMeta, packageCategoryOrder, packageStatusMeta } from '@/config/package-theme'

type StatusFilter = 'all' | PackageStatus
type ArchiveFilter = 'active' | 'archived' | 'all'

// includeArchived=true so this admin view can see everything and filter
// client-side — avoids a refetch every time the admin flips a tab.
export default function AdminPackagesPage() {
  const { data: packages, loading, refetch } = useFetch<Package[]>('/api/packages?includeArchived=true', [])
  const confirmDialog = useConfirmDialog<Package>()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('active')
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
      if (archiveFilter === 'active' && p.isArchived) return false
      if (archiveFilter === 'archived' && !p.isArchived) return false
      return true
    })
  }, [packages, statusFilter, categoryFilter, archiveFilter])

  async function handleDelete() {
    await confirmDialog.confirm(async (pkg) => {
      await fetch(`/api/packages/${pkg._id}`, { method: 'DELETE' })
      refetch()
    })
  }

  async function toggleArchive(pkg: Package) {
    setBusyId(pkg._id)
    await fetch(`/api/packages/${pkg._id}/archive`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived: !pkg.isArchived }),
    })
    await refetch()
    setBusyId(null)
  }

  async function changeStatus(pkg: Package, status: PackageStatus) {
    setBusyId(pkg._id)
    await fetch(`/api/packages/${pkg._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await refetch()
    setBusyId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Packages</h1>
          <p className="text-gray-500 text-sm">{filtered.length} of {packages.length} packages</p>
        </div>
        <Link href="/admin/packages/new">
          <Button><Plus size={16} className="mr-1" /> Add Package</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </select>
        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {packageCategoryOrder.map((c) => (
            <option key={c} value={c}>{packageCategoryMeta[c].emoji} {packageCategoryMeta[c].label}</option>
          ))}
        </select>
        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={archiveFilter} onChange={(e) => setArchiveFilter(e.target.value as ArchiveFilter)}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <PackageIcon size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No packages match these filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Package</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium hidden sm:table-cell">Price</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((pkg) => (
                <tr key={pkg._id} className={`hover:bg-gray-50 ${pkg.isArchived ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-800">{pkg.title}</div>
                    <div className="text-xs text-gray-400">{pkg.duration.days}D / {pkg.duration.nights}N · {pkg.slug}</div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${packageCategoryMeta[pkg.category].badgeClass}`}>
                      {packageCategoryMeta[pkg.category].emoji} {packageCategoryMeta[pkg.category].label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-orange-600 font-semibold hidden sm:table-cell">
                    ₹{pkg.price.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${packageStatusMeta[pkg.status].badgeClass}`}
                      value={pkg.status}
                      disabled={busyId === pkg._id}
                      onChange={(e) => changeStatus(pkg, e.target.value as PackageStatus)}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="hidden">Hidden</option>
                    </select>
                    {pkg.isArchived && <span className="ml-2 text-xs text-gray-400">Archived</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Button size="sm" variant="ghost" disabled={busyId === pkg._id} onClick={() => toggleArchive(pkg)} title={pkg.isArchived ? 'Unarchive' : 'Archive'}>
                        {pkg.isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                      </Button>
                      <Link href={`/admin/packages/${pkg._id}/edit`}>
                        <Button size="sm" variant="ghost"><Edit size={15} /></Button>
                      </Link>
                      <Button size="sm" variant="destructive" onClick={() => confirmDialog.ask(pkg)}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.isOpen}
        title="Delete this package?"
        message={confirmDialog.pending ? `"${confirmDialog.pending.title}" will be permanently removed.` : ''}
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={confirmDialog.cancel}
      />
    </div>
  )
}
