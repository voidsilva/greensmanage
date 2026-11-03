'use server';

import { eq, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db, schema } from '@/db';
import { DUMMY_HASH, verifyPassword } from '@/lib/password';
import { createSession, deleteSession } from '@/lib/session';

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

const LoginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, 'Informe o usuário.').max(40),
  password: z.string().min(1, 'Informe a senha.').max(200),
  remember: z.literal('on').optional(),
});

export type LoginState = { error?: string; username?: string; at?: number } | undefined;

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    username: form.get('username'),
    password: form.get('password'),
    remember: form.get('remember') ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, at: Date.now() };
  const { username, password, remember } = parsed.data;

  const [user] = await db()
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .limit(1);

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const min = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
    return { username, error: `Muitas tentativas. Tente de novo em ${min} min.`, at: Date.now() };
  }

  // Always run scrypt, so a missing user takes as long as a wrong password.
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !ok) {
    if (user) {
      await db()
        .update(schema.users)
        .set({
          failedLogins: sql`${schema.users.failedLogins} + 1`,
          lockedUntil: sql`case when ${schema.users.failedLogins} + 1 >= ${MAX_FAILS}
            then now() + make_interval(mins => ${LOCK_MINUTES}) else null end`,
        })
        .where(eq(schema.users.id, user.id));
    }
    return { username, error: 'Usuário ou senha incorretos.', at: Date.now() };
  }

  await db()
    .update(schema.users)
    .set({ failedLogins: 0, lockedUntil: null })
    .where(eq(schema.users.id, user.id));
  await createSession({ sub: user.id, name: user.name }, remember === 'on');
  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
