// In-memory registration store used when MONGODB_URI is not configured --
// same global-cached-singleton pattern as demo/bookings.ts, extended for
// the Phase 5 payment-verification fields so the whole registration ->
// payment -> approve/reject flow is exercisable without a database.
import type { Registration } from '@/types'

type Store = { registrations: Registration[]; seeded: boolean }

const g = global as unknown as { __demoRegistrationStore?: Store }

if (!g.__demoRegistrationStore) {
  g.__demoRegistrationStore = { registrations: [], seeded: false }
}

const store = g.__demoRegistrationStore

export function genBookingId(): string {
  return 'PST-REG-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

function seed() {
  if (store.seeded) return
  store.seeded = true
  const now = Date.now()
  store.registrations = [
    {
      _id: 'demo-registration-1',
      bookingId: 'PST-REG-A1B2C3',
      packageId: 'demo-package-1',
      packageTitle: 'Char Dham Yatra',
      name: 'Suresh Sharma',
      age: 41,
      gender: 'male',
      mobile: '9812345670',
      email: 'suresh@example.com',
      address: 'Sector 62, Noida',
      city: 'Noida',
      state: 'Uttar Pradesh',
      emergencyContactName: 'Rekha Sharma',
      emergencyContactPhone: '9812300000',
      idType: 'aadhar',
      idNumber: '1111-2222-3333',
      travelDate: new Date(now + 86400000 * 20).toISOString(),
      numPersons: 2,
      specialRequests: 'Need a lower-berth-equivalent seat, elderly traveller in the group.',
      status: 'pending_payment',
      seatStatus: 'reserved',
      paymentStatus: 'waiting_verification',
      paymentScreenshot: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400&q=60&auto=format&fit=crop',
      transactionId: 'TXN220011',
      upiId: 'suresh@okhdfc',
      paymentAmount: 37000,
      paymentSubmittedAt: new Date(now - 3600000).toISOString(),
      createdAt: new Date(now - 86400000 * 2).toISOString(),
      updatedAt: new Date(now - 3600000).toISOString(),
    },
    {
      _id: 'demo-registration-2',
      bookingId: 'PST-REG-D4E5F6',
      packageId: 'demo-package-1',
      packageTitle: 'Char Dham Yatra',
      name: 'Priya Verma',
      age: 29,
      gender: 'female',
      mobile: '9123456781',
      email: 'priya@example.com',
      address: 'Indirapuram, Ghaziabad',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      emergencyContactName: 'Anil Verma',
      emergencyContactPhone: '9123400000',
      idType: 'pan',
      idNumber: 'ABCDE1234F',
      travelDate: new Date(now + 86400000 * 20).toISOString(),
      numPersons: 1,
      status: 'confirmed',
      seatStatus: 'confirmed',
      paymentStatus: 'verified',
      paymentScreenshot: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400&q=60&auto=format&fit=crop',
      transactionId: 'TXN220005',
      upiId: 'priya@okicici',
      paymentAmount: 18500,
      paymentSubmittedAt: new Date(now - 86400000).toISOString(),
      paymentReviewedAt: new Date(now - 3600000 * 20).toISOString(),
      createdAt: new Date(now - 86400000 * 3).toISOString(),
      updatedAt: new Date(now - 3600000 * 20).toISOString(),
    },
    {
      _id: 'demo-registration-3',
      bookingId: 'PST-REG-G7H8I9',
      packageId: 'demo-package-2',
      packageTitle: 'Goa Family Holiday',
      name: 'Manoj Gupta',
      age: 35,
      gender: 'male',
      mobile: '9988776655',
      email: 'manoj@example.com',
      address: 'Sector 18, Noida',
      city: 'Noida',
      state: 'Uttar Pradesh',
      emergencyContactName: 'Kiran Gupta',
      emergencyContactPhone: '9988700000',
      idType: 'aadhar',
      idNumber: '4444-5555-6666',
      travelDate: new Date(now + 86400000 * 45).toISOString(),
      numPersons: 4,
      status: 'pending_payment',
      seatStatus: 'reserved',
      paymentStatus: 'not_submitted',
      createdAt: new Date(now - 3600000 * 5).toISOString(),
      updatedAt: new Date(now - 3600000 * 5).toISOString(),
    },
  ]
}

export function getRegistrations(): Registration[] {
  seed()
  return store.registrations
}

export function getRegistrationsByPackage(packageId: string): Registration[] {
  return getRegistrations().filter((r) => r.packageId === packageId)
}

export function getRegistration(id: string): Registration | undefined {
  return getRegistrations().find((r) => r._id === id)
}

export function getRegistrationByBookingId(bookingId: string): Registration | undefined {
  return getRegistrations().find((r) => r.bookingId === bookingId)
}

export function addRegistration(data: Partial<Registration>): Registration {
  seed()
  const now = new Date().toISOString()
  const registration: Registration = {
    _id: 'reg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    bookingId: data.bookingId || genBookingId(),
    packageId: data.packageId || '',
    packageTitle: data.packageTitle || '',
    name: data.name || '',
    age: data.age || 0,
    gender: data.gender || 'other',
    mobile: data.mobile || '',
    email: data.email || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    emergencyContactName: data.emergencyContactName || '',
    emergencyContactPhone: data.emergencyContactPhone || '',
    idType: data.idType || 'aadhar',
    idNumber: data.idNumber || '',
    travelDate: data.travelDate || now,
    numPersons: data.numPersons || 1,
    specialRequests: data.specialRequests,
    status: data.status || 'pending_payment',
    seatStatus: data.seatStatus || 'reserved',
    paymentStatus: data.paymentStatus || 'not_submitted',
    paymentScreenshot: data.paymentScreenshot,
    transactionId: data.transactionId,
    upiId: data.upiId,
    paymentAmount: data.paymentAmount,
    paymentSubmittedAt: data.paymentSubmittedAt,
    paymentReviewNote: data.paymentReviewNote,
    paymentReviewedAt: data.paymentReviewedAt,
    reminderSentAt: data.reminderSentAt,
    cancellationReason: data.cancellationReason,
    // Phase 9 -- additive/optional, see the userId comment in
    // types/registration.ts.
    userId: data.userId,
    createdAt: now,
    updatedAt: now,
  }
  store.registrations.unshift(registration)
  return registration
}

export function updateRegistration(id: string, data: Partial<Registration>): Registration | undefined {
  const r = getRegistration(id)
  if (!r) return undefined
  Object.assign(r, data, { updatedAt: new Date().toISOString() })
  return r
}

export function deleteRegistration(id: string): boolean {
  seed()
  const idx = store.registrations.findIndex((r) => r._id === id)
  if (idx === -1) return false
  store.registrations.splice(idx, 1)
  return true
}
