'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Calendar } from 'lucide-react'

export default function AdminToursPage() {
  const [tours, setTours] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchTours() {
    const res = await fetch('/api/tours')
    const data = await res.json()
    setTours(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function deleteTour(id: string) {
    if (!confirm('Delete this tour?')) return
    await fetch(`/api/tours/${id}`, { method: 'DELETE' })
    fetchTours()
  }

  useEffect(() => { fetchTours() }, [])

  const statusColor: Record<string, string> = {
    upcoming: 'bg-green-100 text-green-700',
    ongoing: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tours</h1>
          <p className="text-gray-500 text-sm">{tours.length} total tours</p>
        </div>
        <Link href="/admin/tours/new">
          <Button><Plus size={16} className="mr-1" /> Add Tour</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : tours.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No tours yet. Add your first yatra!</p>
          <Link href="/admin/tours/new" className="mt-4 inline-block">
            <Button size="sm"><Plus size={14} className="mr-1" /> Add Tour</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Tour</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium hidden md:table-cell">Date</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium hidden sm:table-cell">Price</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tours.map((tour) => (
                <tr key={tour._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-800">{tour.title}</div>
                    <div className="text-xs text-gray-400">{tour.route}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 hidden md:table-cell">
                    {new Date(tour.startDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-4 text-orange-600 font-semibold hidden sm:table-cell">
                    ₹{tour.price.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[tour.status]}`}>
                      {tour.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/tours/${tour._id}/edit`}>
                        <Button size="sm" variant="ghost"><Edit size={15} /></Button>
                      </Link>
                      <Button size="sm" variant="destructive" onClick={() => deleteTour(tour._id)}>
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
    </div>
  )
}
