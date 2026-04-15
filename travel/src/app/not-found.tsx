import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-20">
      <div className="absolute inset-0 travel-bg-light opacity-80" />
      <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-blue-700">
          Error 404
        </p>
        <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
          This route took a detour.
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          The page you were looking for is not here, but your next trip still is.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button size="lg" className="min-w-44">
              Back to Home
            </Button>
          </Link>
          <Link href="/booking">
            <Button size="lg" variant="outline" className="min-w-44">
              Start a Booking
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
