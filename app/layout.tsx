import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Provider } from '@/components/provider';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://lenso.dev'),
  title: { default: 'Lenso', template: '%s · Lenso' },
  description: 'Build modular applications with explicit Plugin, Capability, Host, and runtime boundaries.',
  icons: { icon: '/lenso-assets/lenso-header-mark.svg' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><Provider>{children}</Provider></body>
    </html>
  );
}
