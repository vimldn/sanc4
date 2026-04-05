import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'List Your Hotel',
  description: 'Join The London Sanctuary. Replace 20% commission with a flat monthly fee and attract premium day-use guests.',
}

const TIERS = [
  {
    name: 'Starter',
    fee: '£299',
    period: '/month',
    rooms: 'Up to 3 rooms',
    features: [
      'Sanctuary Direct listing',
      'Commission-free bookings',
      'Standard support',
      'Monthly reporting',
    ],
  },
  {
    name: 'Member',
    fee: '£599',
    period: '/month',
    rooms: 'Up to 10 rooms',
    featured: true,
    features: [
      'Everything in Starter',
      'Priority search placement',
      'AEO landing page inclusion',
      'Schema.org room tagging',
      'Dedicated account manager',
    ],
  },
  {
    name: 'Flagship',
    fee: '£999',
    period: '/month',
    rooms: 'Unlimited rooms',
    features: [
      'Everything in Member',
      'Bespoke programmatic pages',
      'Premium badge + verification',
      'Quarterly strategy review',
      'API inventory sync',
    ],
  },
]

export default function ForHotelsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">

      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold mb-4">Hotel Partners</p>
        <h1 className="font-display text-5xl font-semibold text-stone-900 mb-4 max-w-2xl mx-auto leading-tight">
          Stop giving 20% away. Join The Sanctuary.
        </h1>
        <p className="text-lg text-stone-500 max-w-xl mx-auto">
          A flat monthly fee replaces per-booking commission. You pass 10% to guests, keep the rest,
          and attract high-intent day-use guests through premium AEO-ranked listings.
        </p>
      </div>

      {/* Math */}
      <div className="bg-stone-900 text-white rounded-2xl p-8 mb-16">
        <h2 className="font-display text-2xl font-semibold mb-6">The maths, plainly</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { label: 'Aggregator takes per booking', value: '20%', sub: 'On a £100 room: £20 gone per booking' },
            { label: 'Sanctuary flat fee (Member)', value: '£599', sub: 'Per month. Fixed. Regardless of volume.' },
            { label: 'Break-even bookings/month', value: '30', sub: 'After 30 bookings the flat fee costs less than commission' },
          ].map((item) => (
            <div key={item.label} className="border border-white/10 rounded-xl p-5">
              <p className="font-display text-4xl font-semibold text-gold mb-1">{item.value}</p>
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-1">{item.label}</p>
              <p className="text-sm text-stone-400">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing tiers */}
      <h2 className="font-display text-3xl font-semibold text-stone-900 mb-8 text-center">Membership tiers</h2>
      <div className="grid md:grid-cols-3 gap-5 mb-16">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-xl border p-6 ${
              tier.featured
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white'
            }`}
          >
            {tier.featured && (
              <span className="text-xs font-medium bg-gold text-white px-2 py-0.5 rounded-full mb-3 inline-block">
                Most popular
              </span>
            )}
            <p className="font-display text-xl font-semibold mb-1">{tier.name}</p>
            <p className="text-xs mb-4" style={{ color: tier.featured ? '#a8a29e' : '#78716c' }}>{tier.rooms}</p>
            <p className="mb-6">
              <span className="font-display text-4xl font-semibold">{tier.fee}</span>
              <span className={`text-sm ${tier.featured ? 'text-stone-400' : 'text-stone-500'}`}>{tier.period}</span>
            </p>
            <ul className="space-y-2.5 mb-8">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span className={tier.featured ? 'text-stone-300' : 'text-stone-600'}>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="mailto:hotels@london-sanctuary.co.uk"
              className={`block text-center text-sm font-medium py-2.5 rounded-full transition-colors ${
                tier.featured
                  ? 'bg-gold text-white hover:bg-gold-dark'
                  : 'border border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              Get started
            </a>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center border border-stone-200 rounded-xl p-10">
        <h2 className="font-display text-2xl font-semibold text-stone-900 mb-2">
          Questions before committing?
        </h2>
        <p className="text-stone-500 mb-6">We'll walk through your room inventory, expected volume, and break-even calculation on a 30-minute call.</p>
        <a
          href="mailto:hotels@london-sanctuary.co.uk"
          className="inline-block bg-stone-900 text-white text-sm font-medium px-8 py-3 rounded-full hover:bg-stone-800 transition-colors"
        >
          Book an intro call
        </a>
      </div>
    </main>
  )
}
