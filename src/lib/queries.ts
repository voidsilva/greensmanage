import 'server-only';
import { backend } from './backend';
import { getCurrentUser } from './dal';
import { TZ_OFFSET_MIN, WINDOW_DAYS } from './domain';
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
  const b = backend();
  const [bets, prior] = await Promise.all([b.listBets(from), b.profitBefore(from)]);
  const stats = computeStats(bets, {
    startingBankroll: user.startingBankroll + prior,
    monthlyGoal: user.monthlyGoal,
    now,
  });
  return {
    mode: b.mode,
    user: { name: user.name, unitSize: user.unitSize },
    stats,
    recent: bets.slice(0, 40),
    now: now.toISOString(),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;
