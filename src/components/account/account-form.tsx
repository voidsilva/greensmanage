'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useActionState } from 'react';
import { updateProfile, type ProfileState } from '@/app/actions/profile';
import { FormAlert, Submit } from '@/components/auth/fields';
import type { Profile } from '@/lib/backend/types';

const field =
  'h-[50px] w-full rounded-2xl border-0 bg-chip px-4 text-[15px] font-semibold outline-none shadow-[inset_0_0_0_1px_var(--line)] placeholder:text-faint focus:shadow-[inset_0_0_0_2px_#22e07a]';
const brl = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function AccountForm({ user, demo }: { user: Profile; demo: boolean }) {
  const [state, action] = useActionState<ProfileState, FormData>(updateProfile, undefined);
  return (
    <section className="glass animate-rise rounded-[34px] p-6 sm:p-8">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Voltar ao painel
      </Link>
      <h1 className="text-[26px] font-extrabold tracking-tight">Minha conta</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        {user.email}
        {demo && ' · alterações ficam só neste navegador'}
      </p>
      <FormAlert
        error={state?.error}
        notice={state?.ok ? 'Dados salvos.' : undefined}
        k={state?.at}
      />
      <form action={action} noValidate className="grid gap-3.5">
        <label className="grid gap-1.5 text-[12.5px] font-semibold text-muted">
          Nome
          <input
            name="name"
            defaultValue={user.name}
            autoComplete="name"
            className={field}
            required
          />
        </label>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <label className="grid gap-1.5 text-[12.5px] font-semibold text-muted">
            Banca inicial (R$)
            <input
              name="startingBankroll"
              inputMode="decimal"
              defaultValue={brl(user.startingBankroll)}
              className={field}
            />
          </label>
          <label className="grid gap-1.5 text-[12.5px] font-semibold text-muted">
            Meta mensal (R$)
            <input
              name="monthlyGoal"
              inputMode="decimal"
              defaultValue={brl(user.monthlyGoal)}
              className={field}
            />
          </label>
        </div>
        <label className="grid gap-1.5 text-[12.5px] font-semibold text-muted">
          Valor de 1 unidade (R$)
          <input
            name="unitSize"
            inputMode="decimal"
            defaultValue={brl(user.unitSize)}
            className={field}
          />
        </label>
        <Submit>Salvar</Submit>
      </form>
    </section>
  );
}
