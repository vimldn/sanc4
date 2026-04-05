import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildJsonLd } from '@/lib/sanctuary/schema'
import { RoomCard } from '@/components/RoomCard'
import { SanctuaryPricingPanel } from '@/components/SanctuaryPricingPanel'
import { FAQAccordion } from '@/components/FAQAccordion'
import { TransparencyBanner } from '@/components/TransparencyBanner'
import type { AvailableRoom, RoomCategory } from '@/lib/supabase/types'

interface PageParams {
  area: string
  category: RoomCategory
  feature: string
}

function toTitleCase(slug: string) {
  return slug
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

export async function generateStaticParams() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('page_targets')
    .select('area, category, primary_feature')

  return (data ?? []).map((row) => ({
    area:     row.area.toLowerCase().replace(/\s+/g, '-'),
    category: row.category,
    feature:  row.primary_feature,
  }))
}

export async function generateMetadata(
  { params }: { params: Promise<PageParams> }
): Promise<Metadata> {
  const { area, feature } = await params
  const supabase = await createClient()
  const areaLabel = toTitleCase(area)
  const slug = `${feature}-${area}`

  const { data: target } = await supabase
    .from('page_targets')
    .select('h1_template, meta_desc, area')
    .eq('slug', slug)
    .single()

  if (!target) return { title: 'The London Sanctuary' }

  const h1 = target.h1_template.replace('{area}', areaLabel)

  return {
    title: h1,
    description: target.meta_desc,
    openGraph: { title: h1, description: target.meta_desc },
    alternates: { canonical: `/rooms/${area}/${(await params).category}/${feature}` },
  }
}

export default async function SanctuaryLandingPage(
  { params }: { params: Promise<PageParams> }
) {
  const { area, category, feature } = await params
  const supabase = await createClient()
  const areaLabel = toTitleCase(area)
  const slug = `${feature}-${area}`

  const { data: target } = await supabase
    .from('page_targets')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!target) notFound()

  const { data: rooms } = await supabase
    .from('v_available_rooms')
    .select('*')
    .eq('area', areaLabel)
    .eq('category', category)
    .order('saving_pct', { ascending: false })
    .limit(12)

  const h1 = target.h1_template.replace('{area}', areaLabel)
  const jsonLd = buildJsonLd(target, (rooms ?? []) as AvailableRoom[])

  const categoryLabel = {
    performance: 'Deep-Work · Performance',
    wellness:    'Micro-Wellness · Recovery',
    basecamp:    'Basecamp · Event Refresh',
  }[category]

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <main className="max-w-5xl mx-auto px-4 py-12">

        <nav className="text-xs text-stone-400 mb-8 flex items-center gap-2">
          <a href="/" className="hover:text-stone-600 transition-colors">Home</a>
          <span>›</span>
          <a href="/rooms" className="hover:text-stone-600 transition-colors">Rooms</a>
          <span>›</span>
          <span>{areaLabel}</span>
          <span>›</span>
          <span className="capitalize">{category}</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-gold mb-3">
            {categoryLabel} · {areaLabel}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-stone-900 leading-tight mb-4">
            {h1}
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl leading-relaxed">
            {target.meta_desc}
          </p>
        </header>

        <TransparencyBanner />

        {rooms && rooms.length > 0 ? (
          <section className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-stone-900 mb-5">
              Available rooms
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {(rooms as AvailableRoom[]).map((room) => (
                <RoomCard key={room.id} room={room} category={category} />
              ))}
            </div>
          </section>
        ) : (
          <div className="border border-stone-200 rounded-xl p-12 text-center mb-12 bg-white">
            <p className="text-stone-500">No rooms available for today — availability updates nightly.</p>
          </div>
        )}

        <SanctuaryPricingPanel
          area={areaLabel}
          category={category}
          aggregatorRate={rooms?.[0]?.aggregator_rate_gbp ?? null}
          sanctuaryRate={rooms?.[0]?.sanctuary_rate_gbp ?? null}
        />

        {target.faq_json && target.faq_json.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-semibold text-stone-900 mb-6">
              Common questions
            </h2>
            <FAQAccordion items={target.faq_json} />
          </section>
        )}

      </main>
    </>
  )
}
