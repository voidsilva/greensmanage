'use server';

import { refresh } from 'next/cache';
import { z } from 'zod';
import { backend } from '@/lib/backend';
import { getCurrentUser } from '@/lib/dal';
import { NewBetSchema, codeFrom } from '@/lib/validation';

export type BetFormState =
  { ok: true; id: string; at: number } | { ok: false; error: string; at: number } | undefined;

export async function createBet(_prev: BetFormState, form: FormData): Promise<BetFormState> {
  await getCurrentUser();
  const parsed = NewBetSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message, at: Date.now() };
  const v = parsed.data;
  try {
    const { id } = await backend().createBet({ ...v, code: codeFrom(v.game) });
    refresh();
    return { ok: true, id, at: Date.now() };
  } catch {
    return { ok: false, error: 'Não foi possível salvar. Tente de novo.', at: Date.now() };
  }
}

const SettleSchema = z.object({ id: z.string().min(1).max(64), result: z.enum(['green', 'red']) });

export async function settleBet(id: string, result: 'green' | 'red') {
  await getCurrentUser();
  const v = SettleSchema.parse({ id, result });
  const r = await backend().settleBet(v.id, v.result);
  refresh();
  return r;
}
