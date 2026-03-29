import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Aloqada emas' }, { status: 401 })
    }

    const { data: logs } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!logs || logs.length === 0) {
      return Response.json({ summary: null })
    }

    const uniqueDays = [...new Set(logs.map(l => l.date))]
    const totalDays = uniqueDays.length
    const avgCalories = logs.reduce((sum, l) => sum + (l.analysis?.total_calories || 0), 0) / logs.length
    const totalCalories = logs.reduce((sum, l) => sum + (l.analysis?.total_calories || 0), 0)

    const highCalorieFoods = logs
      .filter(l => l.analysis?.total_calories > 400)
      .map(l => ({
        name: l.analysis?.food_name,
        calories: l.analysis?.total_calories,
        meal_type: l.meal_type,
        alternatives: l.analysis?.alternatives || [],
      }))

    const commonFoods = {}
    logs.forEach(l => {
      if (l.analysis?.food_name) {
        commonFoods[l.analysis.food_name] = (commonFoods[l.analysis.food_name] || 0) + 1
      }
    })

    const sortedFoods = Object.entries(commonFoods)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    return Response.json({
      summary: {
        total_days: totalDays,
        total_meals: logs.length,
        total_calories: Math.round(totalCalories),
        avg_daily_calories: Math.round(avgCalories),
        unique_days: uniqueDays,
        high_calorie_foods: highCalorieFoods,
        common_foods: sortedFoods,
        days_logged: uniqueDays.map(d => ({
          date: d,
          calories: logs.filter(l => l.date === d).reduce((sum, l) => sum + (l.analysis?.total_calories || 0), 0),
          meals: logs.filter(l => l.date === d).length,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching food summary:', error)
    return Response.json({ summary: null })
  }
}
