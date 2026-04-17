"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Plane, MapPin, Calendar } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Image from 'next/image'

const PRICE_PER_KM = 17
const MEMBER_CHARGE_RATE = 0.1

import { destinations } from '@/constants/destinations'

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickup: '',
    travelDate: '',
    tripDays: '',
    members: '',
    destination: '',
    vehicleType: '',
    distance: ''
  })

  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)
  const [distanceError, setDistanceError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingCancelled, setBookingCancelled] = useState(false)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const distanceRequestRef = useRef(0)

  const selectedDestination = destinations.find(d => d.name === formData.destination)

  const calculateTotalPrice = (distanceKm: number, membersValue: string, daysValue: string, vehicleType: string) => {
    const members = parseInt(membersValue, 10)
    const validMembers = Number.isNaN(members) || members <= 0 ? 1 : members
    const days = parseInt(daysValue, 10)
    const validDays = Number.isNaN(days) || days <= 0 ? 1 : days
    
    let basePrice = distanceKm * PRICE_PER_KM
    
    // Scale by valid days naturally
    basePrice = basePrice * validDays * validMembers
    
    // Per the user request: "only add 2% per day in booking and 2% on car and 1% in single member price"
    // Apply 2% increase per day
    basePrice = basePrice * Math.pow(1.02, validDays)
    
    // Apply 2% increase for a vehicle selection
    if (vehicleType) basePrice *= 1.02
    
    // Apply 1% increase per single member
    basePrice = basePrice * Math.pow(1.01, validMembers)

    // Apply 90% discount — show only 10% as final price
    return basePrice * 0.1
  }

  // Generate UPI payment URL
  const generateUpiUrl = () => {
    const upiId = 'chauhanshabji001@okhdfcbank'
    const amount = calculatedPrice.toFixed(2)
    const transactionNote = 'Booking'
    return `upi://pay?pa=${upiId}&am=${amount}&tn=${transactionNote}`
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }

      if (field === 'pickup' || field === 'destination') {
        next.distance = ''
      }

      return next
    })

    if (field === 'pickup' || field === 'destination') {
      setCalculatedPrice(0)
      setDistanceError('')
    }
  }

  const calculateDistance = async (pickup: string, destination: string) => {
    const requestId = ++distanceRequestRef.current
    setIsCalculatingDistance(true)
    setDistanceError('')

    try {
      const response = await fetch('/api/distance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pickup, drop: destination })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Unable to calculate distance')
      }

      const data = await response.json()

      if (requestId !== distanceRequestRef.current) {
        return
      }

      const distanceValue = Number(data.distanceKm || 0)

      if (!distanceValue || distanceValue <= 0) {
        throw new Error('Unable to calculate distance')
      }

      setFormData(prev => ({ ...prev, distance: distanceValue.toFixed(1) }))
    } catch (error) {
      if (requestId !== distanceRequestRef.current) {
        return
      }

      setFormData(prev => ({ ...prev, distance: '' }))
      setCalculatedPrice(0)
      setDistanceError(error instanceof Error ? error.message : 'Unable to calculate distance')
    } finally {
      if (requestId === distanceRequestRef.current) {
        setIsCalculatingDistance(false)
      }
    }
  }

  useEffect(() => {
    const pickup = formData.pickup.trim()
    const destination = formData.destination.trim()

    if (!pickup || !destination) {
      distanceRequestRef.current += 1
      setIsCalculatingDistance(false)
      return
    }

    const timer = setTimeout(() => {
      calculateDistance(pickup, destination)
    }, 700)

    return () => clearTimeout(timer)
  }, [formData.pickup, formData.destination])

  useEffect(() => {
    const distanceValue = parseFloat(formData.distance)

    if (Number.isNaN(distanceValue) || distanceValue <= 0) {
      setCalculatedPrice(0)
      return
    }

    setCalculatedPrice(calculateTotalPrice(distanceValue, formData.members, formData.tripDays, formData.vehicleType))
  }, [formData.distance, formData.members, formData.tripDays, formData.vehicleType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const finalDestination = formData.destination.trim()

      if (!finalDestination) {
        alert('Please select your destination')
        setIsSubmitting(false)
        return
      }

      const tripDays = parseInt(formData.tripDays, 10)
      if (Number.isNaN(tripDays) || tripDays <= 0) {
        alert('Please select trip package days')
        setIsSubmitting(false)
        return
      }

      const members = parseInt(formData.members, 10)
      if (Number.isNaN(members) || members <= 0) {
        alert('Please select how many members are going')
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pickup: formData.pickup,
          drop: finalDestination,
          travelDate: formData.travelDate,
          tripDays,
          members,
          destination: finalDestination,
          vehicleType: formData.vehicleType,
          distance: parseFloat(formData.distance),
          price: calculatedPrice,
          paymentStatus: 'pending'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBookingId(data.id)
        setShowPayment(true)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to create booking'}`)
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to submit booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayment = async () => {
    if (!bookingId) {
      alert('Your booking could not be found. Please submit the booking again.')
      return
    }

    setIsSubmitting(true)

    try {
      const paymentId = `UPI-${bookingId}-${Date.now()}`
      const response = await fetch(`/api/bookings/${bookingId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          paymentStatus: 'completed'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to confirm payment')
      }

      setBookingSuccess(true)
    } catch (error) {
      console.error('Payment confirmation error:', error)
      alert(error instanceof Error ? error.message : 'Failed to confirm payment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetBookingFlow = () => {
    setBookingId(null)
    setShowPayment(false)
    setBookingSuccess(false)
  }

  const handleCancelBooking = async () => {
    if (!bookingId) {
      alert('There is no active booking to cancel.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel booking')
      }

      resetBookingFlow()
      setBookingCancelled(true)
    } catch (error) {
      console.error('Booking cancellation error:', error)
      alert(error instanceof Error ? error.message : 'Failed to cancel booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (bookingCancelled) {
    return (
      <div className="min-h-full flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 travel-bg-light z-0" />

        <div className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
          <Card className="max-w-md mx-auto glow-card">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Booking Cancelled
              </CardTitle>
              <CardDescription className="text-base">
                Your booking has been cancelled successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-gray-600">
                You can start a new booking anytime when you are ready.
              </p>
              <Button
                onClick={() => {
                  setBookingCancelled(false)
                  window.location.href = '/booking'
                }}
                className="w-full glow-button text-white"
              >
                Start New Booking
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    )
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-full flex flex-col relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 travel-bg-light z-0" />
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <Card className="max-w-md mx-auto glow-card success-glow">
              <CardHeader className="text-center">
                <motion.div 
                  className="flex justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <CheckCircle className="w-24 h-24 text-green-500 drop-shadow-lg" />
                </motion.div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Booking Confirmed!
                </CardTitle>
                <CardDescription className="text-lg">
                  Your adventure awaits! ✈️
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <motion.div 
                  className="relative p-6 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-sm text-white/80 mb-2 font-medium">Booking ID</p>
                  <p className="text-4xl font-bold text-white tracking-wider">#{bookingId}</p>
                  <motion.div
                    className="absolute inset-0 shimmer-effect rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  />
                </motion.div>

                <div className="space-y-3 text-gray-700">
                  <p className="flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>Confirmation sent to <strong>{formData.email}</strong></span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span>We'll contact you shortly to confirm details</span>
                  </p>
                </div>

                <Button 
                  onClick={() => window.location.href = '/'} 
                  className="w-full glow-button text-white text-lg py-6"
                >
                  <Plane className="mr-2 h-5 w-5" />
                  Explore More Destinations
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCancelBooking}
                  className="w-full border-2 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Booking'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (showPayment) {
    const upiUrl = generateUpiUrl()
    
    return (
      <div className="min-h-full flex flex-col relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 travel-bg z-0" />
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/20" />
        </div>

        <div className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="glow-card backdrop-blur-sm bg-white/95">
              <CardHeader>
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Complete Payment
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Scan QR code to pay via any UPI app
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div 
                  className="relative p-6 rounded-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/90 font-medium">Total Amount</span>
                    <motion.span 
                      className="text-4xl font-bold text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                    >
                      ₹{calculatedPrice.toFixed(2)}
                    </motion.span>
                  </div>
                  <div className="text-sm text-white/80 space-y-1">
                    <p>📍 Distance: {formData.distance} km</p>
                    <p>💰 Rate: ₹{PRICE_PER_KM}/km</p>
                  </div>
                  <motion.div
                    className="absolute inset-0 shimmer-effect"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Scan to Pay</p>
                    <p className="text-xs text-gray-500 mb-4">Use Google Pay, PhonePe, Paytm or any UPI app</p>
                  </div>

                  <motion.div 
                    className="bg-white p-8 rounded-2xl border-4 border-purple-200 shadow-2xl mx-auto w-fit floating"
                    whileHover={{ scale: 1.05 }}
                    style={{
                      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <QRCodeSVG 
                      value={upiUrl}
                      size={220}
                      level="H"
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </motion.div>

                  <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">UPI ID: chauhanshabji001@okhdfcbank</p>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isSubmitting}
                    className="w-full glow-button text-white text-lg py-6"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        I Have Completed Payment
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowPayment(false)}
                    className="w-full border-2 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    ← Back to Booking
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleCancelBooking}
                    className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Booking'
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col relative overflow-hidden">
      {/* Hero Section with Destination Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] z-0">
        {selectedDestination ? (
          <motion.div
            key={selectedDestination.value}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-full"
          >
            <Image
              src={selectedDestination.image}
              alt={selectedDestination.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-white" />
          </motion.div>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
              alt="Mountains"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-white" />
          </div>
        )}
        
        {/* Floating animated elements */}
        <motion.div
          className="absolute top-20 right-20 w-20 h-20 opacity-20"
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <Plane className="w-full h-full text-white" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-40 left-10 w-16 h-16 opacity-20"
          animate={{ 
            y: [0, 20, 0],
            x: [0, -10, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <MapPin className="w-full h-full text-white" />
        </motion.div>
      </div>

      <div className="flex-1 py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 pt-20"
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-2xl"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Book Your Dream Journey
            </motion.h1>
            <motion.p 
              className="text-xl text-white/90 drop-shadow-lg"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              ✨ Start your adventure with us today ✨
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="glow-card backdrop-blur-sm bg-white/98">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Booking Details
                </CardTitle>
                <CardDescription className="text-base">
                  Fill in your travel information below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        1
                      </div>
                      Personal Information
                    </h3>
                    
                    <div>
                      <Label htmlFor="name" className="text-base font-medium">Full Name *</Label>
                      <Input
                        id="name"
                        required
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-2 glow-input h-12 text-base"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="text-base font-medium">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-2 glow-input h-12 text-base"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-base font-medium">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="mt-2 glow-input h-12 text-base"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Trip Details */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        2
                      </div>
                      Trip Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pickup" className="text-base font-medium">Pickup Location *</Label>
                        <Input
                          id="pickup"
                          required
                          placeholder="Enter pickup location"
                          value={formData.pickup}
                          onChange={(e) => handleInputChange('pickup', e.target.value)}
                          className="mt-2 glow-input h-12 text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="destination" className="text-base font-medium">Dream Destination *</Label>
                      <Select 
                        value={formData.destination} 
                        onValueChange={(value) => handleInputChange('destination', value)}
                      >
                        <SelectTrigger className="mt-2 h-12 text-base glow-input">
                          <SelectValue placeholder="Choose your destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {destinations.map((destination) => (
                            <SelectItem key={destination.name} value={destination.name}>
                              {destination.emoji} {destination.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicleType" className="text-base font-medium">Vehicle Type *</Label>
                        <Select 
                          value={formData.vehicleType} 
                          onValueChange={(value) => handleInputChange('vehicleType', value)}
                        >
                          <SelectTrigger className="mt-2 h-12 text-base glow-input">
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sedan">🚗 Sedan</SelectItem>
                            <SelectItem value="SUV">🚙 SUV</SelectItem>
                            <SelectItem value="Tempo Traveller">🚐 Tempo Traveller</SelectItem>
                            <SelectItem value="Mini Bus">🚌 Mini Bus</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="travelDate" className="text-base font-medium">Travel Date *</Label>
                        <Input
                          id="travelDate"
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.travelDate}
                          onChange={(e) => handleInputChange('travelDate', e.target.value)}
                          className="mt-2 glow-input h-12 text-base"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tripDays" className="text-base font-medium">Trip Package (Days) *</Label>
                        <Select
                          value={formData.tripDays}
                          onValueChange={(value) => handleInputChange('tripDays', value)}
                        >
                          <SelectTrigger className="mt-2 h-12 text-base glow-input">
                            <SelectValue placeholder="Select package days" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Day</SelectItem>
                            <SelectItem value="2">2 Days</SelectItem>
                            <SelectItem value="3">3 Days</SelectItem>
                            <SelectItem value="4">4 Days</SelectItem>
                            <SelectItem value="5">5 Days</SelectItem>
                            <SelectItem value="6">6 Days</SelectItem>
                            <SelectItem value="7">7 Days</SelectItem>
                            <SelectItem value="10">10 Days</SelectItem>
                            <SelectItem value="15">15 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="members" className="text-base font-medium">Members Going *</Label>
                        <Select
                          value={formData.members}
                          onValueChange={(value) => handleInputChange('members', value)}
                        >
                          <SelectTrigger className="mt-2 h-12 text-base glow-input">
                            <SelectValue placeholder="Select members" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Member</SelectItem>
                            <SelectItem value="2">2 Members</SelectItem>
                            <SelectItem value="3">3 Members</SelectItem>
                            <SelectItem value="4">4 Members</SelectItem>
                            <SelectItem value="5">5 Members</SelectItem>
                            <SelectItem value="6">6 Members</SelectItem>
                            <SelectItem value="8">8 Members</SelectItem>
                            <SelectItem value="10">10 Members</SelectItem>
                            <SelectItem value="12">12 Members</SelectItem>
                            <SelectItem value="15">15 Members</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                      <div>
                        <Label htmlFor="distance" className="text-base font-medium">Distance (km) *</Label>
                        <Input
                          id="distance"
                          type="text"
                          value={isCalculatingDistance ? 'Calculating distance...' : (formData.distance ? `${formData.distance} km` : '')}
                          placeholder="Distance will be auto-calculated"
                          readOnly
                          className="mt-2 glow-input h-12 text-base"
                        />
                        {distanceError && (
                          <p className="mt-2 text-sm text-red-500">{distanceError}</p>
                        )}
                      </div>
                  </motion.div>

                  {/* Price Calculation */}
                  {calculatedPrice > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="relative p-8 rounded-2xl overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-white">
                          <p className="text-lg font-medium mb-2">Total Price</p>
                        </div>
                        <motion.div 
                          className="text-right"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.6, type: "spring" }}
                        >
                          <p className="text-5xl font-bold text-white drop-shadow-lg">
                            ₹{calculatedPrice.toFixed(2)}
                          </p>
                        </motion.div>
                      </div>
                      <motion.div
                        className="absolute inset-0 shimmer-effect"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      />
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting || !calculatedPrice}
                      className="w-full glow-button text-white text-xl py-8 font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Plane className="mr-2 h-6 w-6" />
                          Proceed to Payment
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

    </div>
  )
}
