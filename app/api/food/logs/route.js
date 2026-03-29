import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request) {
  const supabase = await getSupabaseServerClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ logs: [] }, { status: 401 })
    }

    const { data: logs, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return Response.json({ logs: logs || [] })
  } catch (error) {
    console.error('Error fetching food logs:', error)
    return Response.json({ logs: [] })
  }
}

export async function POST(request) {
  const supabase = await getSupabaseServerClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Aloqada emas' }, { status: 401 })
    }

    const body = await request.json()
    const { meal_type, image_url, analysis } = body

    const VALID_MEAL_TYPES = ['ertalabki_nonushta', 'tushlik', 'kechkiqlik', 'kechki_ovqat']
    if (!meal_type || !VALID_MEAL_TYPES.includes(meal_type)) {
      return Response.json({ error: "Noto'g'ri meal_type" }, { status: 400 })
    }
    if (!analysis) {
      return Response.json({ error: "Ma'lumot to'liq emas" }, { status: 400 })
    }
    if (JSON.stringify(analysis).length > 10000) {
      return Response.json({ error: 'Tahlil hajmi juda katta' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    const { data: log, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: user.id,
        meal_type,
        image_url,
        analysis,
        date: today,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ log, success: true })
  } catch (error) {
    console.error('Error saving food log:', error)
    return Response.json({ error: 'Saqlashda xatolik' }, { status: 500 })
  }
}
