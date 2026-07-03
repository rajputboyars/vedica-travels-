import { isDBConfigured } from '@/config/env'
import * as demo from '@/lib/demo/bookings'
import type { Booking } from '@/types'
import { serialize } from './serialize'

const PAYMENT_FIELDS = ['paymentStatus', 'amountPaid', 'paymentMethod', 'paymentRef', 'paymentScreenshot', 'paymentNote', 'status'] as const

async function db() {
  const [{ default: connectDB }, { default: Booking }] = await Promise.all([
    import('@/lib/db'),
    import('@/models/Booking'),
  ])
  await connectDB()
  return Booking
}

export async function listBookings(): Promise<Booking[]> {
  if (!isDBConfigured) return demo.getBookings()
  try {
    const Booking = await db()
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).populate('tourId', 'title')
    return serialize(bookings)
  } catch {
    return []
  }
}

export async function listBookingsByTour(tourId: string): Promise<Booking[]> {
  if (!isDBConfigured) return demo.getBookingsByTour(tourId)
  try {
    const Booking = await db()
    const bookings = await Booking.find({ tourId }).sort({ createdAt: -1 })
    return serialize(bookings)
  } catch {
    return []
  }
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (!isDBConfigured) return demo.getBooking(id) ?? null
  try {
    const Booking = await db()
    const booking = await Booking.findById(id)
    return booking ? serialize(booking) : null
  } catch {
    return null
  }
}

export async function createBooking(data: Partial<Booking>): Promise<Booking> {
  if (!data.bookingRef) data.bookingRef = demo.genBookingRef()
  if (!isDBConfigured) return demo.addBooking(data)
  const Booking = await db()
  const booking = await Booking.create(data)
  return serialize(booking)
}

export async function updateBooking(id: string, data: Partial<Booking>): Promise<Booking | null> {
  if (!isDBConfigured) return demo.updateBooking(id, data) ?? null
  const Booking = await db()
  const booking = await Booking.findByIdAndUpdate(id, data, { new: true })
  return booking ? serialize(booking) : null
}

// Whitelists fields so the public payment-screenshot endpoint can't be used
// to smuggle arbitrary updates (e.g. overwriting `passengers`) — same
// allowlist the original route used, now enforced in one place.
export async function updatePayment(id: string, data: Record<string, unknown>): Promise<Booking | null> {
  const update: Record<string, unknown> = {}
  for (const key of PAYMENT_FIELDS) {
    if (key in data) update[key] = data[key]
  }
  return updateBooking(id, update as Partial<Booking>)
}

export async function updateAttendance(id: string, passengerIndex: number, attendance: string): Promise<Booking | null> {
  if (!isDBConfigured) {
    const booking = demo.getBooking(id)
    if (!booking?.passengers[passengerIndex]) return null
    booking.passengers[passengerIndex].attendance = attendance as Booking['passengers'][number]['attendance']
    return booking
  }
  const Booking = await db()
  const booking = await Booking.findById(id)
  if (!booking || !booking.passengers[passengerIndex]) return null
  booking.passengers[passengerIndex].attendance = attendance as Booking['passengers'][number]['attendance']
  booking.markModified('passengers')
  await booking.save()
  return serialize(booking)
}

export async function deleteBooking(id: string): Promise<boolean> {
  if (!isDBConfigured) return demo.deleteBooking(id)
  const Booking = await db()
  await Booking.findByIdAndDelete(id)
  return true
}
