import LoginButton from '@/components/auth/LoginButton'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#020205]">
      {/* Premium Galaxy Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#020205]" />
        
        {/* Nebula Clouds */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-900/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-900/20 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Light Arcs from the image */}
        <div className="absolute top-[15%] left-[10%] w-[40%] h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent rotate-[-15deg] blur-sm" />
        <div className="absolute bottom-[25%] right-[10%] w-[50%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rotate-[25deg] blur-sm" />

        {/* Stars */}
        <div className="stars absolute inset-0 opacity-40 scale-125" />
      </div>

      <div className="relative z-10 text-center max-w-2xl px-6 py-12">
        {/* Logo Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-gradient-to-b from-violet-500 to-violet-700 mb-10 shadow-[0_0_30px_rgba(139,92,246,0.3)] border border-white/10">
          <svg className="w-10 h-10 text-white fill-white" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          Fitness AI{' '}
          <span className="text-[#a78bfa]">
            Yordamchi
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-md mx-auto leading-relaxed font-light">
          Sun&apos;iy intellekt yordamida tana holatingizni tahlil qiling va shaxsiy fitness rejangizni oling
        </p>

        <div className="flex justify-center">
          <LoginButton />
        </div>

        <p className="text-gray-500 text-sm mt-10 font-light opacity-60">
          Davom etish orqali foydalanish shartlarini qabul qilasiz
        </p>
      </div>

      {/* Subtle light flares */}
      <div className="absolute top-20 left-20 w-1 h-1 bg-white rounded-full shadow-[0_0_15px_2px_white] opacity-20" />
      <div className="absolute bottom-40 right-40 w-1 h-1 bg-white rounded-full shadow-[0_0_15px_2px_white] opacity-20" />
    </main>
  )
}
