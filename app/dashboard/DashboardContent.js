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
  const [loading, setLoading] = useState(true)
  const [aiTip, setAiTip] = useState('')
  const [tipLoading, setTipLoading] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setProfile(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // AI kundalik maslahat olish
  useEffect(() => {
    if (profile) {
      setTipLoading(true)
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Menga bugun uchun bitta qisqa (1-2 gap) fitnes yoki sog\'liq maslahati ber. Har safar yangisini ayt.',
          history: []
        })
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data?.reply) setAiTip(data.reply) })
        .catch(() => setAiTip('Har kuni kamida 2 litr suv iching va 30 daqiqa yuring.'))
        .finally(() => setTipLoading(false))
    }
  }, [profile])

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4 animate-bounce">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-violet-400 animate-ping" />
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

      <div className="space-y-6">
        {/* 1. Umumiy xulosa */}
        <SummaryCard summary={aiTip || "Foydalanuvchi tana holati yaxshi, yog' miqdori me'yoridan biroz yuqori. Ozish uchun eng yaxshi yo'l - yog'ni kamaytirish + mushak massasini oshirish."} />

        {/* 2. BMI va Kaloriya Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BmiCard bmi={{ value: bmi, category: bmiStatus }} />
          <CalorieCard calories={{ maintenance: tdee, fat_loss: tdee - 500 }} />
        </div>

        {/* 3. Kuchli tomonlar va Yaxshilash kerak (Mock data to match image) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card glass neon="green" className="border-emerald-500/20 bg-emerald-500/5">
             <div className="flex items-center gap-2 mb-3">
               <span className="text-xl">💪</span>
               <h3 className="text-sm font-bold text-white uppercase tracking-wider">Kuchli tomonlar</h3>
             </div>
             <ul className="space-y-2">
               <li className="flex items-center gap-2 text-xs text-gray-400 font-light">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                 Jidiy intilish va o&apos;zgarishga tayyorlik mavjud
               </li>
               <li className="flex items-center gap-2 text-xs text-gray-400 font-light">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                 Bazalanish qobiliyati yaxshi darajada
               </li>
             </ul>
          </Card>

          <Card glass neon="orange" className="border-orange-500/20 bg-orange-500/5">
             <div className="flex items-center gap-2 mb-3">
               <span className="text-xl">⚠️</span>
               <h3 className="text-sm font-bold text-white uppercase tracking-wider">Yaxshilash kerak</h3>
             </div>
             <ul className="space-y-2">
               <li className="flex items-center gap-2 text-xs text-gray-400 font-light">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                 Tana yog&apos; foizini sekin-asta kamaytirish
               </li>
               <li className="flex items-center gap-2 text-xs text-gray-400 font-light">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                 Protein iste&apos;molini biroz ko&apos;paytirish
               </li>
             </ul>
          </Card>
        </div>

        {/* 4. Mashq rejasi */}
        <WorkoutPlan workouts={[
          { title: 'Kardio', frequency: '30 daqiqa' },
          { title: 'Kuch mashqlari', frequency: '45 daqiqa' },
        ]} />

        {/* 5. Ovqatlanish tavsiyalari */}
        <DietTips tips={[
          "Protein ga boy ovqatlar iste'mol qiling",
          "Sabzavotlar va mevalarni ko'paytiring",
          "Shakarni butunlay kamaytiring"
        ]} />

        {/* Tezkor tugmalar Grid - Moved to bottom for navigation if needed, or kept for functionality */}
        <div className="pt-10 border-t border-white/5">
          <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center mb-6">Tezkor amallar</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="group relative h-full">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.color.split(' ')[1]} opacity-0 group-hover:opacity-40 blur-xl transition-opacity animate-pulse`} />
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
