// In-memory booking store used when MONGODB_URI is not configured.
// Lets the full registration / payment / attendance flow be demonstrated on
// the dev server without a database. Data resets when the server restarts.

export const isDBConfigured = !!process.env.MONGODB_URI

export interface DemoPassenger {
  name: string
  age: number
  gender: string
  idType: string
  idNumber: string
  attendance: 'present' | 'absent' | 'not_marked'
}

export interface DemoBooking {
  _id: string
  bookingRef: string
  tourId: string
  tourTitle: string
  name: string
  phone: string
  email?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  passengers: DemoPassenger[]
  numPersons: number
  message?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  totalAmount?: number
  // payment
  paymentStatus: 'pending' | 'screenshot_received' | 'confirmed' | 'rejected'
  amountPaid: number
  paymentMethod?: string
  paymentRef?: string
  paymentScreenshot?: string
  paymentNote?: string
  isWalkIn?: boolean
  createdAt: string
}

type Store = { bookings: DemoBooking[]; seeded: boolean }

const g = global as unknown as { __vedicaDemoStore?: Store }

if (!g.__vedicaDemoStore) {
  g.__vedicaDemoStore = { bookings: [], seeded: false }
}

const store = g.__vedicaDemoStore

export function genBookingRef(): string {
  return 'VST-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

function seed() {
  if (store.seeded) return
  store.seeded = true
  store.bookings = [
    {
      _id: 'demo-booking-1',
      bookingRef: 'VST-A1B2C3',
      tourId: 'demo-tour-1',
      tourTitle: 'Khatu Shyam Ji – Salasar Balaji – Rani Sati Yatra',
      name: 'Ramesh Kumar',
      phone: '9876543210',
      email: 'ramesh@example.com',
      address: 'Sector 52, Noida',
      emergencyContact: 'Sunita Kumar',
      emergencyPhone: '9876500000',
      passengers: [
        { name: 'Ramesh Kumar', age: 45, gender: 'male', idType: 'aadhar', idNumber: '1234-5678-9012', attendance: 'not_marked' },
        { name: 'Sunita Kumar', age: 42, gender: 'female', idType: 'aadhar', idNumber: '2234-5678-9012', attendance: 'not_marked' },
      ],
      numPersons: 2,
      message: 'Please arrange front seats, elderly travellers.',
      status: 'confirmed',
      totalAmount: 3000,
      paymentStatus: 'confirmed',
      amountPaid: 3000,
      paymentMethod: 'UPI',
      paymentRef: 'UPI-882211',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      _id: 'demo-booking-2',
      bookingRef: 'VST-D4E5F6',
      tourId: 'demo-tour-1',
      tourTitle: 'Khatu Shyam Ji – Salasar Balaji – Rani Sati Yatra',
      name: 'Anita Sharma',
      phone: '9123456780',
      email: '',
      address: 'Sector 18, Noida',
      passengers: [
        { name: 'Anita Sharma', age: 38, gender: 'female', idType: 'pan', idNumber: 'ABCDE1234F', attendance: 'not_marked' },
      ],
      numPersons: 1,
      status: 'pending',
      totalAmount: 1500,
      paymentStatus: 'screenshot_received',
      amountPaid: 1500,
      paymentMethod: 'UPI',
      paymentRef: '',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: 'demo-booking-3',
      bookingRef: 'VST-G7H8I9',
      tourId: 'demo-tour-2',
      tourTitle: 'Vrindavan – Mathura – Gokul Yatra',
      name: 'Mahesh Gupta',
      phone: '9988776655',
      passengers: [
        { name: 'Mahesh Gupta', age: 50, gender: 'male', idType: 'aadhar', idNumber: '3334-5678-9012', attendance: 'not_marked' },
        { name: 'Radha Gupta', age: 47, gender: 'female', idType: 'aadhar', idNumber: '4434-5678-9012', attendance: 'not_marked' },
        { name: 'Kishan Gupta', age: 20, gender: 'male', idType: 'voter_id', idNumber: 'XYZ1234567', attendance: 'not_marked' },
      ],
      numPersons: 3,
      status: 'pending',
      totalAmount: 3600,
      paymentStatus: 'pending',
      amountPaid: 0,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]
}

export function getBookings(): DemoBooking[] {
  seed()
  return store.bookings
}

export function getBookingsByTour(tourId: string): DemoBooking[] {
  return getBookings().filter(b => b.tourId === tourId)
}

export function getBooking(id: string): DemoBooking | undefined {
  return getBookings().find(b => b._id === id)
}

export function addBooking(data: Partial<DemoBooking>): DemoBooking {
  seed()
  const booking: DemoBooking = {
    _id: 'b-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    bookingRef: data.bookingRef || genBookingRef(),
    tourId: data.tourId || '',
    tourTitle: data.tourTitle || '',
    name: data.name || '',
    phone: data.phone || '',
    email: data.email,
    address: data.address,
    emergencyContact: data.emergencyContact,
    emergencyPhone: data.emergencyPhone,
    passengers: (data.passengers as DemoPassenger[]) || [],
    numPersons: data.numPersons || (data.passengers?.length ?? 1),
    message: data.message,
    status: data.status || 'pending',
    totalAmount: data.totalAmount,
    paymentStatus: data.paymentStatus || 'pending',
    amountPaid: data.amountPaid || 0,
    paymentMethod: data.paymentMethod,
    paymentRef: data.paymentRef,
    paymentScreenshot: data.paymentScreenshot,
    paymentNote: data.paymentNote,
    isWalkIn: data.isWalkIn,
    createdAt: new Date().toISOString(),
  }
  store.bookings.unshift(booking)
  return booking
}

export function updateBooking(id: string, data: Partial<DemoBooking>): DemoBooking | undefined {
  const b = getBooking(id)
  if (!b) return undefined
  Object.assign(b, data)
  return b
}

export function deleteBooking(id: string): boolean {
  seed()
  const idx = store.bookings.findIndex(b => b._id === id)
  if (idx === -1) return false
  store.bookings.splice(idx, 1)
  return true
}
