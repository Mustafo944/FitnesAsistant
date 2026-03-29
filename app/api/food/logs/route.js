import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request) {
  const supabase = await getSupabaseServerClient()
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return Response.json({ logs: [] })
      }
    }

    const { data: logs, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id)
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

    if (!meal_type || !analysis) {
      return Response.json({ error: 'Ma&apos;lumot to&apos;liq emas' }, { status: 400 })
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
