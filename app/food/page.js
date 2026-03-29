'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

const MEAL_TYPES = [
  { id: 'ertalabki_nonushta', label: 'Ertalabki nonushta', icon: '☀️', time: '7:00' },
  { id: 'tushlik', label: 'Tushlik', icon: '🍲', time: '13:00' },
  { id: 'kechkiqlik', label: 'Kechkiqlik', icon: '🍎', time: '16:00' },
  { id: 'kechki_ovqat', label: 'Kechki ovqat', icon: '🌙', time: '19:00' },
]

const DAYS_NEEDED = 3

function formatDate(date) {
  const d = new Date(date)
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

function getDayName(dateStr) {
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
  return days[new Date(dateStr).getDay()]
}

export default function FoodPage() {
  const queryClient = useQueryClient()
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showPlanPrompt, setShowPlanPrompt] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['food-logs'],
    queryFn: async () => {
      const res = await fetch('/api/food/logs')
      if (!res.ok) return []
      const data = await res.json()
      return data.logs || []
    },
  })

  const { data: summary } = useQuery({
    queryKey: ['food-summary'],
    queryFn: async () => {
      const res = await fetch('/api/food/summary')
      if (!res.ok) return null
      return res.json()
    },
  })

  const addMealMutation = useMutation({
    mutationFn: async ({ mealType, imageUrl, analysis }) => {
      const res = await fetch('/api/food/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal_type: mealType, image_url: imageUrl, analysis }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Xatolik')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-logs'] })
      queryClient.invalidateQueries({ queryKey: ['food-summary'] })
      setSelectedMeal(null)
      setFile(null)
      setPreview(null)
    },
  })

  const analyzeMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch('/api/food/analyze', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Xatolik')
      }
      return res.json()
    },
  })

  const uniqueDays = logs ? [...new Set(logs.map(l => l.date))] : []
  const daysLogged = uniqueDays.length

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleAnalyzeAndSave = async () => {
    if (!file || !selectedMeal) return
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('meal_type', selectedMeal)

      const analysis = await analyzeMutation.mutateAsync(formData)
      
      await addMealMutation.mutateAsync({
        mealType: selectedMeal,
        imageUrl: preview,
        analysis,
      })

      setShowPlanPrompt(true)
      setTimeout(() => setShowPlanPrompt(false), 3000)
    } catch (err) {
      console.error(err)
      let errorMsg = err.message || 'Xatolik yuz berdi'
      if (errorMsg.includes('image') || errorMsg.includes('model') || errorMsg.includes('read') || errorMsg.includes('does not support')) {
        errorMsg = "Rasmni tahlil qilishda xatolik. Iltimos, boshqa rasm bilan qayta urinib ko'ring."
      }
      setError(errorMsg)
      setTimeout(() => setError(''), 5000)
    } finally {
      setUploading(false)
    }
  }

  const getCaloriesForDay = (date) => {
    return logs
      ?.filter(l => l.date === date)
      ?.reduce((sum, l) => sum + (l.analysis?.total_calories || 0), 0) || 0
  }

  const groupedByDay = logs?.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = []
    acc[log.date].push(log)
    return acc
  }, {}) || {}

  if (logsLoading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="max-w-2xl mx-auto py-6 md:py-8 px-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            Food Tracking
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
          Ovqatlanish Tahlili
        </h1>
        <p className="text-gray-500 text-sm">
          3 kun davomida ovqatlaringizni rasmga oling — biz sizga diet tuzamiz
        </p>
      </div>

      {/* Progress */}
      <Card glass className="mb-6 border-emerald-500/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-white">Tahlil progressi</span>
          <span className="text-sm font-bold text-emerald-400">{daysLogged}/{DAYS_NEEDED} kun</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((daysLogged / DAYS_NEEDED) * 100, 100)}%` }}
          />
        </div>
        {daysLogged < DAYS_NEEDED ? (
          <p className="text-xs text-gray-500 mt-2">
            {DAYS_NEEDED - daysLogged} kun qoldi. Har kuni kamida 3 marta ovqatlaning.
          </p>
        ) : (
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <span>✓</span> 3 kunlik tahlil yakunlandi! Diet rejasini ko'rish uchun pastga o'ting.
          </p>
        )}
      </Card>

      {/* Add Food */}
      <Card glass className="mb-6 border-white/5">
        <h2 className="text-base font-bold text-white mb-4">Ovqat qo'shish</h2>
        
        {!selectedMeal ? (
          <div className="grid grid-cols-2 gap-3">
            {MEAL_TYPES.map(meal => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal.id)}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left"
              >
                <span className="text-2xl mb-2 block">{meal.icon}</span>
                <span className="text-sm font-semibold text-white block">{meal.label}</span>
                <span className="text-xs text-gray-500">{meal.time}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-400">
                {MEAL_TYPES.find(m => m.id === selectedMeal)?.label}
              </span>
              <button 
                onClick={() => { setSelectedMeal(null); setFile(null); setPreview(null) }}
                className="text-xs text-gray-500 hover:text-white"
              >
                Bekor qilish
              </button>
            </div>

            {!preview ? (
              <button
                onClick={() => inputRef.current?.click()}
                className="w-full py-12 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/10 rounded-xl hover:border-emerald-500/30 transition-colors cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">Rasmga olish yoki yuklash</p>
                  <p className="text-gray-500 text-xs mt-1">JPG, PNG · 5MB gacha</p>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden">
                  <img src={preview} alt="Ovqat" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => { setFile(null); setPreview(null) }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <Button
                  onClick={handleAnalyzeAndSave}
                  loading={uploading || analyzeMutation.isPending}
                  className="w-full"
                >
                  {uploading ? 'Tahlil qilinmoqda...' : 'Tahlil qilish va saqlash'}
                </Button>
                {error && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </Card>

      {/* Show Plan Button */}
      {daysLogged >= DAYS_NEEDED && (
        <Button 
          onClick={() => window.location.href = '/plan/diet'}
          className="w-full mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          📋 Shaxsiy dietani ko'rish
        </Button>
      )}

      {/* Daily Summary */}
      {Object.keys(groupedByDay).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Kunlik tarix</h2>
          
          {Object.entries(groupedByDay)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .map(([date, dayLogs]) => {
              const totalCal = getCaloriesForDay(date)
              return (
                <Card key={date} glass className="border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-white font-bold">{getDayName(date)}</span>
                      <span className="text-gray-500 text-sm ml-2">{formatDate(date)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-emerald-400">{totalCal}</span>
                      <span className="text-xs text-gray-500 ml-1">kcal</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {dayLogs.map((log, idx) => {
                      const mealInfo = MEAL_TYPES.find(m => m.id === log.meal_type)
                      return (
                        <div key={idx} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                          <span className="text-xl">{mealInfo?.icon || '🍽️'}</span>
                          <div className="flex-1">
                            <span className="text-sm text-white font-medium">{mealInfo?.label}</span>
                            {log.analysis?.food_name && (
                              <p className="text-xs text-gray-500">{log.analysis.food_name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-emerald-400">{log.analysis?.total_calories || 0}</span>
                            <span className="text-xs text-gray-500 ml-1">kcal</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            })}
        </div>
      )}

      {/* Empty State */}
      {Object.keys(groupedByDay).length === 0 && (
        <Card glass className="p-12 text-center border-white/5">
          <span className="text-5xl block mb-4">📸</span>
          <h3 className="text-lg font-bold text-white mb-2">Hali ovqat qo'shilmagan</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Yuqoridan ovqat rasmini yuklab, 3 kun davomida ovqatlanishingizni kuzating.
          </p>
        </Card>
      )}

      {/* Plan Prompt Toast */}
      {showPlanPrompt && (
        <div className="fixed bottom-24 left-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-xl text-center text-sm font-medium shadow-lg animate-pulse z-50">
          ✓ Ovqat qo'shildi! {daysLogged >= DAYS_NEEDED ? "Endi dietangizni ko'rishingiz mumkin!" : `${DAYS_NEEDED - daysLogged} kun qoldi.`}
        </div>
      )}
    </PageWrapper>
  )
}
