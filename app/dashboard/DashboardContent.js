'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import SummaryCard from '@/components/dashboard/SummaryCard'
import BmiCard from '@/components/dashboard/BmiCard'
import CalorieCard from '@/components/dashboard/CalorieCard'
import WorkoutPlan from '@/components/dashboard/WorkoutPlan'
import DietTips from '@/components/dashboard/DietTips'

export default function DashboardContent() {
  const [profile, setProfile] = useState(null)
  const [latestAnalysis, setLatestAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

    // Profil ma'lumotlarini olish
    fetch('/api/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setProfile(data) })
      .finally(() => setLoading(false))

    // Oxirgi tahlilni olish (Gibrid xulosa uchun)
    fetch('/api/history?latest=true')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setLatestAnalysis(data) })
      .catch(() => {})
  }, [])


  if (loading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </PageWrapper>
    )
  }

  if (!profile) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Profil topilmadi</p>
          <Link href="/onboarding" className="text-violet-400 underline">
            Profilni to&apos;ldirish
          </Link>
        </div>
      </PageWrapper>
    )
  }

  // BMI hisoblash
  const heightM = (profile.height_cm || 170) / 100
  const bmi = ((profile.weight_kg || 70) / (heightM * heightM)).toFixed(1)
  const bmiStatus = bmi < 18.5 ? 'Kam vazn' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Ortiqcha' : 'Semirib ketgan'
  const bmiColor = bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-green-400' : bmi < 30 ? 'text-yellow-400' : 'text-red-400'
  const bmiGlow = bmi < 18.5 ? 'shadow-blue-500/20' : bmi < 25 ? 'shadow-green-500/20' : bmi < 30 ? 'shadow-yellow-500/20' : 'shadow-red-500/20'

  // Kaloriya
  const bmr = profile.gender === 'male'
    ? 10 * (profile.weight_kg || 70) + 6.25 * (profile.height_cm || 170) - 5 * (profile.age || 25) + 5
    : 10 * (profile.weight_kg || 70) + 6.25 * (profile.height_cm || 170) - 5 * (profile.age || 25) - 161
  const activityMultiplier = { passiv: 1.2, yengil: 1.375, o_rtacha: 1.55, faol: 1.725 }
  const tdee = Math.round(bmr * (activityMultiplier[profile.activity_level] || 1.55))

  const displayName = profile.first_name || profile.full_name?.split(' ')[0] || 'Foydalanuvchi'

  // Smart Local/Hybrid Analysis Engine
  const getSmartAnalysis = () => {
    // 1. Agar AI tahlili bo'lsa (Gibrid rejim)
    if (latestAnalysis?.result?.summary) {
      return latestAnalysis.result.summary
    }

    // 2. Aks holda (Local rejim)
    let focus = ''
    let tip = ''
    
    // BMI Status Logic
    if (bmi < 18.5) {
      focus = "Vazn yetishmovchiligi"
      tip = "Sizga mushak massasini oshirish (bulking) tavsiya etiladi."
    } else if (bmi < 25) {
      focus = "Sog'lom tana ko'rsatkichi"
      tip = "Tana holatingiz juda yaxshi!"
    } else if (bmi < 30) {
      focus = "Ortiqcha vazn"
      tip = "Tana yog' foizini kamaytirish bo'g'inlar (ayniqsa tizza) uchun juda foydali."
    } else {
      focus = "Semirib ketish holati"
      tip = "Bo'g'inlarga (tizza, bel) og'irlik tushmasligi uchun yuk kamaytirilishi shart."
    }

    const calorieContext = `Kunlik ${tdee} kcal (saqlash) / ${tdee - 500} kcal (ozish) tavsiya etiladi.`
    return `${focus} aniqlandi. ${tip} ${calorieContext}`
  }

  const smartSummary = getSmartAnalysis()

  const quickActions = [
    { href: '/upload', icon: '📷', label: 'Rasm Tahlil', desc: 'Tana holatini tahlil', color: 'from-violet-600/20 to-purple-600/20 border-violet-500/20' },
    { href: '/plan', icon: '📋', label: 'Haftalik Reja', desc: 'Dieta va mashqlar', color: 'from-blue-600/20 to-cyan-600/20 border-blue-500/20' },
    { href: '/chat', icon: '🤖', label: 'AI Maslahat', desc: 'Savollar bering', color: 'from-green-600/20 to-emerald-600/20 border-green-500/20' },
    { href: '/history', icon: '📊', label: 'Tarix', desc: 'Barcha natijalar', color: 'from-orange-600/20 to-amber-600/20 border-orange-500/20' },
  ]

  return (
    <PageWrapper className="max-w-2xl mx-auto py-10 px-4 pb-24">
      {/* Header: Natijalar */}
      <div className="text-center mb-10 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4 transition-transform">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-violet-400" />
            Tahlil yakunlandi
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          Natijalar
        </h1>
        <p className="text-gray-500 text-sm font-medium tracking-[0.2em] uppercase">
          {new Date().getFullYear()} · {new Date().toLocaleDateString('uz-UZ', { month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8">
        {/* 1. Umumiy xulosa (Smart Local Engine) */}
        <SummaryCard summary={smartSummary} bmi={bmi} goal={profile.goal} />

        {/* 2. BMI va Kaloriya Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BmiCard bmi={{ value: bmi, category: bmiStatus }} />
          <CalorieCard calories={{ maintenance: tdee, fat_loss: tdee - 500 }} />
        </div>

        {/* Quick Navigate to Details */}
        <div className="pt-10 border-t border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="group relative h-full">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.color.split(' ')[1]} opacity-0 group-hover:opacity-40 blur-xl transition-opacity`} />
                  <Card glass className={`relative h-full flex flex-col items-center justify-center p-4 border ${action.color.split(' ')[2]} bg-gradient-to-br ${action.color.split(' ')[0]} ${action.color.split(' ')[1]} hover:scale-[1.05] transition-all cursor-pointer overflow-hidden rounded-2xl`}>
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <p className="text-[10px] font-bold text-white uppercase tracking-tighter">{action.label}</p>
                  </Card>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
