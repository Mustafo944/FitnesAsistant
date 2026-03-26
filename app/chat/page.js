'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ReactMarkdown from 'react-markdown'
import Spinner from '@/components/ui/Spinner'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Sahifa yuklanganda tarixni olish
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
      }
    }
    
    fetchHistory()
  }, [])

  useEffect(() => {
    // Brauzer SpeechRecognition API ni tekshirish
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'uz-UZ' // O'zbek tilida tanish

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput((prev) => prev + (prev ? ' ' : '') + transcript)
        setIsRecording(false)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current?.start()
      setIsRecording(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    
    // Yuboriladigan xabarlar tarixi (xatolik xabarlarini chiqaramiz)
    const history = messages
      .filter(m => m.role !== 'error')
      .map(m => ({ role: m.role, content: m.content }))
    
    // Mahalliy UI ga xabarni qo'shish
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history })
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message || 'Xatolik')
      
      setMessages(prev => [...prev, { role: 'model', content: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', content: "Tarmoqda xatolik yuz berdi yoki AI band. Iltimos, qayta urinib ko'ring." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper className="max-w-3xl mx-auto py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Fitnes Asistant</h1>
        <p className="text-gray-400">Sun'iy intellekt bilan yozishib yoki ovozli gaplashib maslahat oling.</p>
      </div>

      <Card glass className="flex-1 flex flex-col overflow-hidden p-0 bg-transparent border-white/10">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Asistant bilan suhbatni boshlang</h3>
              <p className="text-gray-400 text-sm max-w-sm">Savollaringizni matn ko'rinishida yozing yoki mikrofon tugmasini bosib o'zbek tilida gapiring.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <motion.div 
              key={msg.id || i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'error' ? (
                <div className="max-w-[80%] rounded-2xl px-5 py-3.5 shadow-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <p className="text-sm font-medium">{msg.content}</p>
                </div>
              ) : (
                <div className={`max-w-[80%] rounded-3xl px-5 py-3.5 shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white rounded-br-none border border-white/10' 
                    : 'bg-white/5 backdrop-blur-xl text-gray-200 rounded-bl-sm border border-white/10'
                }`}>
                  {msg.role === 'model' ? (
                    <div className="prose prose-invert max-w-none text-sm leading-relaxed prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">{msg.content}</p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 text-gray-200 rounded-3xl rounded-bl-sm px-5 py-4 border border-white/10 shadow-lg flex items-center gap-3">
                <Spinner className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-gray-400">Yozmoqda...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-gray-950/50 border-t border-white/10">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Savolingizni yozing..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 resize-none max-h-32 min-h-[50px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            </div>
            
            {recognitionRef.current && (
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-3 rounded-xl transition-all ${
                  isRecording 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' 
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10'
                }`}
                title="Ovozli yozish"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}

            <Button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="px-6 py-3 h-[50px]"
            >
              Yuborish
            </Button>
          </form>
        </div>
      </Card>
    </PageWrapper>
  )
}
