'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Link from 'next/link'

const MEAL_ICONS = {
  'ertalabki_nonushta': '☀️',
  'ertalabki nonushta': '☀️',
  'tushlik': '🍲',
  'kechkiqlik': '🍎',
  'kechki ovqat': '🌙',
  'Nonushta': '☀️',
  'Tushlik': '🍲',
  'Kechkiqlik': '🍎',
  'Kechki ovqat': '🌙',
  'default': '🍽️',
}

function getMealIcon(type) {
  if (!type) return MEAL_ICONS.default
  const lower = type.toLowerCase()
  if (lower.includes('non') || lower.includes('erta')) return '☀️'
  if (lower.includes('tush') || lower.includes('lunch')) return '🍲'
  if (lower.includes('kech') || lower.includes('ovqat') || lower.includes('dinner')) return '🌙'
  if (lower.includes('snack') || lower.includes('ekst') || lower.includes('kechkiq')) return '🍎'
  return '🍽️'
}

export default function DietPage() {
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const { data: foodSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['food-summary'],
    queryFn: async () => {
      const res = await fetch('/api/food/summary')
      if (!res.ok) return null
      return res.json()
    },
    staleTime: 30 * 1000,
  })

  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ['personal-plan'],
    queryFn: async () => {
      const res = await fetch('/api/plan/personal')
      if (!res.ok) return null
      const data = await res.json()
      return data.plan
    },
    staleTime: 10 * 60 * 1000,
  })

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/plan/personal', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Xatolik')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['personal-plan'], data.plan)
    },
  })

  const handleGenerate = () => {
    setError('')
    generateMutation.mutate()
  }

  if (summaryLoading || planLoading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </PageWrapper>
    )
  }

  const daysLogged = foodSummary?.summary?.total_days || 0
  const avgCalories = foodSummary?.summary?.avg_daily_calories || 2000
  const highCalorieFoods = foodSummary?.summary?.high_calorie_foods || []
  const commonFoods = foodSummary?.summary?.common_foods || []

  return (
    <PageWrapper className="max-w-2xl mx-auto py-6 md:py-8 px-4 pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🍽️</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Shaxsiy Dieta</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Sizning 3 kunlik ovqatlanish tahlilingiz asosida tuzilgan diet
          </p>
        </div>
        {daysLogged >= 3 && (
          <Button
            onClick={handleGenerate}
            loading={generateMutation.isPending}
            variant={planData ? 'secondary' : 'primary'}
            className="shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            {planData ? 'Yangilash' : 'Diet tuzish'}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Analysis Summary */}
      {daysLogged >= 3 && (
        <Card glass neon="green" className="border-emerald-500/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">📊</span>
            <h2 className="text-base font-bold text-white">Sizning Tahlilingiz</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 p-3 rounded-xl">
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">O'rtacha kunlik</div>
              <div className="text-xl font-black text-white">{avgCalories} <span className="text-[9px] opacity-50">kcal</span></div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl">
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Kunlar</div>
              <div className="text-xl font-black text-emerald-400">{daysLogged}</div>
            </div>
          </div>

          {highCalorieFoods.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚠️</span>
                <h3 className="text-sm font-bold text-amber-400">Ko'p kaloriyali ovqatlar</h3>
              </div>
              <div className="space-y-2">
                {highCalorieFoods.slice(0, 3).map((food, i) => (
                  <div key={i} className="flex items-center justify-between bg-amber-500/5 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-sm text-white">{food.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({food.meal_type})</span>
                    </div>
                    <span className="text-sm font-bold text-amber-400">{food.calories} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {commonFoods.length > 0 && (
            <div className="border-t border-white/5 pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🍴</span>
                <h3 className="text-sm font-bold text-emerald-400">Ko'p iste'mol qilingan</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {commonFoods.slice(0, 5).map((food, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                    {food.name} ({food.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Loading State */}
      {generateMutation.isPending && (
        <Card glass neon="green" className="p-12 text-center">
          <Spinner size="lg" className="mb-4 text-emerald-400 mx-auto" />
          <p className="text-gray-400 text-sm">AI sizning tahlilingiz asosida diet tuzyapti...</p>
          <p className="text-gray-600 text-xs mt-2">Yuqori kaloriyali ovqatlarni almashtiradi...</p>
        </Card>
      )}

      {/* Empty State - Not enough data */}
      {daysLogged < 3 && !generateMutation.isPending && (
        <Card glass className="p-12 text-center border-white/5">
          <span className="text-5xl block mb-4">📸</span>
          <h3 className="text-xl font-bold text-white mb-2">3 kunlik tahlil kerak</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Sizning shaxsiy dietangizni tuzish uchun avval 3 kun davomida ovqatlaringizni rasmga oling.
          </p>
          <Link 
            href="/food"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
          >
            Ovqat qo'shish
          </Link>
        </Card>
      )}

      {/* Empty State - Has data but no plan */}
      {daysLogged >= 3 && !planData && !generateMutation.isPending && (
        <Card glass className="p-12 text-center border-white/5">
          <span className="text-5xl block mb-4">🤖</span>
          <h3 className="text-xl font-bold text-white mb-2">AI Dieta tayyor</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Yuqoridagi tahlil asosida sizga 1 haftalik diet tuzamiz. Yuqoridagi tugmani bosing!
          </p>
        </Card>
      )}

      {/* Plan Content */}
      {planData && !generateMutation.isPending && (
        <div className="space-y-6">
          {/* Macro Overview */}
          <Card glass neon="green" className="relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">📊</span>
              <h2 className="text-base font-bold text-white">Kunlik Maqsad</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Kaloriya', val: planData.target_calories, unit: 'kcal', color: 'text-white' },
                { label: 'Protein', val: planData.macros?.protein, unit: 'g', color: 'text-blue-400' },
                { label: 'Uglevod', val: planData.macros?.carbs, unit: 'g', color: 'text-green-400' },
                { label: "Yog'", val: planData.macros?.fats, unit: 'g', color: 'text-orange-400' },
              ].map((m, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{m.label}</div>
                  <div className={`text-lg font-black ${m.color}`}>{m.val || 0} <span className="text-[9px] opacity-50">{m.unit}</span></div>
                </div>
              ))}
            </div>
          </Card>

          {/* Alternatives */}
          {planData.alternatives && planData.alternatives.length > 0 && (
            <Card glass neon="amber" className="border-amber-500/20">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">🔄</span>
                <h2 className="text-base font-bold text-white">Alternativlar</h2>
              </div>
              <div className="space-y-3">
                {planData.alternatives.map((alt, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-lg">
                      {getMealIcon(alt.original)}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 line-through">{alt.original}</div>
                      <div className="text-sm text-white font-medium">{alt.alternative}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-red-400 line-through">{alt.original_cal}</div>
                      <div className="text-sm text-emerald-400 font-bold">{alt.alt_cal} kcal</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Weekly Meals */}
          {planData.weekly_plan?.map((dayPlan, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <div className="px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                    {dayPlan.day_name || `Kun ${index + 1}`}
                  </span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              </div>

              <Card glass className="border-white/5 p-4">
                <div className="space-y-3">
                  {dayPlan.meals?.map((meal, mIndex) => (
                    <div key={mIndex} className={`flex items-start gap-3 ${mIndex > 0 ? 'pt-3 border-t border-white/5' : ''}`}>
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
                        {getMealIcon(meal.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-emerald-400 uppercase">{meal.type}</span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{meal.calories} kcal</span>
                        </div>
                        <p className="text-white text-sm">{meal.food}</p>
                        {meal.note && (
                          <p className="text-[10px] text-gray-500 mt-1">{meal.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}

          {/* Tips */}
          {planData.tips && planData.tips.length > 0 && (
            <Card glass className="border border-amber-500/10 bg-amber-500/5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg">💡</span>
                <h2 className="text-base font-bold text-amber-400">Muhim Maslahatlar</h2>
              </div>
              <ul className="space-y-2">
                {planData.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </PageWrapper>
  )
}
