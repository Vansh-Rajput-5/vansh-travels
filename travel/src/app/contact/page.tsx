"use client"

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Phone, MapPin, Clock, Send, Loader2, CircleHelp, Ban, CreditCard, BriefcaseBusiness } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

const contactInfo = [
  {
    icon: <MapPin className="w-6 h-6 text-blue-600" />,
    title: 'Address',
    content: 'Uttar Pradesh, India'
  },
  {
    icon: <Mail className="w-6 h-6 text-blue-600" />,
    title: 'Email',
    content: 'info@vanshtravels.com',
    link: 'mailto:info@vanshtravels.com'
  },
  {
    icon: <Phone className="w-6 h-6 text-blue-600" />,
    title: 'Phone',
    content: '+91 8685997685',
    link: 'tel:+918685997685'
  },
  {
    icon: <Clock className="w-6 h-6 text-blue-600" />,
    title: 'Business Hours',
    content: 'Mon - Sun: 24/7 Available'
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bookingId: '',
    issueType: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const helpTopics = [
    {
      value: 'cancel-booking',
      title: 'Cancel Booking',
      description: 'Cancel an existing booking using your booking ID and contact details.',
      icon: <Ban className="w-5 h-5 text-red-600" />
    },
    {
      value: 'payment-issue',
      title: 'Payment Issue',
      description: 'Report a payment that failed, is pending, or was deducted incorrectly.',
      icon: <CreditCard className="w-5 h-5 text-amber-600" />
    },
    {
      value: 'booking-help',
      title: 'Booking Help',
      description: 'Need help updating trip details or understanding your package?',
      icon: <BriefcaseBusiness className="w-5 h-5 text-blue-600" />
    },
    {
      value: 'general-query',
      title: 'General Query',
      description: 'Ask anything about routes, pricing, destinations, or travel planning.',
      icon: <CircleHelp className="w-5 h-5 text-green-600" />
    }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }

      if (field === 'issueType') {
        const selectedSubject = helpTopics.find((topic) => topic.value === value)?.title || ''
        next.subject = selectedSubject
      }

      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.issueType) {
        throw new Error('Please choose a help topic first.')
      }

      if (formData.issueType === 'cancel-booking') {
        const response = await fetch('/api/support/cancel-booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: formData.bookingId,
            email: formData.email,
            phone: formData.phone,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to cancel booking')
        }

        setSuccessMessage(data.message || 'Your booking has been cancelled successfully.')
      } else {
        setSuccessMessage('Your help request has been sent. Our team will contact you shortly.')
      }

      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        bookingId: '',
        issueType: '',
        subject: '',
        message: ''
      })

      setTimeout(() => {
        setSubmitSuccess(false)
        setSuccessMessage('')
      }, 5000)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Help & Contact
            </h1>
            <p className="text-xl text-blue-100">
              Get support for cancellations, payment issues, booking help, and general travel questions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      {info.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                    {info.link ? (
                      <a 
                        href={info.link}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-gray-600">{info.content}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {helpTopics.map((topic) => {
                  const isSelected = formData.issueType === topic.value

                  return (
                    <button
                      key={topic.value}
                      type="button"
                      onClick={() => handleInputChange('issueType', topic.value)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        isSelected ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {topic.icon}
                        <span className="font-semibold text-gray-900">{topic.title}</span>
                      </div>
                      <p className="text-sm text-gray-600">{topic.description}</p>
                    </button>
                  )
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Help & Support</CardTitle>
                  <CardDescription>
                    Choose a help topic and fill in your details below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
                    >
                      {successMessage}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="issueType">Help Topic *</Label>
                      <Select
                        value={formData.issueType}
                        onValueChange={(value) => handleInputChange('issueType', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select what you need help with" />
                        </SelectTrigger>
                        <SelectContent>
                          {helpTopics.map((topic) => (
                            <SelectItem key={topic.value} value={topic.value}>
                              {topic.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        required
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          placeholder="+91 8685997685"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {formData.issueType === 'cancel-booking' && (
                      <div>
                        <Label htmlFor="bookingId">Booking ID *</Label>
                        <Input
                          id="bookingId"
                          required
                          placeholder="Enter your booking ID"
                          value={formData.bookingId}
                          onChange={(e) => handleInputChange('bookingId', e.target.value)}
                          className="mt-1"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          We will match your booking ID with your email or phone number and cancel it immediately.
                        </p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        required
                        placeholder="What is this regarding?"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        required={formData.issueType !== 'cancel-booking'}
                        placeholder={
                          formData.issueType === 'cancel-booking'
                            ? 'Optional: add a short note before cancelling your booking...'
                            : 'Tell us more about your inquiry...'
                        }
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className="mt-1 min-h-[150px]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {formData.issueType === 'cancel-booking' ? 'Cancelling Booking...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {formData.issueType === 'cancel-booking' ? 'Cancel Booking Now' : 'Send Message'}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold mb-4">Help Topics</h2>
                <p className="text-gray-600 mb-6">
                  Whether you need to cancel a booking, resolve a payment issue, or ask about your travel plan, this help section is designed to get you to the right next step quickly.
                </p>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-xl text-blue-900">Self-Service Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-blue-800">
                    <p>Use `Cancel Booking` with your booking ID and email or phone to cancel directly from this page.</p>
                    <p>Choose `Payment Issue` if you paid but did not receive confirmation or if the payment is still pending.</p>
                    <p>Choose `Booking Help` for route changes, package details, or trip planning support.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Office Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">Head Office</p>
                        <p className="text-gray-600">
                          Uttar Pradesh, India
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">Email Us</p>
                        <a 
                          href="mailto:info@vanshtravels.com"
                          className="text-blue-600 hover:underline"
                        >
                          info@vanshtravels.com
                        </a>
                        <br />
                        <a 
                          href="mailto:support@vanshtravels.com"
                          className="text-blue-600 hover:underline"
                        >
                          support@vanshtravels.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold mb-1">Call Us</p>
                        <a 
                          href="tel:+918685997685"
                          className="text-blue-600 hover:underline"
                        >
                          +91 8685997685
                        </a>
                        <br />
                        <a 
                          href="tel:+918685997685"
                          className="text-blue-600 hover:underline"
                        >
                          +91 8685997685
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <CardHeader>
                  <CardTitle className="text-xl">Emergency Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Need immediate assistance during your trip? Our 24/7 emergency support team is always available.
                  </p>
                  <a 
                    href="tel:+919876543210"
                    className="inline-flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Emergency Line
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Find quick answers to common questions</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: 'How do I book a trip?',
                a: 'You can book a trip through our online booking form or by calling us directly. Simply provide your travel details and we\'ll take care of the rest.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept UPI payments, bank transfers, and cash payments. Payment details will be provided after booking confirmation.'
              },
              {
                q: 'Can I modify or cancel my booking?',
                a: 'Yes, you can modify or cancel your booking by contacting us. Cancellation policies vary based on the timing of your request.'
              },
              {
                q: 'Do you provide customized travel packages?',
                a: 'Absolutely! We offer customized travel packages tailored to your preferences and budget. Contact us to discuss your requirements.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.a}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
