import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseConfig } from '@/lib/config';
import type { Database } from './database.types';

/** A fresh client per request, bound to the request cookies (never share one). */
export async function createClient() {
  const cfg = supabaseConfig();
  if (!cfg) throw new Error('Supabase não configurado');
  const store = await cookies();
  return createServerClient<Database>(cfg.url, cfg.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  });
}
