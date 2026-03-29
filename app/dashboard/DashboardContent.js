'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import SummaryCard from '@/components/dashboard/SummaryCard'
import BmiCard from '@/components/dashboard/BmiCard'
import CalorieCard from '@/components/dashboard/CalorieCard'
import WorkoutPlan from '@/components/dashboard/WorkoutPlan'
import DietTips from '@/components/dashboard/DietTips'
import { calculateBMI, getBMICategory, calculateCalories } from '@/lib/calculations'

export default function DashboardContent({ initialProfile, initialLatestAnalysis }) {
  const [profile] = useState(initialProfile)
  const [latestAnalysis] = useState(initialLatestAnalysis)
  const [dateString, setDateString] = useState('')

  useEffect(() => {
    const d = new Date()
    const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']
    setDateString(`${d.getFullYear()} · ${d.getDate()}-${months[d.getMonth()]}`)
  }, [])

  const displayName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'Foydalanuvchi'

  const bmi = useMemo(() => calculateBMI(profile?.weight_kg || 70, profile?.height_cm || 170), [profile?.weight_kg, profile?.height_cm])
  const bmiCategory = useMemo(() => getBMICategory(bmi), [bmi])
  const bmiStatus = bmiCategory.label

  const tdee = useMemo(() => {
    const result = calculateCalories(
      profile?.weight_kg || 70,
      profile?.height_cm || 170,
      profile?.age || 25,
      profile?.gender || 'male',
      profile?.activity_level
    )
    return result.maintenance
  }, [profile?.weight_kg, profile?.height_cm, profile?.age, profile?.gender, profile?.activity_level])

  const smartSummary = useMemo(() => {
    if (!profile) {
      return "Ma'lumotlar mavjud emas"
    }
    
    // Clean up summary if it comes from database or previous version
    let rawSummary = ""
    if (latestAnalysis?.result?.summary) {
      rawSummary = latestAnalysis.result.summary
    } else {
      let focus = ''
      let tip = ''
      
      if (bmi < 18.5) {
        focus = "Vazn yetishmasligi"
        tip = "Sizga mushak massasini oshirish (bulking) tavsiya etiladi."
      } else if (bmi < 25) {
        focus = "Sog'lom tana ko'rsatkichi"
        tip = "Tana holatingiz juda yaxshi!"
      } else if (bmi < 30) {
        focus = "Ortiqcha vazn"
        tip = "Tana yog' foizini kamaytirish bo'g'inlari (ayniqsa tizza) uchun juda foydali."
      } else {
        focus = "Semizlik holati"
        tip = "Bo'g'inlarga (tizza, bel) og'irlik tushmasligi uchun vazn kamaytirish shart."
      }
      rawSummary = `${focus} aniqlandi. ${tip} Kunlik ${tdee} kcal (saqlash) / ${tdee - 500} kcal (ozish) tavsiya etiladi.`
    }

    return rawSummary.replaceAll('&apos;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&')
  }, [latestAnalysis, bmi, tdee, profile])

  if (!profile) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Profil topilmadi</p>
          <Link href="/onboarding" className="text-violet-400 underline">
            Profilni to'ldirish
          </Link>
        </div>
      </PageWrapper>
    )
  }

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
        <p className="text-gray-500 text-sm font-medium tracking-[0.2em] uppercase min-h-[20px]" suppressHydrationWarning>
          {dateString}
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

        {/* 3. Tezkor Amallar qismi */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/progress" className="block p-4 rounded-[24px] bg-white/[0.03] backdrop-blur-[32px] border border-white/5 shadow-xl hover:border-violet-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all">
            <div className="flex items-center gap-3">
              <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">📊</span>
              <div>
                <h3 className="text-sm font-bold text-white">Grafik</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">O'zgarish</p>
              </div>
            </div>
          </Link>
          <Link href="/history" className="block p-4 rounded-[24px] bg-white/[0.03] backdrop-blur-[32px] border border-white/5 shadow-xl hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
            <div className="flex items-center gap-3">
              <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">📜</span>
              <div>
                <h3 className="text-sm font-bold text-white">Tarix</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Barcha tahlillar</p>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </PageWrapper>
  )
}
