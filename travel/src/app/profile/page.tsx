"use client"

import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, MapPin, Plane, Car, Loader2, Banknote, Shield, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return
      setLoadingBookings(true)
      try {
        const res = await fetch(`/api/bookings?email=${user.email}`)
        if (res.ok) {
          const data = await res.json()
          setBookings(data)
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error)
      } finally {
        setLoadingBookings(false)
      }
    }
    fetchBookings()
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen travel-bg-light py-12 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full filter blur-[100px] opacity-20 -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full filter blur-[100px] opacity-20 -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Detail Sidebar */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glow-card backdrop-blur-sm bg-white/95 sticky top-24">
                <CardContent className="pt-10 flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl shadow-blue-100">
                      <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} />
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-8 w-8 bg-green-500 ring-4 ring-white rounded-full flex items-center justify-center tooltip-trigger group cursor-help">
                      <Shield className="w-4 h-4 text-white" />
                      <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white text-xs py-1 px-2 rounded">
                        Verified Member
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="mt-6 text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {user.name}
                  </h2>
                  <p className="text-slate-500 font-medium">{user.email}</p>
                  
                  <div className="w-full mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Member Since</span>
                      <span className="text-slate-800 font-semibold">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Total Bookings</span>
                      <span className="text-slate-800 font-semibold">{bookings.length}</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors py-6 text-base font-semibold rounded-xl"
                    onClick={logout}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Secure Logout
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Bookings History Area */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Your Journey History</h1>
                <Link href="/booking">
                  <Button className="glow-button bg-blue-600 text-white rounded-full px-6">
                    <Plane className="w-4 h-4 mr-2" />
                    New Booking
                  </Button>
                </Link>
              </div>

              {loadingBookings ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                </div>
              ) : bookings.length === 0 ? (
                <Card className="text-center py-16 bg-white/60 backdrop-blur border-dashed border-2 border-slate-300">
                  <CardContent>
                    <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4 opacity-50" />
                    <CardTitle className="text-xl text-slate-600 mb-2">No past adventures found</CardTitle>
                    <CardDescription className="text-base max-w-md mx-auto mb-6">
                      You haven't made any bookings yet. Start exploring the world with Vansh Travels today!
                    </CardDescription>
                    <Link href="/booking">
                      <Button className="glow-button text-white">Start Exploring</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {bookings.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <Card className="glow-card overflow-hidden hover:scale-[1.01] transition-transform duration-300">
                        <div className="flex flex-col md:flex-row">
                          <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 flex flex-col justify-center items-center text-white md:w-48 shrink-0">
                            <span className="text-xs uppercase font-bold tracking-wider opacity-80 mb-1">Booking ID</span>
                            <span className="text-2xl font-black">#{booking.id}</span>
                            <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.paymentStatus === 'completed' ? 'bg-green-500/20 text-green-100 border border-green-400/30' :
                              booking.paymentStatus === 'cancelled' ? 'bg-red-500/20 text-red-100 border border-red-400/30' :
                              'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
                            }`}>
                              {booking.paymentStatus.toUpperCase()}
                            </div>
                          </div>
                          
                          <CardContent className="flex-1 p-6">
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">
                                  {booking.pickup} <span className="text-slate-400 font-normal mx-2">→</span> {booking.destination}
                                </h3>
                                <div className="flex items-center text-slate-500 space-x-4 text-sm mt-2">
                                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(booking.travelDate).toLocaleDateString()}</span>
                                  <span className="flex items-center gap-1.5"><Car className="w-4 h-4" /> {booking.vehicleType}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-sm text-slate-500 font-medium mb-1">Total Paid</span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-end">
                                  <Banknote className="w-5 h-5 text-blue-500 mr-1" /> ₹{booking.price}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-500 font-medium mb-1">Members</p>
                                <p className="font-semibold text-slate-900">{booking.members} Persons</p>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-500 font-medium mb-1">Duration</p>
                                <p className="font-semibold text-slate-900">{booking.tripDays} Days</p>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-500 font-medium mb-1">Distance</p>
                                <p className="font-semibold text-slate-900">{booking.distance} km</p>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-500 font-medium mb-1">Booked On</p>
                                <p className="font-semibold text-slate-900">{new Date(booking.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            {booking.paymentStatus === 'completed' && (
                              <div className="mt-6 flex justify-end">
                                <Link href={`/reviews/add?destination=${booking.destination}&bookingId=${booking.id}`}>
                                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                    Rate this trip ⭐
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
