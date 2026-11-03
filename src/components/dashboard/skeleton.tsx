const box = 'glass animate-pulse';

export function DashboardSkeleton() {
  return (
    <div
      aria-busy
      className="relative z-10 mx-auto grid max-w-[1580px] gap-5 p-3.5 md:grid-cols-[88px_1fr] md:p-5"
    >
      <div className={`${box} hidden h-[calc(100dvh-40px)] rounded-[30px] md:block`} />
      <div className="grid gap-5">
        <div className={`${box} h-[70px] rounded-[30px]`} />
        <div className="grid gap-5 xl:grid-cols-12">
          <div className={`${box} h-[380px] xl:col-span-5`} />
          <div className={`${box} h-[380px] xl:col-span-7`} />
          <div className={`${box} h-[400px] xl:col-span-8`} />
          <div className={`${box} h-[400px] xl:col-span-4`} />
        </div>
      </div>
      <span className="sr-only">Carregando painel…</span>
    </div>
  );
}
