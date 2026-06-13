'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Phone, CheckCircle2, XCircle, Clock, Download, UserPlus } from 'lucide-react'
import { downloadCSV, bookingsToRows } from '@/lib/export'

const attendanceStyles: Record<string, string> = {
  present: 'bg-green-100 text-green-700 border-green-200',
  absent: 'bg-red-100 text-red-700 border-red-200',
  not_marked: 'bg-gray-100 text-gray-500 border-gray-200',
}

const idTypeLabels: Record<string, string> = {
  aadhar: 'Aadhar', pan: 'PAN', passport: 'Passport',
  driving_license: 'DL', voter_id: 'Voter ID',
}

export default function TourPassengersPage() {
  const { tourId } = useParams() as { tourId: string }
  const router = useRouter()
  const [tour, setTour] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'present' | 'absent' | 'not_marked'>('all')
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [walkIn, setWalkIn] = useState({ name: '', phone: '', age: '', gender: 'male', idType: 'aadhar', idNumber: '', amountPaid: '' })
  const [savingWalkIn, setSavingWalkIn] = useState(false)

  async function load() {
    const [tourRes, bookingsRes] = await Promise.all([
      fetch(`/api/tours/${tourId}`),
      fetch(`/api/tours/${tourId}/bookings`),
    ])
    if (tourRes.ok) setTour(await tourRes.json())
    if (bookingsRes.ok) setBookings(await bookingsRes.json())
    setLoading(false)
  }

  async function markAttendance(bookingId: string, passengerIndex: number, attendance: string) {
    const key = `${bookingId}-${passengerIndex}`
    setUpdating(key)
    await fetch(`/api/bookings/${bookingId}/attendance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passengerIndex, attendance }),
    })
    await load()
    setUpdating(null)
  }

  async function markAllAttendance(attendance: 'present' | 'absent') {
    for (const booking of bookings) {
      for (let i = 0; i < (booking.passengers?.length || 0); i++) {
        await fetch(`/api/bookings/${booking._id}/attendance`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passengerIndex: i, attendance }),
        })
      }
    }
    await load()
  }

  async function addWalkIn() {
    if (!walkIn.name || !walkIn.phone) return
    setSavingWalkIn(true)
    await fetch('/api/bookings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tourId,
        tourTitle: tour?.title || '',
        name: walkIn.name,
        phone: walkIn.phone,
        passengers: [{
          name: walkIn.name, age: Number(walkIn.age) || 0, gender: walkIn.gender,
          idType: walkIn.idType, idNumber: walkIn.idNumber, attendance: 'present',
        }],
        numPersons: 1,
        status: 'confirmed',
        totalAmount: tour?.price || undefined,
        amountPaid: Number(walkIn.amountPaid) || 0,
        paymentStatus: Number(walkIn.amountPaid) > 0 ? 'confirmed' : 'pending',
        isWalkIn: true,
      }),
    })
    setWalkIn({ name: '', phone: '', age: '', gender: 'male', idType: 'aadhar', idNumber: '', amountPaid: '' })
    setShowWalkIn(false)
    setSavingWalkIn(false)
    await load()
  }

  function exportCsv() {
    const safe = (tour?.title || 'trip').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
    downloadCSV(`passengers-${safe}`, bookingsToRows(bookings))
  }

  useEffect(() => { load() }, [tourId])

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>

  const allPassengers = bookings.flatMap((b: any) =>
    (b.passengers || []).map((p: any, idx: number) => ({
      ...p, bookingId: b._id, bookingIdx: idx,
      contactName: b.name, contactPhone: b.phone,
      bookingStatus: b.status, totalAmount: b.totalAmount,
    }))
  )

  const filtered = activeTab === 'all' ? allPassengers : allPassengers.filter(p => p.attendance === activeTab)

  const stats = {
    total: allPassengers.length,
    present: allPassengers.filter(p => p.attendance === 'present').length,
    absent: allPassengers.filter(p => p.attendance === 'absent').length,
    not_marked: allPassengers.filter(p => p.attendance === 'not_marked').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{tour?.title || 'Tour Passengers'}</h1>
          <p className="text-gray-500 text-sm">{tour ? new Date(tour.startDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}><Download size={14} className="mr-1" /> Export</Button>
          <Button size="sm" onClick={() => setShowWalkIn(v => !v)}><UserPlus size={14} className="mr-1" /> Add Walk-in</Button>
        </div>
      </div>

      {/* Walk-in form */}
      {showWalkIn && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-orange-100">
          <h3 className="font-semibold text-gray-800 mb-3">Add Walk-in Passenger</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Full name *" value={walkIn.name} onChange={e => setWalkIn({ ...walkIn, name: e.target.value })} />
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Phone *" value={walkIn.phone} onChange={e => setWalkIn({ ...walkIn, phone: e.target.value })} />
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" type="number" placeholder="Age" value={walkIn.age} onChange={e => setWalkIn({ ...walkIn, age: e.target.value })} />
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={walkIn.gender} onChange={e => setWalkIn({ ...walkIn, gender: e.target.value })}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={walkIn.idType} onChange={e => setWalkIn({ ...walkIn, idType: e.target.value })}>
              <option value="aadhar">Aadhar</option><option value="pan">PAN</option><option value="passport">Passport</option><option value="driving_license">DL</option><option value="voter_id">Voter ID</option>
            </select>
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="ID number" value={walkIn.idNumber} onChange={e => setWalkIn({ ...walkIn, idNumber: e.target.value })} />
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" type="number" placeholder="Amount paid (cash)" value={walkIn.amountPaid} onChange={e => setWalkIn({ ...walkIn, amountPaid: e.target.value })} />
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={addWalkIn} disabled={savingWalkIn || !walkIn.name || !walkIn.phone}>{savingWalkIn ? 'Adding...' : 'Add Passenger'}</Button>
            <Button size="sm" variant="outline" onClick={() => setShowWalkIn(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Present', value: stats.present, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Absent', value: stats.absent, color: 'bg-red-50 border-red-200 text-red-700' },
          { label: 'Not Marked', value: stats.not_marked, color: 'bg-gray-50 border-gray-200 text-gray-600' },
        ].map((s, i) => (
          <div key={i} className={`border rounded-xl p-4 text-center ${s.color}`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {allPassengers.length > 0 && (
        <div className="flex flex-wrap gap-2 bg-white rounded-xl shadow-sm p-4">
          <span className="text-sm text-gray-500 font-medium self-center">Quick Mark:</span>
          <Button size="sm" onClick={() => markAllAttendance('present')} className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 size={14} className="mr-1" /> All Present
          </Button>
          <Button size="sm" variant="destructive" onClick={() => markAllAttendance('absent')}>
            <XCircle size={14} className="mr-1" /> All Absent
          </Button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white rounded-xl shadow-sm p-1 w-fit">
        {(['all', 'present', 'absent', 'not_marked'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-orange-600 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab === 'all' ? `All (${stats.total})` :
             tab === 'present' ? `Present (${stats.present})` :
             tab === 'absent' ? `Absent (${stats.absent})` :
             `Not Marked (${stats.not_marked})`}
          </button>
        ))}
      </div>

      {/* Passenger List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">
          No passengers in this category
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">#</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Passenger</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium hidden sm:table-cell">ID Proof</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium hidden md:table-cell">Contact</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Attendance</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p, i) => (
                <tr key={`${p.bookingId}-${p.bookingIdx}`} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        p.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {p.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.age} yrs • {p.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="text-xs text-gray-500">{idTypeLabels[p.idType] || p.idType}</div>
                    <div className="text-xs font-mono text-gray-700">{p.idNumber}</div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="text-xs text-gray-600">{p.contactName}</div>
                    <a href={`tel:${p.contactPhone}`} className="text-xs text-orange-600 flex items-center gap-1">
                      <Phone size={10} /> {p.contactPhone}
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${attendanceStyles[p.attendance || 'not_marked']}`}>
                      {p.attendance === 'present' ? <CheckCircle2 size={11} /> :
                       p.attendance === 'absent' ? <XCircle size={11} /> :
                       <Clock size={11} />}
                      {p.attendance === 'not_marked' ? 'Not Marked' : p.attendance}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {updating === `${p.bookingId}-${p.bookingIdx}` ? (
                        <span className="text-xs text-gray-400">...</span>
                      ) : (
                        <>
                          <button
                            onClick={() => markAttendance(p.bookingId, p.bookingIdx, 'present')}
                            disabled={p.attendance === 'present'}
                            className={`p-1.5 rounded-lg transition-colors ${p.attendance === 'present' ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-green-50 hover:text-green-600'}`}
                            title="Mark Present"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            onClick={() => markAttendance(p.bookingId, p.bookingIdx, 'absent')}
                            disabled={p.attendance === 'absent'}
                            className={`p-1.5 rounded-lg transition-colors ${p.attendance === 'absent' ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:bg-red-50 hover:text-red-600'}`}
                            title="Mark Absent"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bookings breakdown */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Booking Details</h3>
          <div className="space-y-3">
            {bookings.map((b: any, i: number) => (
              <div key={b._id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-800">{b.name}</span>
                    <a href={`tel:${b.phone}`} className="ml-3 text-xs text-orange-600 hover:underline">{b.phone}</a>
                    {b.email && <span className="ml-2 text-xs text-gray-400">{b.email}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {b.totalAmount && <span className="text-sm font-semibold text-orange-600">₹{b.totalAmount.toLocaleString()}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{b.status}</span>
                  </div>
                </div>
                {b.address && <p className="text-xs text-gray-400 mb-2">📍 {b.address}</p>}
                {b.emergencyContact && <p className="text-xs text-gray-400 mb-2">🆘 {b.emergencyContact} — {b.emergencyPhone}</p>}
                {b.message && <p className="text-xs text-gray-500 italic mb-2">"{b.message}"</p>}
                <div className="flex gap-2 flex-wrap">
                  {(b.passengers || []).map((p: any, pi: number) => (
                    <span key={pi} className={`text-xs px-2 py-1 rounded-full border ${attendanceStyles[p.attendance || 'not_marked']}`}>
                      {p.name} ({p.age}
                      {p.gender === 'female' ? '♀' : '♂'})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
