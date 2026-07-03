import { Phone, MapPin, MessageCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-orange-100">We&apos;re here to help you plan your sacred journey</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Get in Touch</h2>

            {[
              {
                icon: <Phone className="text-orange-600" size={24} />,
                title: 'Phone',
                content: (
                  <div className="space-y-1">
                    <a href="tel:9773834051" className="block text-orange-600 hover:underline font-medium">9773834051</a>
                    <a href="tel:8864910917" className="block text-orange-600 hover:underline font-medium">8864910917</a>
                  </div>
                )
              },
              {
                icon: <MessageCircle className="text-green-600" size={24} />,
                title: 'WhatsApp',
                content: <a href="https://wa.me/919773834051" target="_blank" className="text-green-600 hover:underline font-medium">Chat on WhatsApp</a>
              },
              {
                icon: <MapPin className="text-orange-600" size={24} />,
                title: 'Pickup Point',
                content: <div className="text-gray-600">Sector 52, Noida<br />Metro Pillar No. 657</div>
              },
              {
                icon: <Clock className="text-orange-600" size={24} />,
                title: 'Contact Person',
                content: <div className="text-gray-600 font-medium">YOGESH THAKUR</div>
              }
            ].map((item, i) => (
              <Card key={i}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="mt-0.5">{item.icon}</div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">{item.title}</div>
                    {item.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send a Message</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p className="text-gray-600 mb-4">Reach us directly via:</p>
                <div className="space-y-3">
                  <a href="tel:9773834051" className="flex items-center justify-center gap-2 w-full py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors">
                    <Phone size={18} /> Call Now: 9773834051
                  </a>
                  <a href="https://wa.me/919773834051" target="_blank" className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                    <MessageCircle size={18} /> WhatsApp: 9773834051
                  </a>
                </div>
                <p className="text-sm text-gray-400 mt-4">Available: 9 AM – 9 PM daily</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
