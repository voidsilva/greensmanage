import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { ResetRequestForm } from '@/components/auth/forms';

export const metadata: Metadata = { title: 'Esqueci a senha' };

export default function ForgotPage() {
  return (
    <AuthShell
      title="Esqueceu a senha?"
      sub="Informe seu e-mail e enviamos um link para criar uma nova."
      footer={
        <Link href="/login" className="font-semibold text-pos hover:underline">
          Voltar para o login
        </Link>
      }
    >
      <ResetRequestForm />
    </AuthShell>
  );
}
