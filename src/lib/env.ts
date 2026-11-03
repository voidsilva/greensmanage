import 'server-only';
import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET precisa de 32+ caracteres'),
});

let cached: z.infer<typeof schema> | undefined;

/** Validated server env. Read lazily so `next build` does not need secrets. */
export function env() {
  cached ??= schema.parse(process.env);
  return cached;
}
