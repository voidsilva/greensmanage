import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignUpForm } from '@/components/auth/forms';

export const metadata: Metadata = { title: 'Criar conta' };

export default function SignUpPage() {
  return (
    <AuthShell
      title={
        <>
          Criar conta no <span className="text-pos">GreensManage</span>
        </>
      }
      sub="Leva um minuto. Depois é só registrar suas entradas."
      footer={
        <>
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold text-pos hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
