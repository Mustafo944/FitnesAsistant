import Card from '@/components/ui/Card'

export default function SummaryCard({ summary }) {
  if (!summary) return null

  const tags = [
    { label: "Yog'ni kamaytirish", icon: "🎯", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
    { label: "Mushakni oshirish", icon: "💪", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { label: "Salomatlik yaxshi", icon: "⚡", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  ]

  return (
    <Card neon="purple" className="relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Glow Icon */}
        <div className="shrink-0 w-24 h-24 rounded-[32px] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-white/20">
          <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">✨</div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Umumiy xulosa</h3>
          <p className="text-gray-300 leading-relaxed text-sm md:text-base font-light">
            {summary}
          </p>
          
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mt-5">
            {tags.map((tag, i) => (
              <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${tag.color}`}>
                <span>{tag.icon}</span>
                {tag.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
