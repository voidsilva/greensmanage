'use server';

import { refresh } from 'next/cache';
import { z } from 'zod';
import { backend } from '@/lib/backend';
import { getCurrentUser } from '@/lib/dal';
import { parseDecimal } from '@/lib/validation';

const money = (label: string, opts: { min: number; strict?: boolean }) =>
  z
    .string()
    .transform(parseDecimal)
    .pipe(
      z
        .number({ error: `${label}: valor inválido.` })
        [opts.strict ? 'gt' : 'gte'](
          opts.min,
          `${label} precisa ser ${opts.strict ? 'maior que' : 'pelo menos'} ${opts.min}.`,
        )
        .max(100_000_000, `${label}: valor alto demais.`),
    );

const ProfileSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(80),
  startingBankroll: money('Banca inicial', { min: 0 }),
  monthlyGoal: money('Meta mensal', { min: 0 }),
  unitSize: money('Unidade', { min: 0, strict: true }),
});

export type ProfileState = { ok?: boolean; error?: string; at: number } | undefined;

export async function updateProfile(_: ProfileState, form: FormData): Promise<ProfileState> {
  await getCurrentUser();
  const parsed = ProfileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message, at: Date.now() };
  await backend().updateProfile(parsed.data);
  refresh();
  return { ok: true, at: Date.now() };
}
