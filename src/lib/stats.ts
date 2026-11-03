import { MARKET_KEYS, WINDOW_DAYS, daysAgo, profitOf, type BetView } from './domain';
import type { Market } from '@/db/schema';

export type Day = { d: number; pl: number; n: number; g: number; staked: number; balance: number };

export type DashboardStats = {
  bank: number;
  bankChangePct: number;
  profit: number;
  staked: number;
  roi: number;
  greens: number;
  reds: number;
  pending: number;
  hitRate: number;
  avgStake: number;
  avgOdd: number;
  greens7: number;
  reds7: number;
  bestStreak: number;
  currentStreak: number;
  days: Day[];
  byMarket: { market: Market; profit: number }[];
  recentResults: { id: string; status: 'green' | 'red'; game: string; market: Market }[];
  goal: { target: number; progress: number; pct: number };
  bestDay: number;
  worstDay: number;
};

/**
 * Pure: every number on the dashboard comes from here, so it is unit-tested.
 * Only bets inside the window count; the bankroll curve starts at `startingBankroll`
 * plus everything settled before the window.
 */
export function computeStats(
  all: BetView[],
  opts: { startingBankroll: number; monthlyGoal: number; now: Date; days?: number },
): DashboardStats {
  const W = opts.days ?? WINDOW_DAYS;
  const withDay = all.map((b) => ({ ...b, d: daysAgo(b.placedAt, opts.now) }));
  const before = withDay.filter((b) => b.d >= W);
  const bets = withDay.filter((b) => b.d < W && b.d >= 0);
  const settled = bets.filter((b) => b.status !== 'pending');

  const openingBank = opts.startingBankroll + before.reduce((a, b) => a + profitOf(b), 0);
  const greens = settled.filter((b) => b.status === 'green').length;
  const reds = settled.length - greens;
  const profit = settled.reduce((a, b) => a + profitOf(b), 0);
  const staked = settled.reduce((a, b) => a + b.stake, 0);

  let balance = openingBank;
  const days: Day[] = Array.from({ length: W }, (_, i) => {
    const d = W - 1 - i;
    const ds = settled.filter((b) => b.d === d);
    const pl = ds.reduce((a, b) => a + profitOf(b), 0);
    balance += pl;
    return {
      d,
      pl,
      n: ds.length,
      g: ds.filter((b) => b.status === 'green').length,
      staked: ds.reduce((a, b) => a + b.stake, 0),
      balance,
    };
  });

  const ordered = settled.slice().sort((a, b) => a.placedAt.localeCompare(b.placedAt));
  let run = 0;
  let bestStreak = 0;
  for (const b of ordered) {
    run = b.status === 'green' ? run + 1 : 0;
    bestStreak = Math.max(bestStreak, run);
  }
  let currentStreak = 0;
  for (let i = ordered.length - 1; i >= 0 && ordered[i].status === 'green'; i--) currentStreak++;

  const last7 = settled.filter((b) => b.d < 7);
  const pls = days.map((x) => x.pl);
  const gainedTowardsGoal = Math.max(0, profit);

  return {
    bank: balance,
    bankChangePct: openingBank ? ((balance - openingBank) / openingBank) * 100 : 0,
    profit,
    staked,
    roi: staked ? (profit / staked) * 100 : 0,
    greens,
    reds,
    pending: bets.length - settled.length,
    hitRate: settled.length ? greens / settled.length : 0,
    avgStake: bets.length ? bets.reduce((a, b) => a + b.stake, 0) / bets.length : 0,
    avgOdd: bets.length ? bets.reduce((a, b) => a + b.odd, 0) / bets.length : 0,
    greens7: last7.filter((b) => b.status === 'green').length,
    reds7: last7.filter((b) => b.status === 'red').length,
    bestStreak,
    currentStreak,
    days,
    byMarket: MARKET_KEYS.map((market) => ({
      market,
      profit: settled.filter((b) => b.market === market).reduce((a, b) => a + profitOf(b), 0),
    })).sort((a, b) => b.profit - a.profit),
    recentResults: ordered.slice(-24).map((b) => ({
      id: b.id,
      status: b.status as 'green' | 'red',
      game: b.game,
      market: b.market,
    })),
    goal: {
      target: opts.monthlyGoal,
      progress: gainedTowardsGoal,
      pct: opts.monthlyGoal ? (gainedTowardsGoal / opts.monthlyGoal) * 100 : 0,
    },
    bestDay: pls.length ? Math.max(...pls) : 0,
    worstDay: pls.length ? Math.min(...pls) : 0,
  };
}
