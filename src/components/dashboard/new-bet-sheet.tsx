'use client';

import { X } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { createBet, type BetFormState } from '@/app/actions/bets';
import { Segmented } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { MARKETS, MARKET_KEYS } from '@/lib/domain';
import { money } from '@/lib/format';

const field =
  'h-[46px] w-full rounded-[14px] border-0 bg-chip px-3.5 font-semibold outline-none shadow-[inset_0_0_0_1px_var(--line)] placeholder:text-faint focus:shadow-[inset_0_0_0_2px_#22e07a]';
const label = 'grid gap-1.5 text-xs font-semibold text-muted';
const num = (v: string) => Number(v.replace(/\./g, '').replace(',', '.'));

/**
 * Bottom sheet built on the native <dialog>: focus trap, Esc and inert
 * background come from the browser.
 */
export function NewBetSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const [status, setStatus] = useState<'pending' | 'green' | 'red'>('pending');
  const [o, setO] = useState('');
  const [s, setS] = useState('');
  const [state, action, pending] = useActionState<BetFormState, FormData>(async (prev, fd) => {
    const res = await createBet(prev, fd);
    if (res?.ok) {
      form.current?.reset();
      setStatus('pending');
      setO('');
      setS('');
      onCreated(res.id);
      onClose();
      toast('Aposta registrada');
    }
    return res;
  }, undefined);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const odd = num(o);
  const stake = num(s);
  const preview =
    odd > 1 && stake > 0 ? `${money(odd * stake)} (lucro ${money(stake * (odd - 1), true)})` : '—';

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="new-bet-title"
      className="glass fixed inset-x-0 top-auto bottom-3 mx-auto w-[min(460px,calc(100vw-24px))] rounded-[34px] p-0 text-ink backdrop:bg-[#000a05]/45 backdrop:backdrop-blur-sm open:animate-[rise_.5s_cubic-bezier(.3,1.2,.5,1)] md:bottom-6"
    >
      <form ref={form} action={action} noValidate className="px-[22px] pt-2.5 pb-[22px]">
        <div className="mx-auto mt-0.5 mb-3.5 h-[5px] w-10 rounded-full bg-faint" />
        <h2
          id="new-bet-title"
          className="mb-4 flex items-center justify-between text-xl font-extrabold tracking-tight"
        >
          Nova aposta
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 place-items-center rounded-full"
          >
            <X className="size-5" />
          </button>
        </h2>
        <label className={`${label} mb-3`}>
          Jogo
          <input
            name="game"
            required
            placeholder="Ex.: Santos x Grêmio"
            autoComplete="off"
            className={field}
          />
        </label>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className={label}>
            Mercado
            <select name="market" className={field}>
              {MARKET_KEYS.map((k) => (
                <option key={k} value={k} className="text-[#05301a]">
                  {MARKETS[k]}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Liga
            <input name="league" placeholder="Brasileirão" autoComplete="off" className={field} />
          </label>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className={label}>
            Odd
            <input
              name="odd"
              inputMode="decimal"
              placeholder="1,85"
              value={o}
              onChange={(e) => setO(e.target.value)}
              className={field}
            />
          </label>
          <label className={label}>
            Stake (R$)
            <input
              name="stake"
              inputMode="decimal"
              placeholder="100"
              value={s}
              onChange={(e) => setS(e.target.value)}
              className={field}
            />
          </label>
        </div>
        <div className={`${label} mb-3`}>
          Status
          <Segmented
            label="Status"
            name="status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'pending', label: 'Pendente' },
              { value: 'green', label: 'Green' },
              { value: 'red', label: 'Red' },
            ]}
          />
        </div>
        <p className="mt-0.5 mb-2.5 text-[13px] text-muted">
          Retorno potencial: <b className="text-pos">{preview}</b>
        </p>
        <p aria-live="polite" className="mb-2 min-h-4 text-[12.5px] text-neg">
          {state && !state.ok ? state.error : ''}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary shine flex w-full items-center justify-center rounded-full py-[15px] text-sm font-bold transition-transform ease-spring active:scale-[.97] disabled:opacity-70"
        >
          {pending ? 'Salvando…' : 'Registrar aposta'}
        </button>
      </form>
    </dialog>
  );
}
