import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignInForm } from '@/components/auth/forms';
import { isDemo } from '@/lib/config';

export const metadata: Metadata = { title: 'Entrar' };

export default function LoginPage() {
  const demo = isDemo();
  return (
    <AuthShell
      title={
        <>
          Entrar no <span className="text-pos">GreensManage</span>
        </>
      }
      sub="Sua banca, seus greens e reds num só lugar."
      footer={
        !demo && (
          <>
            Não tem conta?{' '}
            <Link href="/cadastro" className="font-semibold text-pos hover:underline">
              Criar conta
            </Link>
          </>
        )
      }
    >
      <Suspense>
        <SignInForm demo={demo} />
      </Suspense>
    </AuthShell>
  );
}
