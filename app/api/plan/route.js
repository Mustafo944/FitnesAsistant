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

    // Rejalarni bazaga ham saqlab qo'yishimiz mumkin, 
    // masalan plans degan jadval bo'lsa. Ammo hozircha faqat generatsiya qilib qaytarib beramiz.
    // user har safar bosganda yangi reja chiqadi.
    
    // Yoki "profiles" ga jsonb qilib saqlashimiz mumkin. Keling hozircha profiles ga saqlaymiz, 
    // to'g'ridan-to'g'ri chaqirish oson bo'lishi u-n.
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ current_plan: aiPlan })
      .eq('id', user.id)

    if (updateError) {
      console.warn("Planni DB ga saqlash amalga oshmadi, davom etyapmiz.", updateError)
    }

    return Response.json({ plan: aiPlan })
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
    return Response.json({ message: "Reja topilmadi" }, { status: 404 })
  }

  return Response.json({ plan: profile?.current_plan })
}
