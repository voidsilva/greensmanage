'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { settleBet } from '@/app/actions/bets';
import { Card, CardHeader } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { MARKETS, daysAgo, profitOf, type BetView } from '@/lib/domain';
import { dayLabel, money, odd } from '@/lib/format';
import type { DashboardStats } from '@/lib/stats';

type Filter = 'all' | 'green' | 'red' | 'pending';
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'pending', label: 'Pendente' },
];

export function BetsTable({
  bets,
  stats,
  now,
  highlight,
  className,
}: {
  bets: BetView[];
  stats: DashboardStats;
  now: Date;
  highlight: string | null;
  className?: string;
}) {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [choosing, setChoosing] = useState<string | null>(null);
  const [, start] = useTransition();
  const [optimistic, settle] = useOptimistic(
    bets,
    (cur, { id, result }: { id: string; result: 'green' | 'red' }) =>
      cur.map((b) => (b.id === id ? { ...b, status: result } : b)),
  );

  const counts = {
    all: stats.greens + stats.reds + stats.pending,
    green: stats.greens,
    red: stats.reds,
    pending: stats.pending,
  };
  const rows = optimistic.filter((b) => filter === 'all' || b.status === filter).slice(0, 7);

  const onSettle = (b: BetView, result: 'green' | 'red') =>
    start(async () => {
      settle({ id: b.id, result });
      setChoosing(null);
      const ok = await settleBet(b.id, result);
      if (!ok) return toast('Essa aposta já foi resolvida.');
      toast(
        result === 'green'
          ? `Green! ${money(b.stake * (b.odd - 1), true)} na banca`
          : `Red registrado: ${money(-b.stake)}`,
      );
    });

  return (
    <Card id="apostas" className={className} delay={0.4}>
      <CardHeader title="Últimas apostas" sub='Toque em "Pendente" para dar o resultado'>
        <div role="group" aria-label="Filtrar apostas" className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'rounded-full px-3 py-[7px] text-[12.5px] font-bold shadow-[inset_0_0_0_1px_var(--line)] transition',
                filter === f.value ? 'bg-ink text-bg' : 'bg-chip text-muted hover:text-ink',
              )}
            >
              {f.label}
              <span className="ml-1.5 opacity-60 tabular-nums">{counts[f.value]}</span>
            </button>
          ))}
        </div>
      </CardHeader>
      <div className="-mx-1.5 overflow-x-auto">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="text-left font-mono text-[11px] tracking-[.08em] text-faint uppercase">
              {['Jogo', 'Mercado', 'Odd', 'Stake', 'Retorno', 'Status'].map((h) => (
                <th key={h} scope="col" className="px-2.5 pb-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  Nenhuma aposta com esse status.
                </td>
              </tr>
            )}
            {rows.map((b) => {
              const r = profitOf(b);
              return (
                <tr
                  key={b.id}
                  className={cn(
                    'whitespace-nowrap transition-colors hover:bg-white/4',
                    b.id === highlight && 'animate-row-in',
                  )}
                >
                  <td className="border-t border-line px-2.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-[34px] place-items-center rounded-xl bg-chip text-[11px] font-extrabold shadow-[inset_0_0_0_1px_var(--line)]">
                        {b.code}
                      </span>
                      <div>
                        {b.game}
                        <small className="block text-xs text-muted">
                          {b.league} · {dayLabel(daysAgo(b.placedAt, now), now)}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="border-t border-line px-2.5 py-3">{MARKETS[b.market]}</td>
                  <td className="border-t border-line px-2.5 py-3 tabular-nums">{odd(b.odd)}</td>
                  <td className="border-t border-line px-2.5 py-3 tabular-nums">
                    {money(b.stake)}
                  </td>
                  <td
                    className={cn(
                      'border-t border-line px-2.5 py-3 font-bold tabular-nums',
                      b.status !== 'pending' && (r > 0 ? 'text-pos' : 'text-neg'),
                    )}
                  >
                    {b.status === 'pending' ? '—' : money(r, true)}
                  </td>
                  <td className="border-t border-line px-2.5 py-3">
                    {b.status !== 'pending' ? (
                      <span
                        className={cn(
                          'inline-block rounded-full px-2.5 py-1.5 text-xs font-bold',
                          b.status === 'green' ? 'bg-green-1/15 text-pos' : 'bg-neg/14 text-neg',
                        )}
                      >
                        {b.status === 'green' ? 'Green' : 'Red'}
                      </span>
                    ) : choosing === b.id ? (
                      <span className="inline-flex gap-1.5">
                        <button
                          autoFocus
                          onClick={() => onSettle(b, 'green')}
                          className="animate-pop rounded-full bg-[#3df08f] px-2.5 py-1.5 text-xs font-bold text-[#03230f]"
                        >
                          Green
                        </button>
                        <button
                          onClick={() => onSettle(b, 'red')}
                          className="animate-pop rounded-full bg-[#e0465c] px-2.5 py-1.5 text-xs font-bold text-white"
                        >
                          Red
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setChoosing(b.id)}
                        aria-label={`Dar resultado: ${b.game}`}
                        className="rounded-full bg-warn/15 px-2.5 py-1.5 text-xs font-bold text-warn transition-transform hover:scale-105"
                      >
                        Pendente
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
