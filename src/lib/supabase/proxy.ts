import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';

/** Refreshes the Supabase session cookies and reports whether a user is signed in. */
export async function updateSession(req: NextRequest, cfg: { url: string; key: string }) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient<Database>(cfg.url, cfg.key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll(list, headers) {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
      },
    },
  });
  // getClaims validates the JWT signature; never trust getSession() on the server.
  const { data } = await supabase.auth.getClaims();
  return { res, signedIn: Boolean(data?.claims?.sub) };
}
