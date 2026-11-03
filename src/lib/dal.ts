import 'server-only';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { db, schema } from '@/db';
import { readSession } from './session';

export type CurrentUser = {
  id: string;
  name: string;
  username: string;
  startingBankroll: number;
  monthlyGoal: number;
  unitSize: number;
};

/** Data Access Layer: the single place that turns a cookie into a user. */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const session = await readSession();
  if (!session) redirect('/login');
  const [user] = await db()
    .select({
      id: schema.users.id,
      name: schema.users.name,
      username: schema.users.username,
      startingBankroll: schema.users.startingBankroll,
      monthlyGoal: schema.users.monthlyGoal,
      unitSize: schema.users.unitSize,
    })
    .from(schema.users)
    .where(eq(schema.users.id, session.sub))
    .limit(1);
  if (!user) redirect('/login');
  return user;
});
