import type { BetView } from './domain';
import type { Market } from './supabase/database.types';

const GAMES: [string, string, string][] = [
  ['FLA', 'Flamengo x Palmeiras', 'Brasileirão'],
  ['RMA', 'Real Madrid x Barcelona', 'La Liga'],
  ['MCI', 'Man City x Arsenal', 'Premier League'],
  ['COR', 'Corinthians x São Paulo', 'Brasileirão'],
  ['INT', 'Inter x Milan', 'Serie A'],
  ['BAY', 'Bayern x Dortmund', 'Bundesliga'],
  ['PSG', 'PSG x Marseille', 'Ligue 1'],
  ['BOT', 'Botafogo x Fluminense', 'Brasileirão'],
  ['LIV', 'Liverpool x Chelsea', 'Premier League'],
  ['ATM', 'Atlético x Sevilla', 'La Liga'],
  ['JUV', 'Juventus x Napoli', 'Serie A'],
  ['GRE', 'Grêmio x Inter', 'Brasileirão'],
];
const MARKETS: [Market, number][] = [
  ['over_under', 0.71],
  ['btts', 0.67],
  ['match_result', 0.6],
  ['corners', 0.69],
  ['asian_handicap', 0.57],
];
const DAY = 86_400_000;

/**
 * 30 days of realistic history, deterministic for a given local day, so the
 * demo looks the same on every server instance. Ids are stable ("s-<day>-<n>").
 */
export function sampleBets(now: Date): BetView[] {
  const dayStart = Math.floor(now.getTime() / DAY) * DAY;
  let sd = 20261103;
  const rnd = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  const out: BetView[] = [];
  for (let d = 29; d >= 0; d--) {
    const n = 4 + Math.floor(rnd() * 5);
    for (let k = 0; k < n; k++) {
      const [code, game, league] = GAMES[Math.floor(rnd() * GAMES.length)];
      const [market, rate] = MARKETS[Math.floor(rnd() * MARKETS.length)];
      const odd = +(1.5 + rnd() * 0.8).toFixed(2);
      const stake = [50, 80, 100, 120, 150, 200][Math.floor(rnd() * 6)];
      const status = rnd() < rate ? 'green' : 'red';
      // spread across the afternoon/evening (UTC 15h–23h ≈ 12h–20h in Brasília)
      const placedAt = new Date(dayStart - d * DAY + (15 + (k * 8) / n) * 3_600_000);
      if (placedAt > now) placedAt.setTime(now.getTime() - (n - k) * 600_000);
      out.push({
        id: `s-${d}-${k}`,
        code,
        game,
        league,
        market,
        odd,
        stake,
        status,
        placedAt: placedAt.toISOString(),
      });
    }
  }
  out.push(
    {
      id: 's-live-1',
      code: 'FLA',
      game: 'Flamengo x Palmeiras',
      league: 'Brasileirão',
      market: 'btts',
      odd: 1.82,
      stake: 150,
      status: 'pending',
      placedAt: new Date(now.getTime() - 30 * 60_000).toISOString(),
    },
    {
      id: 's-live-2',
      code: 'SAN',
      game: 'Santos x Vasco',
      league: 'Brasileirão',
      market: 'over_under',
      odd: 1.95,
      stake: 100,
      status: 'pending',
      placedAt: new Date(now.getTime() - 60 * 60_000).toISOString(),
    },
  );
  return out.sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}
