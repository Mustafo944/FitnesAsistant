'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { GENDER_OPTIONS, GOAL_OPTIONS, ACTIVITY_OPTIONS } from '@/lib/constants'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    height: '',
    weight: '',
    age: '',
    gender: '',
    goal: 'forma_saqlash',
    activity_level: 'o_rtacha',
  })

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) return null
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (profileData) {
      setForm({
        first_name: profileData.first_name || profileData.full_name?.split(' ')[0] || '',
        last_name: profileData.last_name || profileData.full_name?.split(' ').slice(1).join(' ') || '',
        height: profileData.height_cm?.toString() || '',
        weight: profileData.weight_kg?.toString() || '',
        age: profileData.age?.toString() || '',
        gender: profileData.gender || '',
        goal: profileData.goal || 'forma_saqlash',
        activity_level: profileData.activity_level || 'o_rtacha',
      })
    }
  }, [profileData])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          height_cm: Number(form.height),
          weight_kg: Number(form.weight),
          age: Number(form.age),
          gender: form.gender,
          goal: form.goal,
          activity_level: form.activity_level,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Xatolik yuz berdi')
      }

      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="max-w-lg mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Sozlamalar</h1>
        <p className="text-gray-400 text-sm mt-1">Shaxsiy ma&apos;lumotlaringizni yangilang</p>
      </div>

      <Card glass className="border-white/5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ism"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="Mustafo"
              required
            />
            <Input
              label="Familiya"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Karimov"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Bo'y (sm)"
              type="number"
              name="height"
              value={form.height}
              onChange={handleChange}
              placeholder="175"
              min="100"
              max="250"
              required
            />
            <Input
              label="Vazn (kg)"
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="70"
              min="20"
              max="300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Yosh"
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="25"
              min="10"
              max="100"
              required
            />
            <Select
              label="Jins"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              options={GENDER_OPTIONS}
              required
            />
          </div>

          <Select
            label="Maqsadingiz"
            name="goal"
            value={form.goal}
            onChange={handleChange}
            options={GOAL_OPTIONS}
            required
          />

          <Select
            label="Faollik darajangiz"
            name="activity_level"
            value={form.activity_level}
            onChange={handleChange}
            options={ACTIVITY_OPTIONS}
            required
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-400 bg-green-400/10 rounded-xl px-4 py-2">
              ✅ Ma&apos;lumotlar muvaffaqiyatli saqlandi!
            </p>
          )}

          <Button type="submit" loading={saving} className="w-full" size="lg">
            Saqlash
          </Button>
        </form>
      </Card>
    </PageWrapper>
  )
}
