import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { isDemo } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';

/**
 * Landing point for e-mail links (sign-up confirmation, password recovery).
 * Exchanges the one-time token for a session, then sends the user on.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  if (!isDemo()) {
    const sb = await createClient();
    const { error } =
      tokenHash && type
        ? await sb.auth.verifyOtp({ type, token_hash: tokenHash })
        : code
          ? await sb.auth.exchangeCodeForSession(code)
          : { error: new Error('missing token') };
    if (!error) return NextResponse.redirect(new URL(next, req.url));
  }
  return NextResponse.redirect(new URL('/login?erro=link', req.url));
}
