import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountForm } from '@/components/account/account-form';
import { getCurrentUser } from '@/lib/dal';
import { isDemo } from '@/lib/config';

export const metadata: Metadata = { title: 'Minha conta' };

export default function AccountPage() {
  return (
    <main className="relative z-10 mx-auto grid min-h-dvh w-full max-w-[560px] content-center px-4 py-8">
      <Suspense fallback={<div className="glass h-[520px] animate-pulse" />}>
        <Account />
      </Suspense>
    </main>
  );
}

async function Account() {
  const user = await getCurrentUser();
  return <AccountForm user={user} demo={isDemo()} />;
}
