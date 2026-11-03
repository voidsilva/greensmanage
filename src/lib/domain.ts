import type { BetStatus, Market } from '@/db/schema';

export const MARKETS: Record<Market, string> = {
  over_under: 'Over/Under gols',
  btts: 'Ambas marcam',
  match_result: 'Resultado final',
  corners: 'Escanteios',
  asian_handicap: 'Handicap asiático',
};
export const MARKET_KEYS = Object.keys(MARKETS) as Market[];

/** Brasília has no DST since 2019; a fixed offset keeps day math pure and testable. */
export const TZ_OFFSET_MIN = -180;
export const WINDOW_DAYS = 30;

export type BetView = {
  id: string;
  code: string;
  game: string;
  league: string;
  market: Market;
  odd: number;
  stake: number;
  status: BetStatus;
  placedAt: string; // ISO
};

export const profitOf = (b: Pick<BetView, 'status' | 'stake' | 'odd'>) =>
  b.status === 'green' ? b.stake * (b.odd - 1) : b.status === 'red' ? -b.stake : 0;

/** Whole local days between `date` and `now` (0 = today). */
export function daysAgo(date: Date | string, now: Date): number {
  const local = (d: Date) => Math.floor((d.getTime() + TZ_OFFSET_MIN * 60_000) / 86_400_000);
  return local(now) - local(new Date(date));
}
