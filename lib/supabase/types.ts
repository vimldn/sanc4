export type RoomCategory = 'performance' | 'wellness' | 'basecamp'
export type SoundproofRating = 'standard' | 'enhanced' | 'studio' | 'broadcast'
export type BookingStatus = 'available' | 'held' | 'confirmed' | 'completed' | 'cancelled'
export type SlotDuration = 'three_hour' | 'four_hour' | 'six_hour' | 'eight_hour' | 'full_day'
export type PricingModel = 'flat_fee' | 'commission'

export interface Hotel {
  id: string
  name: string
  slug: string
  address_line1: string
  area: string
  borough: string
  postcode: string
  stars: number
  sanctuary_member: boolean
  monthly_fee_gbp: number | null
  commission_rate: number
  min_saving_passthrough: number
  contact_email: string | null
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  hotel_id: string
  name: string
  category: RoomCategory
  floor_area_sqm: number | null
  max_occupancy: number
  base_rate_3h_gbp: number
  description: string | null
  hero_image_url: string | null
  schema_type: string

  // Performance
  perf_soundproofing: SoundproofRating | null
  perf_stc_rating: number | null
  perf_deep_work_nook: boolean
  perf_keyboard_type: string | null
  perf_monitor_count: number | null
  perf_monitor_size: number | null
  perf_monitor_res: string | null
  perf_ergonomic_chair: boolean
  perf_standing_desk: boolean
  perf_natural_light: boolean
  perf_blackout_blinds: boolean
  perf_dedicated_line_mbps: number | null
  perf_noise_masking: boolean

  // Wellness
  well_infrared_sauna: boolean
  well_sauna_type: string | null
  well_hepa_filtration: boolean
  well_hepa_grade: string | null
  well_co2_monitor: boolean
  well_circadian_lighting: boolean
  well_kelvin_range: string | null
  well_pillow_menu: boolean
  well_pillow_options: string[] | null
  well_cold_plunge: boolean
  well_red_light_therapy: boolean
  well_blackout_capability: boolean
  well_sleep_kit: boolean
  well_aroma_diffuser: boolean
  well_yoga_mat: boolean
  well_foam_roller: boolean

  // Basecamp
  base_shower_ensuite: boolean
  base_luggage_storage: boolean
  base_iron_and_board: boolean
  base_hairdryer_pro: boolean
  base_clothing_steamer: boolean
  base_nearby_venue_tags: string[] | null
  base_checkout_flexibility: boolean

  created_at: string
  updated_at: string
}

export interface InventorySlot {
  id: string
  room_id: string
  date: string
  start_time: string
  end_time: string
  duration: SlotDuration
  status: BookingStatus
  sanctuary_rate_gbp: number
  aggregator_rate_gbp: number | null
  saving_gbp: number
  saving_pct: number
  created_at: string
}

export interface Booking {
  id: string
  slot_id: string
  hotel_id: string
  room_id: string
  guest_name: string
  guest_email: string
  amount_paid_gbp: number
  pricing_model: PricingModel
  aggregator_would_charge: number | null
  transparency_saving_gbp: number | null
  stripe_payment_id: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  created_at: string
}

export interface PageTarget {
  id: string
  slug: string
  area: string
  category: RoomCategory
  primary_feature: string
  h1_template: string
  meta_desc: string
  faq_json: Array<{ q: string; a: string }> | null
  schema_type: string
  created_at: string
}

export interface Review {
  id: string
  booking_id: string | null
  room_id: string
  rating: number
  headline: string | null
  body: string | null
  use_case: string | null
  verified: boolean
  created_at: string
}

// Joined view type returned by v_available_rooms
export interface AvailableRoom extends Room {
  hotel_name: string
  hotel_slug: string
  area: string
  borough: string
  sanctuary_member: boolean
  slot_id: string
  date: string
  start_time: string
  end_time: string
  duration: SlotDuration
  sanctuary_rate_gbp: number
  aggregator_rate_gbp: number | null
  saving_gbp: number
  saving_pct: number
}

export interface Database {
  public: {
    Tables: {
      hotels: { Row: Hotel; Insert: Partial<Hotel>; Update: Partial<Hotel> }
      rooms: { Row: Room; Insert: Partial<Room>; Update: Partial<Room> }
      inventory_slots: { Row: InventorySlot; Insert: Partial<InventorySlot>; Update: InventorySlotUpdate }
      bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> }
      page_targets: { Row: PageTarget; Insert: Partial<PageTarget>; Update: Partial<PageTarget> }
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> }
    }
    Views: {
      v_available_rooms: { Row: AvailableRoom }
    }
  }
}

// Updatable fields only — excludes generated columns (saving_gbp, saving_pct)
export type InventorySlotUpdate = Partial<
  Omit<InventorySlot, 'saving_gbp' | 'saving_pct' | 'id' | 'created_at'>
>
