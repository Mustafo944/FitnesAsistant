'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

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
    <PageWrapper className="max-w-lg mx-auto py-6 px-4">
      {/* Salomlashish */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Salom, {displayName}! 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">Bugungi holatingiz</p>
      </div>

      {/* BMI va Kaloriya */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* BMI */}
        <Card glass className={`text-center border-white/5 shadow-lg ${bmiGlow}`}>
          <p className="text-gray-400 text-xs font-medium mb-1">BMI</p>
          <p className={`text-3xl font-bold ${bmiColor}`}>{bmi}</p>
          <p className={`text-xs mt-1 ${bmiColor} opacity-80`}>{bmiStatus}</p>
        </Card>

        {/* Kaloriya */}
        <Card glass className="text-center border-white/5 shadow-lg shadow-violet-500/10">
          <p className="text-gray-400 text-xs font-medium mb-1">Kunlik kaloriya</p>
          <p className="text-3xl font-bold text-violet-400">{tdee}</p>
          <p className="text-xs mt-1 text-gray-500">kkal/kun</p>
        </Card>
      </div>

      {/* AI Kundalik Maslahat */}
      <Card glass className="mb-4 border-violet-500/10 bg-gradient-to-br from-violet-600/5 to-transparent">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-sm">💡</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-violet-400 mb-1">AI Kunlik Maslahat</p>
            {tipLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-violet-400/50 border-t-violet-400 rounded-full animate-spin" />
                <span className="text-xs text-gray-500">Yuklanmoqda...</span>
              </div>
            ) : (
              <p className="text-sm text-gray-300 leading-relaxed">{aiTip || 'Har kuni kamida 8 stakan suv iching!'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Profil holati */}
      <Card glass className="mb-4 border-white/5">
        <div className="grid grid-cols-3 divide-x divide-white/5">
          <div className="text-center px-2">
            <p className="text-xs text-gray-500">Bo&apos;y</p>
            <p className="text-lg font-semibold text-white">{profile.height_cm || '—'}</p>
            <p className="text-[10px] text-gray-500">sm</p>
          </div>
          <div className="text-center px-2">
            <p className="text-xs text-gray-500">Vazn</p>
            <p className="text-lg font-semibold text-white">{profile.weight_kg || '—'}</p>
            <p className="text-[10px] text-gray-500">kg</p>
          </div>
          <div className="text-center px-2">
            <p className="text-xs text-gray-500">Yosh</p>
            <p className="text-lg font-semibold text-white">{profile.age || '—'}</p>
            <p className="text-[10px] text-gray-500">yil</p>
          </div>
        </div>
      </Card>

      {/* Tezkor tugmalar 2x2 grid */}
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="group relative h-full">
              {/* Neon Glow Outward */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.color.split(' ')[1]} opacity-0 group-hover:opacity-40 blur-xl transition-opacity animate-pulse`} />
              
              <Card glass className={`relative h-full border ${action.color.split(' ')[2]} bg-gradient-to-br ${action.color.split(' ')[0]} ${action.color.split(' ')[1]} hover:scale-[1.02] transition-all cursor-pointer overflow-hidden rounded-2xl`}>
                {/* Shine effect */}
                <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] group-hover:left-[100%] transition-all duration-700" />
                
                <div className="relative z-10 p-1">
                  <div className="text-3xl mb-3 flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 backdrop-blur-md group-hover:scale-110 transition-transform">
                    {action.icon}
                  </div>
                  <p className="text-sm font-bold text-white tracking-tight">{action.label}</p>
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight font-light">{action.desc}</p>
                </div>

                {/* Neon Border */}
                <div className={`absolute inset-0 border border-white/5 rounded-2xl group-hover:border-violet-500/30 transition-colors`} />
              </Card>
            </div>
          </Link>
        ))}
      </div>
    </PageWrapper>
  )
}
