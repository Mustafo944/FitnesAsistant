'use client'

import Link from 'next/link'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'

export default function PlanPage() {
  const sections = [
    {
      href: '/plan/diet',
      icon: '🍽️',
      title: 'Dieta Rejasi',
      desc: 'AI sizning kaloriyalaringizni hisoblab, kunlik ovqatlanish rejasini tayyorlaydi. Har bir taomning tayyorlanishi va kaloriyasi ko\'rsatiladi.',
      color: 'from-emerald-600/20 to-green-600/20',
      border: 'border-emerald-500/20',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      badge: 'Kaloriya hisobli',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      href: '/plan/workout',
      icon: '💪',
      title: 'Mashg\'ulot Rejasi',
      desc: 'Sizning maqsadingiz va jismoniy holatingizga mos individual mashg\'ulot rejasi. Har bir mashq uchun takrorlar va setlar ko\'rsatiladi.',
      color: 'from-blue-600/20 to-indigo-600/20',
      border: 'border-blue-500/20',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
      badge: 'Individual',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
  ]

  return (
    <PageWrapper className="max-w-2xl mx-auto py-10 px-4 pb-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
          Haftalik Reja
        </h1>
        <p className="text-gray-500 font-medium max-w-md mx-auto">
          AI sizning tana ko'rsatkichlaringiz va maqsadingizga tayanib shaxsiy reja tuzadi
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="block group">
            <Card glass className={`relative overflow-hidden border ${section.border} ${section.glow} bg-gradient-to-br ${section.color} transition-all hover:scale-[1.01]`}>
              <div className="flex items-start gap-6 py-2">
                {/* Icon */}
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">{section.title}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${section.badgeColor}`}>
                      {section.badge}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{section.desc}</p>
                </div>

                {/* Arrow */}
                <div className="shrink-0 flex items-center self-center">
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </PageWrapper>
  )
}
