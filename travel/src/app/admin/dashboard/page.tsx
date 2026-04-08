"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, LogOut, Search, Filter, Download } from 'lucide-react'
import { motion } from 'framer-motion'
interface Booking {
  id: number
  name: string
  email: string
  phone: string
  pickup: string
  drop: string
  travelDate: string
  tripDays: number
  members: number
  destination: string
  vehicleType: string
  distance: number
  price: number
  paymentStatus: string
  paymentId: string | null
  createdAt: string
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [updatingBookingIds, setUpdatingBookingIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterVehicle, setFilterVehicle] = useState('all')
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin')
      return
    }

    // Verify token
    verifyToken(token)
    
    // Fetch bookings
    fetchBookings()
  }, [])

  useEffect(() => {
    // Filter bookings based on search and filters
    let filtered = [...bookings]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm) ||
        booking.destination.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === filterStatus)
    }

    // Vehicle filter
    if (filterVehicle !== 'all') {
      filtered = filtered.filter(booking => booking.vehicleType === filterVehicle)
    }

    setFilteredBookings(filtered)
  }, [searchTerm, filterStatus, filterVehicle, bookings])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        localStorage.removeItem('adminToken')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Token verification error:', error)
      localStorage.removeItem('adminToken')
      router.push('/admin')
    }
  }

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
        setFilteredBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin')
  }

  const updateBookingStatus = async (bookingId: number, paymentStatus: string) => {
    setUpdatingBookingIds(prev => [...prev, bookingId])

    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin')
        return
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Failed to update status: ${error.error || 'Unknown error'}`)
        return
      }

      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId ? { ...booking, paymentStatus } : booking
        )
      )
    } catch (error) {
      console.error('Error updating booking status:', error)
      alert('Failed to update booking status')
    } finally {
      setUpdatingBookingIds(prev => prev.filter(id => id !== bookingId))
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      cancelled: "outline"
    }
    
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Pickup', 'Drop', 'Travel Date', 'Trip Days', 'Members', 'Destination', 'Vehicle', 'Distance', 'Price', 'Payment Status', 'Date']
    const rows = filteredBookings.map(booking => [
      booking.id,
      booking.name,
      booking.email,
      booking.phone,
      booking.pickup,
      booking.drop,
      booking.travelDate || '-',
      booking.tripDays || '-',
      booking.members || '-',
      booking.destination,
      booking.vehicleType,
      booking.distance,
      booking.price,
      booking.paymentStatus,
      new Date(booking.createdAt).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Vansh Travels</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle className="text-3xl">{bookings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {bookings.filter(b => b.paymentStatus === 'completed').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {bookings.filter(b => b.paymentStatus === 'pending').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                ₹{bookings.reduce((sum, b) => sum + b.price, 0).toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterVehicle} onValueChange={setFilterVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Tempo Traveller">Tempo Traveller</SelectItem>
                  <SelectItem value="Mini Bus">Mini Bus</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportToCSV} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
            <CardDescription>
              Manage and view all customer bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No bookings found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Trip Details</TableHead>
                      <TableHead>Travel Date</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Update Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.name}</p>
                            <p className="text-sm text-gray-500">{booking.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{booking.phone}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p><strong>From:</strong> {booking.pickup}</p>
                            <p><strong>To:</strong> {booking.drop}</p>
                            <p className="text-blue-600">{booking.destination}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {booking.travelDate || '-'}
                        </TableCell>
                        <TableCell>{booking.tripDays ? `${booking.tripDays} days` : '-'}</TableCell>
                        <TableCell>{booking.members ? `${booking.members}` : '-'}</TableCell>
                        <TableCell>{booking.vehicleType}</TableCell>
                        <TableCell>{booking.distance} km</TableCell>
                        <TableCell className="font-semibold">₹{booking.price.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(booking.paymentStatus)}</TableCell>
                        <TableCell>
                          <Select
                            value={booking.paymentStatus}
                            onValueChange={(value) => updateBookingStatus(booking.id, value)}
                            disabled={updatingBookingIds.includes(booking.id)}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Set status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
