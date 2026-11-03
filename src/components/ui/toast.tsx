'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { createContext, use, useCallback, useRef, useState, type ReactNode } from 'react';

const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => use(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; key: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((text: string) => {
    setMsg({ text, key: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2600);
  }, []);
  return (
    <ToastCtx value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[95] flex justify-center"
      >
        <AnimatePresence>
          {msg && (
            <motion.div
              key={msg.key}
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="glass flex items-center gap-2.5 rounded-full px-4.5 py-3 text-sm font-bold"
            >
              <i className="grid size-[22px] place-items-center rounded-full bg-green-1 text-[#03200f]">
                <Check className="size-3.5" strokeWidth={3} />
              </i>
              {msg.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastCtx>
  );
}
