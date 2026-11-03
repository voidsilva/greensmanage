import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { NewPasswordForm } from '@/components/auth/forms';

export const metadata: Metadata = { title: 'Nova senha' };

export default function NewPasswordPage() {
  return (
    <AuthShell title="Crie uma nova senha" sub="Depois de salvar, você já entra no painel.">
      <NewPasswordForm />
    </AuthShell>
  );
}
