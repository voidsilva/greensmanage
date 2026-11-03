import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { DEMO_ACCOUNT } from '@/lib/config';
import type { BetView } from '@/lib/domain';
import { sampleBets } from '@/lib/sample';
import type { Backend, Profile } from './types';

/**
 * Demo mode: no database. The sample history is generated on the fly and the
 * visitor's own changes (new bets, results, profile) live in a signed cookie,
 * so each visitor gets a private sandbox that survives reloads.
 */
const SESSION = 'gm_demo';
const DATA = 'gm_demo_data';
const MAX_ADDED = 15; // keeps the cookie well under 4 KB
const key = () =>
  new TextEncoder().encode(
    process.env.SESSION_SECRET ?? 'greensmanage-demo-only-not-a-secret-0001',
  );
const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

type Added = [
  id: string,
  code: string,
  game: string,
  league: string,
  market: BetView['market'],
  odd: number,
  stake: number,
  status: BetView['status'],
  placedAt: string,
];
type Overlay = {
  s: Record<string, 'green' | 'red'>;
  a: Added[];
  p?: Partial<Pick<Profile, 'name' | 'startingBankroll' | 'monthlyGoal' | 'unitSize'>>;
};

const DEFAULT_PROFILE: Profile = {
  id: 'demo',
  email: DEMO_ACCOUNT.email,
  name: 'Paulo Silva',
  startingBankroll: 12500,
  monthlyGoal: 3000,
  unitSize: 100,
};

async function sign(payload: object) {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key());
}
async function verify<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    return (await jwtVerify(token, key(), { algorithms: ['HS256'] })).payload as T;
  } catch {
    return null;
  }
}

/** Used by the proxy (edge-safe: only jose + the request cookie). */
export async function isDemoSessionValid(token: string | undefined) {
  return (await verify<{ demo?: boolean }>(token))?.demo === true;
}
export const DEMO_SESSION_COOKIE = SESSION;

async function signedIn() {
  return isDemoSessionValid((await cookies()).get(SESSION)?.value);
}
async function readOverlay(): Promise<Overlay> {
  const o = await verify<Overlay>((await cookies()).get(DATA)?.value);
  return { s: o?.s ?? {}, a: o?.a ?? [], p: o?.p };
}
async function writeOverlay(o: Overlay) {
  (await cookies()).set(DATA, await sign(o), cookieOpts);
}

async function allBets(): Promise<BetView[]> {
  const o = await readOverlay();
  const added: BetView[] = o.a.map(
    ([id, code, game, league, market, odd, stake, status, placedAt]) => ({
      id,
      code,
      game,
      league,
      market,
      odd,
      stake,
      status,
      placedAt,
    }),
  );
  return [...added, ...sampleBets(new Date())]
    .map((b) => (o.s[b.id] ? { ...b, status: o.s[b.id] } : b))
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export const demoBackend: Backend = {
  mode: 'demo',

  async currentProfile() {
    if (!(await signedIn())) return null;
    return { ...DEFAULT_PROFILE, ...(await readOverlay()).p };
  },

  async listBets(from) {
    return (await allBets()).filter((b) => b.status === 'pending' || new Date(b.placedAt) >= from);
  },

  async profitBefore() {
    return 0; // the sample history starts inside the window
  },

  async createBet(input) {
    const o = await readOverlay();
    const id = `u-${crypto.randomUUID()}`;
    o.a = [
      [
        id,
        input.code,
        input.game,
        input.league,
        input.market,
        input.odd,
        input.stake,
        input.status,
        new Date().toISOString(),
      ] as Added,
      ...o.a,
    ].slice(0, MAX_ADDED);
    await writeOverlay(o);
    return { id };
  },

  async settleBet(id, result) {
    const bet = (await allBets()).find((b) => b.id === id);
    if (!bet || bet.status !== 'pending') return null;
    const o = await readOverlay();
    const i = o.a.findIndex((a) => a[0] === id);
    if (i >= 0) o.a[i][7] = result;
    else o.s[id] = result;
    await writeOverlay(o);
    return { stake: bet.stake, odd: bet.odd };
  },

  async updateProfile(input) {
    const o = await readOverlay();
    o.p = input;
    await writeOverlay(o);
  },

  async signIn(email, password) {
    if (email !== DEMO_ACCOUNT.email || password !== DEMO_ACCOUNT.password) {
      await new Promise((r) => setTimeout(r, 500));
      return { error: 'E-mail ou senha incorretos.' };
    }
    (await cookies()).set(SESSION, await sign({ demo: true }), cookieOpts);
    return {};
  },

  async signUp() {
    return { error: 'Cadastro desativado no modo demonstração. Entre com a conta demo.' };
  },
  async requestPasswordReset() {
    return { error: 'Indisponível no modo demonstração.' };
  },
  async updatePassword() {
    return { error: 'Indisponível no modo demonstração.' };
  },

  async signOut() {
    const c = await cookies();
    c.delete(SESSION);
    c.delete(DATA);
  },
};
