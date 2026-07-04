'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Archive, ArchiveRestore, Package as PackageIcon } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import EmptyState from '@/components/lux/EmptyState'
import { AdminHeader, PrimaryLink, adminControl, tableWrap, tableCls, theadCls, thCls, tdCls, rowCls, iconBtn, dangerIconBtn, AdminLoading } from '@/features/admin/components/ui'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import type { Package, PackageStatus } from '@/types'
import { packageCategoryMeta, packageCategoryOrder, packageStatusMeta } from '@/config/package-theme'

type StatusFilter = 'all' | PackageStatus
type ArchiveFilter = 'active' | 'archived' | 'all'

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
      <AdminHeader title="Packages" description={`${filtered.length} of ${packages.length} packages`}>
        <PrimaryLink href="/admin/packages/new" icon={Plus}>Add Package</PrimaryLink>
      </AdminHeader>

      <div className="flex flex-wrap gap-3">
        <select className={adminControl} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </select>
        <select className={adminControl} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {packageCategoryOrder.map((c) => (
            <option key={c} value={c}>{packageCategoryMeta[c].emoji} {packageCategoryMeta[c].label}</option>
          ))}
        </select>
        <select className={adminControl} value={archiveFilter} onChange={(e) => setArchiveFilter(e.target.value as ArchiveFilter)}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </select>
      </div>

      {loading ? (
        <AdminLoading />
      ) : filtered.length === 0 ? (
        <EmptyState icon={PackageIcon} title="No packages match these filters" description="Try adjusting the filters, or add a new package." action={{ label: 'Add Package', href: '/admin/packages/new' }} />
      ) : (
        <div className={tableWrap}>
          <table className={tableCls}>
            <thead className={theadCls}>
              <tr>
                <th className={thCls}>Package</th>
                <th className={`${thCls} hidden md:table-cell`}>Category</th>
                <th className={`${thCls} hidden sm:table-cell`}>Price</th>
                <th className={thCls}>Status</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pkg) => (
                <tr key={pkg._id} className={`${rowCls} ${pkg.isArchived ? 'opacity-50' : ''}`}>
                  <td className={tdCls}>
                    <div className="font-medium text-white">{pkg.title}</div>
                    <div className="text-xs text-white/40">{pkg.duration.days}D / {pkg.duration.nights}N · {pkg.slug}</div>
                  </td>
                  <td className={`${tdCls} hidden md:table-cell`}>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${packageCategoryMeta[pkg.category].badgeClass}`}>
                      {packageCategoryMeta[pkg.category].emoji} {packageCategoryMeta[pkg.category].label}
                    </span>
                  </td>
                  <td className={`${tdCls} hidden sm:table-cell font-semibold gilt-text`}>₹{pkg.price.toLocaleString()}</td>
                  <td className={tdCls}>
                    <select
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 ${packageStatusMeta[pkg.status].badgeClass}`}
                      value={pkg.status}
                      disabled={busyId === pkg._id}
                      onChange={(e) => changeStatus(pkg, e.target.value as PackageStatus)}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="hidden">Hidden</option>
                    </select>
                    {pkg.isArchived && <span className="ml-2 text-xs text-white/40">Archived</span>}
                  </td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-1 justify-end">
                      <button className={iconBtn} disabled={busyId === pkg._id} onClick={() => toggleArchive(pkg)} title={pkg.isArchived ? 'Unarchive' : 'Archive'}>
                        {pkg.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                      </button>
                      <Link href={`/admin/packages/${pkg._id}/edit`} className={iconBtn} title="Edit"><Edit size={16} /></Link>
                      <button className={dangerIconBtn} onClick={() => confirmDialog.ask(pkg)} title="Delete"><Trash2 size={16} /></button>
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
