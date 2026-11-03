'use client';

import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, Chip, CountUp } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { dayLabel, money, odd, pct } from '@/lib/format';
import type { DashboardStats } from '@/lib/stats';

const bankFmt = (v: number) => {
  const [i, d] = Math.abs(v).toFixed(2).split('.');
  return (
    <>
      R$ {Number(i).toLocaleString('pt-BR')}
      <small className="text-2xl font-semibold text-muted">,{d}</small>
    </>
  );
};

export function BankHero({
  stats,
  now,
  onNewBet,
  className,
}: {
  stats: DashboardStats;
  now: Date;
  onNewBet: () => void;
  className?: string;
}) {
  const toast = useToast();
  const week = stats.days.slice(-7);
  const weekMax = Math.max(...week.map((d) => Math.abs(d.pl)), 1);
  const weekSum = week.reduce((a, d) => a + d.pl, 0);
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <Card
      id="banca"
      className={cn('flex flex-col gap-[18px] overflow-hidden p-[26px]', className)}
      delay={0.05}
    >
      <div
        aria-hidden
        className="animate-float absolute -top-[70px] -right-[70px] -z-10 size-[260px] rounded-full blur-[6px] [animation-duration:14s] [background:radial-gradient(circle_at_35%_35%,rgb(198_255_94/.55),rgb(34_224_122/.25)_45%,transparent_70%)]"
      />
      <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-muted">
        Banca atual
        <Chip tone={stats.bankChangePct >= 0 ? 'up' : 'down'}>
          {stats.bankChangePct >= 0 ? '▲' : '▼'} {pct(Math.abs(stats.bankChangePct))} em 30 dias
        </Chip>
      </div>
      <div
        className="text-[42px] leading-none font-extrabold tracking-[-0.045em] tabular-nums md:text-[54px]"
        aria-live="polite"
      >
        <CountUp value={stats.bank} format={bankFmt} duration={1.4} />
      </div>
      <dl className="flex flex-wrap gap-[18px] text-[13px] text-muted md:gap-7">
        <div>
          <dt>Lucro em 30 dias</dt>
          <dd
            className={cn(
              'mt-0.5 text-lg font-bold tabular-nums',
              stats.profit >= 0 ? 'text-pos' : 'text-neg',
            )}
          >
            <CountUp value={stats.profit} format={(v) => money(v, true)} />
          </dd>
        </div>
        <div>
          <dt>Stake média</dt>
          <dd className="mt-0.5 text-lg font-bold text-ink tabular-nums">
            {money(stats.avgStake)}
          </dd>
        </div>
        <div>
          <dt>Odd média</dt>
          <dd className="mt-0.5 text-lg font-bold text-ink tabular-nums">{odd(stats.avgOdd)}</dd>
        </div>
      </dl>
      <div>
        <div className="flex justify-between text-[12.5px] text-muted">
          <span>Últimos 7 dias</span>
          <span className={cn('font-bold tabular-nums', weekSum >= 0 ? 'text-pos' : 'text-neg')}>
            {money(weekSum, true)}
          </span>
        </div>
        <div className="mt-2 flex h-16 items-end gap-2" aria-hidden>
          {week.map((d) => (
            <div
              key={d.d}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              title={`${dayLabel(d.d, now)}: ${money(d.pl, true)}`}
            >
              <i
                className={cn(
                  'w-full max-w-[34px] rounded-t-[9px] rounded-b-[5px] transition-[height] duration-1000 ease-spring',
                  d.pl < 0
                    ? 'bg-linear-180 from-[#ff8b98] to-[#c9304a] shadow-[0_0_14px_-2px_rgb(255_107_125/.45)]'
                    : 'bg-linear-180 from-green-3 to-green-2 shadow-[0_0_14px_-2px_rgb(34_224_122/.55),inset_0_1px_0_rgb(255_255_255/.6)]',
                )}
                style={{ height: grown ? Math.max(8, (Math.abs(d.pl) / weekMax) * 46) : 4 }}
              />
              <span className="font-mono text-[10px] text-faint">
                {dayLabel(d.d, now).slice(0, 5)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto flex gap-2.5">
        <button
          onClick={onNewBet}
          className="btn-primary shine inline-flex items-center gap-2 rounded-full px-4 py-3 text-[13px] font-bold transition-transform ease-spring active:scale-95 md:px-5 md:text-sm"
        >
          <Plus className="size-4" strokeWidth={2.6} />
          Nova aposta
          <kbd className="hidden rounded-md bg-[#002814]/18 px-1.5 py-0.5 font-mono text-[10.5px] md:inline">
            N
          </kbd>
        </button>
        <button
          onClick={() => toast('Depósito: conecte sua casa de apostas para ativar')}
          className="glass lens shine rounded-full px-4 py-3 text-[13px] font-bold md:px-5 md:text-sm"
        >
          Depositar
        </button>
        <button
          onClick={() => toast('Saque: conecte sua casa de apostas para ativar')}
          className="glass lens shine rounded-full px-4 py-3 text-[13px] font-bold md:px-5 md:text-sm"
        >
          Sacar
        </button>
      </div>
    </Card>
  );
}
