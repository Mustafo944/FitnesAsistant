'use client'

import { useState, useEffect } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'

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
    <PageWrapper className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Haftalik Reja</h1>
          <p className="text-gray-400">
            Sizning tana o'lchovlaringiz va maqsadingizga moslashtirilgan AI dieta va mashg'ulot rejasi.
          </p>
        </div>
        <Button 
          onClick={handleGeneratePlan} 
          loading={loading}
          variant={plan ? 'secondary' : 'primary'}
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
          icon={
            <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="Reja mavjud emas"
          description="Siz hali shaxsiy reja yaratmagansiz. Yuqoridagi tugmani bosib AIdan siz uchun reja tuzishni so'rang."
        />
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
          <Spinner size="lg" className="mb-4 text-violet-400 relative z-10" />
          <p className="text-gray-400 text-sm relative z-10 animate-pulse">
            AI sizning profillaringizni tahlil qilib, mukammal reja tuzyapti. Iltimos kuting...
          </p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-6">
          <Card glass className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
            <h2 className="text-xl font-bold text-white mb-2">Haftalik Maqsad</h2>
            <p className="text-violet-200">{plan.weekly_goal}</p>
            
            <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="text-sm text-gray-400 mb-1">Kunlik Kaloriya</div>
                <div className="text-2xl font-bold text-white">{plan.daily_calories} <span className="text-sm text-gray-500">kcal</span></div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="text-sm text-gray-400 mb-1">Oqsillar</div>
                <div className="text-2xl font-bold text-blue-400">{plan.macros?.protein}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="text-sm text-gray-400 mb-1">Uglevodlar</div>
                <div className="text-2xl font-bold text-green-400">{plan.macros?.carbs}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="text-sm text-gray-400 mb-1">Yog'lar</div>
                <div className="text-2xl font-bold text-yellow-500">{plan.macros?.fats}</div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6">
            {plan.plan?.map((dayPlan, index) => (
              <Card key={index} glass className="relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-violet-500/50 group-hover:bg-violet-400 transition-colors" />
                
                <h3 className="text-xl font-bold text-white mb-6 pl-4 border-b border-white/5 pb-4">
                  Kun {dayPlan.day}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8 pl-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-violet-400 font-medium mb-4">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Ovqatlanish
                    </h4>
                    <ul className="space-y-3">
                      {dayPlan.meals?.map((meal, mIndex) => (
                        <li key={mIndex} className="text-sm">
                          <span className="text-gray-400 block mb-1">{meal.type} — <span className="text-gray-500">{meal.calories} kcal</span></span>
                          <span className="text-gray-200">{meal.food}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {dayPlan.workout && (
                    <div className="md:border-l md:border-white/5 md:pl-8">
                      <h4 className="flex items-center gap-2 text-indigo-400 font-medium mb-4">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Mashg'ulot: {dayPlan.workout.title}
                      </h4>
                      <ul className="space-y-2">
                        {dayPlan.workout.exercises?.map((exercise, eIndex) => (
                          <li key={eIndex} className="text-sm flex items-start gap-2">
                            <span className="text-indigo-500 mt-0.5">•</span>
                            <span className="text-gray-300">{exercise}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
