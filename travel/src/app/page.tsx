"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Car, Shield, Clock, Plane, Star, TrendingUp, Award } from 'lucide-react'
import { motion } from 'framer-motion'

import { destinations } from '@/constants/destinations'
import { Heart, MessageCircle, Search, ArrowRight, Building, Bus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const features = [
  {
    icon: <Car className="w-12 h-12" />,
    title: 'Comfortable Vehicles',
    description: 'Well-maintained fleet of sedans, SUVs, and buses for your journey',
    color: 'from-blue-500 to-cyan-500',
    emoji: '🚗'
  },
  {
    icon: <Shield className="w-12 h-12" />,
    title: 'Safe & Secure',
    description: 'Experienced drivers and 24/7 support for a worry-free trip',
    color: 'from-purple-500 to-pink-500',
    emoji: '🛡️'
  },
  {
    icon: <MapPin className="w-12 h-12" />,
    title: 'Multiple Destinations',
    description: 'Explore beautiful locations across North India',
    color: 'from-green-500 to-emerald-500',
    emoji: '📍'
  },
  {
    icon: <Clock className="w-12 h-12" />,
    title: 'Flexible Timing',
    description: 'Book at your convenience with flexible pickup times',
    color: 'from-orange-500 to-red-500',
    emoji: '⏰'
  }
]

const stats = [
  { icon: <Star className="w-8 h-8" />, value: '4.9/5', label: 'Customer Rating', emoji: '⭐' },
  { icon: <TrendingUp className="w-8 h-8" />, value: '10K+', label: 'Happy Travelers', emoji: '🎉' },
  { icon: <MapPin className="w-8 h-8" />, value: '50+', label: 'Destinations', emoji: '🌍' },
  { icon: <Award className="w-8 h-8" />, value: '15+', label: 'Years Experience', emoji: '🏆' }
]

export default function Home() {
  const { user } = useAuth()
  const [likedDestinations, setLikedDestinations] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const sliderRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const filteredDestinations = destinations.filter(dest => 
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Reset scroll position when search results change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'instant' })
    }
  }, [searchQuery])

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -400, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 400, behavior: 'smooth' })
    }
  }

  const handleLike = (e: React.MouseEvent, destName: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.error("Please login to save favorite destinations!")
      return
    }
    setLikedDestinations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(destName)) {
        newSet.delete(destName)
        toast.info(`Removed ${destName} from favorites`)
      } else {
        newSet.add(destName)
        toast.success(`Added ${destName} to favorites! ❤️`)
      }
      return newSet
    })
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = 400
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <>
      {/* Hero Section with Enhanced Animations */}
      <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
            alt="Mountain landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>

        {/* Animated Floating Elements */}
        <motion.div
          className="absolute top-20 right-20 w-24 h-24 opacity-20"
          animate={{ 
            y: [0, -40, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <Plane className="w-full h-full text-white" />
        </motion.div>

        <motion.div
          className="absolute bottom-40 left-10 w-20 h-20 opacity-15"
          animate={{ 
            y: [0, 30, 0],
            x: [0, -15, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <MapPin className="w-full h-full text-white" />
        </motion.div>

        {/* Floating Orbs */}
        <div className="absolute top-32 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-32 right-1/4 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full text-black font-semibold mb-8 glow-card">
              ✨ Welcome to Vansh Travels ✨
            </span> 
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
              Discover Your Next
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
              Adventure Journey
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience comfortable and reliable travel services to the most breathtaking destinations across India 🗺️
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/booking">
              <Button size="lg" className="glow-button text-white px-10 py-7 text-xl font-semibold group">
                <Plane className="mr-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                Book Your Journey Now
              </Button>
            </Link>
            <Link href="#destinations">
              <Button size="lg" variant="outline" className="px-10 py-7 text-xl font-semibold bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-blue-600 transition-all">
                Explore Destinations 🌍
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 bg-white/95 backdrop-blur rounded-2xl p-3 flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto shadow-2xl overflow-hidden"
          >
            <div className="flex-1 w-full relative flex items-center">
              <Search className="w-6 h-6 text-slate-400 absolute left-4" />
              <input 
                type="text" 
                placeholder="Search destinations, attractions, or activities..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-14 pr-4 bg-transparent outline-none text-slate-800 text-lg placeholder:text-slate-500"
              />
            </div>
            <Button 
              onClick={() => {
                document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="h-14 px-8 w-full md:w-auto bg-[#DC3545] hover:bg-[#c82333] text-white rounded-xl text-lg font-bold transition-colors shrink-0"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm md:text-base font-semibold"
          >
            <span className="text-white/80 uppercase tracking-wider mr-2 text-xs font-bold">Popular:</span>
             {['Manali', 'Leh', 'Goa', 'Shimla', 'Jaipur'].map((place) => (
              <button 
                onClick={() => {
                  setSearchQuery(place)
                  setTimeout(() => {
                    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                key={place} 
                className="bg-white/20 hover:bg-white text-white hover:text-slate-900 px-4 py-1.5 rounded-full backdrop-blur-md transition-colors shadow-sm flex items-center gap-2"
              >
                🇮🇳 {place}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 travel-bg overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Card className="glow-card backdrop-blur-sm bg-white/95 hover:scale-105 transition-transform">
                  <CardContent className="pt-8 pb-8">
                    <motion.div 
                      className="flex justify-center mb-4 text-blue-600"
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                    >
                      {stat.icon}
                    </motion.div>
                    <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                    <div className="text-3xl mt-2">{stat.emoji}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 travel-bg-light opacity-60" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Why Choose Vansh Travels?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your comfort, safety, and satisfaction are our top priorities 🎯
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="glow-card text-center h-full backdrop-blur-sm bg-white/95 overflow-hidden group">
                  <CardContent className="pt-10 pb-8 relative">
                    <motion.div 
                      className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${feature.color}`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                      viewport={{ once: true }}
                    />
                    
                    <motion.div 
                      className={`flex justify-center mb-6 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {feature.icon}
                    </motion.div>
                    
                    <div className="text-4xl mb-4">{feature.emoji}</div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    
                    <motion.div
                      className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Popular Dream Destinations
              </span>
            </h2>
            <div className="flex justify-center gap-4 mb-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-[#AC2424] text-[#AC2424] hover:bg-[#AC2424] hover:text-white"
                onClick={() => scroll('left')}
              >
                <ChevronLeft size={24} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-[#AC2424] text-[#AC2424] hover:bg-[#AC2424] hover:text-white"
                onClick={() => scroll('right')}
              >
                <ChevronRight size={24} />
              </Button>
            </div>
          </motion.div>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar scroll-smooth snap-x min-h-[500px]"
          >
            {filteredDestinations.length > 0 ? (
              filteredDestinations.map((destination, index) => (
              <div
                key={index}
                className="min-w-[300px] md:min-w-[350px] lg:min-w-[400px] snap-start"
              >
                <Card className="overflow-hidden glow-card group backdrop-blur-sm bg-white/95 flex flex-col h-full relative">
                  <div className="relative h-64 w-full overflow-hidden shrink-0">
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div 
                      className="absolute top-4 right-4 text-6xl transition-transform duration-500 group-hover:scale-110"
                    >
                      {destination.emoji}
                    </div>
                      <div className="absolute top-4 left-4 bg-[#DC3545] text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg z-10">
                        BEST SELLING
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-grow">
                      <CardHeader className="pb-2 px-6 pt-6">
                        <div className="flex justify-between items-start mb-1">
                          <CardTitle className="text-xl font-bold text-slate-800">
                            {destination.name}
                          </CardTitle>
                          <button 
                            onClick={(e) => handleLike(e, destination.name)}
                            className={`transition-all hover:scale-110 ${likedDestinations.has(destination.name) ? 'text-red-500' : 'text-slate-300 hover:text-red-500'}`}
                          >
                            <Heart fill={likedDestinations.has(destination.name) ? 'currentColor' : 'none'} size={22} />
                          </button>
                        </div>
                        <CardDescription className="text-lg leading-relaxed text-gray-600 line-clamp-2">
                          {destination.description}
                        </CardDescription>
                      </CardHeader>
                    
                    <CardContent className="flex flex-col flex-grow justify-between mt-2 pt-0 px-6 pb-6">

                      <div className="mb-6">
                        <p className="text-[13px] font-bold uppercase tracking-widest text-slate-500 mb-3">Tours Highlights</p>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-2">
                          {destination.highlights.map((highlight, i) => (
                            <div 
                              key={i}
                              className="flex items-center text-sm text-slate-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis hover:translate-x-1 transition-transform"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 shrink-0" />
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-4 mt-auto pt-4 border-t border-slate-100">
                        <Link href={`/booking?destination=${destination.name}`} className="flex-1">
                          <Button className="w-full bg-[#DC3545] hover:bg-[#c82333] text-white font-bold h-11">
                            <Plane className="mr-2 h-4 w-4" /> Book Now
                          </Button>
                        </Link>
                        <Link href={`/reviews?destination=${destination.name}`} className="w-1/3">
                          <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 font-bold h-11 text-xs">
                            <MessageCircle className="mr-1.5 h-4 w-4" /> Reviews
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>

                  <div
                    className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 pointer-events-none"
                  />
                </Card>
              </div>
            ))
          ) : (
            <div className="w-full py-20 text-center">
              <p className="text-2xl text-slate-400 font-medium">No destinations found for "{searchQuery}"</p>
              <Button 
                variant="link" 
                className="mt-4 text-[#DC3545] font-bold text-lg"
                onClick={() => setSearchQuery("")}
              >
                Clear all filters
              </Button>
            </div>
          )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 travel-bg" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-80 h-80 bg-blue-400 rounded-full filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-7xl mb-8"
            >
              ✈️
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-2xl">
              Ready to Start Your Dream Journey?
            </h2>
            
            <p className="text-xl md:text-2xl mb-10 text-white/90 drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
              Book your trip today and experience the best travel services with unforgettable memories 🌟
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/booking">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="glow-button text-white px-12 py-8 text-xl font-semibold group backdrop-blur-sm">
                    <Plane className="mr-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    Book Your Adventure Now
                  </Button>
                </motion.div>
              </Link>
              
              <Link href="/contact">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="px-12 py-8 text-xl font-semibold bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white hover:text-blue-600 transition-all">
                    Contact Us 💬
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </>
  )
}
