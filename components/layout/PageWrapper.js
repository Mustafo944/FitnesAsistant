export default function PageWrapper({ children, className = '' }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060012]">
      {/* Persistent Galaxy Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#060012]" />
        {/* Subtly brighter nebula for dashbaord */}
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-purple-600/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="stars absolute inset-0 opacity-20" />
      </div>

      <main className={`relative z-10 max-w-5xl mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] ${className}`}>
        {children}
      </main>
    </div>
  )
}
