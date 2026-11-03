import { jwtVerify } from 'jose';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseConfig } from '@/lib/config';
import { updateSession } from '@/lib/supabase/proxy';

/**
 * Optimistic gate: refreshes the session and bounces signed-out visitors before
 * rendering. Real authorization happens again in the DAL, in every Server
 * Action and, in Supabase mode, in Postgres Row Level Security.
 */
const GUEST_ONLY = ['/login', '/cadastro', '/esqueci-senha'];
const OPEN = ['/auth/confirm'];

async function demoSignedIn(req: NextRequest) {
  const token = req.cookies.get('gm_demo')?.value;
  if (!token) return false;
  try {
    const secret = process.env.SESSION_SECRET ?? 'greensmanage-demo-only-not-a-secret-0001';
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    return payload.demo === true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (OPEN.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const cfg = supabaseConfig();
  const { res, signedIn } = cfg
    ? await updateSession(req, cfg)
    : { res: NextResponse.next(), signedIn: await demoSignedIn(req) };

  const guestOnly = GUEST_ONLY.includes(pathname);
  if (!signedIn && !guestOnly) {
    const url = new URL('/login', req.url);
    if (pathname !== '/') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if (signedIn && guestOnly) return NextResponse.redirect(new URL('/', req.url));
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|grain.svg|robots.txt).*)'],
};
