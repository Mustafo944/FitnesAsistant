import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#08001a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-2xl font-bold text-white mb-4">Internet aloqasi uzildi</h1>
        <p className="text-gray-400 mb-8">
          Iltimos, internet aloqasini tekshiring va qayta urinib ko&apos;ring.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
        >
          <span>🔄</span>
          Qayta urinish
        </Link>
      </div>
    </div>
  )
}
