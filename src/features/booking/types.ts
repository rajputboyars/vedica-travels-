// Form-local passenger shape (age as string while typing) — distinct from
// the persisted Passenger type in @/types, which requires a numeric age.
export interface PassengerFormValue {
  name: string
  age: string
  gender: string
  idType: string
  idNumber: string
}

export const defaultPassenger = (): PassengerFormValue => ({
  name: '', age: '', gender: 'male', idType: 'aadhar', idNumber: '',
})

export interface ContactFormValue {
  name: string
  phone: string
  email: string
  address: string
  emergencyContact: string
  emergencyPhone: string
}

export const defaultContact = (): ContactFormValue => ({
  name: '', phone: '', email: '', address: '', emergencyContact: '', emergencyPhone: '',
})

export const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
export const labelClass = 'block text-xs text-gray-600 font-medium mb-1'
