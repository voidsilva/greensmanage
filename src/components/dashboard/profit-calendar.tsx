'use client';

import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { dayLabel, money } from '@/lib/format';
import type { DashboardStats } from '@/lib/stats';

export function ProfitCalendar({
  stats,
  now,
  className,
}: {
  stats: DashboardStats;
  now: Date;
  className?: string;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const max = Math.max(...stats.days.map((d) => Math.abs(d.pl)), 1);
  const day = sel !== null ? stats.days.find((d) => d.d === sel) : undefined;
  return (
    <Card id="calendario" className={className} delay={0.5}>
      <CardHeader title="Calendário de lucro" sub="Cada quadrado é um dia dos últimos 30">
        <div aria-hidden className="flex items-center gap-1.5 text-[11.5px] text-muted">
          Red
          <i className="size-3.5 rounded bg-[rgb(255_107_125/.55)]" />
          <i className="size-3.5 rounded bg-chip" />
          <i className="size-3.5 rounded bg-[rgb(34_224_122/.35)]" />
          <i className="size-3.5 rounded bg-[rgb(34_224_122/.85)]" />
          Green
        </div>
      </CardHeader>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
        {stats.days.map((d) => {
          const k = d.pl / max;
          const bg =
            k >= 0
              ? `rgb(34 224 122 / ${(0.12 + k * 0.75).toFixed(2)})`
              : `rgb(255 107 125 / ${(0.15 - k * 0.55).toFixed(2)})`;
          const date = new Date(now.getTime() - d.d * 86_400_000);
          const show = () => setSel(d.d);
          return (
            <button
              key={d.d}
              onMouseEnter={show}
              onFocus={show}
              onClick={show}
              aria-label={`${dayLabel(d.d, now)}: ${money(d.pl, true)}`}
              style={{ background: bg }}
              className={cn(
                'relative grid aspect-square place-items-center rounded-xl text-[11px] font-bold shadow-[inset_0_0_0_1px_var(--line),inset_0_1px_0_rgb(255_255_255/.15)] transition-transform duration-200 ease-spring hover:z-10 hover:scale-[1.14] focus-visible:z-10 focus-visible:scale-[1.14]',
                sel === d.d && 'ring-2 ring-green-1',
              )}
            >
              {new Intl.DateTimeFormat('pt-BR', {
                day: 'numeric',
                timeZone: 'America/Sao_Paulo',
              }).format(date)}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-3.5 min-h-5 text-[13px] text-muted">
        {day ? (
          <>
            <b className="text-ink">{dayLabel(day.d, now)}</b> · {day.n} entradas · {day.g} greens ·{' '}
            <span className={cn('font-bold', day.pl >= 0 ? 'text-pos' : 'text-neg')}>
              {money(day.pl, true)}
            </span>
          </>
        ) : (
          'Passe o mouse ou toque num dia para ver o resultado.'
        )}
      </p>
    </Card>
  );
}
