import { getSupabaseServerClient } from '@/lib/supabase/server'

const UZBEK_FOODS = {
  breakfast: [
    { food: 'Nonushta uchun 2 ta tuxum, 1 ta non, pomidor', calories: 280, note: 'Protein boy' },
    { food: 'Sut (200ml), 2 ta mayizli non', calories: 250, note: 'Yengil' },
    { food: 'Omlet (3 ta tuxum), bodring, 1 ta non', calories: 300, note: 'Yaxshi tanlov' },
    { food: 'Kefir (300ml), 1 ta somsa (kichik)', calories: 320, note: 'Sut mahsulotlari boy' },
    { food: '1 ta yirik olma, 50g quritilgan mevalar, 2 ta tuxum', calories: 290, note: 'Vitamin boy' },
    { food: "Somsa (1 dona), choy", calories: 340, note: "An'anaviy" },
  ],
  lunch: [
    { food: 'Osh (pishloqli, 250g), yashil choy', calories: 450, note: 'Asosiy taom' },
    { food: 'Lagman (suyuq, 300g)', calories: 380, note: 'Yengil versiya' },
    { food: 'Manti (6 dona), qatiq', calories: 400, note: 'Protein boy' },
    { food: 'Shorva (300ml), 1 ta non', calories: 320, note: 'Yengil' },
    { food: "Dimlama (to'y oshi, 250g)", calories: 350, note: "Sabzavotli" },
    { food: "Mastava (300ml), 1 ta non", calories: 340, note: "An'anaviy" },
    { food: "Norin (200g), 1 ta non", calories: 380, note: "Uyg'ur oshpazligi" },
    { food: "Kabob (2 dona), sabzavotlar, non", calories: 420, note: "Go'shtli" },
  ],
  snack: [
    { food: '1 ta banan, 100g yogurt', calories: 150, note: 'Tez energiya' },
    { food: "2 ta olma, 50g yong'oq", calories: 180, note: "Vitamin" },
    { food: '1 ta pomidor, 1 ta bodring', calories: 35, note: 'Kam kaloriya' },
    { food: "1 ta kivi, 1 ta apelsin", calories: 120, note: "Sog'lom" },
    { food: '100g qovun', calories: 40, note: 'Yengil' },
    { food: '1 ta nok, 10 dona bodom', calories: 160, note: 'Sutemish' },
  ],
  dinner: [
    { food: "Kabob (2 dona), sabzavotli sho'rva", calories: 380, note: "Yengil kechki" },
    { food: "Tovuq jo'xori (150g), sabzavotlar", calories: 280, note: "Protein boy" },
    { food: "Dimlama (goshtli, 200g)", calories: 320, note: "An'anaviy" },
    { food: "Baliq (grill, 150g), sabzavotlar", calories: 250, note: "Sog'lom tanlov" },
    { food: "1 ta somsa, 1 stakan sut", calories: 350, note: "An'anaviy" },
    { food: 'Sabzavotli sotuv (300g)', calories: 180, note: 'Eng yengil' },
    { food: 'Tuxum (2 dona), pomidor, bodring', calories: 200, note: 'Kam kaloriya' },
  ],
}

const ALTERNATIVES = [
  { original: 'Coca Cola / Pepsi', original_cal: 150, alternative: 'Suv + Limon', alt_cal: 5 },
  { original: 'Shirin choy (2 qoshiq)', original_cal: 80, alternative: 'Choy (shakarsiz)', alt_cal: 5 },
  { original: 'Fransi', original_cal: 350, alternative: 'Sabzavotli sous', alt_cal: 50 },
  { original: 'Pizza (katta)', original_cal: 800, alternative: "1 bo'lak pizza + sabzavot", alt_cal: 400 },
  { original: 'Hamburger', original_cal: 500, alternative: 'Tovuq sandwich', alt_cal: 280 },
  { original: 'Shirin likopcha (osh)', original_cal: 600, alternative: 'Lagman (kichik porsiya)', alt_cal: 350 },
  { original: 'Chocopie (3 dona)', original_cal: 540, alternative: '2 dona + olma', alt_cal: 300 },
  { original: 'Somsa (2 dona)', original_cal: 560, alternative: '1 dona + sabzavot', alt_cal: 300 },
  { original: 'Manti (9 dona)', original_cal: 660, alternative: '6 dona + qatiq', alt_cal: 450 },
  { original: 'Kunjara (2 dona)', original_cal: 400, alternative: '1 dona + olma', alt_cal: 220 },
]

const WEEKLY_DAYS = [
  'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'
]

