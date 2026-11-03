'use client';

import { useEffect, useState } from 'react';
import type { DashboardData } from '@/lib/queries';
import { ToastProvider } from '@/components/ui/toast';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { BankHero } from './bank-hero';
import { KpiGrid } from './kpi-grid';
import { BalanceChart } from './balance-chart';
import { HitRate } from './hit-rate';
import { BetsTable } from './bets-table';
import { MarketBars } from './market-bars';
import { ProfitCalendar } from './profit-calendar';
import { StreakCard } from './streak-card';
import { NewBetSheet } from './new-bet-sheet';
import { EmptyState } from './empty-state';

export function Dashboard({ data }: { data: DashboardData }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const now = new Date(data.now);
  const { stats } = data;

  // "N" opens the new-bet sheet, unless the user is typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key.toLowerCase() !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/INPUT|SELECT|TEXTAREA/.test(t.tagName) || t.isContentEditable) return;
      e.preventDefault();
      setSheetOpen(true);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  return (
    <ToastProvider>
      <div className="relative z-10 mx-auto grid min-h-dvh max-w-[1580px] gap-3.5 p-3.5 md:grid-cols-[88px_minmax(0,1fr)] md:gap-5 md:p-5">
        <Sidebar />
        <main id="top" className="flex min-w-0 flex-col gap-3.5 pb-24 md:gap-5 md:pb-0">
          <Topbar name={data.user.name} demo={data.mode === 'demo'} />
          {data.recent.length === 0 && <EmptyState onNewBet={() => setSheetOpen(true)} />}
          <div className="grid grid-cols-1 gap-3.5 md:gap-5 xl:grid-cols-12">
            <BankHero
              stats={stats}
              now={now}
              onNewBet={() => setSheetOpen(true)}
              className="xl:col-span-5"
            />
            <KpiGrid stats={stats} unitSize={data.user.unitSize} className="xl:col-span-7" />
            <BalanceChart stats={stats} now={now} className="xl:col-span-8" />
            <HitRate stats={stats} className="xl:col-span-4" />
            <BetsTable
              bets={data.recent}
              stats={stats}
              now={now}
              highlight={highlight}
              className="xl:col-span-8"
            />
            <MarketBars stats={stats} className="xl:col-span-4" />
            <ProfitCalendar stats={stats} now={now} className="xl:col-span-7" />
            <StreakCard stats={stats} className="xl:col-span-5" />
          </div>
        </main>
      </div>
      <NewBetSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onCreated={setHighlight} />
    </ToastProvider>
  );
}
