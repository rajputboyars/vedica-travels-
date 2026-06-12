import { Users, Star, Bus, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">About Us</h1>
        <p className="text-orange-100">Our story of service and devotion</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">🙏 Vedika Spiritual Travels</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Founded by <strong>YOGESH THAKUR</strong>, Vedika Spiritual Travels has been serving thousands of devotees on their sacred pilgrimage journeys.
              We believe every soul deserves a comfortable and memorable yatra experience.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our tagline — <em>&quot;आपकी सेवा, हमारा सौभाग्य&quot;</em> (Your service, our privilege) — reflects our commitment to making every journey a divine experience.
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center">
            <div className="text-7xl mb-4">🛕</div>
            <div className="text-4xl font-bold text-orange-600 mb-1">1000+</div>
            <div className="text-gray-600">Happy Devotees Served</div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Bus size={32} className="text-orange-600" />, title: 'AC Transport', desc: 'Comfortable AC buses for all journeys' },
              { icon: <Star size={32} className="text-orange-600" />, title: 'Experienced Team', desc: 'Knowledgeable guides and staff' },
              { icon: <Users size={32} className="text-orange-600" />, title: 'Group Bonding', desc: 'Connect with fellow devotees' },
              { icon: <MapPin size={32} className="text-orange-600" />, title: 'Best Routes', desc: 'Carefully planned itineraries' },
            ].map((item, i) => (
              <Card key={i} className="text-center p-6 hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex justify-center mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-orange-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            To provide safe, comfortable, and spiritually enriching pilgrimage experiences to all devotees,
            making sacred journeys accessible and memorable for everyone.
          </p>
        </section>
      </div>
    </div>
  )
}
