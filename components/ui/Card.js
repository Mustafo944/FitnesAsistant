export default function Card({ children, className = '', glass = false, neon = '' }) {
  const base = 'rounded-[32px] p-6 transition-all duration-500 ease-out group/card'
  
  const neonStyles = {
    purple: 'border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.2)] group-hover/card:shadow-[0_0_40px_rgba(168,85,247,0.3)]',
    blue: 'border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.2)] group-hover/card:shadow-[0_0_40px_rgba(59,130,246,0.3)]',
    green: 'border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)] group-hover/card:shadow-[0_0_40px_rgba(16,185,129,0.3)]',
    orange: 'border-orange-500/40 shadow-[0_0_25px_rgba(249,115,22,0.2)] group-hover/card:shadow-[0_0_40px_rgba(249,115,22,0.3)]',
    red: 'border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.2)] group-hover/card:shadow-[0_0_40px_rgba(239,68,68,0.3)]',
  }

  // Increased transparency: bg-white/2 for glass, bg-[#0c0c14]/40 for non-glass
  const style = glass
    ? `bg-white/[0.03] backdrop-blur-[32px] border border-white/10 shadow-2xl ${neon ? neonStyles[neon] : ''}`
    : `bg-[#0c0c14]/40 backdrop-blur-2xl border border-white/5 shadow-xl ${neon ? neonStyles[neon] : ''}`

  return (
    <div className="perspective-1000">
      <div className={`${base} ${style} ${className} hover:-translate-y-2 hover:rotate-x-1 hover:rotate-y-1 transform-gpu`}>
        {children}
      </div>
    </div>
  )
}
