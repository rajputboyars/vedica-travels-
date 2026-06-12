import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, MapPin, Star, Users, Calendar, ArrowRight, MessageCircle, Bus, Utensils, Droplets, Clock } from 'lucide-react'

async function getFeaturedTours() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/tours`, {
      cache: 'no-store'
    })
    const tours = await res.json()
    return Array.isArray(tours) ? tours.filter((t: any) => t.status === 'upcoming').slice(0, 3) : []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const tours = await getFeaturedTours()

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white overflow-hidden">
        <div className="absolute inset-0 om-pattern"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 text-sm px-4 py-1">
            🙏 जय श्री श्याम | 1000+ संतुष्ट तीर्थयात्री
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Vedika Spiritual Travels
          </h1>
          <p className="text-xl sm:text-2xl text-orange-100 mb-2 font-medium">
            आपकी सेवा, हमारा सौभाग्य
          </p>
          <p className="text-orange-200 mb-8 max-w-2xl mx-auto text-lg">
            Join us for sacred Yatra journeys to Khatu Shyam Ji, Salasar Balaji, Rani Sati Jhunjhunur and more holy destinations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tours">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8">
                View All Yatras <ArrowRight className="ml-2" size={18} />
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

      {/* Stats Bar */}
      <section className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: <Users size={24} className="text-orange-600" />, value: '1000+', label: 'Happy Devotees' },
            { icon: <Calendar size={24} className="text-orange-600" />, value: '50+', label: 'Yatras Completed' },
            { icon: <MapPin size={24} className="text-orange-600" />, value: '10+', label: 'Holy Destinations' },
            { icon: <Star size={24} className="text-orange-600" />, value: '4.9★', label: 'Average Rating' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              {s.icon}
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Upcoming Yatras</h2>
          <p className="text-gray-500">Sacred journeys departing soon — book your seat today</p>
        </div>

        {tours.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-30" />
            <p>New yatras coming soon. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tours.map((tour: any) => (
              <Card key={tour._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="h-48 bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center relative">
                  {tour.image ? (
                    <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-7xl">🛕</span>
                  )}
                  <Badge className="absolute top-3 right-3">{tour.status}</Badge>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">{tour.title}</h3>
                  <p className="text-sm text-orange-600 font-medium mb-3">📍 {tour.route}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(tour.startDate).toLocaleDateString('en-IN')}</span>
                    <span className="flex items-center gap-1"><Clock size={13} /> {tour.departureTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-orange-600">₹{tour.price.toLocaleString()}<span className="text-sm text-gray-400 font-normal">/person</span></div>
                    <Link href={`/tours/${tour._id}`}>
                      <Button size="sm">Book Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href="/tours">
            <Button variant="outline" size="lg">View All Tours <ArrowRight className="ml-2" size={16} /></Button>
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="bg-orange-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Our Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Bus size={32} className="text-orange-600" />, title: 'AC Bus', desc: 'Comfortable AC coaches for all journeys' },
              { icon: <Utensils size={32} className="text-orange-600" />, title: 'Meals Included', desc: 'Breakfast & lunch on all tours' },
              { icon: <Droplets size={32} className="text-orange-600" />, title: 'Refreshments', desc: 'Water bottles & snacks provided' },
              { icon: <MapPin size={32} className="text-orange-600" />, title: 'Guided Tour', desc: 'Experienced guides for all yatras' },
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
          <h2 className="text-3xl font-bold mb-4">Ready for Your Spiritual Journey?</h2>
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
