"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, Loader2, MessageSquareQuote } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function ReviewsList() {
  const searchParams = useSearchParams()
  const destination = searchParams.get('destination') || 'Travels'
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/reviews?destination=${destination}`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data)
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReviews()
  }, [destination])

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 w-12 h-12" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Reviews for <span className="text-blue-600 border-b-4 border-yellow-400">{destination}</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See what other adventurers are saying about their journey.
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8">
          <Link href={`/reviews/add?destination=${destination}`}>
            <Button className="glow-button bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-6 rounded-full text-lg shadow-lg shadow-yellow-200">
              <Star className="w-5 h-5 mr-2 fill-current" />
              Write a Review
            </Button>
          </Link>
        </motion.div>
      </div>

      {reviews.length === 0 ? (
        <Card className="text-center py-20 bg-white/50 backdrop-blur border-dashed border-2">
          <CardContent>
            <MessageSquareQuote className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <CardTitle className="text-2xl text-slate-700 mb-2">No reviews yet</CardTitle>
            <p className="text-slate-500 mb-6">Be the first to share your experience exploring this destination!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review, i) => (
            <motion.div 
              key={review.id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glow-card border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-slate-50 p-6 md:w-64 border-r border-slate-100 flex flex-col items-center justify-center text-center shrink-0">
                      <Avatar className="h-20 w-20 ring-4 ring-white shadow-md mb-4">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                          {review.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-slate-900 text-lg">{review.userName}</h3>
                      <p className="text-sm text-slate-500 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col justify-center relative">
                      <MessageSquareQuote className="absolute top-8 right-8 w-16 h-16 text-slate-100 -z-0" />
                      <div className="flex gap-1 mb-4 relative z-10">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className="w-5 h-5" 
                            fill={review.rating >= star ? '#F59E0B' : 'transparent'} 
                            color={review.rating >= star ? '#F59E0B' : '#CBD5E1'} 
                          />
                        ))}
                      </div>
                      <p className="text-slate-700 text-lg leading-relaxed relative z-10 italic">
                        "{review.comment}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <div className="min-h-screen travel-bg-light relative px-4 py-16 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300/30 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/30 rounded-full filter blur-[100px]" />
      </div>
      <div className="relative z-10">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>}>
          <ReviewsList />
        </Suspense>
      </div>
    </div>
  )
}
