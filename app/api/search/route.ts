import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const area     = searchParams.get('area')
  const category = searchParams.get('category')
  const date     = searchParams.get('date') ?? new Date().toISOString().slice(0, 10)
  const duration = searchParams.get('duration')

  let query = supabase
    .from('v_available_rooms')
    .select('*')
    .eq('date', date)
    .order('saving_pct', { ascending: false })

  if (area)     query = query.ilike('area', `%${area}%`)
  if (category) query = query.eq('category', category)
  if (duration) query = query.eq('duration', duration)

  const { data, error } = await query.limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ rooms: data })
}
