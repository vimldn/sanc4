'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { AvailableRoom, RoomCategory } from '@/lib/supabase/types'
import { DURATION_LABELS, formatGBP } from '@/lib/sanctuary/pricing'

interface RoomCardProps {
  room: AvailableRoom
  category: RoomCategory
}

const CATEGORY_BADGE: Record<RoomCategory, string> = {
  performance: 'sanctuary-badge-performance',
  wellness:    'sanctuary-badge-wellness',
  basecamp:    'sanctuary-badge-basecamp',
}

const CATEGORY_LABEL: Record<RoomCategory, string> = {
  performance: 'Performance',
  wellness:    'Wellness',
  basecamp:    'Basecamp',
}

function PerformanceFeatures({ room }: { room: AvailableRoom }) {
  const chips: string[] = []
  if (room.perf_soundproofing) chips.push(
    { standard: 'STC 35+', enhanced: 'STC 45+', studio: 'STC 55+', broadcast: 'STC 65+' }[room.perf_soundproofing]
  )
  if (room.perf_monitor_res)   chips.push(room.perf_monitor_res)
  if (room.perf_keyboard_type) chips.push(room.perf_keyboard_type)
  if (room.perf_deep_work_nook) chips.push('Deep-Work Nook')
  if (room.perf_dedicated_line_mbps) chips.push(`${room.perf_dedicated_line_mbps}Mbps fibre`)
  return chips
}

function WellnessFeatures({ room }: { room: AvailableRoom }) {
  const chips: string[] = []
  if (room.well_infrared_sauna)   chips.push(room.well_sauna_type ?? 'Infrared Sauna')
  if (room.well_hepa_filtration)  chips.push(`HEPA ${room.well_hepa_grade ?? 'Filtration'}`)
  if (room.well_circadian_lighting) chips.push('Circadian Lighting')
  if (room.well_cold_plunge)      chips.push('Cold Plunge')
  if (room.well_red_light_therapy) chips.push('Red Light Therapy')
  if (room.well_pillow_menu)      chips.push('Pillow Menu')
  return chips
}

function BasecampFeatures({ room }: { room: AvailableRoom }) {
  const chips: string[] = []
  if (room.base_shower_ensuite)    chips.push('Ensuite Shower')
  if (room.base_clothing_steamer)  chips.push('Clothing Steamer')
  if (room.base_luggage_storage)   chips.push('Luggage Storage')
  if (room.base_nearby_venue_tags?.length) chips.push(...room.base_nearby_venue_tags.slice(0, 2))
  return chips
}

function getFeatures(room: AvailableRoom, category: RoomCategory): string[] {
  switch (category) {
    case 'performance': return PerformanceFeatures({ room })
    case 'wellness':    return WellnessFeatures({ room })
    case 'basecamp':    return BasecampFeatures({ room })
  }
}

export function RoomCard({ room, category }: RoomCardProps) {
  const features = getFeatures(room, category).slice(0, 4)
  const duration = DURATION_LABELS[room.duration] ?? room.duration
  const hasSaving = room.saving_gbp > 0

  return (
    <article className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-sm transition-all group">

      {/* Image */}
      <div className="relative h-44 bg-stone-100 overflow-hidden">
        {room.hero_image_url ? (
          <Image
            src={room.hero_image_url}
            alt={room.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-20">
              {category === 'performance' ? '⌨' : category === 'wellness' ? '◎' : '◈'}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`sanctuary-badge ${CATEGORY_BADGE[category]}`}>
            {CATEGORY_LABEL[category]}
          </span>
        </div>
        {hasSaving && (
          <div className="absolute top-3 right-3">
            <span className="saving-pill">
              Save {formatGBP(room.saving_gbp)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h3 className="font-display text-lg font-semibold text-stone-900 leading-snug">
              {room.name}
            </h3>
            <p className="text-sm text-stone-400">{room.hotel_name} · {room.area}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-xl font-semibold text-stone-900">
              {formatGBP(room.sanctuary_rate_gbp)}
            </p>
            <p className="text-xs text-stone-400">{duration}</p>
          </div>
        </div>

        {/* Feature chips */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
            {features.map((f) => (
              <span
                key={f}
                className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Pricing comparison row */}
        {room.aggregator_rate_gbp && hasSaving && (
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-4 border-t border-stone-100 pt-3">
            <span>Aggregator rate:</span>
            <span className="line-through">{formatGBP(room.aggregator_rate_gbp)}</span>
            <span className="text-emerald-600 font-medium">
              You save {room.saving_pct.toFixed(1)}%
            </span>
          </div>
        )}

        {/* Slot info + CTA */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-stone-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle" />
            {room.start_time.slice(0, 5)} – {room.end_time.slice(0, 5)} · {room.date}
          </div>
          <button
            className="text-xs font-medium px-4 py-2 bg-stone-900 text-white rounded-full hover:bg-gold transition-colors"
            onClick={() => {
              window.location.href = `/book/${room.slot_id}`
            }}
          >
            Book now
          </button>
        </div>
      </div>
    </article>
  )
}
