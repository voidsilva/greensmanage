import { describe, expect, it } from 'vitest';
import { sampleBets } from '@/lib/sample';
import { computeStats } from '@/lib/stats';

describe('sampleBets (demo data)', () => {
  const now = new Date('2026-11-03T15:00:00Z');
  it('is deterministic and never in the future', () => {
    const a = sampleBets(now);
    expect(a).toEqual(sampleBets(now));
    expect(a.every((b) => new Date(b.placedAt) <= now)).toBe(true);
    expect(new Set(a.map((b) => b.id)).size).toBe(a.length);
  });
  it('produces a profitable but believable month', () => {
    const s = computeStats(sampleBets(now), { startingBankroll: 12500, monthlyGoal: 3000, now });
    expect(s.pending).toBe(2);
    expect(s.hitRate).toBeGreaterThan(0.5);
    expect(s.hitRate).toBeLessThan(0.75);
  });
});
