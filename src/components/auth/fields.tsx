'use client';

import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';
import { useFormStatus } from 'react-dom';

const input =
  'h-13 w-full rounded-2xl border-0 bg-chip pr-12 pl-11 text-[15px] font-semibold outline-none shadow-[inset_0_0_0_1px_var(--line),inset_0_2px_4px_rgb(0_0_0/.12)] transition-shadow placeholder:font-medium placeholder:text-faint focus:shadow-[inset_0_0_0_2px_#22e07a,0_0_0_5px_rgb(34_224_122/.15)]';

export function Field({
  label,
  icon: Icon,
  type,
  ...props
}: { label: string; icon: LucideIcon } & InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <label className="mb-3.5 grid gap-1.5">
      <span className="text-[12.5px] font-semibold text-muted">{label}</span>
      <span className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-faint" />
        <input {...props} type={isPassword && show ? 'text' : type} className={input} />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Esconder senha' : 'Mostrar senha'}
            aria-pressed={show}
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-muted"
          >
            {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        )}
      </span>
    </label>
  );
}

export function FormAlert({ error, notice, k }: { error?: string; notice?: string; k?: number }) {
  if (!error && !notice) return null;
  return (
    <div
      role={error ? 'alert' : 'status'}
      key={k}
      className={
        error
          ? 'animate-shake mb-4 flex items-center gap-2.5 rounded-2xl bg-neg/12 px-3.5 py-3 text-[13.5px] font-semibold text-neg shadow-[inset_0_0_0_1px_rgb(255_107_125/.3)]'
          : 'animate-rise mb-4 flex items-center gap-2.5 rounded-2xl bg-green-1/12 px-3.5 py-3 text-[13.5px] font-semibold text-pos shadow-[inset_0_0_0_1px_rgb(34_224_122/.3)]'
      }
    >
      {error ? (
        <AlertCircle className="size-[18px] flex-none" />
      ) : (
        <CheckCircle2 className="size-[18px] flex-none" />
      )}
      {error ?? notice}
    </div>
  );
}

export function Submit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary shine group mt-1 flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full text-base font-extrabold transition-transform duration-200 ease-spring active:scale-[.97] disabled:cursor-wait"
    >
      {pending ? (
        <span
          aria-label="Enviando"
          className="size-5 animate-spin rounded-full border-[2.5px] border-[#03230f]/25 border-t-[#03230f]"
        />
      ) : (
        <>
          {children}
          <ArrowRight
            className="size-[18px] transition-transform group-hover:translate-x-1"
            strokeWidth={2.6}
          />
        </>
      )}
    </button>
  );
}
