'use client';

import { useEffect } from 'react';

/** Moves the specular highlight of nearby glass surfaces with the pointer. */
export function PointerLight() {
  useEffect(() => {
    let raf = 0;
    let e: PointerEvent | null = null;
    const onMove = (ev: PointerEvent) => {
      e = ev;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!e) return;
        for (const el of document.querySelectorAll<HTMLElement>('.glass, .shine')) {
          const r = el.getBoundingClientRect();
          if (
            e.clientX < r.left - 220 ||
            e.clientX > r.right + 220 ||
            e.clientY < r.top - 220 ||
            e.clientY > r.bottom + 220
          )
            continue;
          el.style.setProperty('--mx', `${e.clientX - r.left}px`);
          el.style.setProperty('--my', `${e.clientY - r.top}px`);
        }
      });
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => {
      removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
