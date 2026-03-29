'use client'

import PageWrapper from '@/components/layout/PageWrapper'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <PageWrapper className="flex items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="max-w-md">
        <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
           <svg className="w-12 h-12 text-violet-400 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
           </svg>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Internet Aloqasi Yo'q</h1>
        <p className="text-gray-400 mb-10 leading-relaxed font-semibold">
           Ilovada ba'zi sahifalar offline rejimi orqali ishlashi mumkin, lekin yangi ma'lumotlar uchun internet kerak.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl shadow-[0_10px_20px_rgba(139,92,246,0.3)] active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Bosh sahifaga qaytish
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors py-2"
          >
            Yangilash 🔄
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
