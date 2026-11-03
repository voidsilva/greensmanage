'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({
  id,
  className,
  delay = 0,
  children,
}: {
  id?: string;
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn('glass animate-rise min-w-0 scroll-mt-5 p-5 md:p-[22px]', className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
      <div>
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
        {sub && <p className="mt-0.5 text-[12.5px] text-muted">{sub}</p>}
      </div>
      {children}
    </header>
  );
}

export function Chip({
  tone = 'up',
  className,
  children,
}: {
  tone?: 'up' | 'down';
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12.5px] font-bold whitespace-nowrap tabular-nums',
        tone === 'up'
          ? 'bg-green-1/15 text-pos shadow-[inset_0_0_0_1px_rgb(34_224_122/.32)]'
          : 'bg-neg/13 text-neg shadow-[inset_0_0_0_1px_rgb(255_107_125/.32)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Animated number. Re-animates from the previous value when `value` changes. */
export function CountUp({
  value,
  format,
  duration = 1.1,
}: {
  value: number;
  format: (v: number) => ReactNode;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (reduce) return;
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const e = 1 - Math.pow(1 - p, 3);
      setShown(a + (value - a) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);
  return <>{format(reduce ? value : shown)}</>;
}

/** iOS-style segmented control with a sliding glass thumb. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  name,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
  name?: string;
}) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative flex gap-0.5 rounded-full bg-chip p-1 shadow-[inset_0_1px_2px_rgb(0_0_0/.15)]"
    >
      {name && <input type="hidden" name={name} value={value} />}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative flex-1 rounded-full px-3.5 py-[7px] text-xs font-bold transition-colors duration-300',
              on ? 'text-[#05301a]' : 'text-muted hover:text-ink',
            )}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                className="absolute inset-0 rounded-full bg-white/95 shadow-[0_4px_14px_-4px_rgb(0_0_0/.4),inset_0_1px_0_#fff]"
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Sparkline({
  data,
  color,
  className,
}: {
  data: number[];
  color: string;
  className?: string;
}) {
  const id = useId();
  const W = 200;
  const H = 36;
  const mx = Math.max(...data);
  const mn = Math.min(...data);
  const pts = data.map((v, i) => [
    (i / Math.max(1, data.length - 1)) * W,
    H - 4 - ((v - mn) / (mx - mn || 1)) * (H - 8),
  ]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
      className={cn('block h-9 w-full', className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W} ${H} L0 ${H}Z`} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}
