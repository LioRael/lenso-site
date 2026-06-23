import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Lenso',
    template: '%s | Lenso',
  },
  description:
    'Agent-ready modular app framework for Rust business systems.',
};

const themeInitScript = `
try {
  const mode = localStorage.getItem('lenso-theme') || 'system';
  const resolved = mode === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.style.colorScheme = resolved;
} catch {}
`;

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
