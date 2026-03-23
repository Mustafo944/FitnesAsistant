export default function PageWrapper({ children, className = '' }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08001a]">
      {/* Persistent Galaxy Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#08001a]" />
        {/* Much brighter and larger nebula for dashboard */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-purple-600/25 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[0%] right-[-10%] w-[80%] h-[80%] bg-blue-600/20 blur-[160px] rounded-full animate-pulse delay-1000" />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-pink-500/15 blur-[120px] rounded-full" />
        <div className="stars absolute inset-0 opacity-30 scale-110" />
      </div>

      <main className={`relative z-10 max-w-5xl mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] ${className}`}>
        {children}
      </main>
    </div>
  )
}
