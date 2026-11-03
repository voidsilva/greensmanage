import 'server-only';
import { and, desc, eq, gte, lt, or, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getCurrentUser } from './dal';
import { TZ_OFFSET_MIN, WINDOW_DAYS, type BetView } from './domain';
import { computeStats } from './stats';

const DAY = 86_400_000;

/** Start (UTC instant) of the first local day in the window. */
export function windowStart(now: Date, days = WINDOW_DAYS) {
  const off = TZ_OFFSET_MIN * 60_000;
  const today = Math.floor((now.getTime() + off) / DAY);
  return new Date((today - (days - 1)) * DAY - off);
}

export async function getDashboard() {
  const user = await getCurrentUser();
  const now = new Date();
  const from = windowStart(now);
  const b = schema.bets;

  const [rows, [prior]] = await Promise.all([
    db()
      .select({
        id: b.id,
        code: b.code,
        game: b.game,
        league: b.league,
        market: b.market,
        odd: b.odd,
        stake: b.stake,
        status: b.status,
        placedAt: b.placedAt,
      })
      .from(b)
      .where(and(eq(b.userId, user.id), or(gte(b.placedAt, from), eq(b.status, 'pending'))))
      .orderBy(desc(b.placedAt)),
    db()
      .select({
        profit: sql<string>`coalesce(sum(case
          when ${b.status} = 'green' then ${b.stake} * (${b.odd} - 1)
          when ${b.status} = 'red' then -${b.stake} else 0 end), 0)`,
      })
      .from(b)
      .where(and(eq(b.userId, user.id), lt(b.placedAt, from))),
  ]);

  const bets: BetView[] = rows.map((r) => ({ ...r, placedAt: r.placedAt.toISOString() }));
  const stats = computeStats(bets, {
    startingBankroll: user.startingBankroll + Number(prior?.profit ?? 0),
    monthlyGoal: user.monthlyGoal,
    now,
  });

  return {
    user: { name: user.name, unitSize: user.unitSize, startingBankroll: user.startingBankroll },
    stats,
    recent: bets.slice(0, 40),
    now: now.toISOString(),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;
