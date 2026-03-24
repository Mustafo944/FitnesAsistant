import Card from '@/components/ui/Card'

export default function SummaryCard({ summary, bmi, goal }) {
  if (!summary) return null

  // Dynamic tags based on health context
  const getTags = () => {
    const tags = []
    
    // BMI Context Tags
    if (bmi > 25) {
      tags.push({ label: "Yog'ni kamaytirish", icon: "💎", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" })
    } else if (bmi < 18.5) {
      tags.push({ label: "Vazn yig'ish", icon: "📈", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" })
    } else {
      tags.push({ label: "Salomatlik yaxshi", icon: "⚡", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" })
    }

    // Goal Context Tags
    if (goal === 'muscle_gain') {
      tags.push({ label: "Mushakni oshirish", icon: "💪", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" })
    }
    
    return tags
  }

  const dynamicTags = getTags()

  return (
    <Card glass neon="purple" className="relative overflow-hidden group/summary">
      <div className="flex flex-col md:flex-row gap-8 py-2">
        {/* Glow Icon Container */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)] border border-white/20 transition-all group-hover/summary:scale-105 group-hover/summary:rotate-3 duration-500">
            <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">✨</span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-6 w-1 bg-violet-500 rounded-full" />
             <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">Smart Tahlil</h3>
          </div>
          
          <p className="text-gray-300 leading-relaxed text-sm md:text-lg font-medium opacity-90 max-w-xl">
            {summary}
          </p>
          
          {/* Dynamic Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {dynamicTags.map((tag, i) => (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${tag.color} shadow-sm transition-all hover:scale-105`}>
                <span className="text-sm">{tag.icon}</span>
                {tag.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
