import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Ambient } from '@/components/ui/ambient';
import { LiquidFilter } from '@/components/ui/liquid-filter';
import { PointerLight } from '@/components/ui/pointer-light';
import './globals.css';

const hanken = localFont({
  src: '../fonts/hanken-grotesk.woff2',
  weight: '400 800',
  variable: '--font-hanken',
  display: 'swap',
});
const plexMono = localFont({
  src: '../fonts/ibm-plex-mono-500.woff2',
  weight: '500',
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'GreensManage', template: '%s · GreensManage' },
  description: 'Gestão de banca de apostas esportivas.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#03140c' },
    { media: '(prefers-color-scheme: light)', color: '#e7f5ec' },
  ],
};

// Runs before paint so the saved theme never flashes.
const themeScript = `try{var t=localStorage.getItem('gm-theme');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      className={`${hanken.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LiquidFilter />
        <Ambient />
        <PointerLight />
        {children}
      </body>
    </html>
  );
}
