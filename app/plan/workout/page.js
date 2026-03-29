'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

const DAY_COLORS = {
  1: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400' },
  2: { bg: 'bg-green-500/5', border: 'border-green-500/20', text: 'text-green-400' },
  3: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-400' },
  4: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400' },
  5: { bg: 'bg-red-500/5', border: 'border-red-500/20', text: 'text-red-400' },
  6: { bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', text: 'text-cyan-400' },
  7: { bg: 'bg-pink-500/5', border: 'border-pink-500/20', text: 'text-pink-400' },
}

export default function WorkoutPage() {
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
            <span className="text-3xl">💪</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Mashg'ulot Rejasi</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Sizning maqsadingizga mos individual mashg'ulot dasturi
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          loading={generateMutation.isPending}
          variant={planData ? 'secondary' : 'primary'}
          className="shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          {planData ? 'Yangilash' : 'AI Mashq tuzish'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {generateMutation.isPending && (
        <Card glass neon="blue" className="p-12 text-center">
          <Spinner size="lg" className="mb-4 text-blue-400 mx-auto" />
          <p className="text-gray-400 text-sm">AI sizga individual mashq rejasi tuzyapti...</p>
          <p className="text-gray-600 text-xs mt-2">Mushak guruhlari va mashqlarni tanlaydi...</p>
        </Card>
      )}

      {/* Empty State */}
      {!planData && !generateMutation.isPending && (
        <Card glass className="p-12 text-center border border-white/5">
          <span className="text-5xl block mb-4">🏋️</span>
          <h3 className="text-xl font-bold text-white mb-2">Mashg'ulot rejasi mavjud emas</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Yuqoridagi tugmani bosib, AI sizga individual mashg'ulot rejasini tayyorlab bersin.
          </p>
        </Card>
      )}

      {/* Plan Content */}
      {planData && !generateMutation.isPending && (
        <div className="space-y-8">
          {/* Weekly Goal */}
          {planData.weekly_goal && (
            <Card glass neon="purple" className="relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">🎯</span>
                <h2 className="text-lg font-bold text-white">Haftalik Maqsad</h2>
              </div>
              <p className="text-purple-200 text-base leading-relaxed font-light">{planData.weekly_goal}</p>
            </Card>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card glass className="p-4 text-center border border-white/5">
              <div className="text-2xl font-black text-blue-400">{planData.plan?.filter(d => d.workout).length || 0}</div>
              <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">Mashq kuni</div>
            </Card>
            <Card glass className="p-4 text-center border border-white/5">
              <div className="text-2xl font-black text-green-400">{planData.plan?.filter(d => !d.workout).length || 0}</div>
              <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">Dam olish</div>
            </Card>
            <Card glass className="p-4 text-center border border-white/5">
              <div className="text-2xl font-black text-purple-400">7</div>
              <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-1">Jami kun</div>
            </Card>
          </div>

          {/* Daily Workouts */}
          {planData.plan?.map((dayPlan, index) => {
            const colors = DAY_COLORS[dayPlan.day] || DAY_COLORS[1]
            
            return (
              <div key={index} className="space-y-4">
                {/* Day Divider */}
                <div className="flex items-center gap-4">
                  <div className={`h-px flex-1 bg-gradient-to-r from-transparent via-${colors.text.replace('text-', '')}-500/20 to-transparent`} />
                  <div className={`px-4 py-2 rounded-full border ${colors.border} ${colors.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black ${colors.text} uppercase tracking-[0.2em]`}>Kun {dayPlan.day}</span>
                      {dayPlan.day_name && (
                        <span className="text-[10px] text-gray-500">| {dayPlan.day_name}</span>
                      )}
                    </div>
                    {dayPlan.focus && (
                      <p className={`text-[9px] ${colors.text} opacity-60 text-center mt-0.5`}>{dayPlan.focus}</p>
                    )}
                  </div>
                  <div className={`h-px flex-1 bg-gradient-to-r from-transparent via-${colors.text.replace('text-', '')}-500/20 to-transparent`} />
                </div>

                {dayPlan.workout ? (
                  <Card glass className={`border ${colors.border}`}>
                    {/* Workout Header */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                        <span className="text-xl">⚡</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{dayPlan.workout.title}</h3>
                        {dayPlan.workout.duration && (
                          <p className="text-xs text-gray-500">{dayPlan.workout.duration}</p>
                        )}
                      </div>
                    </div>

                    {/* Warmup */}
                    {dayPlan.workout.warmup && (
                      <div className="flex items-center gap-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 mb-4">
                        <span className="text-lg">🔥</span>
                        <div>
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Isish mashqlari</span>
                          <p className="text-sm text-gray-300">{dayPlan.workout.warmup}</p>
                        </div>
                      </div>
                    )}

                    {/* Exercises */}
                    <div className="space-y-3 mb-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asosiy mashqlar</h4>
                      {dayPlan.workout.exercises?.map((exercise, eIndex) => (
                        <div key={eIndex} className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center text-xs font-black ${colors.text}`}>
                              {eIndex + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-bold text-white mb-1">{exercise.name}</h5>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                                  {exercise.sets} set
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                                  {exercise.reps} reps
                                </span>
                                {exercise.rest && (
                                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                                    {exercise.rest} rest
                                  </span>
                                )}
                              </div>
                              {exercise.note && (
                                <p className="text-[10px] text-gray-500 mt-2 italic">{exercise.note}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cardio */}
                    {dayPlan.workout.cardio && (
                      <div className="flex items-center gap-3 p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/10 mb-4">
                        <span className="text-lg">🏃</span>
                        <div>
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Kardiyo</span>
                          <p className="text-sm text-gray-300">
                            {dayPlan.workout.cardio.type} - {dayPlan.workout.cardio.duration} ({dayPlan.workout.cardio.intensity})
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Cooldown */}
                    {dayPlan.workout.cooldown && (
                      <div className="flex items-center gap-3 p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
                        <span className="text-lg">🧘</span>
                        <div>
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Tinchlantirish</span>
                          <p className="text-sm text-gray-300">{dayPlan.workout.cooldown}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card glass className="border border-white/5 p-8 text-center">
                    <span className="text-4xl block mb-3">🧘</span>
                    <p className="text-gray-400 text-sm font-medium">Dam olish kuni</p>
                    <p className="text-gray-600 text-xs mt-1">Tanangizni tiklash uchun vaqt</p>
                  </Card>
                )}
              </div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}
