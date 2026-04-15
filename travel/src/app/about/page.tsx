"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Award, Users, MapPin, Heart } from 'lucide-react'
import Image from 'next/image'

const stats = [
  { icon: <Users className="w-8 h-8 text-blue-600" />, value: '10,000+', label: 'Happy Customers' },
  { icon: <MapPin className="w-8 h-8 text-blue-600" />, value: '50+', label: 'Destinations' },
  { icon: <Award className="w-8 h-8 text-blue-600" />, value: '15+', label: 'Years Experience' },
  { icon: <Heart className="w-8 h-8 text-blue-600" />, value: '100%', label: 'Satisfaction Rate' }
]

const team = [
  {
    name: 'Vansh',
    role: 'Founder & CEO',
    description: 'With over 15 years of experience in the travel industry, Vansh leads Vansh Travels with a vision to provide exceptional travel experiences.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'
  },
  {
    name: 'Akash Chauhan',
    role: 'Head of Operations',
    description: 'Akash ensures smooth operations and maintains our fleet to the highest standards, guaranteeing safe and comfortable journeys.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'
  }
]

const values = [
  {
    title: 'Safety First',
    description: 'Your safety is our top priority. All our vehicles are regularly maintained and our drivers are experienced professionals.',
    icon: '🛡️'
  },
  {
    title: 'Customer Satisfaction',
    description: 'We go above and beyond to ensure every journey exceeds your expectations and creates lasting memories.',
    icon: '😊'
  },
  {
    title: 'Reliability',
    description: 'We pride ourselves on punctuality and reliability, ensuring you reach your destination on time, every time.',
    icon: '⏰'
  },
  {
    title: 'Transparency',
    description: 'No hidden charges, no surprises. We believe in transparent pricing and honest communication.',
    icon: '💎'
  }
]

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
            alt="About us"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            About Vansh Travels
          </h1>
          <p className="text-xl md:text-2xl text-gray-200">
            Your trusted travel partner since 2009
          </p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
              <p>
                Founded in 2009 in Uttar Pradesh, Vansh Travels began with a simple mission: to make travel comfortable, 
                safe, and accessible for everyone. What started as a small operation with just two vehicles has grown into 
                one of the most trusted travel service providers in North India.
              </p>
              <p>
                Over the years, we've had the privilege of serving thousands of satisfied customers, helping them explore 
                the magnificent destinations of the Himalayas and beyond. Our commitment to quality service, customer 
                satisfaction, and safety has earned us a reputation that we're proud of.
              </p>
              <p>
                Today, with a fleet of well-maintained vehicles and a team of experienced drivers, we continue to deliver 
                on our promise of making every journey memorable. Whether it's a spiritual pilgrimage to Kedarnath, an 
                adventurous trip to Kullu Manali, or a peaceful retreat to Mussoorie, we're here to make your travel 
                dreams come true.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-4">{value.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600">
              The people behind your memorable journeys
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-80">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl">{member.name}</CardTitle>
                    <p className="text-blue-600 font-semibold">{member.role}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{member.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Travel with Us?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Experience the difference of traveling with a trusted partner
            </p>
            <a href="/booking">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
                Book Your Journey
              </button>
            </a>
          </motion.div>
        </div>
      </section>

    </>
  )
}
