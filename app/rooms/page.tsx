import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { RoomCard } from '@/components/RoomCard'
import type { AvailableRoom, RoomCategory } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: 'Browse Rooms',
  description: 'All available Sanctuary rooms in London — performance, wellness, and basecamp. Sanctuary Direct pricing.',
}

const AREAS = [
  'All', 'Mayfair', 'Soho', 'Marylebone', 'City of London',
  'Canary Wharf', 'Chelsea', 'Clerkenwell', 'Shoreditch',
]

const CATEGORIES = [
  { value: 'all',         label: 'All types' },
  { value: 'performance', label: 'Performance' },
  { value: 'wellness',    label: 'Wellness' },
  { value: 'basecamp',    label: 'Basecamp' },
]

interface BrowsePageProps {
  searchParams: Promise<{ area?: string; category?: string; date?: string }>
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const sp = await searchParams
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const selectedArea     = sp.area     ?? 'All'
  const selectedCategory = sp.category ?? 'all'
  const selectedDate     = sp.date     ?? today

  let query = supabase
    .from('v_available_rooms')
    .select('*')
    .eq('date', selectedDate)
    .order('saving_pct', { ascending: false })

  if (selectedArea !== 'All')     query = query.eq('area', selectedArea)
  if (selectedCategory !== 'all') query = query.eq('category', selectedCategory)

  const { data: rooms } = await query.limit(24)

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-semibold text-stone-900 mb-2">
        Available rooms
      </h1>
      <p className="text-stone-500 mb-8">
        {rooms?.length ?? 0} rooms available · {selectedDate}
      </p>

      <div className="flex flex-wrap gap-6 mb-8 pb-6 border-b border-stone-200">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Area</p>
          <div className="flex flex-wrap gap-1.5">
            {AREAS.map((area) => (
              <a
                key={area}
                href={`/rooms?area=${area}&category=${selectedCategory}&date=${selectedDate}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedArea === area
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'border-stone-200 text-stone-500 hover:border-stone-400'
                }`}
              >
                {area}
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Type</p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.value}
                href={`/rooms?area=${selectedArea}&category=${cat.value}&date=${selectedDate}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'border-stone-200 text-stone-500 hover:border-stone-400'
                }`}
              >
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {rooms && rooms.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(rooms as AvailableRoom[]).map((room) => (
            <RoomCard key={room.id} room={room} category={room.category as RoomCategory} />
          ))}
        </div>
      ) : (
        <div className="border border-stone-200 rounded-xl p-16 text-center">
          <p className="text-stone-400 mb-2">No rooms available for this filter combination.</p>
          <a href="/rooms" className="text-sm text-gold hover:underline">Clear filters</a>
        </div>
      )}
    </main>
  )
}
