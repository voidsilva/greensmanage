'use client';

import { useActionState, useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, User } from 'lucide-react';
import { login, type LoginState } from '@/app/actions/auth';
import { cn } from '@/lib/cn';

const input =
  'h-13 w-full rounded-2xl border-0 bg-chip pr-12 pl-11 text-[15px] font-semibold outline-none shadow-[inset_0_0_0_1px_var(--line),inset_0_2px_4px_rgb(0_0_0/.12)] transition-shadow placeholder:font-medium placeholder:text-faint focus:shadow-[inset_0_0_0_2px_#22e07a,0_0_0_5px_rgb(34_224_122/.15)]';

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);
  const [show, setShow] = useState(false);

  return (
    <form action={action} noValidate>
      {state?.error && (
        <div
          role="alert"
          key={state.at}
          className="animate-shake mb-4 flex items-center gap-2.5 rounded-2xl bg-neg/12 px-3.5 py-3 text-[13.5px] font-semibold text-neg shadow-[inset_0_0_0_1px_rgb(255_107_125/.3)]"
        >
          <AlertCircle className="size-[18px] flex-none" />
          {state.error}
        </div>
      )}

      <label className="mb-3.5 grid gap-1.5">
        <span className="text-[12.5px] font-semibold text-muted">Usuário</span>
        <span className="relative">
          <User className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-faint" />
          <input
            name="username"
            defaultValue={state?.username}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="seu usuário"
            required
            autoFocus
            className={input}
          />
        </span>
      </label>

      <label className="mb-3.5 grid gap-1.5">
        <span className="text-[12.5px] font-semibold text-muted">Senha</span>
        <span className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-faint" />
          <input
            name="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className={input}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Esconder senha' : 'Mostrar senha'}
            aria-pressed={show}
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-muted"
          >
            {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        </span>
      </label>

      <label className="my-2 mb-5 flex w-fit cursor-pointer items-center gap-2.5 text-[13.5px] text-muted select-none">
        <input type="checkbox" name="remember" defaultChecked className="peer sr-only" />
        <i className="relative h-[25px] w-[42px] rounded-full bg-chip shadow-[inset_0_0_0_1px_var(--line)] transition-colors peer-checked:bg-green-1 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-green-1 after:absolute after:top-[3px] after:left-[3px] after:size-[19px] after:rounded-full after:bg-white after:shadow-md after:transition-transform after:duration-300 after:ease-spring peer-checked:after:translate-x-[17px]" />
        Manter conectado por 30 dias
      </label>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary shine group flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full text-base font-extrabold transition-transform duration-200 ease-spring active:scale-[.97] disabled:cursor-wait"
      >
        {pending ? (
          <span
            aria-label="Entrando"
            className="size-5 animate-spin rounded-full border-[2.5px] border-[#03230f]/25 border-t-[#03230f]"
          />
        ) : (
          <>
            Entrar
            <ArrowRight
              className={cn('size-[18px] transition-transform group-hover:translate-x-1')}
              strokeWidth={2.6}
            />
          </>
        )}
      </button>
    </form>
  );
}
