import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'grid size-12 place-items-center rounded-2xl bg-linear-145 from-[#a6ffd0] to-green-2 text-[#04210f] shadow-[0_12px_30px_-8px_rgb(34_224_122/.75),inset_0_1px_0_rgb(255_255_255/.8)]',
        className,
      )}
    >
      <TrendingUp className="size-[55%]" strokeWidth={2.4} />
    </div>
  );
}
