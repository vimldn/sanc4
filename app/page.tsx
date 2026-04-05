import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RoomCard } from '@/components/RoomCard'
import type { AvailableRoom } from '@/lib/supabase/types'

const AREAS = [
  'Mayfair', 'Soho', 'Marylebone', 'City of London',
  'Canary Wharf', 'Chelsea', 'Clerkenwell', 'Shoreditch',
]

const CATEGORIES = [
  {
    key: 'performance',
    label: 'Performance',
    headline: 'Deep-work environments',
    desc: 'STC-rated soundproofing, mechanical keyboards, 4K monitors, symmetric fibre. Built for the hours that matter.',
    badge: 'sanctuary-badge-performance',
    href: '/rooms/soho/performance/soundproof-workspace',
    icon: '⌨',
  },
  {
    key: 'wellness',
    label: 'Wellness',
    headline: 'Micro-wellness suites',
    desc: 'Infrared saunas, HEPA H13 filtration, circadian lighting, cold plunge. Recovery engineered, not improvised.',
    badge: 'sanctuary-badge-wellness',
    href: '/rooms/marylebone/wellness/infrared-sauna',
    icon: '◎',
  },
  {
    key: 'basecamp',
    label: 'Basecamp',
    headline: 'Event refresh & reset',
    desc: '3-hour slots. Ensuite shower, clothes steamer, luggage storage. Theatre, stadium, or boardroom — arrive ready.',
    badge: 'sanctuary-badge-basecamp',
    href: '/rooms/city-of-london/basecamp/refresh-reset-theatre',
    icon: '◈',
  },
]

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featured } = await supabase
    .from('v_available_rooms')
    .select('*')
    .order('saving_pct', { ascending: false })
    .limit(6)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-28">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold mb-4">
            London · Day Use · Direct
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-semibold text-stone-900 leading-none mb-6 max-w-3xl">
            The room you need,<br />
            <span className="text-gold">for the hours you need it.</span>
          </h1>
          <p className="text-lg text-stone-500 max-w-xl mb-10">
            Premium London hotel rooms by the hour — for deep work, recovery, and event prep.
            No 20% aggregator tax. Sanctuary Direct pricing, guaranteed.
          </p>

          {/* Area quick-links */}
          <div className="flex flex-wrap gap-2">
            {AREAS.map((area) => (
              <Link
                key={area}
                href={`/rooms/${area.toLowerCase().replace(/\s+/g, '-')}/performance/soundproof-workspace`}
                className="text-sm px-4 py-2 border border-stone-200 rounded-full text-stone-600 hover:border-stone-400 hover:text-stone-900 transition-colors"
              >
                {area}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl font-semibold text-stone-900 mb-2">
          Three types of sanctuary
        </h2>
        <p className="text-stone-500 mb-8">Every room tagged, rated, and priced with precision.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className="group block border border-stone-200 rounded-xl p-6 bg-white hover:border-stone-300 hover:shadow-sm transition-all"
            >
              <div className="text-2xl mb-4">{cat.icon}</div>
              <span className={`sanctuary-badge ${cat.badge} mb-3`}>{cat.label}</span>
              <h3 className="font-display text-xl font-semibold text-stone-900 mb-2 group-hover:text-gold transition-colors">
                {cat.headline}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Rooms ────────────────────────────────── */}
      {featured && featured.length > 0 && (
        <section className="bg-stone-100 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-semibold text-stone-900 mb-1">
                  Available today
                </h2>
                <p className="text-stone-500 text-sm">Highest saving first</p>
              </div>
              <Link href="/rooms" className="text-sm text-gold hover:text-gold-dark font-medium transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(featured as AvailableRoom[]).map((room) => (
                <RoomCard key={room.id} room={room} category={room.category} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Transparency Strip ────────────────────────────── */}
      <section className="border-t border-b border-stone-200 bg-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                stat: '£0',
                label: 'Commission charged',
                detail: 'Hotels pay us a flat monthly fee — never a per-booking cut.',
              },
              {
                stat: '10%',
                label: 'Guaranteed saving',
                detail: 'Every Sanctuary Member hotel contractually passes 10% of their commission saving to you.',
              },
              {
                stat: 'STC 55+',
                label: 'Soundproofing verified',
                detail: 'Performance rooms are independently tested. We publish the STC rating, not a vague "quiet room" label.',
              },
            ].map((item) => (
              <div key={item.stat}>
                <p className="font-display text-4xl font-semibold text-stone-900 mb-1">{item.stat}</p>
                <p className="text-xs font-medium tracking-wide uppercase text-gold mb-2">{item.label}</p>
                <p className="text-sm text-stone-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
