import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold text-stone-900 tracking-tight">
            The Sanctuary
          </span>
          <span className="text-[10px] font-medium tracking-widest uppercase text-gold border border-gold/30 px-1.5 py-0.5 rounded">
            London
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-stone-500">
          <Link href="/rooms/soho/performance/soundproof-workspace" className="hover:text-stone-900 transition-colors">
            Performance
          </Link>
          <Link href="/rooms/marylebone/wellness/infrared-sauna" className="hover:text-stone-900 transition-colors">
            Wellness
          </Link>
          <Link href="/rooms/city-of-london/basecamp/refresh-reset-theatre" className="hover:text-stone-900 transition-colors">
            Basecamp
          </Link>
          <Link
            href="/for-hotels"
            className="text-stone-900 font-medium border border-stone-200 px-3 py-1.5 rounded-full hover:border-stone-400 transition-colors"
          >
            List your hotel
          </Link>
        </nav>
      </div>
    </header>
  )
}
