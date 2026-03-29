'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const MotionDiv = dynamic(() => import('@/components/ui/MotionDiv'), { ssr: false })

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // 1. Service Worker ni ro'yxatdan o'tkazish
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration.scope)
          })
          .catch((error) => {
            console.log('SW registration failed:', error)
          })
      })
    }

    // 2. Yana Notification xizmatlari uchun xabar ushlagich
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.addEventListener('message', (event) => {
        if (event.data?.type === 'SHOW_NOTIFICATION') {
          const { title, options } = event.data
          navigator.serviceWorker.registration.showNotification(title, options)
        }
      })
    }

    // 3. PWA Install Prompt ni ushlash (Faqat Android/Chrome da qisman ishlaydi, yoki qo'lda)
    const handleBeforeInstallPrompt = (e) => {
      // Standart brauzer oynasini to'xtatish
      e.preventDefault()
      // Eventni saqlab qolish
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 4. Standalone rejimini tekshirish (allaqachon o'rnatilgan bo'lsa)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
      setIsStandalone(isStandaloneMode)
      if (isStandaloneMode) {
        setShowPrompt(false)
      }
    }

    checkStandalone()
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // So'rovni ko'rsatish
    deferredPrompt.prompt()

    // Natijani kutish
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // Agar qabul qilsa, promptni yashirish
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  // IOS uchun maxsus ko'rsatma (iOS `beforeinstallprompt` ni qo'llab-quvvatlamaydi)
  useEffect(() => {
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      return /iphone|ipad|ipod/.test(userAgent)
    }

    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

    if (isIos() && !isInstalled) {
      // IOS uchun bir marta ko'rsatma berish
      const hasSeenIosPrompt = localStorage.getItem('fit2_ios_prompt')
      if (!hasSeenIosPrompt) {
        // IOS kullanicilarini ulashish menyusidan "Add to Home Screen" qilishlarini eslatamiz
        setTimeout(() => {
          setShowPrompt(true)
          localStorage.setItem('fit2_ios_prompt', 'true')
        }, 3000) // 3 sekunddan keyin ko'rsatish
      }
    }
  }, [])

  if (isStandalone || !showPrompt) return null

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-80"
    >
      <div className="bg-white/[0.08] backdrop-blur-[40px] border border-violet-500/30 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
             </svg>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold leading-tight">Fit2 ilovasini o'rnating</h4>
            <p className="text-gray-400 text-[11px] leading-tight mt-0.5">Telefoningiz ekranida ilova sifatida oching! Offline ishlash imkonini beradi.</p>
          </div>
        </div>

        {!deferredPrompt && (
          <div className="mt-1 p-2 bg-indigo-500/10 border border-indigo-400/20 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-[10px] text-indigo-200">
              Ulashish (Share 📤) tugmasini bosing va pastdan <strong className="text-white">&quot;Ekranga qo'shish&quot; (Add to Home Screen ➕)</strong> ni tanlang.
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-end gap-3 mt-1">
          <button
             onClick={() => setShowPrompt(false)}
             className="text-gray-400 hover:text-white text-xs font-medium transition-colors px-2 py-1"
          >
            Yopish
          </button>
          
          {deferredPrompt && (
            <button
              onClick={deferredPrompt ? handleInstallClick : () => setShowPrompt(false)}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.6)] hover:-translate-y-0.5"
            >
              Hozir o'rnatish
            </button>
          )}
        </div>
      </div>
    </MotionDiv>
  )
}

export async function showAppNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      options,
    })
  }
}
