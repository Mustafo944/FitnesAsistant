import PageWrapper from '@/components/layout/PageWrapper'
import Spinner from '@/components/ui/Spinner'

export default function DashboardLoading() {
  return (
    <PageWrapper className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center justify-center opacity-70">
        <Spinner className="w-10 h-10 text-violet-500 mb-4" />
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-violet-400 animate-pulse">
          Ma'lumotlar yuklanmoqda...
        </p>
      </div>
    </PageWrapper>
  )
}
