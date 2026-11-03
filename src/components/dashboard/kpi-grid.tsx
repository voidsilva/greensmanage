'use client';

import { Check, TrendingUp, X, Zap, type LucideIcon } from 'lucide-react';
import { Card, Chip, CountUp, Sparkline } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { money, pct } from '@/lib/format';
import type { DashboardStats } from '@/lib/stats';

export function KpiGrid({
  stats,
  unitSize,
  className,
}: {
  stats: DashboardStats;
  unitSize: number;
  className?: string;
}) {
  const roiSeries: number[] = [];
  for (let i = 0, acc = 0, st = 0; i < stats.days.length; i++) {
    acc += stats.days[i].pl;
    st += stats.days[i].staked;
    roiSeries.push(st ? acc / st : 0);
  }
  const units = stats.profit / unitSize;
  const items: {
    icon: LucideIcon;
    color: string;
    chip: string;
    tone: 'up' | 'down';
    value: number;
    fmt: (v: number) => string;
    label: string;
    series: number[];
    spark: string;
  }[] = [
    {
      icon: Check,
      color: '#22e07a',
      chip: `${stats.greens7} nos últimos 7d`,
      tone: 'up',
      value: stats.greens,
      fmt: (v) => String(Math.round(v)),
      label: 'Greens em 30 dias',
      series: stats.days.map((d) => d.g),
      spark: '#22e07a',
    },
    {
      icon: X,
      color: '#ff6b7d',
      chip: `${stats.reds7} nos últimos 7d`,
      tone: 'down',
      value: stats.reds,
      fmt: (v) => String(Math.round(v)),
      label: 'Reds em 30 dias',
      series: stats.days.map((d) => d.n - d.g),
      spark: '#ff6b7d',
    },
    {
      icon: TrendingUp,
      color: '#a6e83a',
      chip: `${money(stats.staked).replace(',00', '')} apostados`,
      tone: 'up',
      value: stats.roi,
      fmt: (v) => pct(v),
      label: 'ROI',
      series: roiSeries,
      spark: '#a6e83a',
    },
    {
      icon: Zap,
      color: '#22e07a',
      chip: `${stats.currentStreak} ${stats.currentStreak === 1 ? 'green seguido' : 'greens seguidos'}`,
      tone: 'up',
      value: units,
      fmt: (v) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1).replace('.', ',')}u`,
      label: `Unidades (1u = ${money(unitSize).replace(',00', '')})`,
      series: stats.days.map((d) => d.balance),
      spark: '#2be884',
    },
  ];
  return (
    <div className={cn('grid grid-cols-2 gap-3 md:gap-5', className)}>
      {items.map((k, i) => (
        <Card key={k.label} className="flex flex-col gap-3 p-4 md:p-5" delay={0.1 + i * 0.05}>
          <div className="flex items-center justify-between gap-2">
            <span className="grid size-10 place-items-center rounded-[14px] bg-chip shadow-[inset_0_0_0_1px_var(--line),inset_0_1px_0_rgb(255_255_255/.2)]">
              <k.icon className="size-5" color={k.color} strokeWidth={2.2} />
            </span>
            <span className="hidden md:block">
              <Chip tone={k.tone}>{k.chip}</Chip>
            </span>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight tabular-nums md:text-[30px]">
              <CountUp value={k.value} format={k.fmt} />
            </div>
            <div className="text-[13px] text-muted">{k.label}</div>
          </div>
          <Sparkline data={k.series} color={k.spark} />
        </Card>
      ))}
    </div>
  );
}
