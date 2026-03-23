'use client'

import { useState, useEffect } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import WorkoutPlan from '@/components/dashboard/WorkoutPlan'
import DietTips from '@/components/dashboard/DietTips'

export default function PlanPage() {
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
        if (data.plan) {
          setPlan(data.plan)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
    }
  }

  const handleGeneratePlan = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/plan', { method: 'POST' })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || 'Reja generatsiya qilishda xatolik')
      }
      
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
    <PageWrapper className="max-w-4xl mx-auto py-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Haftalik Reja</h1>
          <p className="text-gray-500 font-medium">
            AI tomonidan siz uchun tayyorlangan maxsus dieta va mashg&apos;ulotlar.
          </p>
        </div>
        <Button 
          onClick={handleGeneratePlan} 
          loading={loading}
          variant={plan ? 'secondary' : 'primary'}
          className="shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:scale-105"
        >
          {plan ? 'Rejani yangilash' : 'Yangi reja yaratish'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!plan && !loading && (
        <EmptyState
          icon={<span className="text-4xl">📋</span>}
          title="Reja mavjud emas"
          description="Siz hali shaxsiy reja yaratmagansiz. Yuqoridagi tugmani bosib AIdan siz uchun reja tuzishni so'rang."
        />
      )}

      {loading && (
        <Card glass neon="purple" className="p-12 text-center">
          <Spinner size="lg" className="mb-4 text-violet-400 mx-auto" />
          <p className="text-gray-400 text-sm">
            AI sizning profillaringizni tahlil qilib, mukammal reja tuzyapti...
          </p>
        </Card>
      )}

      {plan && !loading && (
        <div className="space-y-12">
          {/* Haftalik Maqsad & Macros */}
          <Card glass neon="purple" className="relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🎯</span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Haftalik Maqsad</h2>
            </div>
            <p className="text-violet-200 text-lg mb-8 leading-relaxed font-light">{plan.weekly_goal}</p>
            
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Kaloriya', val: plan.daily_calories, unit: 'kcal', color: 'text-white' },
                { label: 'Protein', val: plan.macros?.protein, unit: 'g', color: 'text-blue-400' },
                { label: 'Uglevod', val: plan.macros?.carbs, unit: 'g', color: 'text-green-400' },
                { label: 'Yog\'', val: plan.macros?.fats, unit: 'g', color: 'text-orange-400' },
              ].map((m, i) => (
                <div key={i} className="bg-white/5 p-5 rounded-3xl border border-white/5 backdrop-blur-md">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{m.label}</div>
                  <div className={`text-2xl font-black ${m.color}`}>{m.val} <span className="text-[10px] opacity-50 font-medium">{m.unit}</span></div>
                </div>
              ))}
            </div>
          </Card>

          {/* Kunlik Rejalar */}
          <div className="space-y-16">
            {plan.plan?.map((dayPlan, index) => (
              <div key={index} className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Kun {dayPlan.day}</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Dieta */}
                  <DietTips tips={dayPlan.meals?.map(m => `${m.type}: ${m.food} (${m.calories} kcal)`) || []} />
                  
                  {/* Mashqlar */}
                  {dayPlan.workout && (
                    <WorkoutPlan workouts={[
                      { 
                        title: dayPlan.workout.title, 
                        frequency: dayPlan.workout.exercises?.join(' • ') || 'Profilaktika' 
                      }
                    ]} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
