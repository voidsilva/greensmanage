/** Soft green blobs + film grain behind the glass. Pure decoration. */
export function Ambient() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 10% 0%, var(--bg-2) 0%, transparent 55%), radial-gradient(90% 80% at 100% 100%, var(--bg-2) 0%, transparent 60%), var(--bg)',
        }}
      />
      <div className="animate-float absolute -top-24 -left-36 size-[560px] rounded-full opacity-75 blur-[70px] [background:radial-gradient(circle,var(--blob-1),transparent_70%)]" />
      <div className="animate-float absolute top-[20%] -right-28 size-[480px] rounded-full opacity-35 blur-[70px] [animation-delay:-7s] [background:radial-gradient(circle,var(--blob-2),transparent_70%)]" />
      <div className="animate-float absolute -bottom-72 left-[30%] size-[640px] rounded-full opacity-75 blur-[70px] [animation-delay:-13s] [background:radial-gradient(circle,var(--blob-3),transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:url(/grain.svg)]" />
    </div>
  );
}
