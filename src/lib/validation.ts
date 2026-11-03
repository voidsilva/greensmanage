import { z } from 'zod';
import { MARKET_KEYS } from './domain';
import type { Market } from './supabase/database.types';

/** Accepts "1,85", "1.85" and "1.234,50". */
export const parseDecimal = (v: string) => {
  const s = v.trim();
  return Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s);
};

const decimal = (label: string, min: number, max: number) =>
  z
    .string()
    .transform(parseDecimal)
    .pipe(
      z
        .number({ error: `${label} inválida.` })
        .gt(min, `${label} precisa ser maior que ${min}.`)
        .max(max, `${label} muito alta.`),
    );

export const NewBetSchema = z.object({
  game: z.string().trim().min(3, 'Informe o jogo.').max(80),
  league: z
    .string()
    .trim()
    .max(60)
    .transform((v) => v || 'Outros'),
  market: z.enum(MARKET_KEYS as [Market, ...Market[]], { error: 'Mercado inválido.' }),
  odd: decimal('A odd', 1, 1000),
  stake: decimal('A stake', 0, 1_000_000),
  status: z.enum(['pending', 'green', 'red']),
});

export const codeFrom = (game: string) =>
  (
    game
      .normalize('NFD')
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 3) || 'GM'
  ).toUpperCase();
