export type Gender = 'male' | 'female' | 'other'
export type IdType = 'aadhar' | 'pan' | 'passport' | 'driving_license' | 'voter_id'
export type Attendance = 'present' | 'absent' | 'not_marked'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
export type PaymentStatus = 'pending' | 'screenshot_received' | 'confirmed' | 'rejected'

export interface Passenger {
  name: string
  age: number
  gender: Gender
  idType: IdType
  idNumber: string
  attendance: Attendance
}

export interface Booking {
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
  passengers: Passenger[]
  numPersons: number
  message?: string
  status: BookingStatus
  totalAmount?: number
  paymentStatus: PaymentStatus
  amountPaid: number
  paymentMethod?: string
  paymentRef?: string
  paymentScreenshot?: string
  paymentNote?: string
  isWalkIn?: boolean
  createdAt: string
}

export const idTypeLabels: Record<IdType, string> = {
  aadhar: 'Aadhar',
  pan: 'PAN',
  passport: 'Passport',
  driving_license: 'DL',
  voter_id: 'Voter ID',
}
