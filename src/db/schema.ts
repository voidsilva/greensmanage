import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  numeric,
  pgSchema,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Everything lives in its own Postgres schema so the app can share a database
 * with other projects without touching their tables.
 */
export const gm = pgSchema('greensmanage');

export const betStatus = gm.enum('bet_status', ['pending', 'green', 'red']);
export const market = gm.enum('market', [
  'over_under',
  'btts',
  'match_result',
  'corners',
  'asian_handicap',
]);

export const users = gm.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 40 }).notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  /** Bankroll at the start of tracking, in BRL. */
  startingBankroll: numeric('starting_bankroll', { precision: 12, scale: 2, mode: 'number' })
    .notNull()
    .default(12500),
  monthlyGoal: numeric('monthly_goal', { precision: 12, scale: 2, mode: 'number' })
    .notNull()
    .default(3000),
  unitSize: numeric('unit_size', { precision: 10, scale: 2, mode: 'number' })
    .notNull()
    .default(100),
  failedLogins: integer('failed_logins').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const bets = gm.table(
  'bets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 4 }).notNull(),
    game: varchar('game', { length: 80 }).notNull(),
    league: varchar('league', { length: 60 }).notNull(),
    market: market('market').notNull(),
    odd: numeric('odd', { precision: 6, scale: 2, mode: 'number' }).notNull(),
    stake: numeric('stake', { precision: 10, scale: 2, mode: 'number' }).notNull(),
    status: betStatus('status').notNull().default('pending'),
    placedAt: timestamp('placed_at', { withTimezone: true }).notNull().defaultNow(),
    settledAt: timestamp('settled_at', { withTimezone: true }),
  },
  (t) => [
    index('bets_user_placed_idx').on(t.userId, t.placedAt.desc()),
    index('bets_user_pending_idx')
      .on(t.userId)
      .where(sql`${t.status} = 'pending'`),
  ],
);

export type User = typeof users.$inferSelect;
export type Bet = typeof bets.$inferSelect;
export type NewBet = typeof bets.$inferInsert;
export type BetStatus = (typeof betStatus.enumValues)[number];
export type Market = (typeof market.enumValues)[number];
