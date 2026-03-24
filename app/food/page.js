'use client'

import { useState, useRef } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function FoodPage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setResult(null)
    setError('')
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/food-analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Xatolik')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (score) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 5) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getHealthBg = (score) => {
    if (score >= 8) return 'bg-green-500/10 border-green-500/20'
    if (score >= 5) return 'bg-yellow-500/10 border-yellow-500/20'
    return 'bg-red-500/10 border-red-500/20'
  }

  return (
    <PageWrapper className="max-w-2xl mx-auto py-8 px-4 pb-24">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            AI Vision
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          Ovqat Tahlili
        </h1>
        <p className="text-gray-500 text-sm font-medium max-w-md mx-auto">
          Ovqatingizni rasmga oling — AI uning kaloriyasi va tarkibini aytib beradi
        </p>
      </div>

      {/* Upload Area */}
      <Card glass className="mb-8 border-white/5">
        {!preview ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full py-16 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/10 rounded-2xl hover:border-emerald-500/30 transition-colors cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">Ovqat rasmini yuklang</p>
              <p className="text-gray-500 text-xs mt-1">JPG, PNG yoki WebP · 5MB gacha</p>
            </div>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden">
              <img src={preview} alt="Ovqat" className="w-full max-h-80 object-cover" />
              <button
                onClick={() => { setFile(null); setPreview(null); setResult(null) }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/80 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <Button
              onClick={handleAnalyze}
              loading={loading}
              className="w-full shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              🔍 AI bilan tahlil qilish
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          className="hidden"
        />
      </Card>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <Card glass neon="green" className="p-12 text-center mb-6">
          <Spinner size="lg" className="mb-4 text-emerald-400 mx-auto" />
          <p className="text-gray-400 text-sm">AI ovqatingizni tahlil qilyapti...</p>
        </Card>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Food Name & Score */}
          <Card glass neon="green" className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">{result.food_name}</h2>
                <p className="text-gray-400 text-sm">{result.health_note}</p>
              </div>
              <div className={`px-4 py-2 rounded-2xl border ${getHealthBg(result.health_score)} text-center`}>
                <div className={`text-2xl font-black ${getHealthColor(result.health_score)}`}>
                  {result.health_score}/10
                </div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Sog&apos;liq</div>
              </div>
            </div>
          </Card>

          {/* Calories & Macros */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Kaloriya', val: result.total_calories, unit: 'kcal', color: 'text-white' },
              { label: 'Protein', val: result.macros?.protein, color: 'text-blue-400' },
              { label: 'Uglevod', val: result.macros?.carbs, color: 'text-green-400' },
              { label: "Yog'", val: result.macros?.fats, color: 'text-orange-400' },
            ].map((m, i) => (
              <Card key={i} glass className="p-4 border-white/5">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{m.label}</div>
                <div className={`text-xl font-black ${m.color}`}>
                  {m.val} <span className="text-[9px] opacity-50">{m.unit || ''}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Ingredients */}
          {result.ingredients?.length > 0 && (
            <Card glass className="border-white/5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span>🥘</span> Tarkibiy qismlar
              </h3>
              <div className="space-y-3">
                {result.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded-xl px-4 py-3 border border-white/5">
                    <div>
                      <span className="text-sm text-white font-medium">{ing.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{ing.amount}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{ing.calories} kcal</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <Card glass className="border-white/5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <span>💡</span> Maslahatlar
              </h3>
              <ul className="space-y-2">
                {result.suggestions.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </PageWrapper>
  )
}
