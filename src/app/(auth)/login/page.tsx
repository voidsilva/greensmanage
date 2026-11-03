import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/ui/logo';

export const metadata: Metadata = { title: 'Entrar' };

export default function LoginPage() {
  return (
    <main className="relative z-10 grid min-h-dvh place-items-center px-4 py-6">
      <Bubbles />
      <section className="glass animate-rise w-full max-w-[420px] rounded-[34px] px-6 pt-8 pb-6 sm:px-8 sm:pt-9">
        <Logo className="mb-6 size-14 rounded-[20px]" />
        <h1 className="text-[26px] leading-tight font-extrabold tracking-tight">
          Entrar no <span className="text-pos">GreensManage</span>
        </h1>
        <p className="mt-2 mb-7 text-sm text-muted">Painel de gestão de banca de Paulo Silva.</p>
        <LoginForm />
        <footer className="mt-6 flex justify-center font-mono text-[10.5px] tracking-wide text-faint uppercase sm:justify-between">
          <span className="hidden sm:inline">Conexão segura</span>
          <span>+18 · Jogue com responsabilidade</span>
        </footer>
      </section>
    </main>
  );
}

function Bubbles() {
  const base =
    'pointer-events-none fixed hidden rounded-full sm:block backdrop-blur-[4px] backdrop-saturate-150 [background:radial-gradient(circle_at_30%_25%,rgb(255_255_255/.55),rgb(255_255_255/.08)_32%,rgb(125_255_181/.06)_60%,rgb(255_255_255/.18))] shadow-[inset_0_0_0_1px_rgb(255_255_255/.35),inset_-10px_-14px_30px_rgb(34_224_122/.18),0_30px_60px_-20px_rgb(0_0_0/.45)] animate-[float_9s_ease-in-out_infinite]';
  return (
    <div aria-hidden>
      <div className={`${base} top-[calc(50%-250px)] left-[calc(50%-330px)] size-[150px]`} />
      <div
        className={`${base} top-[calc(50%+150px)] left-[calc(50%+230px)] size-[90px] [animation-delay:-3s]`}
      />
      <div
        className={`${base} top-[calc(50%-230px)] left-[calc(50%+250px)] size-[54px] [animation-delay:-5s]`}
      />
    </div>
  );
}
