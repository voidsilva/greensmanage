import { Suspense } from 'react';
import { Dashboard } from '@/components/dashboard/dashboard';
import { DashboardSkeleton } from '@/components/dashboard/skeleton';
import { getDashboard } from '@/lib/queries';

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}

async function DashboardData() {
  const data = await getDashboard();
  return <Dashboard data={data} />;
}
