import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request) {
  const supabase = await getSupabaseServerClient()
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
      .limit(200)

    if (!logs || logs.length === 0) {
      return Response.json({ summary: null })
    }

    const uniqueDays = [...new Set(logs.map(l => l.date))]
    const totalDays = uniqueDays.length
    const totalCalories = logs.reduce((sum, l) => sum + (l.analysis?.total_calories || 0), 0)
    const dailyTotals = uniqueDays.map(day =>
      logs.filter(l => l.date === day).reduce((s, l) => s + (l.analysis?.total_calories || 0), 0)
    )
    const avgCalories = dailyTotals.reduce((a, b) => a + b, 0) / (dailyTotals.length || 1)

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
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=900'
      }
    })
  } catch (error) {
    console.error('Error fetching food summary:', error)
    return Response.json({ summary: null })
  }
}
