'use client';

import { motion } from 'motion/react';
import { Card, CardHeader, Chip } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { MARKETS } from '@/lib/domain';
import { money, pct } from '@/lib/format';
import type { DashboardStats } from '@/lib/stats';

const Bar = ({
  value,
  neg = false,
  delay = 0,
}: {
  value: number;
  neg?: boolean;
  delay?: number;
}) => (
  <div className="col-span-full h-2.5 overflow-hidden rounded-full bg-chip shadow-[inset_0_1px_2px_rgb(0_0_0/.25)]">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, value)}%` }}
      transition={{ duration: 1.2, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        'h-full rounded-[inherit]',
        neg
          ? 'bg-linear-90 from-[#c9304a] to-[#ff8b98] shadow-[0_0_12px_rgb(255_107_125/.45)]'
          : 'bg-linear-90 from-green-2 to-green-3 shadow-[0_0_12px_rgb(34_224_122/.55)]',
      )}
    />
  </div>
);

export function MarketBars({ stats, className }: { stats: DashboardStats; className?: string }) {
  const max = Math.max(...stats.byMarket.map((m) => Math.abs(m.profit)), 1);
  const g = stats.goal;
  return (
    <Card id="mercados" className={cn('flex flex-col gap-3.5', className)} delay={0.45}>
      <CardHeader title="Lucro por mercado" sub="Últimos 30 dias" />
      <div className="flex flex-col gap-3.5">
        {stats.byMarket.map((m, i) => (
          <div
            key={m.market}
            className="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-1.5 text-[13.5px]"
          >
            <span className="text-muted">{MARKETS[m.market]}</span>
            <b className={cn('tabular-nums', m.profit >= 0 ? 'text-pos' : 'text-neg')}>
              {money(m.profit, true)}
            </b>
            <Bar
              value={(Math.abs(m.profit) / max) * 100}
              neg={m.profit < 0}
              delay={0.2 + i * 0.06}
            />
          </div>
        ))}
      </div>
      <div className="mt-auto rounded-[22px] bg-linear-145 from-lime/18 to-green-1/7 p-[18px] shadow-[inset_0_0_0_1px_rgb(198_255_94/.25)]">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-muted">Meta mensal</span>
          <Chip>{pct(Math.min(g.pct, 999), 0)}</Chip>
        </div>
        <b className="text-[22px] tabular-nums">
          {money(g.progress)} / {money(g.target)}
        </b>
        <p className="mt-1 mb-3 text-[12.5px] text-muted">
          {g.pct >= 100
            ? 'Meta batida. Hora de proteger a banca e reduzir a stake.'
            : `Faltam ${money(g.target - g.progress)} para bater a meta.`}
        </p>
        <Bar value={g.pct} delay={0.5} />
      </div>
    </Card>
  );
}
