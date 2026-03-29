import { getSupabaseServerClient } from '@/lib/supabase/server'
import { generatePlanWithGemini } from '@/services/ai'
import { calculateCalories } from '@/lib/calculations'

export async function POST(request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ message: 'Avtorizatsiya kerak' }, { status: 401 })
  }

  // Profil ma'lumotlarini olish
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('height_cm, weight_kg, age, gender, goal, activity_level')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return Response.json(
      { message: "Profil ma'lumotlari topilmadi. Iltimos oldin profilni to'ldiring." },
      { status: 400 }
    )
  }

  try {
    // AI reja generatsiyasi
    let aiPlan = await generatePlanWithGemini({
      height: profile.height_cm,
      weight: profile.weight_kg,
      age: profile.age,
      gender: profile.gender,
      goal: profile.goal,
      activity_level: profile.activity_level,
    })

    // Hisoblangan bazaviy kaloriyalarni qo'shish (ixtiyoriy, AI o'zi ham beradi)
    const calories = calculateCalories(
      profile.weight_kg,
      profile.height_cm,
      profile.age,
      profile.gender
    )
    
    aiPlan.calculated_maintenance = calories.maintenance

    const planToSave = { ...aiPlan, generated_at: new Date().toISOString() }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ current_plan: planToSave })
      .eq('id', user.id)

    if (updateError) {
      console.error("Plan update error:", updateError)
      return Response.json({ message: "Rejani saqlashda xatolik: " + updateError.message }, { status: 500 })
    }

    return Response.json({ plan: planToSave })
  } catch (err) {
    console.error('Plan generation error:', err)
    return Response.json(
      { message: err.message || 'Reja tuzishda xatolik yuz berdi' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ message: 'Avtorizatsiya kerak' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('current_plan')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Fetch plan error:', profileError)
    // Agar kutingan xato bo'lsa (masalan profil hali yo'q yoki column yo'q)
    return Response.json({ plan: null, error: profileError.message }, { status: 200 })
  }

  const plan = profile?.current_plan || null
  if (plan?.generated_at) {
    const ageMs = Date.now() - new Date(plan.generated_at).getTime()
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    if (ageMs < sevenDays) {
      return Response.json({ plan, cached: true })
    }
    return Response.json({ plan: null, needsRefresh: true })
  }
  return Response.json({ plan: null })
}
