'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Bell, LogOut, Moon, Settings, Sun } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import { useToast } from '@/components/ui/toast';

const iconBtn = 'glass lens grid size-[46px] flex-none place-items-center rounded-full text-ink';

type Theme = 'dark' | 'light';
const themeListeners = new Set<() => void>();
const readTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

/** Theme lives on <html data-theme>, set before paint by the inline script in the root layout. */
function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => (themeListeners.add(cb), () => themeListeners.delete(cb)),
    readTheme,
    () => 'dark' as Theme,
  );
  const toggle = () => {
    const t: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem('gm-theme', t);
    } catch {}
    themeListeners.forEach((l) => l());
  };
  return { theme, toggle };
}

const noop = () => () => {};
function greeting() {
  const h = Number(
    new Intl.DateTimeFormat('pt-BR', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'America/Sao_Paulo',
    }).format(new Date()),
  );
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export function Topbar({ name, demo }: { name: string; demo: boolean }) {
  const toast = useToast();
  const { theme, toggle } = useTheme();
  const hello = useSyncExternalStore(noop, greeting, () => 'Olá');
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="glass animate-rise relative z-40 flex items-center gap-3.5 rounded-[30px] py-2.5 pr-2.5 pl-[18px] md:py-3 md:pr-3.5 md:pl-[26px]">
      <div className="min-w-0">
        <small className="block text-[13px] font-medium text-muted">{hello}</small>
        <h1 className="truncate text-[21px] font-bold tracking-tight md:text-2xl">
          Olá, <span className="text-pos">{name}</span>
        </h1>
      </div>
      <LiveIsland />
      <div className="ml-auto flex items-center gap-2.5 lg:ml-0">
        <button onClick={toggle} className={iconBtn} aria-label="Alternar tema claro e escuro">
          {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
        <button
          className={`${iconBtn} relative`}
          aria-label="Notificações: 2 novas"
          onClick={() => toast('2 novas: Bayern x Dortmund deu green · Meta perto de bater')}
        >
          <Bell className="size-5" />
          <span className="absolute top-[11px] right-3 size-2 rounded-full bg-lime shadow-[0_0_10px_var(--color-lime)]" />
        </button>
        <Link href="/conta" className={`${iconBtn} md:hidden`} aria-label="Minha conta">
          <Settings className="size-5" />
        </Link>
        <form action={signOut}>
          <button className={iconBtn} aria-label="Sair" title="Sair">
            <LogOut className="size-5" />
          </button>
        </form>
        <Link
          href="/conta"
          aria-label="Minha conta"
          className="glass lens hidden flex-none items-center gap-3 rounded-full py-1.5 pr-4 pl-1.5 md:flex"
        >
          <span className="grid size-[38px] place-items-center rounded-full border-[1.5px] border-white/35 bg-linear-145 from-[#1b6b42] to-[#0d3d25] text-[13px] font-bold text-[#eafff3]">
            {initials}
          </span>
          <span>
            <b className="block text-sm uppercase">{name}</b>
            <small className="text-xs text-muted">{demo ? 'Conta demo' : 'Minha conta'}</small>
          </span>
        </Link>
      </div>
    </header>
  );
}

/** Dynamic-Island style live match pill. Expands on click. */
function LiveIsland() {
  const [open, setOpen] = useState(false);
  const [minute, setMinute] = useState(67);
  useEffect(() => {
    const t = setInterval(() => setMinute((m) => Math.min(90, m + 1)), 20_000);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.button
      layout
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      aria-label="Jogo ao vivo: Flamengo 1 a 1 Palmeiras"
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      style={{ borderRadius: open ? 30 : 999 }}
      className="mx-auto hidden flex-col justify-center gap-2.5 overflow-hidden bg-[#020b06] px-3.5 py-2.5 text-[13px] font-semibold whitespace-nowrap text-[#eafff3] shadow-[0_10px_30px_-10px_rgb(0_0_0/.7),inset_0_0_0_1px_rgb(255_255_255/.08)] lg:flex"
    >
      <motion.span layout="position" className="flex w-[222px] items-center gap-2.5">
        <span className="size-2 flex-none animate-[pulse-ring_1.6s_infinite] rounded-full bg-[#ff6b7d]" />
        <span>FLA</span>
        <span className="text-[15px] font-extrabold tracking-wide tabular-nums">1 – 1</span>
        <span>PAL</span>
        <span className="ml-auto rounded-full bg-[#3df08f]/14 px-2.5 py-1 font-mono text-[11.5px] text-[#9dffc8] tabular-nums">
          {minute >= 90 ? 'FIM' : `${minute}'`}
        </span>
      </motion.span>
      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex w-[360px] items-center justify-between gap-3 text-[12.5px] text-[#bfe9d1]"
          >
            <span>
              Sua entrada: <b className="text-white">Ambas marcam @1,82</b>
            </span>
            <span className="font-bold text-[#7dffb5]">Green garantido</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
