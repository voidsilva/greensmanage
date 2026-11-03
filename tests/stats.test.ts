import { describe, expect, it } from 'vitest';
import { computeStats } from '@/lib/stats';
import { daysAgo, profitOf, type BetView } from '@/lib/domain';

const now = new Date('2026-11-03T15:00:00Z'); // 12:00 in Brasília
let i = 0;
const bet = (p: Partial<BetView> & { daysBack: number }): BetView => ({
  id: String(++i),
  code: 'FLA',
  game: 'Flamengo x Palmeiras',
  league: 'Brasileirão',
  market: 'btts',
  odd: 2,
  stake: 100,
  status: 'green',
  placedAt: new Date(now.getTime() - p.daysBack * 86_400_000).toISOString(),
  ...p,
});

describe('profitOf', () => {
  it('pays stake × (odd − 1) on green, loses stake on red, 0 when pending', () => {
    expect(profitOf({ status: 'green', stake: 100, odd: 1.82 })).toBeCloseTo(82);
    expect(profitOf({ status: 'red', stake: 100, odd: 1.82 })).toBe(-100);
    expect(profitOf({ status: 'pending', stake: 100, odd: 1.82 })).toBe(0);
  });
});

describe('daysAgo', () => {
  it('uses Brasília days, not UTC days', () => {
    // 02:00 UTC on the 3rd is still 23:00 on the 2nd in Brasília → yesterday
    expect(daysAgo('2026-11-03T02:00:00Z', now)).toBe(1);
    expect(daysAgo('2026-11-03T03:30:00Z', now)).toBe(0);
  });
});

describe('computeStats', () => {
  const bets = [
    bet({ daysBack: 40, status: 'green', stake: 100, odd: 3 }), // before window: +200 to opening bank
    bet({ daysBack: 5, status: 'green' }), // +100
    bet({ daysBack: 4, status: 'green' }), // +100
    bet({ daysBack: 3, status: 'red' }), // −100
    bet({ daysBack: 2, status: 'green' }), // +100
    bet({ daysBack: 0, status: 'pending' }),
  ];
  const s = computeStats(bets, { startingBankroll: 1000, monthlyGoal: 400, now });

  it('builds the bankroll from the opening balance', () => {
    expect(s.days).toHaveLength(30);
    expect(s.days[0].balance).toBe(1200);
    expect(s.bank).toBe(1400);
    expect(s.profit).toBe(200);
  });
  it('counts results, ROI and hit rate only on settled bets in the window', () => {
    expect([s.greens, s.reds, s.pending]).toEqual([3, 1, 1]);
    expect(s.roi).toBeCloseTo(50);
    expect(s.hitRate).toBeCloseTo(0.75);
  });
  it('tracks streaks in chronological order', () => {
    expect(s.bestStreak).toBe(2);
    expect(s.currentStreak).toBe(1);
  });
  it('reports goal progress and best/worst days', () => {
    expect(s.goal.pct).toBeCloseTo(50);
    expect(s.bestDay).toBe(100);
    expect(s.worstDay).toBe(-100);
  });
  it('handles an empty account without NaN', () => {
    const e = computeStats([], { startingBankroll: 500, monthlyGoal: 0, now });
    expect([e.bank, e.roi, e.hitRate, e.avgOdd, e.goal.pct]).toEqual([500, 0, 0, 0, 0]);
  });
});
