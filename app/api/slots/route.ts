import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { slotId } = await req.json()

  if (!slotId) return NextResponse.json({ error: 'slotId required' }, { status: 400 })

  const { data: slot } = await supabase
    .from('inventory_slots')
    .select('id, status')
    .eq('id', slotId)
    .single<{ id: string; status: string }>()

  if (!slot || slot.status !== 'available') {
    return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 })
  }

  // Cast needed: generated columns (saving_gbp, saving_pct) make the inferred
  // Update type overly strict — we only touch the mutable status field.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from('inventory_slots')
    .update({ status: 'held' } as any)
    .eq('id', slotId)
    .eq('status', 'available')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ held: true, slotId })
}
