import type { AvailableRoom, PageTarget } from '@/lib/supabase/types'

export function buildJsonLd(target: PageTarget, rooms: AvailableRoom[]) {
  const area = target.area
  const h1   = target.h1_template.replace('{area}', area)

  const primarySchema =
    target.schema_type === 'CreativeWork'
      ? {
          '@type': ['CreativeWork', 'Product'],
          name: h1,
          description: target.meta_desc,
          additionalType: 'https://schema.org/WorkBasedLearningProgram',
          audience: {
            '@type': 'PeopleAudience',
            audienceType: 'Remote workers, Deep-work practitioners',
          },
          offers: rooms.map((r) => ({
            '@type': 'Offer',
            name: `${r.name} — ${r.hotel_name}`,
            price: r.sanctuary_rate_gbp.toFixed(2),
            priceCurrency: 'GBP',
            availability: 'https://schema.org/InStock',
            validFrom: r.date,
            seller: { '@type': 'LocalBusiness', name: r.hotel_name },
          })),
        }
      : target.schema_type === 'HealthAndBeautyBusiness'
      ? {
          '@type': ['HealthAndBeautyBusiness', 'LodgingBusiness'],
          name: h1,
          description: target.meta_desc,
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Micro-Wellness Day-Use Suites',
            itemListElement: rooms.map((r, i) => ({
              '@type': 'Offer',
              position: i + 1,
              name: r.name,
              price: r.sanctuary_rate_gbp.toFixed(2),
              priceCurrency: 'GBP',
            })),
          },
        }
      : {
          '@type': 'LodgingBusiness',
          name: h1,
          description: target.meta_desc,
        }

  const faqSchema =
    target.faq_json && target.faq_json.length > 0
      ? {
          '@type': 'FAQPage',
          mainEntity: target.faq_json.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
          })),
        }
      : null

  const uniqueHotels = [
    ...new Map(rooms.map((r) => [r.hotel_slug, r])).values(),
  ]

  const hotelSchemas = uniqueHotels.map((r) => ({
    '@type': 'LodgingBusiness',
    '@id': `https://london-sanctuary.co.uk/hotels/${r.hotel_slug}`,
    name: r.hotel_name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: r.area,
      addressRegion: r.borough,
      addressCountry: 'GB',
    },
    priceRange: '££–£££',
  }))

  return [
    { '@context': 'https://schema.org', ...primarySchema },
    ...(faqSchema ? [{ '@context': 'https://schema.org', ...faqSchema }] : []),
    ...hotelSchemas.map((h) => ({ '@context': 'https://schema.org', ...h })),
  ]
}
