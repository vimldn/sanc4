'use client'

import { useState } from 'react'

interface FAQItem {
  q: string
  a: string
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-start justify-between gap-4 px-6 py-4 text-left hover:bg-stone-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-medium text-stone-800 text-sm leading-relaxed">{item.q}</span>
            <span
              className={`text-stone-400 text-lg leading-none mt-0.5 shrink-0 transition-transform duration-200 ${
                open === i ? 'rotate-45' : ''
              }`}
            >
              +
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-sm text-stone-500 leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
