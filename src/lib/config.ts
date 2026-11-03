/**
 * The app runs in two modes:
 *  - **Supabase**: real accounts and data (needs the two NEXT_PUBLIC_SUPABASE_* vars).
 *  - **Demo**: no database; one demo account with sample data, changes kept in a cookie.
 */
export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export const isDemo = () => supabaseConfig() === null;

export const DEMO_ACCOUNT = { email: 'demo@greensmanage.app', password: 'demo1234' } as const;

/** Public origin, used in e-mail links. */
export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');
