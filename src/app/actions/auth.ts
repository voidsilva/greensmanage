'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { backend } from '@/lib/backend';

export type FormState = { error?: string; notice?: string; email?: string; at: number } | undefined;

const email = z.string().trim().toLowerCase().email('Informe um e-mail válido.').max(254);
const password = z
  .string()
  .min(8, 'A senha precisa de pelo menos 8 caracteres.')
  .max(72, 'Senha longa demais.')
  .regex(/[A-Za-z]/, 'Use pelo menos uma letra.')
  .regex(/\d/, 'Use pelo menos um número.');

const fail = (error: string, extra: Partial<NonNullable<FormState>> = {}): FormState => ({
  error,
  at: Date.now(),
  ...extra,
});
const first = (e: z.ZodError) => e.issues[0]?.message ?? 'Dados inválidos.';

/** Only same-site relative paths, so `next` can't redirect off-site. */
const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === 'string' ? v : '';
  return s.startsWith('/') && !s.startsWith('//') ? s : '/';
};

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ email, password: z.string().min(1, 'Informe a senha.').max(200) })
    .safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return fail(first(parsed.error), { email: String(form.get('email') ?? '') });
  const r = await backend().signIn(parsed.data.email, parsed.data.password);
  if (r.error) return fail(r.error, { email: parsed.data.email });
  redirect(safeNext(form.get('next')));
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ name: z.string().trim().min(2, 'Informe seu nome.').max(80), email, password })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(first(parsed.error), { email: String(form.get('email') ?? '') });
  const { name, email: e, password: p } = parsed.data;
  const r = await backend().signUp(name, e, p);
  if (r.error) return fail(r.error, { email: e });
  if (r.notice) return { notice: r.notice, at: Date.now() };
  redirect('/');
}

export async function requestReset(_: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(form.get('email'));
  if (!parsed.success) return fail(first(parsed.error));
  const r = await backend().requestPasswordReset(parsed.data);
  return r.error ? fail(r.error) : { notice: r.notice, at: Date.now() };
}

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ password, confirm: z.string() })
    .refine((v) => v.password === v.confirm, { message: 'As senhas não conferem.' })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(first(parsed.error));
  const r = await backend().updatePassword(parsed.data.password);
  if (r.error) return fail(r.error);
  redirect('/');
}

export async function signOut() {
  await backend().signOut();
  redirect('/login');
}
