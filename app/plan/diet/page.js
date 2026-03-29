'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

const MEAL_ICONS = {
  'Nonushta': '☀️',
  'Nonushta (7:00)': '☀️',
  'ertalabki nonushta': '☀️',
  'ertalabki nonushta (7:00)': '☀️',
  'cho\'michka': '🍎',
  'cho\'michka (10:00)': '🍎',
  'tushlik': '🍲',
  'tushlik (13:00)': '🍲',
  'kechkiqlik': '🍪',
  'kechkiqlik (16:00)': '🍪',
  'kechki ovqat': '🌙',
  'kechki ovqat (19:00)': '🌙',
  'default': '🍽️',
}

function getMealIcon(type) {
  if (!type) return MEAL_ICONS.default
  const lower = type.toLowerCase()
  if (lower.includes('non') || lower.includes('erta')) return '☀️'
  if (lower.includes('tush') || lower.includes('lunch')) return '🍲'
  if (lower.includes('kech') || lower.includes('ovqat') || lower.includes('dinner')) return '🌙'
  if (lower.includes('cho') || lower.includes('snack') || lower.includes('ekst')) return '🍎'
  return '🍽️'
}

export default function DietPage() {
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const { data: planData, isLoading: fetching } = useQuery({
    queryKey: ['plan'],
    queryFn: async () => {
      const res = await fetch('/api/plan')
      if (!res.ok) return null
      const data = await res.json()
      return data.plan
    },
    staleTime: 10 * 60 * 1000,
  })

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/plan', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Xatolik')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['plan'], data.plan)
    },
  })

  const handleGenerate = () => {
    setError('')
    generateMutation.mutate()
  }

  if (fetching) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="max-w-2xl mx-auto py-8 px-4 pb-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🍽️</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Dieta Rejasi</h1>
          </div>
          <p className="text-gray-500 text-sm">
            AI sizning profilngizga asoslanib individual ovqatlanish rejasini tuzadi
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          loading={generateMutation.isPending}
          variant={planData ? 'secondary' : 'primary'}
          className="shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          {planData ? 'Yangilash' : 'AI Dieta tuzish'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {generateMutation.isPending && (
        <Card glass neon="green" className="p-12 text-center">
          <Spinner size="lg" className="mb-4 text-emerald-400 mx-auto" />
          <p className="text-gray-400 text-sm">AI sizga maxsus dieta rejasi tuzyapti...</p>
          <p className="text-gray-600 text-xs mt-2">Kunlik kaloriya va makrolarni hisoblaydi...</p>
        </Card>
      )}

      {/* Empty State */}
      {!planData && !generateMutation.isPending && (
        <Card glass className="p-12 text-center border border-white/5">
          <span className="text-5xl block mb-4">🥗</span>
          <h3 className="text-xl font-bold text-white mb-2">Dieta rejasi mavjud emas</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Yuqoridagi tugmani bosib, AI sizga kunlik ovqatlanish rejasini tayyorlab bersin.
          </p>
        </Card>
      )}

      {/* Plan Content */}
      {planData && !generateMutation.isPending && (
        <div className="space-y-8">
          {/* Macro Overview */}
          <Card glass neon="green" className="relative overflow-hidden">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">📊</span>
              <h2 className="text-lg font-bold text-white">Kunlik Kaloriya va Makronutrientlar</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Kaloriya', val: planData.daily_calories, unit: 'kcal', color: 'text-white' },
                { label: 'Protein', val: planData.macros?.protein, unit: '', color: 'text-blue-400' },
                { label: 'Uglevod', val: planData.macros?.carbs, unit: '', color: 'text-green-400' },
                { label: "Yog'", val: planData.macros?.fats, unit: '', color: 'text-orange-400' },
              ].map((m, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{m.label}</div>
                  <div className={`text-xl font-black ${m.color}`}>{m.val} <span className="text-[9px] opacity-50">{m.unit}</span></div>
                </div>
              ))}
            </div>
            
            {/* Hydration */}
            {planData.hydration && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                <span className="text-lg">💧</span>
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Suv me&apos;yori</span>
                  <p className="text-sm text-gray-300">{planData.hydration}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Weekly Goal */}
          {planData.weekly_goal && (
            <Card glass neon="purple" className="border-l-4 border-l-violet-500">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">🎯</span>
                <h2 className="text-base font-bold text-white">Haftalik Maqsad</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{planData.weekly_goal}</p>
            </Card>
          )}

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

          {/* Daily Meals */}
          {planData.plan?.map((dayPlan, index) => (
            <div key={index} className="space-y-4">
              {/* Day Header */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <div className="px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Kun {dayPlan.day}</span>
                    {dayPlan.day_name && (
                      <span className="text-[10px] text-gray-500">| {dayPlan.day_name}</span>
                    )}
                  </div>
                  {dayPlan.focus && (
                    <p className="text-[9px] text-emerald-400/60 text-center mt-0.5">{dayPlan.focus}</p>
                  )}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              </div>

              {/* Meals */}
              <Card glass className="border border-white/5">
                <div className="space-y-4">
                  {dayPlan.meals?.map((meal, mIndex) => (
                    <div key={mIndex} className={`flex items-start gap-4 ${mIndex > 0 ? 'pt-4 border-t border-white/5' : ''}`}>
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
                        {getMealIcon(meal.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{meal.type}</span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{meal.calories} kcal</span>
                        </div>
                        <p className="text-white text-sm leading-relaxed font-medium">{meal.food}</p>
                        {meal.macros && (
                          <p className="text-[10px] text-gray-500 mt-1">{meal.macros}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Day Total */}
                  {dayPlan.meals && (
                    <div className="pt-4 border-t border-emerald-500/10 mt-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Kunlik jami:</span>
                        <span className="font-bold text-emerald-400">
                          {dayPlan.meals.reduce((sum, m) => sum + (m.calories || 0), 0)} kcal
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
