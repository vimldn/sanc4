import Link from 'next/link'

const FOOTER_LINKS = {
  Rooms: [
    { label: 'Performance', href: '/rooms/soho/performance/soundproof-workspace' },
    { label: 'Wellness', href: '/rooms/marylebone/wellness/infrared-sauna' },
    { label: 'Basecamp', href: '/rooms/city-of-london/basecamp/refresh-reset-theatre' },
  ],
  Areas: [
    { label: 'Mayfair', href: '/rooms/mayfair/performance/soundproof-workspace' },
    { label: 'Soho', href: '/rooms/soho/performance/soundproof-workspace' },
    { label: 'Marylebone', href: '/rooms/marylebone/wellness/infrared-sauna' },
    { label: 'City of London', href: '/rooms/city-of-london/basecamp/refresh-reset-theatre' },
  ],
  Company: [
    { label: 'How it works', href: '/how-it-works' },
    { label: 'List your hotel', href: '/for-hotels' },
    { label: 'Pricing', href: '/pricing' },
  ],
}

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white mt-16">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <p className="font-display text-lg font-semibold text-stone-900 mb-2">The Sanctuary</p>
            <p className="text-sm text-stone-400 leading-relaxed">
              Premium London hotel rooms by the hour. No aggregator commission — ever.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-medium tracking-wider uppercase text-stone-400 mb-3">{group}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-100 pt-6 flex flex-col md:flex-row justify-between gap-2">
          <p className="text-xs text-stone-400">© {new Date().getFullYear()} The London Sanctuary. All rights reserved.</p>
          <p className="text-xs text-stone-400">
            Sanctuary Direct: hotels pay a flat monthly fee. Minimum 10% saving contractually guaranteed to guests.
          </p>
        </div>
      </div>
    </footer>
  )
}
