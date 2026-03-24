import PageWrapper from '@/components/layout/PageWrapper'
import Spinner from '@/components/ui/Spinner'

export default function Loading() {
  return (
    <PageWrapper className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.5)] rounded-full animate-pulse" />
        <p className="text-sm text-gray-400 font-medium tracking-widest uppercase animate-pulse">
          Yuklanmoqda...
        </p>
      </div>
    </PageWrapper>
  )
}
