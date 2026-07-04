'use client'
import Link from 'next/link'
import { Plus, Edit, Trash2, Calendar } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import EmptyState from '@/components/lux/EmptyState'
import { AdminHeader, PrimaryLink, tableWrap, tableCls, theadCls, thCls, tdCls, rowCls, iconBtn, dangerIconBtn, AdminLoading } from '@/features/admin/components/ui'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import type { Tour } from '@/types'

const statusColor: Record<string, string> = {
  upcoming: 'bg-emerald-500/15 text-emerald-300',
  ongoing: 'bg-sky-500/15 text-sky-300',
  completed: 'bg-white/10 text-white/60',
  cancelled: 'bg-rose-500/15 text-rose-300',
}

export default function AdminToursPage() {
  const { data: tours, loading, refetch } = useFetch<Tour[]>('/api/tours', [])
  const confirmDialog = useConfirmDialog<Tour>()

  async function handleDelete() {
    await confirmDialog.confirm(async (tour) => {
      await fetch(`/api/tours/${tour._id}`, { method: 'DELETE' })
      refetch()
    })
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Tours" description={`${tours.length} total tours`}>
        <PrimaryLink href="/admin/tours/new" icon={Plus}>Add Tour</PrimaryLink>
      </AdminHeader>

      {loading ? (
        <AdminLoading />
      ) : tours.length === 0 ? (
        <EmptyState icon={Calendar} title="No tours yet" description="Add your first yatra departure to get started." action={{ label: 'Add Tour', href: '/admin/tours/new' }} />
      ) : (
        <div className={tableWrap}>
          <table className={tableCls}>
            <thead className={theadCls}>
              <tr>
                <th className={thCls}>Tour</th>
                <th className={`${thCls} hidden md:table-cell`}>Date</th>
                <th className={`${thCls} hidden sm:table-cell`}>Price</th>
                <th className={thCls}>Status</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour._id} className={rowCls}>
                  <td className={tdCls}>
                    <div className="font-medium text-white">{tour.title}</div>
                    <div className="text-xs text-white/40">{tour.route}</div>
                  </td>
                  <td className={`${tdCls} text-white/60 hidden md:table-cell`}>{new Date(tour.startDate).toLocaleDateString('en-IN')}</td>
                  <td className={`${tdCls} hidden sm:table-cell font-semibold gilt-text`}>₹{tour.price.toLocaleString()}</td>
                  <td className={tdCls}>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[tour.status]}`}>{tour.status}</span>
                  </td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/admin/tours/${tour._id}/edit`} className={iconBtn} title="Edit"><Edit size={16} /></Link>
                      <button className={dangerIconBtn} onClick={() => confirmDialog.ask(tour)} title="Delete"><Trash2 size={16} /></button>
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
        title="Delete this tour?"
        message={confirmDialog.pending ? `"${confirmDialog.pending.title}" will be permanently removed.` : ''}
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={confirmDialog.cancel}
      />
    </div>
  )
}
