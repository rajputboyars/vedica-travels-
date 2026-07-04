'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, CheckCircle2, XCircle, Download, UserPlus } from 'lucide-react'
import { ghostBtn, primaryBtn, adminControl, Panel, tableWrap, tableCls, theadCls, thCls, tdCls, rowCls, AdminLoading } from '@/features/admin/components/ui'
import { downloadCSV, bookingsToRows } from '@/lib/export'
import { idTypeLabels, type Tour, type Booking, type Attendance } from '@/types'
import AttendanceBadge from '@/features/passengers/components/AttendanceBadge'

export default function TourPassengersPage() {
  const { tourId } = useParams() as { tourId: string }
  const router = useRouter()
  const [tour, setTour] = useState<Tour | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | Attendance>('all')
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [walkIn, setWalkIn] = useState({ name: '', phone: '', age: '', gender: 'male', idType: 'aadhar', idNumber: '', amountPaid: '' })
  const [savingWalkIn, setSavingWalkIn] = useState(false)

  async function load() {
    const [tourRes, bookingsRes] = await Promise.all([fetch(`/api/tours/${tourId}`), fetch(`/api/tours/${tourId}/bookings`)])
    if (tourRes.ok) setTour(await tourRes.json())
    if (bookingsRes.ok) setBookings(await bookingsRes.json())
    setLoading(false)
  }

  async function markAttendance(bookingId: string, passengerIndex: number, attendance: Attendance) {
    const key = `${bookingId}-${passengerIndex}`
    setUpdating(key)
    await fetch(`/api/bookings/${bookingId}/attendance`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passengerIndex, attendance }) })
    await load()
    setUpdating(null)
  }

  async function markAllAttendance(attendance: 'present' | 'absent') {
    for (const booking of bookings) {
      for (let i = 0; i < (booking.passengers?.length || 0); i++) {
        await fetch(`/api/bookings/${booking._id}/attendance`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passengerIndex: i, attendance }) })
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
        tourId, tourTitle: tour?.title || '', name: walkIn.name, phone: walkIn.phone,
        passengers: [{ name: walkIn.name, age: Number(walkIn.age) || 0, gender: walkIn.gender, idType: walkIn.idType, idNumber: walkIn.idNumber, attendance: 'present' }],
        numPersons: 1, status: 'confirmed', totalAmount: tour?.price || undefined,
        amountPaid: Number(walkIn.amountPaid) || 0, paymentStatus: Number(walkIn.amountPaid) > 0 ? 'confirmed' : 'pending', isWalkIn: true,
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

  useEffect(() => { load() }, [tourId]) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  if (loading) return <AdminLoading />

  const allPassengers = bookings.flatMap((b) =>
    (b.passengers || []).map((p, idx) => ({ ...p, bookingId: b._id, bookingIdx: idx, contactName: b.name, contactPhone: b.phone })),
  )
  const filtered = activeTab === 'all' ? allPassengers : allPassengers.filter((p) => p.attendance === activeTab)
  const stats = {
    total: allPassengers.length,
    present: allPassengers.filter((p) => p.attendance === 'present').length,
    absent: allPassengers.filter((p) => p.attendance === 'absent').length,
    not_marked: allPassengers.filter((p) => p.attendance === 'not_marked').length,
  }
  const statTone: Record<string, string> = { Total: 'text-sky-300', Present: 'text-emerald-300', Absent: 'text-rose-300', 'Not Marked': 'text-white/60' }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="grid place-items-center w-9 h-9 rounded-lg text-white/60 hover:bg-white/5 hover:text-white"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{tour?.title || 'Tour Passengers'}</h1>
          <p className="text-white/50 text-sm">{tour ? new Date(tour.startDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
        </div>
        <div className="flex gap-2">
          <button className={ghostBtn} onClick={exportCsv}><Download size={14} /> Export</button>
          <button className={primaryBtn} onClick={() => setShowWalkIn((v) => !v)}><UserPlus size={14} /> Add Walk-in</button>
        </div>
      </div>

      {showWalkIn && (
        <Panel title="Add Walk-in Passenger">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <input className={adminControl} placeholder="Full name *" value={walkIn.name} onChange={(e) => setWalkIn({ ...walkIn, name: e.target.value })} />
            <input className={adminControl} placeholder="Phone *" value={walkIn.phone} onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })} />
            <input className={adminControl} type="number" placeholder="Age" value={walkIn.age} onChange={(e) => setWalkIn({ ...walkIn, age: e.target.value })} />
            <select className={adminControl} value={walkIn.gender} onChange={(e) => setWalkIn({ ...walkIn, gender: e.target.value })}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
            <select className={adminControl} value={walkIn.idType} onChange={(e) => setWalkIn({ ...walkIn, idType: e.target.value })}>
              <option value="aadhar">Aadhar</option><option value="pan">PAN</option><option value="passport">Passport</option><option value="driving_license">DL</option><option value="voter_id">Voter ID</option>
            </select>
            <input className={adminControl} placeholder="ID number" value={walkIn.idNumber} onChange={(e) => setWalkIn({ ...walkIn, idNumber: e.target.value })} />
            <input className={adminControl} type="number" placeholder="Amount paid (cash)" value={walkIn.amountPaid} onChange={(e) => setWalkIn({ ...walkIn, amountPaid: e.target.value })} />
          </div>
          <div className="flex gap-2 mt-3">
            <button className={primaryBtn} onClick={addWalkIn} disabled={savingWalkIn || !walkIn.name || !walkIn.phone}>{savingWalkIn ? 'Adding…' : 'Add Passenger'}</button>
            <button className={ghostBtn} onClick={() => setShowWalkIn(false)}>Cancel</button>
          </div>
        </Panel>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{ label: 'Total', value: stats.total }, { label: 'Present', value: stats.present }, { label: 'Absent', value: stats.absent }, { label: 'Not Marked', value: stats.not_marked }].map((s) => (
          <div key={s.label} className="rounded-3xl glass gilt-border p-5 text-center">
            <div className={`text-3xl font-semibold ${statTone[s.label]}`}>{s.value}</div>
            <div className="text-xs font-medium mt-1 text-white/50">{s.label}</div>
          </div>
        ))}
      </div>

      {allPassengers.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center rounded-3xl glass gilt-border p-4">
          <span className="text-sm text-white/50 font-medium">Quick Mark:</span>
          <button className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600" onClick={() => markAllAttendance('present')}><CheckCircle2 size={14} /> All Present</button>
          <button className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/25" onClick={() => markAllAttendance('absent')}><XCircle size={14} /> All Absent</button>
        </div>
      )}

      <div className="flex flex-wrap gap-1 glass rounded-full p-1 w-fit">
        {(['all', 'present', 'absent', 'not_marked'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? 'bg-gilt-400 text-ink-900' : 'text-white/60 hover:bg-white/5'}`}
          >
            {tab === 'all' ? `All (${stats.total})` : tab === 'present' ? `Present (${stats.present})` : tab === 'absent' ? `Absent (${stats.absent})` : `Not Marked (${stats.not_marked})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl glass gilt-border text-white/40">No passengers in this category</div>
      ) : (
        <div className={tableWrap}>
          <table className={tableCls}>
            <thead className={theadCls}>
              <tr>
                <th className={thCls}>#</th>
                <th className={thCls}>Passenger</th>
                <th className={`${thCls} hidden sm:table-cell`}>ID Proof</th>
                <th className={`${thCls} hidden md:table-cell`}>Contact</th>
                <th className={thCls}>Attendance</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={`${p.bookingId}-${p.bookingIdx}`} className={rowCls}>
                  <td className={`${tdCls} text-white/40 text-xs`}>{i + 1}</td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-2">
                      <div className={`grid place-items-center w-8 h-8 rounded-full text-xs font-bold ${p.gender === 'female' ? 'bg-pink-500/20 text-pink-300' : 'bg-sky-500/20 text-sky-300'}`}>{p.name?.charAt(0)?.toUpperCase()}</div>
                      <div>
                        <div className="font-medium text-white">{p.name}</div>
                        <div className="text-xs text-white/40">{p.age} yrs • {p.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`${tdCls} hidden sm:table-cell`}>
                    <div className="text-xs text-white/50">{idTypeLabels[p.idType] || p.idType}</div>
                    <div className="text-xs font-mono text-white/70">{p.idNumber}</div>
                  </td>
                  <td className={`${tdCls} hidden md:table-cell`}>
                    <div className="text-xs text-white/60">{p.contactName}</div>
                    <a href={`tel:${p.contactPhone}`} className="text-xs text-gilt-300 flex items-center gap-1"><Phone size={10} /> {p.contactPhone}</a>
                  </td>
                  <td className={tdCls}><AttendanceBadge attendance={p.attendance} /></td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-1">
                      {updating === `${p.bookingId}-${p.bookingIdx}` ? (
                        <span className="text-xs text-white/40">…</span>
                      ) : (
                        <>
                          <button onClick={() => markAttendance(p.bookingId, p.bookingIdx, 'present')} disabled={p.attendance === 'present'} className={`p-1.5 rounded-lg transition-colors ${p.attendance === 'present' ? 'text-emerald-300 bg-emerald-500/15' : 'text-white/40 hover:bg-emerald-500/15 hover:text-emerald-300'}`} title="Mark Present"><CheckCircle2 size={16} /></button>
                          <button onClick={() => markAttendance(p.bookingId, p.bookingIdx, 'absent')} disabled={p.attendance === 'absent'} className={`p-1.5 rounded-lg transition-colors ${p.attendance === 'absent' ? 'text-rose-300 bg-rose-500/15' : 'text-white/40 hover:bg-rose-500/15 hover:text-rose-300'}`} title="Mark Absent"><XCircle size={16} /></button>
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

      {bookings.length > 0 && (
        <Panel title="Booking Details">
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b._id} className="border border-white/5 rounded-2xl p-4 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <span className="font-medium text-white">{b.name}</span>
                    <a href={`tel:${b.phone}`} className="ml-3 text-xs text-gilt-300 hover:underline">{b.phone}</a>
                    {b.email && <span className="ml-2 text-xs text-white/40">{b.email}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {b.totalAmount && <span className="text-sm font-semibold gilt-text">₹{b.totalAmount.toLocaleString()}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${b.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-300' : b.status === 'cancelled' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'}`}>{b.status}</span>
                  </div>
                </div>
                {b.address && <p className="text-xs text-white/40 mb-2">📍 {b.address}</p>}
                {b.emergencyContact && <p className="text-xs text-white/40 mb-2">🆘 {b.emergencyContact} — {b.emergencyPhone}</p>}
                {b.message && <p className="text-xs text-white/50 italic mb-2">&quot;{b.message}&quot;</p>}
                <div className="flex gap-2 flex-wrap">
                  {(b.passengers || []).map((p, pi) => (
                    <span key={pi} className="text-xs px-2 py-1 rounded-full border bg-white/[0.03] border-white/10 text-white/60">{p.name} ({p.age}{p.gender === 'female' ? '♀' : '♂'})</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}
