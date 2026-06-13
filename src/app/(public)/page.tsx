import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, MapPin, Star, Users, Calendar, ArrowRight, MessageCircle, Bus, Utensils, Droplets, Clock, Mountain, Sparkles } from 'lucide-react'
import TourImage from '@/components/ui/tour-image'
import { getBaseUrl } from '@/lib/base-url'

async function getTours() {
  try {
    const res = await fetch(`${await getBaseUrl()}/api/tours`, { cache: 'no-store' })
    const tours = await res.json()
    return Array.isArray(tours) ? tours : []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const all = await getTours()
  const upcoming = all.filter((t: any) => t.status === 'upcoming')
  const spiritual = upcoming.filter((t: any) => (t.category || 'spiritual') === 'spiritual').slice(0, 3)
  const leisure = upcoming.filter((t: any) => t.category === 'leisure').slice(0, 3)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop"
          alt="Travel" className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/85 via-orange-800/80 to-amber-700/75" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 text-sm px-4 py-1">
            🙏 जय श्री श्याम | 1000+ happy travellers
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">
            Vedika Spiritual Travels
          </h1>
          <p className="text-xl sm:text-2xl text-orange-100 mb-2 font-medium">आपकी सेवा, हमारा सौभाग्य</p>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto text-lg">
            Sacred yatras to Khatu Shyam Ji, Vrindavan & Haridwar — plus holiday trips to Manali, Mussoorie, Rishikesh & Dehradun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tours">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8">
                Explore All Trips <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <a href="https://wa.me/919773834051" target="_blank">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                <MessageCircle className="mr-2" size={18} /> WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Category chooser */}
      <section className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link href="/tours?cat=spiritual" className="group">
            <div className="relative h-44 rounded-2xl overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80&auto=format&fit=crop" alt="Spiritual" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 to-orange-900/20 flex flex-col justify-end p-5">
                <Sparkles className="text-amber-300 mb-1" size={22} />
                <h3 className="text-white text-xl font-bold">Spiritual Yatras</h3>
                <p className="text-orange-100 text-sm">Khatu Shyam, Vrindavan, Haridwar & more</p>
              </div>
            </div>
          </Link>
          <Link href="/tours?cat=leisure" className="group">
            <div className="relative h-44 rounded-2xl overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80&auto=format&fit=crop" alt="Holiday" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-emerald-900/20 flex flex-col justify-end p-5">
                <Mountain className="text-emerald-200 mb-1" size={22} />
                <h3 className="text-white text-xl font-bold">Holiday Trips</h3>
                <p className="text-emerald-100 text-sm">Manali, Mussoorie, Rishikesh, Dehradun</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="mt-14">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: <Users size={24} className="text-orange-600" />, value: '1000+', label: 'Happy Travellers' },
            { icon: <Calendar size={24} className="text-orange-600" />, value: '50+', label: 'Trips Completed' },
            { icon: <MapPin size={24} className="text-orange-600" />, value: '15+', label: 'Destinations' },
            { icon: <Star size={24} className="text-orange-600" />, value: '4.9★', label: 'Average Rating' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 bg-amber-50 rounded-xl py-5 border border-amber-100">
              {s.icon}
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Spiritual Yatras */}
      <ShowcaseSection
        title="🛕 Spiritual Yatras"
        subtitle="Sacred pilgrimages departing soon — book your seat today"
        tours={spiritual}
      />

      {/* Holiday Trips */}
      <ShowcaseSection
        title="🏔️ Holiday Trips"
        subtitle="Mountains, valleys & adventure — getaways for family and friends"
        tours={leisure}
        muted
      />

      {/* Services */}
      <section className="bg-orange-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Why Travel With Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Bus size={32} className="text-orange-600" />, title: 'AC Bus & Volvo', desc: 'Comfortable coaches for every journey' },
              { icon: <Utensils size={32} className="text-orange-600" />, title: 'Meals Included', desc: 'Breakfast & meals on all trips' },
              { icon: <Droplets size={32} className="text-orange-600" />, title: 'Refreshments', desc: 'Water bottles & snacks provided' },
              { icon: <MapPin size={32} className="text-orange-600" />, title: 'Guided Tours', desc: 'Experienced guides throughout' },
            ].map((s, i) => (
              <Card key={i} className="text-center p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-3">{s.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for Your Next Journey?</h2>
          <p className="text-orange-100 mb-8 text-lg">Contact us today to book your seat. Limited seats available!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:9773834051">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold">
                <Phone className="mr-2" size={18} /> Call: 9773834051
              </Button>
            </a>
            <a href="https://wa.me/919773834051" target="_blank">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <MessageCircle className="mr-2" size={18} /> WhatsApp Us
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-orange-200">Pickup Point: Sector 52, Noida • Metro Pillar No. 657</p>
        </div>
      </section>
    </div>
  )
}

function ShowcaseSection({ title, subtitle, tours, muted }: { title: string; subtitle: string; tours: any[]; muted?: boolean }) {
  if (tours.length === 0) return null
  return (
    <section className={`py-16 px-4 ${muted ? 'bg-gray-50' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-500">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tours.map((tour: any) => (
            <Card key={tour._id} className="overflow-hidden hover:shadow-xl transition-all group pt-0">
              <div className="h-48 relative overflow-hidden">
                <TourImage src={tour.image} alt={tour.title} category={tour.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <Badge className="absolute top-3 right-3 capitalize">{tour.status}</Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">{tour.title}</h3>
                <p className="text-sm text-orange-600 font-medium mb-3 line-clamp-1">📍 {tour.route}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(tour.startDate).toLocaleDateString('en-IN')}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {tour.departureTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-orange-600">₹{tour.price.toLocaleString()}<span className="text-sm text-gray-400 font-normal">/person</span></div>
                  <Link href={`/tours/${tour._id}`}><Button size="sm">Book Now</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Link href="/tours"><Button variant="outline" size="lg">View All Trips <ArrowRight className="ml-2" size={16} /></Button></Link>
        </div>
      </div>
    </section>
  )
}
