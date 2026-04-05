'use client'

import { useState } from 'react'
import type { RoomCategory } from '@/lib/supabase/types'
import { calcSanctuaryPricing, formatGBP } from '@/lib/sanctuary/pricing'

interface SanctuaryPricingPanelProps {
  area: string
  category: RoomCategory
  aggregatorRate?: number | null
  sanctuaryRate?: number | null
}

const RACK_RATES: Record<RoomCategory, Record<number, number>> = {
  performance: { 3: 95,  4: 118, 6: 165, 8: 210 },
  wellness:    { 3: 120, 4: 148, 6: 205, 8: 260 },
  basecamp:    { 3: 65,  4: 82,  6: 115, 8: 145 },
}

const DURATIONS = [3, 4, 6, 8] as const

export function SanctuaryPricingPanel({
  area,
  category,
  aggregatorRate,
  sanctuaryRate,
}: SanctuaryPricingPanelProps) {
  const [hours, setHours] = useState<3 | 4 | 6 | 8>(3)

  const rack = aggregatorRate ?? RACK_RATES[category][hours]
  const pricing = calcSanctuaryPricing(rack)

  // If we have real slot rates, use them for the 3h slot; otherwise use rack estimates
  const displayAgg       = aggregatorRate ?? pricing.aggregatorRate
  const displaySanctuary = sanctuaryRate  ?? pricing.sanctuaryRate
  const displaySaving    = displayAgg - displaySanctuary
  const displaySavingPct = ((displaySaving / displayAgg) * 100).toFixed(1)

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-stone-100">
        <h2 className="font-display text-2xl font-semibold text-stone-900 mb-1">
          Sanctuary Direct pricing
        </h2>
        <p className="text-sm text-stone-500">
          See exactly how much the aggregator commission costs — and what you save by booking direct.
        </p>
      </div>

      {/* Duration selector */}
      <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-stone-400">Duration</span>
        <div className="flex gap-2">
          {DURATIONS.map((h) => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                hours === h
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-stone-200 text-stone-500 hover:border-stone-400'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* Rate comparison */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100">

        {/* Sanctuary Direct */}
        <div className="p-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-stone-900 text-white px-2.5 py-1 rounded-full mb-4">
            Sanctuary Direct
          </div>
          <p className="font-display text-5xl font-semibold text-stone-900 mb-1">
            {formatGBP(displaySanctuary)}
          </p>
          <p className="text-sm text-stone-400 mb-5">for {hours} hours · {area}</p>
          <div className="space-y-2.5">
            <PricingRow label="Commission charged" value="£0.00" positive />
            <PricingRow label="Hotel keeps" value={formatGBP(displaySanctuary)} />
            <PricingRow label="Your saving" value={`+${formatGBP(displaySaving)}`} positive />
          </div>
        </div>

        {/* Aggregator */}
        <div className="p-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full mb-4">
            Aggregator rate
          </div>
          <p className="font-display text-5xl font-semibold text-stone-400 line-through mb-1">
            {formatGBP(displayAgg)}
          </p>
          <p className="text-sm text-stone-400 mb-5">typical dayuse.co.uk listing</p>
          <div className="space-y-2.5">
            <PricingRow label="Commission taken" value={`-${formatGBP(pricing.aggregatorCommission)}`} negative />
            <PricingRow label="Hotel keeps" value={formatGBP(pricing.hotelReceivesAggregator)} />
            <PricingRow label="Your saving" value="£0.00" />
          </div>
        </div>
      </div>

      {/* Saving bar */}
      <div className="px-6 pb-6 pt-4 border-t border-stone-100">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-stone-500">Your saving vs aggregator</span>
          <span className="font-medium text-emerald-600">{formatGBP(displaySaving)} ({displaySavingPct}%)</span>
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(parseFloat(displaySavingPct) * 5, 100)}%` }}
          />
        </div>
      </div>

      {/* Commission flow explainer */}
      <div className="mx-6 mb-6 bg-stone-50 rounded-lg p-4">
        <p className="text-xs font-medium text-stone-600 mb-3 uppercase tracking-wider">
          How the Sanctuary rate is built
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <FlowBox label="Rack rate" value={formatGBP(displayAgg)} />
          <FlowArrow label="20% commission saved" negative />
          <FlowBox label="10% passed to you" value={formatGBP(displaySaving)} positive />
        </div>
        <p className="text-xs text-stone-400 mt-3 leading-relaxed">
          Hotels on The Sanctuary pay a flat monthly subscription, not 20% per booking.
          The contract requires them to pass a minimum of 10% of that saving to guests.
          The hotel keeps the rest — aligning their incentive with yours.
        </p>
      </div>
    </div>
  )
}

function PricingRow({
  label,
  value,
  positive,
  negative,
}: {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={`font-medium ${positive ? 'text-emerald-600' : negative ? 'text-red-500' : 'text-stone-700'}`}>
        {value}
      </span>
    </div>
  )
}

function FlowBox({
  label,
  value,
  positive,
}: {
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <div className="border border-stone-200 rounded-lg py-2.5 px-2 bg-white">
      <p className="text-[10px] text-stone-400 mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${positive ? 'text-emerald-600' : 'text-stone-800'}`}>{value}</p>
    </div>
  )
}

function FlowArrow({ label, negative }: { label: string; negative?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5">
      <span className="text-stone-300 text-lg leading-none">→</span>
      <p className={`text-[9px] leading-tight text-center ${negative ? 'text-red-400' : 'text-stone-400'}`}>
        {label}
      </p>
    </div>
  )
}
