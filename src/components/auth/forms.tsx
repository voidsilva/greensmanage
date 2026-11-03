'use client';

import { Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { requestReset, signIn, signUp, updatePassword, type FormState } from '@/app/actions/auth';
import { DEMO_ACCOUNT } from '@/lib/config';
import { Field, FormAlert, Submit } from './fields';

export function SignInForm({ demo }: { demo: boolean }) {
  const params = useSearchParams();
  const [state, action] = useActionState<FormState, FormData>(signIn, undefined);
  const linkError =
    params.get('erro') === 'link' ? 'Esse link expirou ou já foi usado. Peça um novo.' : undefined;
  return (
    <form action={action} noValidate>
      {demo && (
        <div className="mb-4 rounded-2xl bg-lime/12 px-3.5 py-3 text-[13px] text-muted shadow-[inset_0_0_0_1px_rgb(198_255_94/.3)]">
          <b className="text-ink">Modo demonstração.</b> Entre com{' '}
          <b className="text-ink">{DEMO_ACCOUNT.email}</b> e senha{' '}
          <b className="text-ink">{DEMO_ACCOUNT.password}</b>.
        </div>
      )}
      <FormAlert error={state?.error ?? linkError} k={state?.at} />
      <input type="hidden" name="next" value={params.get('next') ?? '/'} />
      <Field
        label="E-mail"
        icon={Mail}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@email.com"
        defaultValue={state?.email ?? (demo ? DEMO_ACCOUNT.email : undefined)}
        required
        autoFocus
      />
      <Field
        label="Senha"
        icon={Lock}
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />
      {!demo && (
        <p className="-mt-1 mb-4 text-right text-[13px]">
          <Link href="/esqueci-senha" className="font-semibold text-pos hover:underline">
            Esqueci a senha
          </Link>
        </p>
      )}
      <Submit>Entrar</Submit>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState<FormState, FormData>(signUp, undefined);
  if (state?.notice) return <FormAlert notice={state.notice} />;
  return (
    <form action={action} noValidate>
      <FormAlert error={state?.error} k={state?.at} />
      <Field
        label="Nome"
        icon={User}
        name="name"
        autoComplete="name"
        placeholder="Seu nome"
        required
        autoFocus
      />
      <Field
        label="E-mail"
        icon={Mail}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@email.com"
        defaultValue={state?.email}
        required
      />
      <Field
        label="Senha"
        icon={Lock}
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="8+ caracteres, com letra e número"
        required
        minLength={8}
      />
      <Submit>Criar conta</Submit>
    </form>
  );
}

export function ResetRequestForm() {
  const [state, action] = useActionState<FormState, FormData>(requestReset, undefined);
  if (state?.notice) return <FormAlert notice={state.notice} />;
  return (
    <form action={action} noValidate>
      <FormAlert error={state?.error} k={state?.at} />
      <Field
        label="E-mail"
        icon={Mail}
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@email.com"
        required
        autoFocus
      />
      <Submit>Enviar link</Submit>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(updatePassword, undefined);
  return (
    <form action={action} noValidate>
      <FormAlert error={state?.error} k={state?.at} />
      <Field
        label="Nova senha"
        icon={Lock}
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="8+ caracteres, com letra e número"
        required
        autoFocus
      />
      <Field
        label="Repita a senha"
        icon={Lock}
        name="confirm"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        required
      />
      <Submit>Salvar nova senha</Submit>
    </form>
  );
}
