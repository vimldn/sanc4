import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-32 text-center">
      <p className="font-display text-8xl font-semibold text-stone-100 mb-0 leading-none">404</p>
      <h1 className="font-display text-3xl font-semibold text-stone-900 mb-3 -mt-4">
        Room not found
      </h1>
      <p className="text-stone-500 mb-8">
        This room may have been booked or the link has changed.
      </p>
      <Link
        href="/rooms"
        className="inline-block bg-stone-900 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-stone-800 transition-colors"
      >
        Browse available rooms
      </Link>
    </main>
  )
}
