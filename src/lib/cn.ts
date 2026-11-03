/** Tiny className joiner (no runtime deps). */
export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
