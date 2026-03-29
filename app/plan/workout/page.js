'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

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
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Mashg&apos;ulot Rejasi</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Sizning maqsadingizga mos individual mashg&apos;ulot dasturi
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
        </Card>
      )}

      {/* Empty State */}
      {!planData && !generateMutation.isPending && (
        <Card glass className="p-12 text-center border border-white/5">
          <span className="text-5xl block mb-4">🏋️</span>
          <h3 className="text-xl font-bold text-white mb-2">Mashg&apos;ulot rejasi mavjud emas</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Yuqoridagi tugmani bosib, AI sizga individual mashg&apos;ulot rejasini tayyorlab bersin.
          </p>
        </Card>
      )}

      {/* Plan Content */}
      {planData && !generateMutation.isPending && (
        <div className="space-y-8">
          {/* Weekly Goal */}
          <Card glass neon="blue" className="relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🎯</span>
              <h2 className="text-lg font-bold text-white">Haftalik Maqsad</h2>
            </div>
            <p className="text-blue-200 text-base leading-relaxed font-light">{planData.weekly_goal}</p>
          </Card>

          {/* Daily Workouts */}
          {planData.plan?.map((dayPlan, index) => (
            <div key={index} className="space-y-4">
              {/* Day Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <div className="px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Kun {dayPlan.day}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              </div>

              {dayPlan.workout ? (
                <Card glass className="border border-blue-500/10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-sm">⚡</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{dayPlan.workout.title}</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {dayPlan.workout.exercises?.map((exercise, eIndex) => (
                      <div key={eIndex} className="flex items-center gap-3 bg-white/3 rounded-xl px-4 py-3 border border-white/5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400">
                          {eIndex + 1}
                        </div>
                        <span className="text-sm text-gray-300 font-medium">{exercise}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card glass className="border border-white/5 p-6 text-center">
                  <span className="text-2xl block mb-2">🧘</span>
                  <p className="text-gray-500 text-sm">Dam olish kuni</p>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
