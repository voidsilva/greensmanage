'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardHeader, Segmented } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { dayLabel, money } from '@/lib/format';
import type { DashboardStats } from '@/lib/stats';

type Range = '7' | '14' | '30';

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) =>
      setSize({ w: e.contentRect.width, h: e.contentRect.height }),
    );
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

export function BalanceChart({
  stats,
  now,
  className,
}: {
  stats: DashboardStats;
  now: Date;
  className?: string;
}) {
  const [range, setRange] = useState<Range>('30');
  const [hover, setHover] = useState<number | null>(null);
  const [ref, { w: W, h: H }] = useSize<HTMLDivElement>();
  const reduce = useReducedMotion();
  const goal = stats.goal.target;

  const g = useMemo(() => {
    const n = Number(range);
    const days = stats.days.slice(-n);
    const data = days.map((d) => d.balance);
    const startV = days[0].balance - days[0].pl;
    const goalEnd = startV + (goal * n) / 30;
    const L = 50,
      R = 12,
      T = 12,
      B = 28;
    const mn = Math.min(...data, startV) * 0.992;
    const mx = Math.max(...data, goalEnd) * 1.006;
    const X = (i: number) => L + (i / Math.max(1, n - 1)) * (W - L - R);
    const Y = (v: number) => T + (1 - (v - mn) / (mx - mn || 1)) * (H - T - B);
    const pts = data.map((v, i) => [X(i), Y(v)] as const);
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < n; i++) {
      const [ax, ay] = pts[i - 1];
      const [bx, by] = pts[i];
      const cx = (ax + bx) / 2;
      d += ` C${cx} ${ay} ${cx} ${by} ${bx} ${by}`;
    }
    const ticks = Array.from({ length: 5 }, (_, k) => mn + ((mx - mn) * k) / 4);
    const step = Math.max(1, Math.ceil(n / 7));
    return { n, days, data, startV, goalEnd, L, R, T, B, X, Y, pts, d, ticks, step };
  }, [range, stats.days, goal, W, H]);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left - g.L) / (W - g.L - g.R)) * (g.n - 1));
    setHover(Math.max(0, Math.min(g.n - 1, i)));
  };

  const ready = W > 0 && H > 0;
  const h = hover !== null ? { x: g.pts[hover][0], y: g.pts[hover][1], day: g.days[hover] } : null;

  return (
    <Card className={className} delay={0.3}>
      <CardHeader
        title="Evolução da banca"
        sub={`Saldo diário contra a meta de ${money(goal).replace(',00', '')} por mês`}
      >
        <Segmented<Range>
          label="Período"
          value={range}
          onChange={setRange}
          options={[
            { value: '7', label: '7D' },
            { value: '14', label: '14D' },
            { value: '30', label: '30D' },
          ]}
        />
      </CardHeader>
      <div className="mb-2 flex gap-4 text-[12.5px] text-muted">
        <span>
          <i className="mr-1.5 inline-block size-2.5 rounded-[3px] bg-green-1 align-[-1px]" />
          Banca
        </span>
        <span>
          <i className="mr-1.5 inline-block size-2.5 rounded-[3px] bg-faint align-[-1px]" />
          Meta
        </span>
      </div>
      <div ref={ref} className="relative h-60 md:h-[300px]">
        {ready && (
          <svg
            role="img"
            aria-label={`Banca foi de ${money(g.startV)} para ${money(g.data[g.n - 1])} nos últimos ${g.n} dias`}
            viewBox={`0 0 ${W} ${H}`}
            className="block size-full overflow-visible"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#22e07a" stopOpacity=".42" />
                <stop offset="1" stopColor="#22e07a" stopOpacity="0" />
              </linearGradient>
              <filter id="glow" x="-5%" y="-30%" width="110%" height="160%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {g.ticks.map((v) => (
              <g key={v}>
                <line
                  x1={g.L}
                  x2={W - g.R}
                  y1={g.Y(v)}
                  y2={g.Y(v)}
                  stroke="var(--faint)"
                  strokeOpacity=".35"
                />
                <text
                  x={g.L - 10}
                  y={g.Y(v) + 4}
                  textAnchor="end"
                  fill="var(--faint)"
                  fontSize="11"
                  className="font-mono"
                >
                  {(v / 1000).toFixed(1).replace('.', ',')}k
                </text>
              </g>
            ))}
            {g.days.map((d, i) =>
              i % g.step === 0 ? (
                <text
                  key={d.d}
                  x={g.X(i)}
                  y={H - 6}
                  textAnchor="middle"
                  fill="var(--faint)"
                  fontSize="11"
                  className="font-mono"
                >
                  {dayLabel(d.d, now)}
                </text>
              ) : null,
            )}
            <path
              d={`M${g.X(0)} ${g.Y(g.startV)} L${g.X(g.n - 1)} ${g.Y(g.goalEnd)}`}
              stroke="var(--faint)"
              strokeWidth="1.5"
              strokeDasharray="5 6"
              fill="none"
            />
            <motion.g
              key={range}
              initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 1.3, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <path
                d={`${g.d} L${g.X(g.n - 1)} ${H - g.B} L${g.X(0)} ${H - g.B}Z`}
                fill="url(#area)"
              />
              <path
                d={g.d}
                fill="none"
                stroke="#2be884"
                strokeWidth="3"
                filter="url(#glow)"
                strokeLinecap="round"
              />
              <circle
                cx={g.pts[g.n - 1][0]}
                cy={g.pts[g.n - 1][1]}
                r="5"
                fill="#eafff3"
                stroke="#22e07a"
                strokeWidth="3"
              />
            </motion.g>
            {h && (
              <g pointerEvents="none">
                <line
                  x1={h.x}
                  x2={h.x}
                  y1={g.T}
                  y2={H - g.B}
                  stroke="var(--faint)"
                  strokeDasharray="3 4"
                />
                <circle cx={h.x} cy={h.y} r="7" fill="#eafff3" stroke="#22e07a" strokeWidth="4" />
              </g>
            )}
          </svg>
        )}
        {h && (
          <div
            className="glass pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[118%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-nowrap"
            style={{ left: Math.max(80, Math.min(W - 80, h.x)), top: h.y }}
          >
            <span className="text-muted">
              {dayLabel(h.day.d, now)} · {h.day.n} entradas
            </span>
            <b className="block text-[15px] tabular-nums">{money(h.day.balance)}</b>
            <span className={cn('font-bold', h.day.pl >= 0 ? 'text-pos' : 'text-neg')}>
              {money(h.day.pl, true)} no dia
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
