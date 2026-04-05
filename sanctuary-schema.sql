-- ============================================================
--  THE LONDON SANCTUARY — Supabase / PostgreSQL Schema v1.0
--  Micro-Inventory Day-Use Platform
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";      -- fuzzy search on features
create extension if not exists "postgis";       -- geo queries (nearest hotel)

-- ── Enums ────────────────────────────────────────────────────
create type room_category as enum (
  'performance',   -- Deep-Work environments
  'wellness',      -- Recovery / bio-hacking
  'basecamp'       -- Pre/post-event Refresh & Reset
);

create type soundproof_rating as enum (
  'standard',      -- STC 35-44
  'enhanced',      -- STC 45-54
  'studio',        -- STC 55-64
  'broadcast'      -- STC 65+
);

create type booking_status as enum (
  'available', 'held', 'confirmed', 'completed', 'cancelled'
);

create type slot_duration as enum (
  'three_hour', 'four_hour', 'six_hour', 'eight_hour', 'full_day'
);

create type pricing_model as enum (
  'flat_fee',      -- Sanctuary Direct (monthly subscription hotel)
  'commission'     -- Legacy aggregator model
);

-- ── Hotels ───────────────────────────────────────────────────
create table hotels (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  slug                text unique not null,                -- programmatic-page URL key
  address_line1       text not null,
  area                text not null,                       -- 'Marylebone', 'Soho', 'City'
  borough             text not null,                       -- London borough for schema.org
  postcode            text not null,
  location            geography(point, 4326),             -- PostGIS point
  stars               smallint check (stars between 3 and 5),
  sanctuary_member    boolean not null default false,      -- flat-fee subscriber
  monthly_fee_gbp     numeric(8,2),                        -- their flat subscription
  commission_rate     numeric(4,3) default 0.20,           -- legacy comparison rate
  min_saving_passthrough numeric(4,3) default 0.10,        -- contractual 10% pass-through
  contact_email       text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index hotels_area_idx       on hotels(area);
create index hotels_borough_idx    on hotels(borough);
create index hotels_location_idx   on hotels using gist(location);
create index hotels_member_idx     on hotels(sanctuary_member) where sanctuary_member = true;

-- ── Rooms ────────────────────────────────────────────────────
create table rooms (
  id                  uuid primary key default uuid_generate_v4(),
  hotel_id            uuid not null references hotels(id) on delete cascade,
  name                text not null,                       -- 'The Alcove', 'Studio One'
  category            room_category not null,
  floor_area_sqm      numeric(5,1),
  max_occupancy       smallint default 1,
  base_rate_3h_gbp    numeric(8,2) not null,               -- anchor price
  description         text,                               -- AEO-optimised copy
  hero_image_url      text,
  schema_type         text default 'LodgingBusiness',     -- schema.org override

  -- ── Performance attributes ──────────────────────────────
  perf_soundproofing  soundproof_rating,
  perf_stc_rating     smallint,                            -- exact STC number
  perf_deep_work_nook boolean default false,               -- designated focus alcove
  perf_keyboard_type  text,                               -- 'Mechanical TKL', 'Silent 65%'
  perf_monitor_count  smallint,
  perf_monitor_size   smallint,                            -- inches
  perf_monitor_res    text,                               -- '4K UHD', 'WQHD'
  perf_ergonomic_chair boolean default false,
  perf_standing_desk  boolean default false,
  perf_natural_light  boolean default false,
  perf_blackout_blinds boolean default false,
  perf_dedicated_line_mbps integer,                       -- symmetric fibre speed
  perf_noise_masking  boolean default false,               -- white/pink noise system

  -- ── Wellness attributes ──────────────────────────────────
  well_infrared_sauna       boolean default false,
  well_sauna_type           text,                         -- 'Full-spectrum', 'Near-infrared'
  well_hepa_filtration      boolean default false,
  well_hepa_grade           text,                         -- 'H13', 'H14'
  well_co2_monitor          boolean default false,
  well_circadian_lighting   boolean default false,         -- tunable colour temp
  well_kelvin_range         text,                         -- '2700K–6500K'
  well_pillow_menu          boolean default false,
  well_pillow_options       text[],                       -- ['Memory foam','Buckwheat','...]
  well_cold_plunge          boolean default false,
  well_red_light_therapy    boolean default false,
  well_blackout_capability  boolean default false,
  well_sleep_kit            boolean default false,
  well_aroma_diffuser       boolean default false,
  well_yoga_mat             boolean default false,
  well_foam_roller          boolean default false,

  -- ── Basecamp attributes ─────────────────────────────────
  base_shower_ensuite       boolean default false,
  base_luggage_storage      boolean default false,
  base_iron_and_board       boolean default false,
  base_hairdryer_pro        boolean default false,         -- salon-grade
  base_clothing_steamer     boolean default false,
  base_nearby_venue_tags    text[],                       -- ['Royal Albert Hall','Oval']
  base_checkout_flexibility boolean default false,        -- late check-in tolerance

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index rooms_hotel_idx      on rooms(hotel_id);
create index rooms_category_idx   on rooms(category);
create index rooms_soundproof_idx on rooms(perf_soundproofing);

-- Full-text search vector for AEO landing page matching
alter table rooms add column search_vector tsvector
  generated always as (
    to_tsvector('english',
      coalesce(name,'') || ' ' ||
      coalesce(description,'') || ' ' ||
      coalesce(perf_keyboard_type,'') || ' ' ||
      coalesce(perf_monitor_res,'') || ' ' ||
      coalesce(well_sauna_type,'') || ' ' ||
      coalesce(well_hepa_grade,'') || ' ' ||
      array_to_string(coalesce(base_nearby_venue_tags, '{}'), ' ')
    )
  ) stored;

create index rooms_search_idx on rooms using gin(search_vector);

-- ── Inventory Slots ─────────────────────────────────────────
create table inventory_slots (
  id              uuid primary key default uuid_generate_v4(),
  room_id         uuid not null references rooms(id) on delete cascade,
  date            date not null,
  start_time      time not null,
  end_time        time not null,
  duration        slot_duration not null,
  status          booking_status not null default 'available',

  -- Sanctuary Direct pricing
  sanctuary_rate_gbp  numeric(8,2) not null,
  aggregator_rate_gbp numeric(8,2),                        -- display-only comparison
  saving_gbp          numeric(8,2)
    generated always as (
      coalesce(aggregator_rate_gbp, 0) - sanctuary_rate_gbp
    ) stored,
  saving_pct          numeric(5,2)
    generated always as (
      case when coalesce(aggregator_rate_gbp, 0) > 0
        then round(((coalesce(aggregator_rate_gbp,0) - sanctuary_rate_gbp)
                    / aggregator_rate_gbp) * 100, 1)
        else 0
      end
    ) stored,

  created_at      timestamptz default now(),
  unique (room_id, date, start_time)
);

create index slots_room_date_idx   on inventory_slots(room_id, date);
create index slots_date_status_idx on inventory_slots(date, status);

-- ── Bookings ─────────────────────────────────────────────────
create table bookings (
  id                  uuid primary key default uuid_generate_v4(),
  slot_id             uuid not null references inventory_slots(id),
  hotel_id            uuid not null references hotels(id),
  room_id             uuid not null references rooms(id),
  guest_name          text not null,
  guest_email         text not null,
  amount_paid_gbp     numeric(8,2) not null,
  pricing_model       pricing_model not null default 'flat_fee',
  aggregator_would_charge numeric(8,2),
  transparency_saving_gbp numeric(8,2),
  stripe_payment_id   text,
  confirmed_at        timestamptz,
  cancelled_at        timestamptz,
  created_at          timestamptz default now()
);

create index bookings_hotel_idx on bookings(hotel_id);
create index bookings_guest_idx on bookings(guest_email);

-- ── Programmatic Page Metadata ───────────────────────────────
-- Powers AEO-targeted /rooms/[area]/[category]/[feature] pages
create table page_targets (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  area            text not null,
  category        room_category not null,
  primary_feature text not null,                           -- 'soundproof-workspace'
  h1_template     text not null,                           -- with {area} tokens
  meta_desc       text not null,
  faq_json        jsonb,                                   -- FAQ schema Q&A pairs
  schema_type     text default 'HealthAndBeautyBusiness',
  created_at      timestamptz default now()
);

-- ── Schema.org Tag Store ─────────────────────────────────────
-- Stores structured data snippets per room for SSG injection
create table room_schema_tags (
  id          uuid primary key default uuid_generate_v4(),
  room_id     uuid not null references rooms(id) on delete cascade,
  schema_type text not null,                               -- 'CreativeWork', 'HealthAndBeautyBusiness'
  json_ld     jsonb not null,
  version     integer not null default 1,
  created_at  timestamptz default now(),
  unique (room_id, schema_type)
);

-- ── Reviews ──────────────────────────────────────────────────
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid references bookings(id),
  room_id     uuid not null references rooms(id),
  rating      smallint check (rating between 1 and 5),
  headline    text,
  body        text,
  use_case    text,                                        -- 'deep work', 'recovery'
  verified    boolean default false,
  created_at  timestamptz default now()
);

-- ── RLS Policies ─────────────────────────────────────────────
alter table hotels        enable row level security;
alter table rooms         enable row level security;
alter table inventory_slots enable row level security;
alter table bookings      enable row level security;

-- Public can read hotels + rooms; bookings are private
create policy "Public hotel read"  on hotels        for select using (true);
create policy "Public room read"   on rooms         for select using (true);
create policy "Public slot read"   on inventory_slots for select using (status = 'available');
create policy "Guest own bookings" on bookings      for select
  using (guest_email = auth.jwt() ->> 'email');

-- ── Handy Views ──────────────────────────────────────────────
create or replace view v_available_rooms as
  select
    r.*,
    h.name          as hotel_name,
    h.area,
    h.borough,
    h.slug          as hotel_slug,
    h.sanctuary_member,
    s.id            as slot_id,
    s.date,
    s.start_time,
    s.end_time,
    s.duration,
    s.sanctuary_rate_gbp,
    s.aggregator_rate_gbp,
    s.saving_gbp,
    s.saving_pct
  from rooms r
  join hotels h on h.id = r.hotel_id
  join inventory_slots s on s.room_id = r.id
  where s.status = 'available'
    and s.date >= current_date;

-- ── Seed: Example Programmatic Page Targets ──────────────────
insert into page_targets (slug, area, category, primary_feature, h1_template, meta_desc, schema_type, faq_json) values
(
  'soundproof-workspace-soho',
  'Soho', 'performance', 'soundproofing',
  'Private soundproof workspace in {area} — book by the hour',
  'Find London''s quietest hotel rooms for deep work in Soho. STC-rated soundproofing, mechanical keyboards, 4K monitors. Book 3–8 hour slots.',
  'CreativeWork',
  '[
    {"q":"What is the STC rating of your soundproof rooms?","a":"Our Soho performance rooms carry STC ratings from 45 (Enhanced) to 65+ (Broadcast-grade), measured by an independent acoustic engineer."},
    {"q":"Can I book a 4-hour slot for focused work?","a":"Yes — all Sanctuary Performance rooms offer 3, 4, 6, and 8-hour slots with guaranteed privacy."}
  ]'::jsonb
),
(
  'infrared-sauna-marylebone',
  'Marylebone', 'wellness', 'infrared-sauna',
  'Infrared sauna & recovery suite in {area} — day use',
  'Book a private infrared sauna and bio-hacking recovery suite in Marylebone by the hour. HEPA air filtration, circadian lighting, pillow menus.',
  'HealthAndBeautyBusiness',
  '[
    {"q":"Is the infrared sauna private?","a":"Every Sanctuary wellness suite is booked exclusively — no shared facilities during your slot."},
    {"q":"What does a bio-hacking recovery suite include?","a":"Full-spectrum infrared sauna, H13 HEPA air filtration, circadian tunable lighting, cold plunge access, red-light therapy panel, and a curated pillow menu."}
  ]'::jsonb
),
(
  'refresh-reset-theatre-city',
  'City of London', 'basecamp', 'event-refresh',
  'Pre-theatre & event refresh suite in {area} — 3-hour slots',
  'Arriving for a City event or show? Book a 3-hour Basecamp slot: ensuite shower, clothes steamer, luggage storage, and flexible check-in.',
  'LodgingBusiness',
  '[
    {"q":"Can I store luggage before my event?","a":"Yes — all Basecamp suites include secure in-room luggage storage for your entire slot duration."},
    {"q":"Is there a clothes steamer for post-travel freshening up?","a":"Every Basecamp room is equipped with a professional-grade clothes steamer alongside iron and board."}
  ]'::jsonb
);
