'use server';

import { and, eq } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { z } from 'zod';
import { db, schema } from '@/db';
import { getCurrentUser } from '@/lib/dal';
import { MARKET_KEYS } from '@/lib/domain';

const decimal = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v) => Number(v.replace(/\./g, '').replace(',', '.')))
    .pipe(
      z
        .number({ error: `${label} inválida.` })
        .gt(min, `${label} precisa ser maior que ${min}.`)
        .max(max, `${label} muito alta.`),
    );

const NewBetSchema = z.object({
  game: z.string().trim().min(3, 'Informe o jogo.').max(80),
  league: z
    .string()
    .trim()
    .max(60)
    .transform((v) => v || 'Outros'),
  market: z.enum(MARKET_KEYS as [string, ...string[]], { error: 'Mercado inválido.' }),
  odd: decimal('A odd', 1, 1000),
  stake: decimal('A stake', 0, 1_000_000),
  status: z.enum(['pending', 'green', 'red']),
});

export type BetFormState =
  { ok: true; id: string; at: number } | { ok: false; error: string; at: number } | undefined;

const codeFrom = (game: string) =>
  (
    game
      .normalize('NFD')
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 3) || 'GM'
  ).toUpperCase();

export async function createBet(_prev: BetFormState, form: FormData): Promise<BetFormState> {
  const user = await getCurrentUser();
  const parsed = NewBetSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message, at: Date.now() };
  const v = parsed.data;
  const [row] = await db()
    .insert(schema.bets)
    .values({
      userId: user.id,
      code: codeFrom(v.game),
      game: v.game,
      league: v.league,
      market: v.market as (typeof MARKET_KEYS)[number],
      odd: v.odd,
      stake: v.stake,
      status: v.status,
      settledAt: v.status === 'pending' ? null : new Date(),
    })
    .returning({ id: schema.bets.id });
  refresh();
  return { ok: true, id: row.id, at: Date.now() };
}

const SettleSchema = z.object({ id: z.uuid(), result: z.enum(['green', 'red']) });

export async function settleBet(id: string, result: 'green' | 'red') {
  const user = await getCurrentUser();
  const v = SettleSchema.parse({ id, result });
  const updated = await db()
    .update(schema.bets)
    .set({ status: v.result, settledAt: new Date() })
    .where(
      and(
        eq(schema.bets.id, v.id),
        eq(schema.bets.userId, user.id),
        eq(schema.bets.status, 'pending'),
      ),
    )
    .returning({ stake: schema.bets.stake, odd: schema.bets.odd });
  refresh();
  return updated[0] ?? null;
}
