'use client'

import { useState, useEffect } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function DietPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchExistingPlan()
  }, [])

  const fetchExistingPlan = async () => {
    try {
      setFetching(true)
      const res = await fetch('/api/plan')
      if (res.ok) {
        const data = await res.json()
        if (data.plan) setPlan(data.plan)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/plan', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Xatolik')
      setPlan(data.plan)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
            AI sizning kaloriyalaringizga asoslanib kunlik ovqatlanish rejasini tuzadi
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          loading={loading}
          variant={plan ? 'secondary' : 'primary'}
          className="shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          {plan ? 'Yangilash' : 'AI Dieta tuzish'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card glass neon="green" className="p-12 text-center">
          <Spinner size="lg" className="mb-4 text-emerald-400 mx-auto" />
          <p className="text-gray-400 text-sm">AI sizga maxsus dieta rejasi tuzyapti...</p>
        </Card>
      )}

      {/* Empty State */}
      {!plan && !loading && (
        <Card glass className="p-12 text-center border border-white/5">
          <span className="text-5xl block mb-4">🥗</span>
          <h3 className="text-xl font-bold text-white mb-2">Dieta rejasi mavjud emas</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Yuqoridagi tugmani bosib, AI sizga kunlik ovqatlanish rejasini tayyorlab bersin.
          </p>
        </Card>
      )}

      {/* Plan Content */}
      {plan && !loading && (
        <div className="space-y-8">
          {/* Macro Overview */}
          <Card glass neon="green" className="relative overflow-hidden">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">📊</span>
              <h2 className="text-lg font-bold text-white">Kunlik Kaloriya va Makronutrientlar</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Kaloriya', val: plan.daily_calories, unit: 'kcal', color: 'text-white' },
                { label: 'Protein', val: plan.macros?.protein, unit: '', color: 'text-blue-400' },
                { label: 'Uglevod', val: plan.macros?.carbs, unit: '', color: 'text-green-400' },
                { label: "Yog'", val: plan.macros?.fats, unit: '', color: 'text-orange-400' },
              ].map((m, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{m.label}</div>
                  <div className={`text-xl font-black ${m.color}`}>{m.val} <span className="text-[9px] opacity-50">{m.unit}</span></div>
                </div>
              ))}
            </div>
          </Card>

          {/* Daily Meals */}
          {plan.plan?.map((dayPlan, index) => (
            <div key={index} className="space-y-4">
              {/* Day Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <div className="px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Kun {dayPlan.day}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              </div>

              {/* Meals */}
              <Card glass className="border border-white/5">
                <div className="space-y-4">
                  {dayPlan.meals?.map((meal, mIndex) => (
                    <div key={mIndex} className={`flex items-start gap-4 ${mIndex > 0 ? 'pt-4 border-t border-white/5' : ''}`}>
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <span className="text-sm">
                          {meal.type === 'Ertuslik' ? '☕' : meal.type === 'Tushlik' ? '🍲' : meal.type === 'Kechlik' ? '🌙' : '🍎'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">{meal.type}</span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{meal.calories} kcal</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{meal.food}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
