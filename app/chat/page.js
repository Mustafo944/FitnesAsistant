'use client'
// Cache budget: 1.0.1 - Updated UI logic

import dynamic from 'next/dynamic'
import { useState, useRef, useEffect } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

const MotionDiv = dynamic(() => import('@/components/ui/MotionDiv'), { ssr: false })
const MarkdownRenderer = dynamic(() => import('@/components/ui/MarkdownRenderer'), { ssr: false })

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/chat/history')
        if (res.ok) {
          const data = await res.json()
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages)
          }
        }
      } catch (err) {
        console.error('Chat tarixini yuklashda xatolik:', err)
      } finally {
        setHistoryLoading(false)
      }
    }
    
    fetchHistory()
  }, [])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    
    // Smooth reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const history = messages
      .filter(m => m.role !== 'error')
      .map(m => ({ role: m.role, content: m.content }))
    
    const tempId = Date.now()
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history })
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message || 'Xatolik')
      
      setMessages(prev => [...prev.filter(m => m.id !== tempId), 
        { role: 'user', content: userMsg },
        { role: 'model', content: data.reply }
      ])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', content: "Tarmoqda xatolik yuz berdi. Iltimos, qayta urinib ko'ring." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-transparent">
      <PageWrapper className="max-w-4xl mx-auto flex-1 flex flex-col p-0 md:p-4 overflow-hidden">
        
        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scrollbar-hide">
          {historyLoading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
              <Spinner className="w-8 h-8 text-violet-500 mb-2" />
              <p className="text-xs font-medium tracking-widest uppercase">Xotira yuklanmoqda...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center mb-6 shadow-2xl border border-white/5">
                 <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">✨</span>
              </div>
              <h1 className="text-2xl font-black text-white mb-3">Salom! Men sizning Fitnes Asistentingizman.</h1>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Mashg'ulotlar, ovqatlanish yoki sog'lom turmush tarzi haqida savollaringiz bo'lsa, marhamat! Men sizga yordam berishga tayyorman.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <MotionDiv 
                key={msg.id || i}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col gap-2 max-w-[85%] md:max-w-[75%]">
                  <div className={`
                    relative px-5 py-3.5 rounded-[22px] shadow-2xl border transition-all duration-300
                    ${msg.role === 'user' 
                      ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 border-white/10 text-white rounded-br-md self-end' 
                      : msg.role === 'error'
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-white/[0.03] backdrop-blur-xl border-white/5 text-gray-200 rounded-bl-md'
                    }
                  `}>
                    {msg.role === 'model' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest opacity-30 ${msg.role === 'user' ? 'text-right mr-2' : 'text-left ml-2'}`}>
                    {msg.role === 'user' ? 'Siz' : 'Asistent'}
                  </span>
                </div>
              </MotionDiv>
            ))
          )}

          {loading && (
             <MotionDiv 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-start items-center gap-3 ml-2"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                 <div className="flex gap-1">
                    <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                 </div>
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tahlil qilinmoqda...</span>
            </MotionDiv>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Bar Section */}
        <div className="px-4 pb-6 pt-2">
          <div className="relative max-w-3xl mx-auto flex items-end gap-2 bg-white/[0.03] backdrop-blur-[32px] border border-white/10 rounded-[28px] p-2 pl-4 shadow-2xl focus-within:border-violet-500/30 transition-all duration-300">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="Xabar yozing..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 py-3 text-[15px] leading-relaxed resize-none scrollbar-hide min-h-[44px] max-h-[150px]"
              rows={1}
            />
            
            <button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || loading}
              className={`
                w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0
                ${input.trim() && !loading 
                  ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] scale-100 rotate-0' 
                  : 'bg-white/5 text-gray-600 scale-90 -rotate-12'
                }
              `}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-[9px] text-center text-gray-600 font-bold uppercase tracking-[0.2em] mt-3 opacity-50">
            AI ba'zida xato qilishi mumkin. Muhim ma'lumotlarni tekshiring.
          </p>
        </div>

      </PageWrapper>
    </div>
  )
}
