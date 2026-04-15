"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-20">
      <div className="absolute inset-0 travel-bg-light opacity-80" />
      <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-rose-300/25 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-amber-300/25 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-rose-700">
          Something Went Wrong
        </p>
        <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
          We hit a bump in the road.
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Try the page again, or head back to a safe route and continue your trip planning.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" onClick={reset} className="min-w-44">
            Try Again
          </Button>
          <Link href="/">
            <Button size="lg" variant="outline" className="min-w-44">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
