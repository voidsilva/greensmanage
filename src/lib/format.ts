const nf = (min: number, max = min) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max });
const n2 = nf(2);

/** R$ 1.234,56 · with `signed`, +R$ / −R$ (true minus sign). */
export function money(v: number, signed = false): string {
  const sign = signed && v > 0.004 ? '+' : v < -0.004 ? '−' : '';
  return `${sign}R$ ${n2.format(Math.abs(v))}`;
}
export const pct = (v: number, digits = 1) => `${nf(digits).format(v)}%`;
export const odd = (v: number) => n2.format(v);

export function dayLabel(d: number, now: Date): string {
  if (d === 0) return 'Hoje';
  if (d === 1) return 'Ontem';
  const t = new Date(now);
  t.setUTCDate(t.getUTCDate() - d);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(t);
}
