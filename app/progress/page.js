'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { calculateBMI } from '@/lib/calculations'

const ChartComponents = dynamic(() => import('./ChartComponents'), {
  ssr: false,
  loading: () => <div className="h-[280px] flex items-center justify-center"><Spinner /></div>
})

export default function ProgressPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('weight')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/history')
        if (!res.ok) throw new Error('Xatolik')
        const analyses = await res.json()

        // Eng eskisidan yangiigacha tartiblash
        const sorted = [...analyses].reverse()

        const chartData = sorted.map((item) => {
          const date = new Date(item.created_at)
          const bmi = calculateBMI(item.weight_kg, item.height_cm)
          return {
            date: date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
            vazn: item.weight_kg,
            bmi: bmi,
          }
        })

        setData(chartData)
      } catch {
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const tabs = [
    { id: 'weight', label: 'Vazn', unit: 'kg', color: '#8b5cf6', key: 'vazn' },
    { id: 'bmi', label: 'BMI', unit: '', color: '#06b6d4', key: 'bmi' },
  ]

  const activeConfig = tabs.find((t) => t.id === activeTab)

  if (loading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="max-w-2xl mx-auto py-8 px-4 pb-24">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-violet-400" />
            Progress
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          O&apos;zgarishlar
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          Vazn va BMI ko&apos;rsatkichlaringiz vaqt davomida qanday o&apos;zgarganini kuzating
        </p>
      </div>

      {data.length < 2 ? (
        <EmptyState
          icon="📊"
          title="Yetarli ma'lumot yo'q"
          description="Grafik ko'rish uchun kamida 2 marta tahlil qilishingiz kerak. Tahlil sahifasiga o'ting va rasmingizni yuklang."
        />
      ) : (
        <>
          {/* Tab selector */}
          <div className="flex gap-2 mb-8 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <Card glass neon="purple" className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">{activeConfig.label} grafigi</h2>
                <p className="text-gray-500 text-xs mt-1">
                  {data.length} ta tahlil natijalari
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">
                  {data[data.length - 1]?.[activeConfig.key]}
                </span>
                <span className="text-xs text-gray-500 ml-1">{activeConfig.unit}</span>
                <p className="text-[10px] text-gray-600 mt-0.5">Oxirgi natija</p>
              </div>
            </div>

            <ChartComponents data={data} activeTab={activeTab} activeConfig={activeConfig} />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5">
              {[
                { label: 'Boshlang\'ich', value: data[0]?.[activeConfig.key] },
                { label: 'Hozirgi', value: data[data.length - 1]?.[activeConfig.key] },
                {
                  label: 'Farq',
                  value: (
                    (data[data.length - 1]?.[activeConfig.key] || 0) -
                    (data[0]?.[activeConfig.key] || 0)
                  ).toFixed(1),
                },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    {stat.label}
                  </div>
                  <div className="text-lg font-black text-white">
                    {stat.value}
                    <span className="text-[10px] text-gray-600 ml-0.5">{activeConfig.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </PageWrapper>
  )
}
