import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Optimistic gate only: bounces requests without a valid token before rendering.
 * The real authorization check lives in the Data Access Layer (src/lib/dal.ts)
 * and in every Server Action.
 */
const COOKIE = 'gm_session';
const PUBLIC = ['/login'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC.includes(pathname);
  const token = req.cookies.get(COOKIE)?.value;
  let valid = false;
  if (token && process.env.SESSION_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET), {
        issuer: 'greensmanage',
        algorithms: ['HS256'],
      });
      valid = true;
    } catch {}
  }
  if (!isPublic && !valid) return NextResponse.redirect(new URL('/login', req.url));
  if (isPublic && valid) return NextResponse.redirect(new URL('/', req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)'],
};
