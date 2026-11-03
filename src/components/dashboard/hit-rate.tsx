'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Card, CardHeader, Chip, CountUp } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { pct } from '@/lib/format';
import type { DashboardStats } from '@/lib/stats';

const C = 2 * Math.PI * 82;

export function HitRate({ stats, className }: { stats: DashboardStats; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <Card className={cn('flex flex-col', className)} delay={0.35}>
      <CardHeader title="Taxa de acerto" sub={`${stats.greens + stats.reds} entradas resolvidas`}>
        <Chip>ROI {pct(stats.roi)}</Chip>
      </CardHeader>
      <div className="relative mx-auto mt-1.5 mb-[18px] size-[200px]">
        <svg viewBox="0 0 200 200" className="size-full -rotate-90" aria-hidden>
          <defs>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c6ff5e" />
              <stop offset="1" stopColor="#0fb565" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="82" fill="none" stroke="var(--chip)" strokeWidth="18" />
          <motion.circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="url(#ring)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: reduce ? C * (1 - stats.hitRate) : C }}
            animate={{ strokeDashoffset: C * (1 - stats.hitRate) }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ filter: 'drop-shadow(0 0 10px rgb(34 224 122 / .55))' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <b className="text-[42px] font-extrabold tracking-tight tabular-nums">
            <CountUp value={stats.hitRate * 100} format={(v) => `${Math.round(v)}%`} />
          </b>
          <span className="text-[12.5px] text-muted">de greens</span>
        </div>
      </div>
      <dl className="mt-auto grid grid-cols-3 gap-2.5 text-center">
        {[
          ['Greens', stats.greens, 'text-pos'],
          ['Reds', stats.reds, 'text-neg'],
          ['Pendentes', stats.pending, 'text-warn'],
        ].map(([l, v, c]) => (
          <div key={l} className="rounded-[18px] bg-chip p-3 shadow-[inset_0_0_0_1px_var(--line)]">
            <dd className={cn('text-[19px] font-bold tabular-nums', c as string)}>{v}</dd>
            <dt className="text-[11.5px] text-muted">{l}</dt>
          </div>
        ))}
      </dl>
    </Card>
  );
}
