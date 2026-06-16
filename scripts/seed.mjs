// Seeds the MongoDB database with dummy tours and bookings.
// Usage: node scripts/seed.mjs   (reads MONGODB_URI from .env.local)
import mongoose from 'mongoose'
import fs from 'node:fs'
import path from 'node:path'

// --- load MONGODB_URI from .env.local ---
function loadEnv() {
  const file = path.join(process.cwd(), '.env.local')
  const text = fs.readFileSync(file, 'utf8')
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*MONGODB_URI\s*=\s*(.+)\s*$/)
    if (m) return m[1].trim()
  }
  throw new Error('MONGODB_URI not found in .env.local')
}

const uri = loadEnv()
const img = (id) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`
const DEMO_QR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><rect width="220" height="220" fill="white"/><rect x="10" y="10" width="60" height="60" fill="black"/><rect x="25" y="25" width="30" height="30" fill="white"/><rect x="150" y="10" width="60" height="60" fill="black"/><rect x="165" y="25" width="30" height="30" fill="white"/><rect x="10" y="150" width="60" height="60" fill="black"/><rect x="25" y="165" width="30" height="30" fill="white"/><rect x="90" y="40" width="15" height="15" fill="black"/><rect x="120" y="40" width="15" height="15" fill="black"/><rect x="90" y="90" width="15" height="15" fill="black"/><rect x="120" y="90" width="15" height="15" fill="black"/><rect x="150" y="120" width="15" height="15" fill="black"/><rect x="90" y="150" width="15" height="15" fill="black"/></svg>'

const TourSchema = new mongoose.Schema({
  title: String, description: String, route: String,
  startDate: Date, endDate: Date, price: Number,
  services: [String], inclusions: [String], pickupPoints: [String],
  image: String, qrImage: String, paymentNote: String,
  departureTime: String, totalSeats: Number, availableSeats: Number,
  status: String, category: String, featured: Boolean,
}, { timestamps: true })

const PassengerSchema = new mongoose.Schema({
  name: String, age: Number, gender: String, idType: String, idNumber: String, attendance: String,
})
const BookingSchema = new mongoose.Schema({
  bookingRef: String, tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' }, tourTitle: String,
  name: String, phone: String, email: String, address: String,
  emergencyContact: String, emergencyPhone: String,
  passengers: [PassengerSchema], numPersons: Number, message: String,
  status: String, totalAmount: Number,
  paymentStatus: String, amountPaid: Number, paymentMethod: String,
  paymentRef: String, paymentScreenshot: String, paymentNote: String, isWalkIn: Boolean,
}, { timestamps: true })

const d = (s) => new Date(s)

const tours = [
  { title: 'Khatu Shyam Ji – Salasar Balaji – Rani Sati Yatra',
    description: 'खाटू श्याम जी, सालासर बालाजी और रानी सती धाम की पावन तीर्थयात्रा।',
    route: 'Khatu Shyam Ji → Salasar Balaji → Rani Sati Jhunjhunur',
    startDate: d('2026-07-11'), endDate: d('2026-07-12'), price: 1500, category: 'spiritual',
    services: ['AC Bus', 'Breakfast', 'Lunch', 'Water Bottle'],
    inclusions: ['AC Bus transportation', 'Breakfast on Day 1', 'Lunch on Day 2', 'Experienced guide', 'All temple entry fees'],
    pickupPoints: ['Sector 52, Noida – Metro Pillar No. 657 (08:30 PM)', 'Sector 18, Noida – Atta Market (08:45 PM)'],
    image: img('photo-1605649487212-47bdab064df7'), qrImage: DEMO_QR,
    paymentNote: 'Please call 9773834051 once before payment, then send the screenshot to confirm.',
    departureTime: '08:30 PM', totalSeats: 50, availableSeats: 23, status: 'upcoming', featured: true },
  { title: 'Vrindavan – Mathura – Gokul Yatra',
    description: 'भगवान श्री कृष्ण की लीलाभूमि वृंदावन, मथुरा और गोकुल की पावन यात्रा।',
    route: 'Vrindavan → Mathura → Gokul',
    startDate: d('2026-08-05'), endDate: d('2026-08-06'), price: 1200, category: 'spiritual',
    services: ['AC Bus', 'Breakfast', 'Lunch'],
    inclusions: ['AC Bus transportation', 'Breakfast & Lunch', 'Hotel stay (1 night)', 'Local guide'],
    pickupPoints: ['Sector 52, Noida – Metro Pillar No. 657 (07:00 AM)'],
    image: img('photo-1604608672516-f1b9b1d37076'),
    departureTime: '07:00 AM', totalSeats: 45, availableSeats: 31, status: 'upcoming', featured: true },
  { title: 'Haridwar – Rishikesh Yatra',
    description: 'गंगा स्नान, हर की पौड़ी गंगा आरती और ऋषिकेश में लक्ष्मण झूला का दर्शन।',
    route: 'Haridwar → Rishikesh',
    startDate: d('2026-09-14'), endDate: d('2026-09-15'), price: 1800, category: 'spiritual',
    services: ['AC Bus', 'Breakfast', 'Dinner', 'Hotel Stay'],
    inclusions: ['AC Volvo Bus', 'Breakfast & Dinner', 'Hotel accommodation', 'Ganga Aarti darshan'],
    pickupPoints: ['Sector 52, Noida – Metro Pillar No. 657 (06:00 AM)'],
    image: img('photo-1561361513-2d000a50f0dc'),
    departureTime: '06:00 AM', totalSeats: 40, availableSeats: 18, status: 'upcoming', featured: false },
  { title: 'Manali – Solang Valley Adventure',
    description: 'बर्फ से ढके पहाड़, सोलंग वैली एडवेंचर और हिडिम्बा मंदिर का दर्शन।',
    route: 'Delhi → Manali → Solang Valley → Rohtang',
    startDate: d('2026-07-20'), endDate: d('2026-07-24'), price: 8500, category: 'leisure',
    services: ['AC Volvo Bus', 'Hotel Stay (3 Nights)', 'Breakfast & Dinner', 'Sightseeing'],
    inclusions: ['AC Volvo round trip', '3-star hotel (3 nights)', 'Daily breakfast & dinner', 'Solang Valley visit', 'Hidimba Temple & Mall Road'],
    pickupPoints: ['Sector 52, Noida – Metro Pillar No. 657 (05:00 PM)', 'Delhi – Kashmere Gate (06:00 PM)'],
    image: img('photo-1626621341517-bbf3d9990a23'),
    departureTime: '05:00 PM', totalSeats: 35, availableSeats: 20, status: 'upcoming', featured: true },
  { title: 'Mussoorie – Queen of Hills Getaway',
    description: 'मसूरी की ठंडी हवाएं, केम्प्टी फॉल, माल रोड और गन हिल की सैर।',
    route: 'Delhi → Mussoorie → Kempty Falls',
    startDate: d('2026-08-15'), endDate: d('2026-08-17'), price: 6500, category: 'leisure',
    services: ['AC Bus', 'Hotel Stay (2 Nights)', 'Breakfast', 'Sightseeing'],
    inclusions: ['AC Bus transport', 'Hotel (2 nights)', 'Daily breakfast', 'Kempty Falls', 'Gun Hill & Mall Road'],
    pickupPoints: ['Sector 52, Noida – Metro Pillar No. 657 (10:00 PM)'],
    image: img('photo-1593181629936-11c609b8db9b'),
    departureTime: '10:00 PM', totalSeats: 40, availableSeats: 28, status: 'upcoming', featured: false },
  { title: 'Rishikesh – Dehradun River Rafting Trip',
    description: 'ऋषिकेश में रिवर राफ्टिंग, कैम्पिंग और देहरादून की सैर।',
    route: 'Delhi → Rishikesh → Dehradun',
    startDate: d('2026-09-05'), endDate: d('2026-09-07'), price: 5500, category: 'leisure',
    services: ['AC Bus', 'Camp Stay', 'River Rafting', 'Meals'],
    inclusions: ['AC Bus transport', 'Riverside camp (2 nights)', 'River rafting 16 km', 'Bonfire night', 'All meals'],
    pickupPoints: ['Sector 52, Noida – Metro Pillar No. 657 (11:00 PM)'],
    image: img('photo-1571536802807-30451e3955d8'),
    departureTime: '11:00 PM', totalSeats: 30, availableSeats: 15, status: 'upcoming', featured: true },
]

const ref = () => 'VST-' + Math.random().toString(36).slice(2, 8).toUpperCase()

async function run() {
  console.log('Connecting to MongoDB...')
  await mongoose.connect(uri)
  const Tour = mongoose.model('Tour', TourSchema)
  const Booking = mongoose.model('Booking', BookingSchema)

  console.log('Clearing existing tours & bookings...')
  await Tour.deleteMany({})
  await Booking.deleteMany({})

  console.log('Inserting tours...')
  const inserted = await Tour.insertMany(tours)
  const byTitle = (t) => inserted.find(x => x.title.startsWith(t))
  const khatu = byTitle('Khatu'), vrindavan = byTitle('Vrindavan'), manali = byTitle('Manali')

  console.log('Inserting bookings...')
  await Booking.insertMany([
    { bookingRef: ref(), tourId: khatu._id, tourTitle: khatu.title,
      name: 'Ramesh Kumar', phone: '9876543210', email: 'ramesh@example.com', address: 'Sector 52, Noida',
      emergencyContact: 'Sunita Kumar', emergencyPhone: '9876500000',
      passengers: [
        { name: 'Ramesh Kumar', age: 45, gender: 'male', idType: 'aadhar', idNumber: '1234-5678-9012', attendance: 'not_marked' },
        { name: 'Sunita Kumar', age: 42, gender: 'female', idType: 'aadhar', idNumber: '2234-5678-9012', attendance: 'not_marked' },
      ], numPersons: 2, message: 'Please arrange front seats, elderly travellers.',
      status: 'confirmed', totalAmount: 3000, paymentStatus: 'confirmed', amountPaid: 3000, paymentMethod: 'UPI', paymentRef: 'UPI-882211' },
    { bookingRef: ref(), tourId: khatu._id, tourTitle: khatu.title,
      name: 'Anita Sharma', phone: '9123456780', address: 'Sector 18, Noida',
      passengers: [{ name: 'Anita Sharma', age: 38, gender: 'female', idType: 'pan', idNumber: 'ABCDE1234F', attendance: 'not_marked' }],
      numPersons: 1, status: 'pending', totalAmount: 1500, paymentStatus: 'screenshot_received', amountPaid: 1500, paymentMethod: 'UPI' },
    { bookingRef: ref(), tourId: vrindavan._id, tourTitle: vrindavan.title,
      name: 'Mahesh Gupta', phone: '9988776655',
      passengers: [
        { name: 'Mahesh Gupta', age: 50, gender: 'male', idType: 'aadhar', idNumber: '3334-5678-9012', attendance: 'not_marked' },
        { name: 'Radha Gupta', age: 47, gender: 'female', idType: 'aadhar', idNumber: '4434-5678-9012', attendance: 'not_marked' },
        { name: 'Kishan Gupta', age: 20, gender: 'male', idType: 'voter_id', idNumber: 'XYZ1234567', attendance: 'not_marked' },
      ], numPersons: 3, status: 'pending', totalAmount: 3600, paymentStatus: 'pending', amountPaid: 0 },
    { bookingRef: ref(), tourId: manali._id, tourTitle: manali.title,
      name: 'Priya Verma', phone: '9001122334', email: 'priya@example.com',
      passengers: [
        { name: 'Priya Verma', age: 29, gender: 'female', idType: 'aadhar', idNumber: '5534-5678-9012', attendance: 'not_marked' },
        { name: 'Arjun Verma', age: 31, gender: 'male', idType: 'aadhar', idNumber: '6634-5678-9012', attendance: 'not_marked' },
      ], numPersons: 2, status: 'confirmed', totalAmount: 17000, paymentStatus: 'confirmed', amountPaid: 17000, paymentMethod: 'UPI', paymentRef: 'UPI-554433' },
  ])

  const tc = await Tour.countDocuments()
  const bc = await Booking.countDocuments()
  console.log(`\n✅ Done. Tours: ${tc}, Bookings: ${bc}`)
  await mongoose.disconnect()
}

run().catch(e => { console.error('Seed failed:', e.message); process.exit(1) })
