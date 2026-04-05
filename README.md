# The London Sanctuary

Premium day-use platform for London. Disrupts Dayuse.co.uk with Micro-Wellness and Deep-Work focused room inventory.

## Stack

- **Next.js 15** (App Router)
- **Supabase** (PostgreSQL + RLS + PostGIS)
- **Tailwind CSS**
- **TypeScript**
- Vercel deployment

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Supabase

1. Create a project at supabase.com
2. Run `sanctuary-schema.sql` in the Supabase SQL editor
3. Enable the `postgis` extension in Supabase → Database → Extensions

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — for server-side admin ops

### 4. Run locally

```bash
npm run dev
```

## Architecture

### Programmatic pages

Routes live at `/rooms/[area]/[category]/[feature]`.

Pages are generated from the `page_targets` table via `generateStaticParams()`.
To add a new AEO page, insert a row into `page_targets` and redeploy.

### Schema.org strategy

Each page outputs up to 3 JSON-LD blobs:
- `CreativeWork` (performance rooms) or `HealthAndBeautyBusiness` (wellness rooms)
- `FAQPage` — the primary AEO ranking signal
- `LodgingBusiness` per hotel — geo anchor

Performance rooms also get `additionalType: WorkBasedLearningProgram` — a signal no aggregator uses.

### Pricing model

Hotels pay a flat monthly fee (Starter £299 / Member £599 / Flagship £999).
The `calcSanctuaryPricing()` function in `lib/sanctuary/pricing.ts` computes the
guest saving. Hotels are contractually required to pass a minimum 10% of the
avoided commission to guests. This is enforced at the slot insert level via
`min_saving_passthrough` on the hotels table.

### Room categories

| Category    | Primary angle         | Key DB attributes |
|-------------|----------------------|-------------------|
| performance | Deep-Work            | `perf_stc_rating`, `perf_monitor_res`, `perf_keyboard_type` |
| wellness    | Micro-Wellness       | `well_infrared_sauna`, `well_hepa_grade`, `well_circadian_lighting` |
| basecamp    | Event Refresh        | `base_shower_ensuite`, `base_nearby_venue_tags` |

## Deployment

Push to GitHub, connect to Vercel, add environment variables.
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings.

## Seeding

The schema file includes 3 seed rows in `page_targets` to get the first AEO pages running.
Add hotels and rooms via the Supabase dashboard or a seed script.
