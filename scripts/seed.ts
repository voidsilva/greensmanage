/**
 * Creates (or updates the password of) the owner account and, on an empty
 * account, loads 30 days of realistic history so the dashboard has data.
 *   npm run db:seed
 */
import { count, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { hashPassword } from '../src/lib/password';
import type { Market, NewBet } from '../src/db/schema';

const { DATABASE_URL, SEED_USER, SEED_NAME, SEED_PASSWORD } = process.env;
if (!DATABASE_URL || !SEED_USER || !SEED_PASSWORD) {
  console.error('Defina DATABASE_URL, SEED_USER e SEED_PASSWORD.');
  process.exit(1);
}
if (SEED_PASSWORD.length < 10) {
  console.error('SEED_PASSWORD precisa de pelo menos 10 caracteres.');
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1, prepare: false });
const db = drizzle(client, { schema });

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

async function main() {
  const passwordHash = await hashPassword(SEED_PASSWORD!);
  const username = SEED_USER!.trim().toLowerCase();
  const [user] = await db
    .insert(schema.users)
    .values({ username, name: SEED_NAME || username, passwordHash })
    .onConflictDoUpdate({
      target: schema.users.username,
      set: { passwordHash, failedLogins: 0, lockedUntil: null },
    })
    .returning({ id: schema.users.id });

  const [{ n }] = await db
    .select({ n: count() })
    .from(schema.bets)
    .where(eq(schema.bets.userId, user.id));
  if (n > 0) {
    console.log(`Usuário "${username}" atualizado. Já tem ${n} apostas, histórico mantido.`);
    return client.end();
  }

  let sd = 20261103;
  const rnd = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  const rows: NewBet[] = [];
  const now = Date.now();
  for (let d = 29; d >= 0; d--) {
    const n = 4 + Math.floor(rnd() * 5);
    for (let k = 0; k < n; k++) {
      const [code, game, league] = GAMES[Math.floor(rnd() * GAMES.length)];
      const [market, rate] = MARKETS[Math.floor(rnd() * MARKETS.length)];
      const odd = +(1.5 + rnd() * 0.8).toFixed(2);
      const stake = [50, 80, 100, 120, 150, 200][Math.floor(rnd() * 6)];
      const status = rnd() < rate ? 'green' : 'red';
      const placedAt = new Date(now - d * 86_400_000 - (n - k) * 40 * 60_000);
      rows.push({
        userId: user.id,
        code,
        game,
        league,
        market,
        odd,
        stake,
        status,
        placedAt,
        settledAt: placedAt,
      });
    }
  }
  rows.push(
    {
      userId: user.id,
      code: 'FLA',
      game: 'Flamengo x Palmeiras',
      league: 'Brasileirão',
      market: 'btts',
      odd: 1.82,
      stake: 150,
      status: 'pending',
      placedAt: new Date(now - 30 * 60_000),
    },
    {
      userId: user.id,
      code: 'SAN',
      game: 'Santos x Vasco',
      league: 'Brasileirão',
      market: 'over_under',
      odd: 1.95,
      stake: 100,
      status: 'pending',
      placedAt: new Date(now - 60 * 60_000),
    },
  );
  await db.insert(schema.bets).values(rows);
  console.log(`Usuário "${username}" criado com ${rows.length} apostas de exemplo.`);
  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  await client.end();
  process.exit(1);
});
