"use client"

import { useAuth } from '@/context/AuthContext'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

function AddReviewForm() {
  const { user, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const destination = searchParams.get('destination') || 'Vansh Travels'
  const router = useRouter()
  
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('You must be logged in to leave a review')
      router.push('/')
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          destination,
          rating,
          comment
        })
      })

      if (res.ok) {
        toast.success('Thank you for your valuable feedback! ⭐')
        router.push(`/reviews?destination=${destination}`)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to submit review')
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !user) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="max-w-2xl mx-auto glow-card backdrop-blur-sm bg-white/95 mt-12 border-2 border-yellow-100">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Rate Your Experience</CardTitle>
          <CardDescription className="text-lg text-slate-600">
            Share your thoughts about {destination}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Overall Rating</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className="w-12 h-12" 
                      fill={(hoveredRating || rating) >= star ? '#F59E0B' : 'transparent'} 
                      color={(hoveredRating || rating) >= star ? '#F59E0B' : '#CBD5E1'} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-center">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Your Comments</span>
              <Textarea 
                placeholder={`Describe your adventure to ${destination}...`}
                className="min-h-[150px] resize-none border-2 border-slate-200 focus:border-yellow-400 focus:ring-yellow-400 rounded-xl glow-input text-base"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold glow-button bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-200/50"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Star className="w-6 h-6 mr-2 fill-current" />}
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function AddReviewPage() {
  return (
    <div className="min-h-screen travel-bg relative px-4 py-12 flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400 rounded-full filter blur-[100px] opacity-20" />
      </div>
      <div className="relative z-10 w-full">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-white w-10 h-10" /></div>}>
          <AddReviewForm />
        </Suspense>
      </div>
    </div>
  )
}
