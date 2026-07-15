'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, IndianRupee, TrendingUp, TrendingDown, Receipt, Plus, Edit, Trash2,
  Bus, UserRound, Hotel, BadgeCheck, Save, CheckCircle2, Gauge,
} from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { Panel, adminControl, luxLabel, primaryBtn, iconBtn, dangerIconBtn, tableWrap, tableCls, theadCls, thCls, tdCls, rowCls, AdminLoading } from '@/features/admin/components/ui'
import { Metric, ProgressStat, CategoryBreakdown, RevenueVsExpenses, BreakEvenCard, inr } from '@/features/finance/components/FinanceUI'
import ExpenseModal from '@/features/finance/components/ExpenseModal'
import { expenseCategoryMeta } from '@/types'
import type { ComputedExpense, Tour, TripFinanceSummary, VendorWithTotals, ExpensePaymentStatus } from '@/types'

interface FinancePayload {
  tour: Tour
  summary: TripFinanceSummary
  expenses: ComputedExpense[]
}

type Tab = 'overview' | 'finance' | 'operations'

const payStatusChip: Record<ExpensePaymentStatus, string> = {
  pending: 'bg-white/10 text-white/60',
  partial: 'bg-amber-500/15 text-amber-300',
  paid: 'bg-emerald-500/15 text-emerald-300',
}

