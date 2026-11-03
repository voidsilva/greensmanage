'use client';

import { motion } from 'motion/react';
import { BarChart3, CalendarDays, LayoutGrid, Trophy, Wallet, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/cn';

const NAV: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'top', label: 'Visão geral', icon: LayoutGrid },
  { id: 'apostas', label: 'Apostas', icon: Trophy },
  { id: 'banca', label: 'Banca', icon: Wallet },
  { id: 'mercados', label: 'Mercados', icon: BarChart3 },
  { id: 'calendario', label: 'Calendário', icon: CalendarDays },
];

/** Side rail on desktop, floating tab bar on phones. Tracks the section in view. */
export function Sidebar() {
  const [active, setActive] = useState('top');

  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        if (scrollY < 120) return setActive('top');
        const vis = entries
          .filter((e) => e.isIntersecting && e.target.id !== 'top')
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id: string) => {
    setActive(id);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <aside className="glass fixed inset-x-3.5 bottom-3 z-50 rounded-[28px] p-2 md:sticky md:top-5 md:inset-x-auto md:bottom-auto md:flex md:h-[calc(100dvh-40px)] md:flex-col md:items-center md:gap-2.5 md:rounded-[30px] md:px-0 md:py-[18px]">
      <Logo className="mb-3.5 hidden md:grid" />
      <nav
        aria-label="Seções"
        className="flex flex-1 justify-between md:flex-col md:justify-start md:gap-2"
      >
        {NAV.map(({ id, label, icon: Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => go(id)}
              aria-current={on ? 'true' : undefined}
              aria-label={label}
              className={cn(
                'group relative grid size-[52px] place-items-center rounded-[18px] transition-colors duration-300',
                on ? 'text-[#04210f]' : 'text-muted hover:text-ink',
              )}
            >
              {on && (
                <motion.span
                  layoutId="nav-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  className="absolute inset-0 rounded-[18px] bg-linear-145 from-[#a6ffd0] to-green-1 shadow-[0_8px_24px_-6px_rgb(34_224_122/.75),inset_0_1px_0_rgb(255_255_255/.8)]"
                />
              )}
              <Icon className="relative size-[22px]" strokeWidth={2} />
              <span
                aria-hidden
                className="glass pointer-events-none absolute top-1/2 left-16 hidden -translate-x-1.5 -translate-y-1/2 rounded-xl px-3 py-[7px] text-[12.5px] font-semibold whitespace-nowrap text-ink opacity-0 transition md:block group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="hidden size-[46px] place-items-center rounded-full border-[1.5px] border-white/35 bg-linear-145 from-[#1b6b42] to-[#0d3d25] text-[15px] font-bold text-[#eafff3] md:grid">
        PS
      </div>
    </aside>
  );
}
