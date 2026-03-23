import { getSupabaseServerClient } from '@/lib/supabase/server'
import { validateProfileData } from '@/lib/validation'

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ message: 'Avtorizatsiya kerak' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return Response.json({ message: 'Profil topilmadi' }, { status: 404 })
  }

  return Response.json(data)
}

export async function POST(request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ message: 'Avtorizatsiya kerak' }, { status: 401 })
  }

  const body = await request.json()
  const { height_cm, weight_kg, age, gender, goal, activity_level, first_name, last_name } = body

  const validation = validateProfileData({
    height: height_cm,
    weight: weight_kg,
    age,
    gender,
    goal,
    activity_level,
  })

  if (!validation.valid) {
    return Response.json({ message: validation.errors[0] }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || '',
      first_name: first_name || '',
      last_name: last_name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      height_cm,
      weight_kg,
      age,
      gender,
      goal: goal || 'forma_saqlash',
      activity_level: activity_level || 'o_rtacha',
      onboarded: true,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return Response.json(
      { message: 'Profilni saqlashda xatolik' },
      { status: 500 }
    )
  }

  return Response.json(data)
}
