'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useEffect, useCallback } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Spinner from '@/components/ui/Spinner'

const MotionDiv = dynamic(() => import('@/components/ui/MotionDiv'), { ssr: false })
const MarkdownRenderer = dynamic(() => import('@/components/ui/MarkdownRenderer'), { ssr: false })

const CHAT_STORAGE_KEY = 'fit2_chat_messages'
const MAX_LOCAL_MESSAGES = 100

function saveMessagesToLocal(messages) {
  try {
    const toSave = messages.slice(-MAX_LOCAL_MESSAGES)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave))
  } catch (e) {
    // localStorage to'la bo'lishi mumkin
  }
}

function loadMessagesFromLocal() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

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

  // Tarixni yuklash: avval localStorage, keyin server
  useEffect(() => {
    const fetchHistory = async () => {
      // 1. Birinchi localStorage'dan yuklaymiz (tez)
      const localMessages = loadMessagesFromLocal()
      if (localMessages.length > 0) {
        setMessages(localMessages)
        setHistoryLoading(false)
      }

      // 2. Serverdan so'raymiz (agar jadval bo'lsa, yangi xabarlarni olamiz)
      try {
        const res = await fetch('/api/chat/history')
        if (res.ok) {
          const data = await res.json()
          if (data.messages && data.messages.length > 0) {
            // Server javobini saqlang
            setMessages(data.messages)
            saveMessagesToLocal(data.messages)
          }
          // Agar server bo'sh qaytarsa, localStorage'dagi ma'lumotlar saqlanib qoladi
        }
      } catch (err) {
        // Server xatosi — localStorage'dagi ma'lumotlar ko'rsatiladi
        console.error('Server tarixini yuklashda xatolik:', err)
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')

    // Smooth reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const history = messages
      .filter(m => m.role !== 'error')
      .map(m => ({ role: m.role, content: m.content }))

    const newUserMessage = { id: Date.now(), role: 'user', content: userMsg }
    const updatedWithUser = [...messages, newUserMessage]
    setMessages(updatedWithUser)
    saveMessagesToLocal(updatedWithUser) // Darhol saqlash
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Xatolik')

      const newModelMessage = { id: Date.now() + 1, role: 'model', content: data.reply }
      const updatedWithReply = [...updatedWithUser, newModelMessage]
      setMessages(updatedWithReply)
      saveMessagesToLocal(updatedWithReply) // AI javobini ham saqlash
    } catch (err) {
      const errorMsg = { id: Date.now() + 2, role: 'error', content: "Tarmoqda xatolik yuz berdi. Iltimos, qayta urinib ko'ring." }
      const updatedWithError = [...updatedWithUser, errorMsg]
      setMessages(updatedWithError)
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem(CHAT_STORAGE_KEY)
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-transparent">
      <PageWrapper className="max-w-4xl mx-auto flex-1 flex flex-col p-0 md:p-4 overflow-hidden">

        {/* Header with clear button */}
        {messages.length > 0 && !historyLoading && (
          <div className="flex items-center justify-end px-4 pt-3 pb-1">
            <button
              onClick={clearChat}
              className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-red-400 transition-colors duration-200 flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Chatni tozalash
            </button>
          </div>
        )}

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
          {historyLoading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
              <Spinner className="w-8 h-8 text-violet-500 mb-2" />
              <p className="text-xs font-bold tracking-widest uppercase text-violet-400">Tarix tiklanmoqda...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-8">
              <MotionDiv
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(139,92,246,0.2)] border border-white/10"
              >
                <span className="text-5xl filter drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]">✨</span>
              </MotionDiv>
              <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Sizning AI Asistentingiz</h1>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                Mashg'ulotlar, parhez rejalari yoki motivatsiya haqida savollaringiz bormi? Men sizga yordam berishga tayyorman.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <MotionDiv
                key={msg.id || i}
                initial={{ opacity: 0, y: 15, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                <div className="flex flex-col gap-2.5 max-w-[88%] md:max-w-[80%]">
                  {/* User/AI Label */}
                  <div className={`flex items-center gap-2 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${msg.role === 'user' ? 'text-violet-400' : 'text-gray-400'}`}>
                      {msg.role === 'user' ? 'Siz' : 'Fit2 Pro'}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className={`
                    relative px-6 py-4 rounded-[28px] shadow-2xl transition-all duration-300 border
                    ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-violet-600 to-indigo-700 border-white/20 text-white rounded-tr-md shadow-violet-900/20'
                      : msg.role === 'error'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-white/[0.05] backdrop-blur-[40px] border-white/10 text-gray-100 rounded-tl-sm shadow-black/40'
                    }
                  `}>
                    {msg.role === 'model' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p className="text-[15px] leading-relaxed font-semibold whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              </MotionDiv>
            ))
          )}

          {loading && (
            <MotionDiv
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-start items-center gap-4 ml-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-duration:0.8s]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                </div>
              </div>
              <span className="text-[10px] font-black text-violet-400/60 uppercase tracking-widest animate-pulse">Asistent o'ylamoqda...</span>
            </MotionDiv>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Bar */}
        <div className="px-4 pb-8 pt-4">
          <div className="relative max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-white/[0.06] backdrop-blur-[50px] border border-white/15 rounded-[32px] p-2.5 pl-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus-within:border-violet-500/50 focus-within:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-all duration-500">
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
                placeholder="Xabarni yuboring..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 py-3.5 text-[15px] leading-relaxed resize-none scrollbar-hide min-h-[48px] max-h-[160px]"
                rows={1}
              />

              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || loading}
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 group
                  ${input.trim() && !loading
                    ? 'bg-gradient-to-tr from-violet-500 to-indigo-600 text-white shadow-lg active:scale-90'
                    : 'bg-white/5 text-gray-700 cursor-not-allowed'
                  }
                `}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className={`w-5 h-5 transition-transform duration-300 ${input.trim() ? 'group-hover:translate-x-1 group-hover:-translate-y-1' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-500/40 font-bold uppercase tracking-[0.3em] mt-5">
              Xabarlar qurilmangizda saqlanadi
            </p>
          </div>
        </div>

      </PageWrapper>
    </div>
  )
}
