import { Card, CardHeader } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { MARKETS } from '@/lib/domain';
import { money } from '@/lib/format';
import type { DashboardStats } from '@/lib/stats';

export function StreakCard({ stats, className }: { stats: DashboardStats; className?: string }) {
  return (
    <Card className={cn('flex flex-col gap-4', className)} delay={0.55}>
      <CardHeader
        title="Sequência recente"
        sub="Últimas 24 entradas resolvidas, da mais antiga à mais nova"
      />
      <ol className="grid grid-cols-12 gap-1.5">
        {stats.recentResults.map((r, i) => (
          <li
            key={r.id}
            title={`${r.game} · ${MARKETS[r.market]}`}
            style={{ animationDelay: `${i * 25}ms` }}
            className={cn(
              'animate-pop grid aspect-square place-items-center rounded-[9px] text-[10.5px] font-extrabold',
              r.status === 'green' ? 'bg-green-1/20 text-pos' : 'bg-neg/18 text-neg',
            )}
          >
            <span aria-label={r.status === 'green' ? 'Green' : 'Red'}>
              {r.status === 'green' ? 'G' : 'R'}
            </span>
          </li>
        ))}
      </ol>
      <dl className="mt-auto grid grid-cols-3 gap-2.5">
        {[
          ['Maior sequência', `${stats.bestStreak} greens`, ''],
          ['Pior dia', money(stats.worstDay, true), 'text-neg'],
          ['Melhor dia', money(stats.bestDay, true), 'text-pos'],
        ].map(([l, v, c]) => (
          <div
            key={l}
            className="rounded-[18px] bg-chip p-3.5 shadow-[inset_0_0_0_1px_var(--line)]"
          >
            <dt className="text-[11.5px] text-muted">{l}</dt>
            <dd className={cn('mt-1 text-[15px] font-bold tabular-nums md:text-lg', c)}>{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
