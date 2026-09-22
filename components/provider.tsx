'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

export function Provider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.lang = pathname === '/docs/zh' || pathname?.startsWith('/docs/zh/') ? 'zh-CN' : 'en';
  }, [pathname]);

  return <RootProvider search={{ options: { api: '/api/search' } }}>{children}</RootProvider>;
}