export default function TripFinancePage() {
  const { id } = useParams() as { id: string }
  const { data, loading, refetch } = useFetch<FinancePayload | null>(`/api/tours/${id}/finance`, null)
  const { data: vendors } = useFetch<VendorWithTotals[]>('/api/vendors', [])
  const [tab, setTab] = useState<Tab>('overview')
  const [expenseModal, setExpenseModal] = useState<ComputedExpense | 'new' | null>(null)
  const confirmDialog = useConfirmDialog<ComputedExpense>()

  const summary = data?.summary
  const tour = data?.tour
  const expenses = useMemo(() => data?.expenses ?? [], [data])

  async function handleDeleteExpense() {
    await confirmDialog.confirm(async (e) => {
      await fetch(`/api/tours/${id}/expenses/${e._id}`, { method: 'DELETE' })
      refetch()
    })
  }

  if (loading) return <AdminLoading />
  if (!data || !summary || !tour) {
    return (
      <div className="text-center py-16 rounded-3xl glass gilt-border text-white/50">
        Trip not found. <Link href="/admin/tours" className="text-gilt-300 hover:underline">Back to Tours</Link>
      </div>
    )
  }

  const profitTone = summary.currentLoss > 0 ? 'negative' : 'positive'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/tours" className="inline-flex items-center gap-1.5 text-sm text-gilt-300 hover:underline"><ArrowLeft size={15} /> Back to Tours</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{tour.title}</h1>
            <p className="mt-1 text-sm text-white/50">Trip Command Center · {new Date(tour.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full glass gilt-border text-gilt-300 capitalize">{tour.status}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 glass rounded-full p-1 w-fit">
        {([['overview', 'Operations Overview'], ['finance', 'Financial Management'], ['operations', 'Assignments']] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === key ? 'bg-gilt-400 text-ink-900' : 'text-white/60 hover:bg-white/5'}`}>{label}</button>
        ))}
      </div>

      {/* ===================== OVERVIEW ===================== */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Metric label="Revenue" value={inr(summary.totalRevenue)} sub={`${summary.confirmedPassengers} confirmed pax`} icon={IndianRupee} tone="gold" />
            <Metric label="Total Expenses" value={inr(summary.totalExpenses)} sub={`${inr(summary.costPerPassenger)}/passenger`} icon={Receipt} />
            <Metric label={summary.currentLoss > 0 ? 'Current Loss' : 'Current Profit'} value={inr(summary.currentLoss > 0 ? summary.currentLoss : summary.currentProfit)} sub="Revenue − Expenses" icon={summary.currentLoss > 0 ? TrendingDown : TrendingUp} tone={profitTone} />
            <Metric label="Occupancy" value={`${summary.occupancyPct}%`} sub={`${summary.bookedSeats}/${summary.totalSeats} seats`} icon={Gauge} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Panel title="Operations Overview" className="lg:col-span-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <Field label="Trip Status" value={<span className="capitalize">{tour.status}</span>} />
                <Field label="Confirmed Passengers" value={summary.confirmedPassengers} />
                <Field label="Seats Sold" value={`${summary.bookedSeats} / ${summary.totalSeats}`} />
                <Field label="Revenue" value={inr(summary.totalRevenue)} />
                <Field label="Expenses" value={inr(summary.totalExpenses)} />
                <Field label={summary.currentLoss > 0 ? 'Loss' : 'Profit'} value={<span className={summary.currentLoss > 0 ? 'text-rose-300' : 'text-emerald-300'}>{inr(summary.currentLoss > 0 ? summary.currentLoss : summary.currentProfit)}</span>} />
                <Field label="Bus Assigned" value={tour.operations?.busAssigned || '—'} />
                <Field label="Driver" value={tour.operations?.driverName || '—'} />
                <Field label="Hotel" value={tour.operations?.hotelName || '—'} />
                <Field label="Tour Manager" value={tour.operations?.tourManager || '—'} />
                <Field label="Pending Collection" value={<span className="text-amber-300">{inr(summary.pendingCollection)}</span>} />
                <Field label="Pending Vendor Payments" value={<span className="text-amber-300">{inr(summary.pendingVendorPayments)}</span>} />
              </div>
            </Panel>

            <BreakEvenCard summary={summary} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Panel title="Revenue vs Expenses" className="lg:col-span-2">
              <RevenueVsExpenses summary={summary} />
            </Panel>
            <Panel title="Collection & Occupancy">
              <div className="space-y-5">
                <ProgressStat label="Seat occupancy" value={`${summary.occupancyPct}%`} pct={summary.occupancyPct} tone="sky" />
                <ProgressStat label="Payment collected" value={inr(summary.collectedAmount)} pct={summary.totalRevenue ? (summary.collectedAmount / summary.totalRevenue) * 100 : 0} tone="emerald" />
                <ProgressStat label="Vendor paid" value={inr(summary.paidVendorPayments)} pct={summary.totalExpenses ? (summary.paidVendorPayments / summary.totalExpenses) * 100 : 0} />
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* ===================== FINANCE ===================== */}
      {tab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Metric label="Total Revenue" value={inr(summary.totalRevenue)} tone="gold" />
            <Metric label="Expected Revenue" value={inr(summary.expectedRevenue)} sub="at full occupancy" />
            <Metric label="Fixed Expenses" value={inr(summary.totalFixedExpenses)} />
            <Metric label="Variable Expenses" value={inr(summary.totalVariableExpenses)} sub={`${inr(summary.variableCostPerPassenger)}/pax`} />
            <Metric label="Total Expenses" value={inr(summary.totalExpenses)} />
            <Metric label="Cost / Passenger" value={inr(summary.costPerPassenger)} />
            <Metric label="Current Profit" value={inr(summary.currentProfit)} tone="positive" />
            <Metric label="Current Loss" value={inr(summary.currentLoss)} tone="negative" />
            <Metric label="Expected Profit" value={inr(summary.expectedProfit)} tone={summary.expectedProfit >= 0 ? 'positive' : 'negative'} sub="at full occupancy" />
            <Metric label="Collected" value={inr(summary.collectedAmount)} tone="positive" />
            <Metric label="Pending Collection" value={inr(summary.pendingCollection)} tone="negative" />
            <Metric label="Available Seats" value={summary.availableSeats} sub={`of ${summary.totalSeats}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Expense Category Breakdown"><CategoryBreakdown summary={summary} /></Panel>
            <BreakEvenCard summary={summary} />
          </div>

          <Panel
            title="Trip Expenses"
            action={<button className={primaryBtn} onClick={() => setExpenseModal('new')}><Plus size={15} /> Add Expense</button>}
          >
            {expenses.length === 0 ? (
              <p className="text-sm text-white/40 py-6 text-center">No expenses added yet. Add Bus Rent, meals, hotel and more to track this trip&apos;s finances.</p>
            ) : (
              <div className={tableWrap}>
                <table className={tableCls}>
                  <thead className={theadCls}>
                    <tr>
                      <th className={thCls}>Expense</th>
                      <th className={thCls}>Type</th>
                      <th className={`${thCls} hidden sm:table-cell`}>Rate</th>
                      <th className={`${thCls} hidden md:table-cell`}>Vendor</th>
                      <th className={thCls}>Total</th>
                      <th className={thCls}>Payment</th>
                      <th className={thCls}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e) => (
                      <tr key={e._id} className={rowCls}>
                        <td className={tdCls}>
                          <div className="font-medium text-white">{e.name}</div>
                          <div className="text-xs text-white/40">{expenseCategoryMeta[e.category].label}</div>
                        </td>
                        <td className={tdCls}>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.type === 'variable' ? 'bg-sky-500/15 text-sky-300' : 'bg-white/10 text-white/60'}`}>{e.type === 'variable' ? 'Variable' : 'Fixed'}</span>
                        </td>
                        <td className={`${tdCls} hidden sm:table-cell text-white/70`}>{inr(e.rate)}{e.type === 'variable' ? '/pax' : e.quantity > 1 ? ` × ${e.quantity}` : ''}</td>
                        <td className={`${tdCls} hidden md:table-cell text-white/60`}>{e.vendorName || '—'}</td>
                        <td className={`${tdCls} font-semibold gilt-text`}>{inr(e.totalAmount)}</td>
                        <td className={tdCls}>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${payStatusChip[e.paymentStatus]}`}>{e.paymentStatus}</span>
                          {e.pendingAmount > 0 && <div className="text-[11px] text-amber-300/80 mt-0.5">{inr(e.pendingAmount)} due</div>}
                        </td>
                        <td className={tdCls}>
                          <div className="flex items-center gap-1 justify-end">
                            <button className={iconBtn} onClick={() => setExpenseModal(e)} title="Edit"><Edit size={16} /></button>
                            <button className={dangerIconBtn} onClick={() => confirmDialog.ask(e)} title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* ===================== OPERATIONS (assignments) ===================== */}
      {tab === 'operations' && <OperationsTab tour={tour} onSaved={refetch} />}

      {expenseModal && (
        <ExpenseModal
          tourId={id}
          editing={expenseModal}
          vendors={vendors}
          confirmedPassengers={summary.confirmedPassengers}
          onClose={() => setExpenseModal(null)}
          onSaved={refetch}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.isOpen}
        title="Delete this expense?"
        message={confirmDialog.pending ? `"${confirmDialog.pending.name}" will be removed from this trip.` : ''}
        loading={confirmDialog.loading}
        onConfirm={handleDeleteExpense}
        onCancel={confirmDialog.cancel}
      />
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-white/40">{label}</div>
      <div className="font-medium text-white mt-0.5">{value}</div>
    </div>
  )
}

function OperationsTab({ tour, onSaved }: { tour: Tour; onSaved: () => void }) {
  const [form, setForm] = useState({
    busAssigned: tour.operations?.busAssigned ?? '',
    driverName: tour.operations?.driverName ?? '',
    driverPhone: tour.operations?.driverPhone ?? '',
    hotelName: tour.operations?.hotelName ?? '',
    tourManager: tour.operations?.tourManager ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    setSaved(false)
    // Reuse the existing PUT /api/tours/[id] partial-update route.
    const res = await fetch(`/api/tours/${tour._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations: form }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      onSaved()
    }
  }

  const input = `${adminControl} w-full`
  return (
    <Panel title="Trip Assignments" action={saved ? <span className="flex items-center gap-1 text-emerald-300 text-sm"><CheckCircle2 size={15} /> Saved</span> : undefined}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <div><label className={luxLabel}><Bus size={13} className="inline mr-1 text-gilt-400" />Bus Assigned</label><input className={input} value={form.busAssigned} onChange={(e) => setForm({ ...form, busAssigned: e.target.value })} placeholder="e.g. Volvo AC — HR26 1234" /></div>
        <div><label className={luxLabel}><Hotel size={13} className="inline mr-1 text-gilt-400" />Hotel</label><input className={input} value={form.hotelName} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} placeholder="Hotel name" /></div>
        <div><label className={luxLabel}><UserRound size={13} className="inline mr-1 text-gilt-400" />Driver Name</label><input className={input} value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} /></div>
        <div><label className={luxLabel}>Driver Phone</label><input className={input} value={form.driverPhone} onChange={(e) => setForm({ ...form, driverPhone: e.target.value })} /></div>
        <div><label className={luxLabel}><BadgeCheck size={13} className="inline mr-1 text-gilt-400" />Tour Manager</label><input className={input} value={form.tourManager} onChange={(e) => setForm({ ...form, tourManager: e.target.value })} /></div>
      </div>
      <div className="mt-5">
        <button className={primaryBtn} disabled={saving} onClick={save}><Save size={15} /> {saving ? 'Saving…' : 'Save Assignments'}</button>
      </div>
    </Panel>
  )
}
