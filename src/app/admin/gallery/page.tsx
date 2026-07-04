'use client'
import { useState } from 'react'
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import EmptyState from '@/components/lux/EmptyState'
import { AdminHeader, Panel, adminControl, primaryBtn, AdminLoading } from '@/features/admin/components/ui'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import type { GalleryImage } from '@/types'

export default function AdminGalleryPage() {
  const { data: images, loading, refetch } = useFetch<GalleryImage[]>('/api/gallery', [])
  const [newUrl, setNewUrl] = useState('')
  const [newCaption, setNewCaption] = useState('')
  const [adding, setAdding] = useState(false)
  const confirmDialog = useConfirmDialog<GalleryImage>()

  async function addImage() {
    if (!newUrl.trim()) return
    setAdding(true)
    await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newUrl, caption: newCaption }),
    })
    setNewUrl('')
    setNewCaption('')
    setAdding(false)
    refetch()
  }

  async function handleDelete() {
    await confirmDialog.confirm(async (img) => {
      await fetch(`/api/gallery/${img._id}`, { method: 'DELETE' })
      refetch()
    })
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Gallery" description={`${images.length} images`} />

      <Panel title="Add Image">
        <div className="flex flex-col sm:flex-row gap-3">
          <input className={`${adminControl} flex-1`} placeholder="Image URL (https://...)" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
          <input className={`${adminControl} flex-1`} placeholder="Caption (optional)" value={newCaption} onChange={(e) => setNewCaption(e.target.value)} />
          <button onClick={addImage} disabled={adding || !newUrl} className={primaryBtn}><Plus size={15} /> Add</button>
        </div>
      </Panel>

      {loading ? (
        <AdminLoading />
      ) : images.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No images yet" description="Add gallery photos using the form above." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img._id} className="group overflow-hidden rounded-2xl glass gilt-border">
              <div className="aspect-square bg-ink-800 relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-supplied gallery URL, same pattern as TourImage/PackageCard */}
                <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover" />
                <button
                  onClick={() => confirmDialog.ask(img)}
                  className="absolute top-2 right-2 grid place-items-center w-8 h-8 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              {img.caption && <div className="px-3 py-2 text-xs text-white/60 truncate">{img.caption}</div>}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.isOpen}
        title="Delete this image?"
        message="This image will be removed from the gallery."
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={confirmDialog.cancel}
      />
    </div>
  )
}
