import { Plus, Settings2 } from 'lucide-react';
import Link from 'next/link';

export function EmptyState({ onNewBet }: { onNewBet: () => void }) {
  return (
    <section className="glass animate-rise flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Bem-vindo ao seu painel</h2>
        <p className="mt-1 text-sm text-muted">
          Defina sua banca inicial e meta, depois registre a primeira aposta. Os gráficos se montam
          sozinhos.
        </p>
      </div>
      <div className="flex flex-none gap-2.5">
        <Link
          href="/conta"
          className="glass lens shine inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold"
        >
          <Settings2 className="size-4" /> Ajustar banca
        </Link>
        <button
          onClick={onNewBet}
          className="btn-primary shine inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold"
        >
          <Plus className="size-4" strokeWidth={2.6} /> Primeira aposta
        </button>
      </div>
    </section>
  );
}