function shuffle(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function generateWeeklyPlan(avgCalories, highCalorieFoods, commonFoods) {
  const targetCalories = Math.round(avgCalories * 0.85)
  const dailyBudget = {
    breakfast: Math.round(targetCalories * 0.25),
    lunch: Math.round(targetCalories * 0.40),
    snack: Math.round(targetCalories * 0.10),
    dinner: Math.round(targetCalories * 0.25),
  }

  const weeklyPlan = []

  for (let i = 0; i < 7; i++) {
    const dayMeals = [
      {
        type: 'Nonushta',
        food: shuffle(UZBEK_FOODS.breakfast)[0].food,
        calories: dailyBudget.breakfast,
        note: shuffle(UZBEK_FOODS.breakfast)[0].note,
      },
      {
        type: 'Tushlik',
        food: shuffle(UZBEK_FOODS.lunch)[0].food,
        calories: dailyBudget.lunch,
        note: shuffle(UZBEK_FOODS.lunch)[0].note,
      },
      {
        type: 'Kechkiqlik',
        food: shuffle(UZBEK_FOODS.snack)[0].food,
        calories: dailyBudget.snack,
        note: shuffle(UZBEK_FOODS.snack)[0].note,
      },
      {
        type: 'Kechki ovqat',
        food: shuffle(UZBEK_FOODS.dinner)[0].food,
        calories: dailyBudget.dinner,
        note: shuffle(UZBEK_FOODS.dinner)[0].note,
      },
    ]

    weeklyPlan.push({
      day: i + 1,
      day_name: WEEKLY_DAYS[i],
      meals: dayMeals,
      total_calories: dayMeals.reduce((sum, m) => sum + m.calories, 0),
    })
  }

  return weeklyPlan
}

function generateAlternatives(highCalorieFoods) {
  const usedAlternatives = []
  const uniqueHighCal = [...new Set(highCalorieFoods.map(f => f.name.toLowerCase()))]

  for (const food of uniqueHighCal.slice(0, 5)) {
    for (const alt of ALTERNATIVES) {
      if (food.includes(alt.original.toLowerCase())) {
        usedAlternatives.push(alt)
        break
      }
      if (alt.original.toLowerCase().includes(food) || food.includes(alt.original.toLowerCase().split(' ')[0])) {
        usedAlternatives.push(alt)
        break
      }
    }
  }

  if (usedAlternatives.length < 3) {
    usedAlternatives.push(...ALTERNATIVES.slice(0, 5 - usedAlternatives.length))
  }

  return usedAlternatives.slice(0, 5)
}

function generateTips(commonFoods, avgCalories) {
  const tips = []

  if (avgCalories > 2500) {
    tips.push("Sizning kaloriya iste'molingiz yuqori. Porsiyalarni kamaytiring.")
  } else if (avgCalories < 1500) {
    tips.push("Siz kam kaloriya iste'mol qilyapsiz. Porsiyalarni oshiring.")
  } else {
    tips.push("Kaloriya iste'molingiz o'rtacha. Uni saqlab qoling.")
  }

  if (commonFoods.some(f => f.name.toLowerCase().includes('non') || f.name.toLowerCase().includes('osh'))) {
    tips.push("Non o'rniga guruch yoki sabzavotlar iste'mol qilishga harakat qiling.")
  }

  tips.push('Har kuni kamida 2 litr suv iching.')
  tips.push('Ovqatlanishdan 30 daqiqa oldin suv iching — bu ishtahani kamaytiradi.')
  tips.push('Kechki ovqatni 19:00 dan oldin yeyishga harakat qiling.')

  return tips.slice(0, 5)
}

export async function GET(request) {
  const supabase = await getSupabaseServerClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ plan: null })
    }

    const { data: plan } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'personal')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (plan && new Date(plan.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      return Response.json({ plan: plan.plan_data })
    }

    return Response.json({ plan: null })
  } catch (error) {
    console.error('Error fetching personal plan:', error)
    return Response.json({ plan: null })
  }
}

export async function POST(request) {
  const supabase = await getSupabaseServerClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Aloqada emas' }, { status: 401 })
    }

    const { data: { user: profile } } = await supabase.auth.getUser()

    const { data: logs } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!logs || logs.length === 0) {
      return Response.json({ error: "Avval ovqatlanish tarixini qo'shing" }, { status: 400 })
    }

    const uniqueDays = [...new Set(logs.map(l => l.date))]
    if (uniqueDays.length < 3) {
      return Response.json({ error: `${3 - uniqueDays.length} kun qoldi. Kamida 3 kun ovqat qo'shing.` }, { status: 400 })
    }

    const avgCalories = logs.reduce((sum, l) => sum + (l.analysis?.total_calories || 0), 0) / uniqueDays.length

    const highCalorieFoods = logs
      .filter(l => l.analysis?.total_calories > 400)
      .map(l => ({
        name: l.analysis?.food_name,
        calories: l.analysis?.total_calories,
        meal_type: l.meal_type,
      }))

    const commonFoods = {}
    logs.forEach(l => {
      if (l.analysis?.food_name) {
        commonFoods[l.analysis.food_name] = (commonFoods[l.analysis.food_name] || 0) + 1
      }
    })
    const sortedFoods = Object.entries(commonFoods)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))

    const targetCalories = Math.round(avgCalories * 0.85)
    const proteinGrams = Math.round(targetCalories * 0.25 / 4)
    const carbsGrams = Math.round(targetCalories * 0.45 / 4)
    const fatsGrams = Math.round(targetCalories * 0.30 / 9)

    const planData = {
      type: 'personal',
      created_at: new Date().toISOString(),
      target_calories: targetCalories,
      macros: {
        protein: proteinGrams,
        carbs: carbsGrams,
        fats: fatsGrams,
      },
      weekly_plan: generateWeeklyPlan(avgCalories, highCalorieFoods, sortedFoods),
      alternatives: generateAlternatives(highCalorieFoods),
      tips: generateTips(sortedFoods, avgCalories),
      based_on_days: uniqueDays.length,
      avg_calories_analyzed: Math.round(avgCalories),
    }

    await supabase
      .from('diet_plans')
      .insert({
        user_id: user.id,
        type: 'personal',
        plan_data: planData,
        created_at: new Date().toISOString(),
      })

    return Response.json({ plan: planData })
  } catch (error) {
    console.error('Error generating personal plan:', error)
    return Response.json({ error: 'Diet tuzishda xatolik' }, { status: 500 })
  }
}
