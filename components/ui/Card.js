export default function Card({ children, className = '', glass = false, neon = '' }) {
  const base = 'rounded-[32px] p-6 transition-all duration-300'
  
  const neonStyles = {
    purple: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    blue: 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    green: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    orange: 'border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]',
    red: 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  }

  const style = glass
    ? `bg-white/5 backdrop-blur-[20px] border border-white/10 shadow-2xl ${neon ? neonStyles[neon] : ''}`
    : `bg-[#0c0c14]/80 backdrop-blur-xl border border-white/5 shadow-xl ${neon ? neonStyles[neon] : ''}`

  return <div className={`${base} ${style} ${className}`}>{children}</div>
}
