'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Gallery</h1>
        <p className="text-gray-500 text-sm">{images.length} images</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Add Image</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="Image URL (https://...)"
            value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
          />
          <input
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="Caption (optional)"
            value={newCaption} onChange={(e) => setNewCaption(e.target.value)}
          />
          <Button onClick={addImage} disabled={adding || !newUrl}>
            <Plus size={14} className="mr-1" /> Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <ImageIcon size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No images yet. Add gallery photos above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img._id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
              <div className="aspect-square bg-gray-100 relative">
                <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover" />
                <button
                  onClick={() => confirmDialog.ask(img)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {img.caption && <div className="px-3 py-2 text-xs text-gray-600 truncate">{img.caption}</div>}
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
